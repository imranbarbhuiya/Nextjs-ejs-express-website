async function isAdmin(req, res, next) {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    res.sendStatus(401);
  }
}

async function canAddCourse(req, res, next) {
  if (req.user && (req.user.role == "instructor" || req.user.role == "admin")) {
    next();
  } else {
    res.sendStatus(400);
  }
}

async function canEditCourse(req, res, next) {
  if (
    req.user &&
    (req.user.role == "admin" || req.course.author == req.user.id)
  ) {
    next();
  } else {
    res.sendStatus(400);
  }
}
function isAdminOrBlogOwner(path) {
  return (req, res, next) => {
    if (
      req.user &&
      (req.user.role == "admin" || req.blog.author == req.user.id)
    ) {
      res.locals.message = req.flash();
      res.render(`blog/${path}`, { blog: req.blog });
    } else {
      res.render("error", { error: { status: 401 }, message: "Unauthorized" });
    }
  };
}
export { isAdmin, canAddCourse, canEditCourse, isAdminOrBlogOwner };
