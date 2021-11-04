// importing dependencies
import { ensureLoggedIn } from "connect-ensure-login";
import { Request, Response, Router } from "express";
import { Metaphone } from "natural";
import courseModel, { Course } from "../model/courseModel";
// mongoose models
import courseDataModel from "../model/userCourseData";
// init express route
const route = Router();

route
  .get("/", async (req, res) => {
    let courses: Course[];
    // FIXME: fix this
    // deepcode ignore HTTPSourceWithUncheckedType: not finding a way to fix this
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
    // FIXME: fix this
    // deepcode ignore XSS: not finding a way to fix this
    res.send(courses);
  })
  .get("/create", ensureLoggedIn("/login"), (_req: Request, res: Response) => {
    res.render("course/courseAdd", { done: false });
  })
  // TODO: add rate limiting
  // file deepcode ignore NoRateLimitingForExpensiveWebOperation: will be added in future
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
    course.save();
    res.render("course/courseAdd", { done: true });
  })
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
