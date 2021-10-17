// importing dependencies
import { Request, Response, Router } from "express";
import { SessionData } from "express-session";
// init express route
const route = Router();

route.get("/", (req: Request, res: Response) => {
  if (!req.isAuthenticated())
    if (req.query.referred) req.session.referred = req.query.referred as string;
  res.render("index", {
    user: req.user ? req.user : null,
    message: req.flash(),
  });
});

export default route;

declare module "express-session" {
  interface SessionData {
    referred: string;
    returnTo: string;
  }
}
