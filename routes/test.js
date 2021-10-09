import { Router } from "express";
const route = new Router();

route.get("/", async (req, res) => {
  res.send(401);
});

export default route;
