import { ensureLoggedIn } from "connect-ensure-login";
import { Router } from "express";
// model
import blogModel from "../model/blogModel.js";

const route = new Router();

route
  .get("/", async function (req, res) {
    let blogs = await blogModel.find().sort({ createdAt: "desc" });
    res.render("blog/index.ejs", { blogs: blogs });
  })
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
  .get("/:slug", async (req, res) => {
    let blog = await blogModel.findOne({ slug: req.params.slug });
    if (blog) res.render("blog/view", { blog: blog });
    else res.sendStatus(404);
  })
  .delete("/:id", async function (req, res) {
    try {
      await blogModel.findByIdAndDelete(req.params.id);
    } catch (err) {}
    res.redirect("/blog");
  })
  .get("/edit/:id", ensureLoggedIn("/login"), async function (req, res) {
    try {
      let blog = await blogModel.findById(req.params.id);
      res.render("blog/edit", { blog: blog });
    } catch (error) {
      //
    }
  })
  .put(
    "/:id",
    async function (req, res, next) {
      req.blog = await blogModel.findById(req.params.id);
      next();
    },
    saveBlogAndRedirect("edit")
  );
function saveBlogAndRedirect(path) {
  return async (req, res) => {
    let blog = req.blog;

    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.markdown = req.body.markdown;

    try {
      blog = await blog.save();
      res.redirect(`/blog/${blog.slug}`);
    } catch (error) {
      console.log(error);
      res.render(`blog/${path}`, { blog: blog });
    }
  };
}
export default route;
