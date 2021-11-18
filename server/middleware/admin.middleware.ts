import type { NextFunction, Request, Response } from "express";
function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.user && req.user.role == "admin") {
    req.admin = true;
    next();
  } else {
    req.admin = false;
    next();
  }
}
export default adminMiddleware;
