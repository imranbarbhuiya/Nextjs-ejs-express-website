// requiring dependencies
import flash from "connect-flash";
import connect_mongo from "connect-mongo";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import methodOverride from "method-override";
import mongoose from "mongoose";
import passport from "passport";
import path from "path";
import serveFavicon from "serve-favicon";
// local modules
import passportSocialAuth from "./controller/auth.js";
import morganMiddleware from "./controller/morgan.js";
import Logger from "./lib/logger.js";
import userModel from "./model/userModel.js";
import blogRoute from "./routes/blog.js";
import courseRoute from "./routes/course.js";
import indexRoute from "./routes/index.js";
import loginRoute from "./routes/login.js";
import { __dirname } from "./__.js";
// object destruction
config();
const { create } = connect_mongo;
const { connect } = mongoose;
// initiate app
const app = express();
app
  // serve favicon
  .use(
    serveFavicon(path.join(__dirname, "public", "assets", "img", "favicon.ico"))
  )
  // set static files
  .use(express.static("public"))
  // set view engine
  .set("view engine", "ejs")
  // fetch data from request
  .use(
    express.urlencoded({
      extended: false,
    })
  )
  // trust proxy
  .set("trust proxy", 1)
  // set cookie parser
  .use(cookieParser())
  // set express season
  .use(
    session({
      name: "codversity_session_id",
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: create({ mongoUrl: process.env.MONGODB_SRV }),
      cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    })
  )
  // set flash
  .use(flash())
  // init passport
  .use(passport.initialize())
  // using passport user session in app
  .use(passport.session())
  // using helmet with custom csp
  .use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://code.jquery.com",
        ],
        imgSrc: ["'self'", "https://*", "data:*"],
      },
    })
  )
  // using method override to use put and delete
  .use(methodOverride("_method"))
  // using morgan to write logs in console
  .use(morganMiddleware);

// mongodb connect with mongoose
connect(process.env.MONGODB_SRV, (err) => {
  err
    ? Logger.error(err)
    : Logger.debug("Connected to the MongoDB database successfully.");
});

// passport setup
passport.use(userModel.createStrategy());

// passport serialize and deserialize
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// calling passport social auth function
passportSocialAuth(passport);

app
  // adding index router
  .use("/", indexRoute)
  // adding login router
  .use("/", loginRoute)
  // defining admin middleware
  .use((req, res, next) => {
    if (req.user && req.user.role == "admin") {
      req.admin = true;
      next();
    } else {
      req.admin = false;
      next();
    }
  })
  // adding course router
  .use("/course", courseRoute)
  // adding blog router
  .use("/blog", blogRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});
// error handlers

/**
 * development error handler
 * will log and print stacktrace
 */
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    Logger.warn(err);
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}
/**
 * production error handler
 * no stacktrace leaked to user
 */
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});

// unhandled error rejection will be customized/removed
process.on("unhandledRejection", function (reason) {
  Logger.error(reason);
});

// listening to port
const port = process.env.PORT;
app.listen(port, () => {
  Logger.debug(`Server started at port ${port}`);
});
