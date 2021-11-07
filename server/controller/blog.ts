// importing modules
import { Request, Response } from "express";
import { Metaphone } from "natural";
// mongoose model
import blogModel, { Blog } from "../model/blogModel";

// blog save controller
function saveBlogAndRedirect(path: string) {
  // deepcode ignore NoRateLimitingForExpensiveWebOperation: it's a middleware
  return async (req: Request, res: Response) => {
    const keywords = Metaphone.process(
      `${req.body.title} ${req.user?.username} ${req.body.description}`
    );
    let blog = req.blog;
    blog.authorName = req.user?.username;
    blog.author = req.user?.id;
    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.markdown = req.body.markdown;
    blog.verified = false;
    blog.keywords = keywords;
    blog.slug = req.body.slug;
    try {
      if (blog.emptyHtml()) {
        req.flash("error", "Markdown can't be empty");
        return res.render(`blog/${path}`, { blog, message: req.flash() });
      }
      blog = await blog.save();
      res.redirect(303, `/blog/preview/${blog.id}`);
    } catch (error) {
      const errorMsg = error.message.split(":")[2];
      req.flash("error", errorMsg ? errorMsg : error.message);
      res.render(`blog/${path}`, { blog, message: req.flash() });
    }
  };
}
// view blog controller
function viewBlogs(path: string) {
  // deepcode ignore NoRateLimitingForExpensiveWebOperation: it's a middleware
  return async (req: Request, res: Response) => {
    let blogs: Blog[];
    // deepcode ignore HTTPSourceWithUncheckedType: fixed in previous middleware
    const searchQuery = req.query.search;
    const autocompleteQuery = req.query.term;
    if (path === "myblogs") {
      if (searchQuery) {
        blogs = await search(searchQuery as string, 0, req.user.id);
      } else {
        blogs = await blogModel
          .find({ author: req.user.id })
          .sort({ createdAt: -1 });
      }
    } else if (path === "all") {
      if (searchQuery) {
        blogs = await search(String(searchQuery), 0);
      } else if (autocompleteQuery) {
        blogs = await search(String(autocompleteQuery), 0);
        const sanitizedBlogs: string[] = blogs.map((blog: Blog) => blog.title);
        // SECURITY: probably need more sanitization
        // deepcode ignore XSS: already sanitized
        return res.send(sanitizedBlogs);
      } else {
        let skip = 0;
        if (req.query.skip) skip = Number(req.query.skip);
        blogs = await blogModel
          .find({ verified: true })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(5);
        if (skip !== 0) return res.send(blogs);
      }
    } else if (path === "unverified") {
      if (searchQuery) {
        blogs = await search(searchQuery as string, 0, undefined, true);
      } else {
        blogs = await blogModel
          .find({ verified: false })
          .sort({ createdAt: -1 });
      }
    } else {
      req.flash("error", "unauthorized");
      return res.redirect("/blog");
    }
    res.render("blog/index", {
      blogs,
      query: searchQuery,
      message: req.flash(),
      csrfToken: req.csrfToken(),
    });
  };
}
// search function
async function search(
  searchQuery: string,
  skip?: number,
  author?: string,
  unverified?: boolean
) {
  if (!skip) skip = 0;
  const keywords = Metaphone.process(searchQuery);
  let blogs: Blog[];
  if (author)
    blogs = await blogModel
      .fuzzySearch(`${keywords} ${searchQuery}`, {
        author,
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
}

export { viewBlogs, saveBlogAndRedirect };

// extend types
declare global {
  namespace Express {
    export interface Request {
      blog: Blog;
    }
  }
}
