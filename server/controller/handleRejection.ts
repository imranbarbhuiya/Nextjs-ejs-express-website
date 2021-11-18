import type { NextFunction, Request, Response } from "express";
// defining promise handler
function handleRejection(done: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // run controllers logic
      await done(req, res, next);
    } catch (error) {
      // if an exception is raised, call next
      if (error.kind === "ObjectId") {
        next();
      }
      next(error);
    }
  };
}

export { handleRejection };
