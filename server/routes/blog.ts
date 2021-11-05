// importing dependencies
import { ensureLoggedIn } from "connect-ensure-login";
import { NextFunction, Request, Response, Router } from "express";
import { query } from "express-validator";
import { apiLimiter } from "../controller/api-rate-limit";
// controllers
import { saveBlogAndRedirect, viewBlogs } from "../controller/blog";
import { handleRejection } from "../controller/handleRejection";
// middleware
import { isAdmin, isAdminOrBlogOwner } from "../middleware/roles.middleware";
// mongoose models
import blogModel, { Blog } from "../model/blogModel";
// init express route
const route = Router();

// file deepcode ignore NoRateLimitingForExpensiveWebOperation: already in place
// TODO: add caching for view routes and remove apiLimiter

route.use(
  /^\/.*(myblogs|unverified|new|preview|verify|edit).*/i,
  ensureLoggedIn({ redirectTo: "/login", setReturnTo: false })
);
route
  .get("/", query("search").trim().escape(), viewBlogs("all"))
  .get("/myblogs", query("search").escape(), viewBlogs("myblogs"))
  .get(
    "/unverified",
    isAdmin,
    query("search").trim().escape(),
    viewBlogs("unverified")
  )
  .get("/new", apiLimiter, (req: Request, res: Response) => {
    if (!req.user.verified) {
      req.flash(
        "error",
        "you must verify before writing blogs <a href='/verify'>Verify</a>"
      );
      return res.redirect("/blog");
    }
    res.render("blog/new", {
      blog: new blogModel(),
      message: req.flash(),
      csrfToken: req.csrfToken(),
    });
  })
  .post(
    "/new",
    apiLimiter,
    async (req: Request, _res: Response, next: NextFunction) => {
      req.blog = new blogModel();
      next();
    },
    saveBlogAndRedirect("new")
  )
  .get(
    "/preview/:id",
    ensureLoggedIn("/login"),
    handleRejection(async (req: Request, res: Response, next: any) => {
      const blog: Blog = await blogModel.findById(req.params.id);
      if (blog) {
        req.blog = blog;
        next();
      } else next({ status: 404, message: "Not found" }, req, res);
    }),
    isAdminOrBlogOwner("view")
  )
  .get("/:slug", apiLimiter, async (req: Request, res: Response, next: any) => {
    const blog: Blog = await blogModel.findOne({
      slug: req.params.slug,
      verified: true,
    });
    if (blog) res.render("blog/view", { blog });
    else next();
  })
  .delete(
    "/:id",
    isAdmin,
    handleRejection(async (req: Request, res: Response) => {
      await blogModel.findByIdAndDelete(req.params.id);
      res.redirect("back");
    })
  )
  .get(
    "/edit/:id",
    ensureLoggedIn("/login"),
    handleRejection(
      async (req: Request, _res: Response, next: NextFunction) => {
        const blog = await blogModel.findById(req.params.id);
        req.blog = blog;
        next();
      }
    ),
    isAdminOrBlogOwner("edit")
  )
  .put(
    "/:id",
    ensureLoggedIn("/login"),
    handleRejection(
      async (req: Request, _res: Response, next: NextFunction) => {
        req.blog = await blogModel.findById(req.params.id);
        next();
      }
    ),
    saveBlogAndRedirect("edit")
  )
  .get(
    "/verify/:id",
    isAdmin,
    handleRejection(async (req: Request, res: Response) => {
      const blog: any = await blogModel.findById(req.params.id);
      blog.verified = true;
      blog.save();
      res.redirect(301, `/blog/${blog.slug}`);
    })
  );
export default route;
