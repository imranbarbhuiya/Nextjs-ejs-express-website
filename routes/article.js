import { Router } from "express";
const route = new Router();

route.get("/", function (req, res) {
  res.sendStatus(404);
});

export default route;
