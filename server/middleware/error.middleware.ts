import { Request, Response } from "express";

function errorMiddleware(err: HttpException, _req: Request, res: Response) {
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
  constructor(code: string, status: number, message: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.message = message;
  }
}
