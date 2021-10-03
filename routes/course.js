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
