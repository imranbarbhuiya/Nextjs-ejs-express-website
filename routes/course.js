import { ensureLoggedIn } from "connect-ensure-login";
import { Router } from "express";
import { createReadStream, statSync } from "fs";
import natural from "natural";
import path from "path";
// local modules
import Course from "../model/courseModel.js";
import { __dirname } from "../__.js";
const { Metaphone } = natural;

const route = Router();

/**
 * @param {request} req
 * @param {response} res
 * @param {NextFunction} next
 */

route
  .get("/", async function (req, res) {
    let courses;
    let searchQuery = req.query.search;
    if (searchQuery) {
      let keywords = Metaphone.process(searchQuery);
      courses = await Course.fuzzySearch(`${keywords} ${searchQuery}`, {
        verified: true,
      }).sort({ price: -1 });
    } else {
      courses = await Course.find({ verified: true }).sort({ price: 1 });
    }
    res.send(courses);
  })
  .get("/create", ensureLoggedIn("/login"), function (req, res) {
    res.render("course/courseAdd", { done: false });
  })
  .post("/create", ensureLoggedIn("/login"), function (req, res) {
    let { title, author, thumbnail, description, price } = req.body;
    let keywords = `${Metaphone.process(`${title} ${author}`)} ${title}`;
    const course = new Course({
      author: author,
      authorId: req.user.id,
      title: title,
      price: price,
      keywords: keywords,
      verified: true,
    });
    course.save(function (err) {
      if (err) console.log(err);
      else {
        res.render("course/courseAdd", { done: true });
      }
    });
  })
  .get("/play", function (req, res) {
    res.render("course/play");
  })
  .get("/video", function (req, res) {
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }

    // get video stats (about 61MB)
    const videoPath = path.resolve(__dirname, "public", "test.mp4");
    const videoSize = statSync(
      path.resolve(__dirname, "public", "test.mp4")
    ).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = createReadStream(videoPath, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
  });
export default route;
