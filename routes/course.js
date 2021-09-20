import { ensureLoggedIn } from "connect-ensure-login";
import { Router } from "express";
import { metaphone } from "metaphone";
// import { isAdmin } from "../controller/roles.js";
import Course from "../model/courseModel.js";

const route = Router();

route
  .get("/", function (req, res) {
    res.sendStatus(500);
  })
  .get("/create", ensureLoggedIn("/login"), function (req, res) {
    res.render("course/courseAdd", { done: false });
  })
  .post("/create", function (req, res) {
    let { title, author, thumbnail, description, price } = req.body;
    const course = new Course({
      author: author,
      authorId: req.user.id,
      title: title,
      keywords: metaphone(`${title}by ${author}`),
    });
    course.save(function (err) {
      if (err) console.log(err);
      else {
        res.render("course/courseAdd", { done: true });
      }
    });
  })
  .get("/search", function (req, res) {
    if (!req.query.search) res.redirect("/");
    try {
      Course.fuzzySearch(
        metaphone(req.query.search) + req.query.search,
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            let verifiedData = data.filter((data) => data.verified);
            res.send(verifiedData);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  });

export default route;
