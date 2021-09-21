export async function isAdmin(req, res, next) {
  if (req.user.role == "admin") {
    next();
  } else {
    res.sendStatus(400);
  }
}

export async function canAddCourse(req, res, next) {
  if (req.user.role == "instructor" || req.user.role == "admin") {
    next();
  } else {
    res.sendStatus(400);
  }
}

export async function canEditCourse(req, res, next) {
  if (
    req.user.role == "admin" ||
    (req.user.role == "instructor" && req.course.userId == req.user.id)
  ) {
    next();
  } else {
    res.sendStatus(400);
  }
}

export async function canEditArticle(req, res, next) {
  if (
    req.user.role == "admin" ||
    (req.user.role == "instructor" && req.article.userId == req.user.id)
  ) {
    next();
  } else {
    res.sendStatus(400);
  }
}