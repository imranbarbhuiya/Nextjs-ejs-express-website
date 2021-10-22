import { NextFunction, Request, Response } from "express";

function errorMiddleware(
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403);
    res.send("Forbidden");
    return;
  }
  res.status(err.status || 500);
  res.render("error", {
    message: err.message || "Internal server error",
    status: err.status,
  });
}
export default errorMiddleware;

export class HttpException extends Error {
  code?: string;
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}
