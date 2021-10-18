import { Request, Response, Router } from "express";
const route = Router();

route.get("/", (req: Request, res: Response) => {
  req.flash("info", "check email");
  res.redirect("/about");
});

export default route;
