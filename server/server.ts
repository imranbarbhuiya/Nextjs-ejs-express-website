// importing dependencies
import flash from "connect-flash";
import connect_redis from "connect-redis";
import cookieParser from "cookie-parser";
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import session from "express-session";
import helmet from "helmet";
import methodOverride from "method-override";
import next from "next";
import passport from "passport";
import { join } from "path";
import serveFavicon from "serve-favicon";
// controllers
import passportSocialAuth from "./controller/auth";
// connecting to redis
import redisClient from "./db/redisDB";
// Logger
import Logger from "./lib/logger";
// middleware
import morganMiddleware from "./middleware/morgan";
// Mongoose Models
import UserModel, { User } from "./model/userModel";
// routes
import blogRoute from "./routes/blog";
import courseRoute from "./routes/course";
import indexRoute from "./routes/index";
import loginRoute from "./routes/login";
// configuring env variables
require("dotenv").config();
// connecting to mongodb
require("./db/mongoDB");
// next setup
const port = parseInt(process.env.PORT as string, 10);
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
    .use(serveFavicon(join(__dirname, "..", "public", "img", "favicon.ico")))
    // set static file directory
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
        secret: process.env.SECRET as string,
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

  // passport setup
  passport.use(UserModel.createStrategy());

  // passport serialize and deserialize
  passport.serializeUser(UserModel.serializeUser());
  passport.deserializeUser(UserModel.deserializeUser());

  // calling passport social auth function
  passportSocialAuth();

  app
    // adding index router
    .use("/", indexRoute)
    // adding login router
    .use("/", loginRoute)
    // defining admin middleware
    .use(
      (
        req: express.Request,
        _res: express.Response,
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
  app.get("*", (req: Request, res: Response) => {
    return handle(req, res);
  });
  // catch 404 and forward to error handler
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    const err: Error = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  // error handlers
  app.use(((err: Error, _req: Request, res: Response) => {
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
  }) as ErrorRequestHandler);

  // listening to port
  const listener = app.listen(port, () => {
    Logger.info(`Started server on ${JSON.stringify(listener.address())}`);
  });
});

// Interface setup
interface Error {
  code?: string;
  status?: number;
  message?: string;
}

// extend types
type _User = User;
declare global {
  namespace Express {
    export interface User extends _User {}
    export interface Request {
      admin?: boolean;
    }
  }
}
