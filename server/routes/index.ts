// importing dependencies
import { NextFunction, Request, Response, Router } from "express";
// init express route
const route = Router();

route.get("/", (req: Request, _res: Response, next: NextFunction) => {
  if (!req.isAuthenticated())
    if (req.query.referred) req.session.referred = req.query.referred as string;
  next();
});

export default route;

declare module "express-session" {
  interface SessionData {
    referred: string;
    returnTo: string;
    flash: {
      info?: string[];
      success?: string[];
      error?: string[];
      warning?: string[];
    };
  }
}
