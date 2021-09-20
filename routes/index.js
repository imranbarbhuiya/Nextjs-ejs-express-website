import { Router } from "express";
const route = Router();

route.get("/", function (req, res) {
  res.render("index", {
    user: req.user ? req.user : null,
  });
});

export default route;
