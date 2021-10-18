import { NextFunction, Request, Response } from "express";
// defining promise handler
function handleRejection(done: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // run controllers logic
      await done(req, res, next);
    } catch (e) {
      // if an exception is raised, call next
      if (e.kind === "ObjectId") {
        e.message = "Not found";
        e.status = 404;
      }
      next(e);
    }
  };
}

export { handleRejection };
