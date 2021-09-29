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
    let keyword = "";
    title.split(/ +/).forEach((key) => (keyword += `${metaphone(key)} `));
    keyword += `b ${metaphone(author)}`;
    const course = new Course({
      author: author,
      authorId: req.user.id,
      title: title,
      keywords: keyword,
    });
    course.save(function (err) {
      if (err) console.log(err);
      else {
        res.render("course/courseAdd", { done: true });
      }
    });
  })
  .get("/search", async function (req, res) {
    let searchQuery = req.query.search;
    if (!searchQuery) res.redirect("/");
    let keyword = "";
    searchQuery.split(/ +/).forEach((key) => (keyword += `${metaphone(key)} `));
    try {
      const data = await Course.fuzzySearch(`${keyword} ${searchQuery}`, {
        verified: true,
      }).sort({ price: -1 });
      res.send(data);
    } catch (error) {
      console.log(error);
    }
  });
// .get("/search/auto", function (req, res) {
//   var regex = new RegExp(req.query["term"], "i");
//   var query = User.find({ author: regex }, { author: 1 })
//     .sort({ price: -1 })
//     .limit(20);

//   // Execute query in a callback and return users list
//   query.exec(function (err, users) {
//     if (!err) {
//       // Method to construct the json result set
//       var result = buildResultSet(users);
//       res.send(
//         result,
//         {
//           "Content-Type": "application/json",
//         },
//         200
//       );
//     } else {
//       res.send(
//         JSON.stringify(err),
//         {
//           "Content-Type": "application/json",
//         },
//         404
//       );
//     }
//   });
// });

export default route;
