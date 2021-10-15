// importing dependencies
import { Router } from "express";
// init express route
const route = Router();

/**
 * @param {request} req
 * @param {response} res
 * @param {NextFunction} next
 */

route.get("/", function (req, res) {
  if (!req.isAuthenticated())
    if (req.query.referred) req.session.referred = req.query.referred;
  res.render("index", {
    user: req.user ? req.user : null,
    message: req.flash(),
  });
});

export default route;
