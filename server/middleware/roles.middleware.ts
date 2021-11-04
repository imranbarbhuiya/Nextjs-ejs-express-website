import { NextFunction, Request, Response } from "express";
import type { Course } from "../model/courseModel";
async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.sendStatus(401);
  }
}

async function canAddCourse(req: Request, res: Response, next: NextFunction) {
  if (
    req.user &&
    (req.user.role === "instructor" || req.user.role === "admin")
  ) {
    next();
  } else {
    res.sendStatus(400);
  }
}

async function canEditCourse(req: Request, res: Response, next: NextFunction) {
  if (
    req.user &&
    (req.user.role === "admin" || req.course.author === req.user.id)
  ) {
    next();
  } else {
    res.sendStatus(400);
  }
}
function isAdminOrBlogOwner(path: string) {
  // file deepcode ignore NoRateLimitingForExpensiveWebOperation: <please specify a reason of ignoring this>
  return (req: Request, res: Response, next: any) => {
    if (
      req.user &&
      (req.user.role === "admin" || req.blog.author === req.user.id)
    ) {
      req.flash();
      res.render(`blog/${path}`, {
        blog: req.blog,
        message: req.flash(),
        csrfToken: req.csrfToken(),
      });
    } else {
      next();
    }
  };
}
export { isAdmin, canAddCourse, canEditCourse, isAdminOrBlogOwner };

declare global {
  namespace Express {
    export interface Request {
      course: Course;
    }
  }
}
