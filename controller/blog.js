import natural from "natural";
import blogModel from "../model/blogModel.js";
const { Metaphone } = natural;

function saveBlogAndRedirect(path) {
  return async (req, res) => {
    let keywords = Metaphone.process(
      `${req.body.title} ${req.user.username} ${req.body.description}`
    );
    let blog = req.blog;
    blog.authorName = req.user.username;
    blog.author = req.user.id;
    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.markdown = req.body.markdown;
    blog.verified = false;
    blog.keywords = keywords;
    blog.slug = req.body.slug;
    try {
      if (blog.emptyHtml()) {
        req.flash("error", "Markdown can't be empty");
        res.locals.message = req.flash();
        return res.render(`blog/${path}`, { blog: blog });
      }
      blog = await blog.save();
      res.redirect(`/blog/preview/${blog.id}`);
    } catch (error) {
      req.flash("error", error.message);
      res.locals.message = req.flash();
      res.render(`blog/${path}`, { blog: blog });
    }
  };
}
function viewBlogs(path) {
  return async (req, res, next) => {
    let blogs;
    let searchQuery = req.query.search;
    let autocompleteQuery = req.query.term;
    if (path == "myblogs") {
      if (searchQuery) {
        blogs = await search(searchQuery, 0, req.user.id);
      } else {
        blogs = await blogModel
          .find({ author: req.user.id })
          .sort({ createdAt: -1 });
      }
    } else if (path == "all") {
      if (searchQuery) {
        blogs = await search(searchQuery, 0);
      } else if (autocompleteQuery) {
        blogs = await search(autocompleteQuery, 0);
        blogs = blogs.map((blog) => blog.title);
        return res.send(blogs);
      } else {
        let skip = 0;
        if (req.query.skip) skip = Number(req.query.skip);
        blogs = await blogModel
          .find({ verified: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(5);
        if (skip != 0) return res.send(blogs);
      }
    } else if (path == "unverified") {
      if (searchQuery) {
        blogs = await search(searchQuery, 0, false, true);
      } else {
        blogs = await blogModel
          .find({ verified: false })
          .sort({ createdAt: -1 });
      }
    } else {
      req.flash("error", "unauthorized");
      return req.redirect("/blog");
    }
    res.locals.message = req.flash();
    res.render("blog/index", { blogs: blogs, query: searchQuery });
  };
}

async function search(searchQuery, skip, author, unverified) {
  if (!skip) skip = 0;
  let keywords = Metaphone.process(searchQuery);
  try {
    let blogs;
    if (author)
      blogs = await blogModel
        .fuzzySearch(`${keywords} ${searchQuery}`, {
          author: author,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(5);
    else if (unverified) {
      blogs = await blogModel
        .fuzzySearch(`${keywords} ${searchQuery}`, {
          verified: false,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(5);
    } else
      blogs = await blogModel
        .fuzzySearch(`${keywords} ${searchQuery}`, {
          verified: true,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(5);
    return blogs;
  } catch (error) {
    console.log(error);
  }
}

export { viewBlogs, saveBlogAndRedirect };
