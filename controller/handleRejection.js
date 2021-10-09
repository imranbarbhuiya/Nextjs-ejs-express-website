// defining promise handler
function handleRejection(done) {
  return async (req, res, next) => {
    try {
      // run controllers logic
      await done(req, res, next);
    } catch (e) {
      // if an exception is raised, call next
      if (e.kind == "ObjectId") {
        e.message = "Not found";
        e.status = 404;
      }
      next(e);
    }
  };
}

export { handleRejection };
