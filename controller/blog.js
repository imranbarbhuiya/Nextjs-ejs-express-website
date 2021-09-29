import { metaphone } from "metaphone";
import blogModel from "../model/blogModel.js";

function saveBlogAndRedirect(path) {
  return async (req, res) => {
    let keyword = "";
    req.body.title
      .split(/ +/)
      .forEach((key) => (keyword += `${metaphone(key)} `));
    keyword += `b ${metaphone(req.user.username)}`;
    let blog = req.blog;
    blog.authorName = req.user.username;
    blog.author = req.user.id;
    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.markdown = req.body.markdown;
    blog.verified = false;
    blog.keywords = keyword;
    try {
      blog = await blog.save();
      res.redirect(`/blog/preview/${blog.id}`);
    } catch (error) {
      res.render(`blog/${path}`, { blog: blog });
    }
  };
}
function view(path) {
  return async (req, res, next) => {
    let blogs;
    if (path == "myblogs")
      blogs = await blogModel.find({ author: req.user.id });
    else if (path == "all") {
      let searchQuery = req.query.search;
      if (searchQuery) {
        let keyword = "";
        searchQuery
          .split(/ +/)
          .forEach((key) => (keyword += `${metaphone(key)} `));
        try {
          blogs = await blogModel
            .fuzzySearch(`${keyword} ${searchQuery}`, {
              verified: true,
            })
            .sort({ createdAt: -1 });
        } catch (error) {
          console.log(error);
        }
      } else {
        blogs = await blogModel
          .find({ verified: true })
          .sort({ createdAt: -1 });
      }
    } else if (path == "unverified")
      blogs = await blogModel.find({ verified: false });
    else {
      req.flash("error", "unauthorized");
      return req.redirect("/blog");
    }
    res.locals.message = req.flash();
    res.render("blog/index", { blogs: blogs });
  };
}
export { view, saveBlogAndRedirect };
