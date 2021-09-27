import { Router } from "express";
const route = Router();

route.get("/", function (req, res) {
  if (req.query.referred) req.session.referred = req.query.referred;
  res.locals.message = req.flash();
  res.render("index", {
    user: req.user ? req.user : null,
  });
});

export default route;
