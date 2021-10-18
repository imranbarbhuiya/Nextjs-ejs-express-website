import { Router } from "express";
const route = Router();

route.get("/", async (req, res) => {
  res.send(401);
});

export default route;
