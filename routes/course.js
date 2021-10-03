import { ensureLoggedIn } from "connect-ensure-login";
import { Router } from "express";
import natural from "natural";
import Course from "../model/courseModel.js";
const { Metaphone } = natural;

const route = Router();

/**
 * @param {request} req
 * @param {response} res
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
  });
export default route;
