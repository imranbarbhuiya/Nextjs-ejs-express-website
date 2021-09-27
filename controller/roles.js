async function isAdmin(req, res, next) {
  if (req.user.role == "admin") {
    next();
  } else {
    res.sendStatus(401);
  }
}

async function canAddCourse(req, res, next) {
  if (req.user.role == "instructor" || req.user.role == "admin") {
    next();
  } else {
    res.sendStatus(400);
  }
}

async function canEditCourse(req, res, next) {
  if (
    req.user.role == "admin" ||
    (req.user.role == "instructor" && req.course.author == req.user.id)
  ) {
    next();
  } else {
    res.sendStatus(400);
  }
}
function isBlogOwner(path) {
  return (req, res, next) => {
    if (req.user.role == "admin" || req.blog.author == req.user.id) {
      res.render(`blog/${path}`, { blog: req.blog });
    } else {
      res.sendStatus(400);
    }
  };
}
export { isAdmin, canAddCourse, canEditCourse, isBlogOwner };
