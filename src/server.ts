// importing dependencies
import flash from "connect-flash";
import connect_redis from "connect-redis";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import methodOverride from "method-override";
import mongoose from "mongoose";
import next from "next";
import passport from "passport";
import path from "path";
import serveFavicon from "serve-favicon";
// controllers
import passportSocialAuth from "./controller/auth";
// Redis Client
import redisClient from "./db/redisDB";
// Logger
import Logger from "./lib/logger";
// middleware
import morganMiddleware from "./middleware/morgan";
// Mongoose Models
import userModel from "./model/userModel";
// routes
import blogRoute from "./routes/blog";
import courseRoute from "./routes/course";
import indexRoute from "./routes/index";
import loginRoute from "./routes/login";
import testRoute from "./routes/test";
// configuring env variables
config();
// next setup
const port = parseInt(process.env.PORT, 10) || 8080;
const dev = process.env.NODE_ENV !== "production";
const client = next({ dev });
const handle = client.getRequestHandler();
// making redisStore for session store
const RedisStore = connect_redis(session);
// init next
client.prepare().then(() => {
  // initiate app
  const app = express();
  app
    // using helmet for csp hide powered by and referer policy
    .use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            scriptSrc: [
              "'self'",
              "https://cdn.jsdelivr.net",
              "https://code.jquery.com",
            ],
            imgSrc: ["'self'", "https://*", "data:"],
          },
        },
        hidePoweredBy: true,
      })
    )
    // serve favicon
    .use(
      serveFavicon(
        path.join(__dirname, "..", "public", "assets", "img", "favicon.ico")
      )
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
        store: new RedisStore({ client: redisClient }),
        cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
      })
    )
    // set flash
    .use(flash())
    // init passport
    .use(passport.initialize())
    // using passport user session in app
    .use(passport.session())
    // using method override to use put and delete
    .use(methodOverride("_method"))
    // using morgan to write logs in console
    .use(morganMiddleware);

  // mongodb connect with mongoose
  mongoose.connect(process.env.MONGODB_SRV, (err) => {
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
    // a test route
    .use("/test", testRoute)
    // defining admin middleware
    .use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (req.user && req.user.role == "admin") {
          req.admin = true;
          next();
        } else {
          req.admin = false;
          next();
        }
      }
    )
    // adding course router
    .use("/course", courseRoute)
    // adding blog router
    .use("/blog", blogRoute);
  // next route

  app.get("*", (req, res) => {
    return handle(req, res);
  });
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    const err: any = new Error("Not Found");
    err.status = 404;
    next(err);
  });
  // error handlers

  // development error handler
  // will log and print the error

  if (app.get("env") === "development") {
    app.use(function (err: Error, req, res, next) {
      Logger.warn(err);
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        status: err.status,
      });
    });
  }
  // production error handler
  // without logs

  app.use(function (err, req, res, next) {
    if (err.code === "EBADCSRFTOKEN") {
      res.status(403);
      res.send("Forbidden");
      return;
    }
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      status: err.status,
    });
  });

  // listening to port
  app.listen(port, () => {
    Logger.debug(`Server started at port ${port}`);
  });
});

// Interface setup
interface Error {
  status?: number;
  message?: string;
}

// extend types
declare global {
  namespace Express {
    export interface Request {
      admin?: boolean;
    }
    export interface User {
      role?: string;
    }
  }
}
