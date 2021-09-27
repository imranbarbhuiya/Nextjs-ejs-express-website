import blogModel from "../model/blogModel.js";

function saveBlogAndRedirect(path) {
  return async (req, res) => {
    let blog = req.blog;
    blog.author = req.user.id;
    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.markdown = req.body.markdown;
    blog.verified = false;
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
    else if (path == "all") blogs = await blogModel.find({ verified: true });
    else if (path == "unverified")
      blogs = await blogModel.find({ verified: false });
    else return req.sendStatus(404);
    res.render("blog/index", { blogs: blogs });
  };
}
export { view, saveBlogAndRedirect };
