import { ensureLoggedIn } from "connect-ensure-login";
import { Router } from "express";
// model
import { saveBlogAndRedirect, view } from "../controller/blog.js";
import { isAdmin, isBlogOwner } from "../controller/roles.js";
import blogModel from "../model/blogModel.js";

const route = new Router();

route
  .get("/", view("all"))
  .get("/my", ensureLoggedIn("/login"), view("my"))
  .get("/unverified", isAdmin, view("unverified"))
  .get("/new", ensureLoggedIn("/login"), function (req, res) {
    res.render("blog/new", { blog: new blogModel() });
  })
  .post(
    "/new",
    async function (req, res, next) {
      req.blog = new blogModel();
      next();
    },
    saveBlogAndRedirect("new")
  )
  .get(
    "/preview/:id",
    async (req, res, next) => {
      try {
        let blog = await blogModel.findById(req.params.id);
        if (blog) {
          req.blog = blog;
          next();
        } else res.sendStatus(404);
      } catch (err) {
        res.sendStatus(404);
        console.log(err);
      }
    },
    isBlogOwner("view")
  )
  .get("/:slug", async (req, res) => {
    let blog = await blogModel.findOne({
      slug: req.params.slug,
      verified: true,
    });
    if (blog) res.render("blog/view", { blog: blog });
    else res.sendStatus(404);
  })
  .delete("/:id", isAdmin, async function (req, res) {
    try {
      await blogModel.findByIdAndDelete(req.params.id);
    } catch (err) {}
    res.redirect("/blog");
  })
  .get(
    "/edit/:id",
    ensureLoggedIn("/login"),
    async function (req, res, next) {
      try {
        let blog = await blogModel.findById(req.params.id);
        req.blog = blog;
        next();
      } catch (error) {
        res.sendStatus(404);
      }
    },
    isBlogOwner("edit")
  )
  .put(
    "/:id",
    async function (req, res, next) {
      req.blog = await blogModel.findById(req.params.id);
      next();
    },
    saveBlogAndRedirect("edit")
  )
  .get("/verify/:id", isAdmin, async (req, res) => {
    let blog = await blogModel.findById(req.params.id);
    blog.verified = true;
    blog.save();
    res.redirect(`/blog/${blog.slug}`);
  });
export default route;
