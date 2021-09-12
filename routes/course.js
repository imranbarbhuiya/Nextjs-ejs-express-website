const { ensureLoggedIn } = require("connect-ensure-login");
const express = require("express");
const natural = require("natural");

const Course = require("../model/courseModel");

const route = express.Router();
const metaphone = natural.Metaphone;

route
  .get("/", function (req, res) {
    res.sendStatus(500);
  })
  .get("/create", ensureLoggedIn("/login"), function (req, res) {
    if (req.user.designation == "instructor") res.render("courseAdd");
    else {
      res.sendStatus(400);
    }
  })
  .post("/create", function (req, res) {
    // res.sendStatus(500);
    let { title, author, thumbnail, description, price } = req.body;
    const course = new Course({
      author: author,
      title: title,
      keywords: metaphone.process(title),
    });
    course.save(function (err) {
      res.sendStatus(200);
      if (err) console.log(err);
    });
  })
  .get("/search", function (req, res) {
    if (!req.query.search) res.redirect("/");
    try {
      Course.fuzzySearch(metaphone.process(req.query.search), (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.send(data);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

module.exports = route;
