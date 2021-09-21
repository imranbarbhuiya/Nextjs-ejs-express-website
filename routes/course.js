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
  .post("/create", ensureLoggedIn("/login"), function (req, res) {
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
        {
          verified: true,
          sort: {
            price: "descending",
          },
          limit: 1,
        },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            res.send(data);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  })
  .get("/search/auto", function (req, res) {
    var regex = new RegExp(req.query["term"], "i");
    var query = User.find({ author: regex }, { author: 1 })
      .sort({ price: -1 })
      .limit(20);

    // Execute query in a callback and return users list
    query.exec(function (err, users) {
      if (!err) {
        // Method to construct the json result set
        var result = buildResultSet(users);
        res.send(
          result,
          {
            "Content-Type": "application/json",
          },
          200
        );
      } else {
        res.send(
          JSON.stringify(err),
          {
            "Content-Type": "application/json",
          },
          404
        );
      }
    });
  });

export default route;
