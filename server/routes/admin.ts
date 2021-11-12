import { Router } from "express";

const route = Router();

route.get("/", (req, res) => {
  res.send("Admin");
});

export default route;
