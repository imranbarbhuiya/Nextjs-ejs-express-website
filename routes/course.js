// importing dependencies
import { ensureLoggedIn } from "connect-ensure-login";
import { Router } from "express";
import { createReadStream, statSync } from "fs";
import natural from "natural";
import path from "path";
// mongoose models
import courseDataModel from "../model/courseData.js";
import Course from "../model/courseModel.js";
// dirname module
import { __dirname } from "../__.js";
// object destruction
const { Metaphone } = natural;
// init express route
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
  .get("/test", ensureLoggedIn(), async (req, res) => {
    // await courseDataModel.findOneAndUpdate(
    //   {
    //     userId: req.user.id,
    //   },
    //   {
    //     $push: {
    //       courses: {
    //         courseId: req.user.id,
    //       },
    //     },
    //   }
    // );
    const data = await courseDataModel.findOne({
      courses: { $elemMatch: { courseId: req.user.id } },
    });
    console.log(data);
    res.sendStatus(200);
  })
  .get("/play", function (req, res) {
    res.render("course/play");
  })
  .get("/video", function (req, res) {
    const sameReferer = `${req.headers.referer}`.includes(req.headers.host);
    const range = req.headers.range;
    if (!range || !sameReferer) {
      return res.status(402).send("Payment required");
    }

    // get video stats
    const videoPath = path.resolve(__dirname, "public", "test.mp4");
    const stats = statSync(path.resolve(__dirname, "public", "test.mp4"));
    // get video size
    const videoSize = stats.size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // if file start is greater than start
    if (start >= fileSize) {
      res
        .status(416)
        .send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }
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
