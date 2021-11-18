// importing dependencies
import { ensureLoggedIn } from "connect-ensure-login";
import type { Request, Response } from "express";
import { Router } from "express";
import { query } from "express-validator";
import { Metaphone } from "natural";
import { authLimiter } from "../controller/api-rate-limit";
// mongoose models
import type { Course } from "../model/courseModel";
import courseModel from "../model/courseModel";
import courseDataModel from "../model/userCourseData";
// init express route
const route = Router();

route
  .get("/", query("search").trim().escape(), async (req, res) => {
    let courses: Course[];
    // deepcode ignore HTTPSourceWithUncheckedType: already fixed
    const searchQuery = String(req.query.search);
    if (searchQuery) {
      const keywords = Metaphone.process(searchQuery as string);
      courses = await courseModel
        .fuzzySearch(`${keywords} ${searchQuery}`, {
          verified: true,
        })
        .sort({ price: -1 });
    } else {
      courses = await courseModel.find({ verified: true }).sort({ price: 1 });
    }
    // TODO: change total course route response
    // deepcode ignore XSS: will be replaced with render
    res.send(courses);
  })
  .get("/create", ensureLoggedIn("/login"), (_req: Request, res: Response) => {
    res.render("course/courseAdd", { done: false });
  })
  .post(
    "/create",
    ensureLoggedIn("/login"),
    authLimiter,
    // deepcode ignore NoRateLimitingForExpensiveWebOperation: already added a rate limiter
    (req: Request, res: Response) => {
      const { title, author, price } = req.body;
      const keywords = `${Metaphone.process(`${title} ${author}`)} ${title}`;
      const course = new courseModel({
        author,
        authorId: req.user.id,
        title,
        price,
        keywords,
        verified: true,
      });
      course.save();
      res.render("course/courseAdd", { done: true });
    }
  )
  .get("/mycourses", ensureLoggedIn(), async (req, res) => {
    const data = await courseDataModel.findOne({
      subscribedCourses: { $elemMatch: { courseId: req.user.id } },
    });
    res.send(data);
  })
  .get("/play", (_req: Request, res: Response) => {
    res.render("course/play");
  });
export default route;
