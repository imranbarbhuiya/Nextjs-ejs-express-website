// importing dependencies
import { ensureLoggedIn } from "connect-ensure-login";
import { Request, Response, Router } from "express";
import natural from "natural";
import Logger from "../lib/logger";
// mongoose models
import courseDataModel from "../model/courseData";
import courseModel, { Course } from "../model/courseModel";
// object destruction
const { Metaphone } = natural;
// init express route
const route = Router();

route
  .get("/", async (req, res) => {
    let courses: Course;
    const searchQuery = req.query.search;
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
    res.send(courses);
  })
  .get("/create", ensureLoggedIn("/login"), (_req: Request, res: Response) => {
    res.render("course/courseAdd", { done: false });
  })
  .post("/create", ensureLoggedIn("/login"), (req: Request, res: Response) => {
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
    course.save((err: Error) => {
      if (err) Logger.error(err);
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
    Logger.debug(data);
    res.sendStatus(200);
  })
  .get("/play", (_req: Request, res: Response) => {
    res.render("course/play");
  });
export default route;
