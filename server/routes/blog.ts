// importing dependencies
import { ensureLoggedIn } from "connect-ensure-login";
import { NextFunction, Request, Response, Router } from "express";
// controllers
import { saveBlogAndRedirect, viewBlogs } from "../controller/blog";
import { handleRejection } from "../controller/handleRejection";
// middleware
import { isAdmin, isAdminOrBlogOwner } from "../middleware/roles.middleware";
// mongoose models
import blogModel, { Blog } from "../model/blogModel";
import { User } from "../model/userModel";
// init express route
const route = Router();

route.use(
  /^\/.*(myblogs|unverified|new|preview|verify|edit).*/i,
  ensureLoggedIn({ redirectTo: "/login", setReturnTo: false })
);
route
  .get("/", viewBlogs("all"))
  .get("/myblogs", viewBlogs("myblogs"))
  .get("/unverified", isAdmin, viewBlogs("unverified"))
  .get("/new", (req: Request, res: Response) => {
    if (!req.user.verified) {
      req.flash(
        "error",
        "you must verify before writing blogs <a href='/verify'>Verify</a>"
      );
      return res.redirect("/blog");
    }
    res.render("blog/new", { blog: new blogModel(), message: req.flash() });
  })
  .post(
    "/new",
    async (req: Request, res: Response, next: NextFunction) => {
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
  .get("/:slug", async (req: Request, res: Response, next: any) => {
    const blog: Blog = await blogModel.findOne({
      slug: req.params.slug,
      verified: true,
    });
    if (blog) res.render("blog/view", { blog });
    else next({ status: 404, message: "Not found" }, req, res);
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
      res.redirect(`/blog/${blog.slug}`);
    })
  );
export default route;

// extend types
type _User = User;
declare global {
  namespace Express {
    export interface User extends _User {}
  }
}
