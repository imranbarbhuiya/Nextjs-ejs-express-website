// importing dependencies
import compression from "compression";
import flash from "connect-flash";
import connect_redis from "connect-redis";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import csrf from "csurf";
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
// middlewares
import adminMiddleware from "./middleware/admin.middleware";
import errorMiddleware from "./middleware/error.middleware";
import morganMiddleware from "./middleware/morgan.middleware";
// Mongoose Models
import UserModel, { User } from "./model/userModel";
// routes
import adminRoute from "./routes/admin";
import blogRoute from "./routes/blog";
import courseRoute from "./routes/course";
import loginRoute from "./routes/login";
import userRoute from "./routes/user";
// configuring env variables
// PRODUCTION: remove dotenv
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
// init csrf
const csrfProtection = csrf({ cookie: true });
// init next
client
  .prepare()
  .then(() => {
    // initiate app
    const app = express();
    app.use(compression());
    app.use((_req: Request, res: Response, next: NextFunction) => {
      // nonce should be base64 encoded
      res.locals.nonce = crypto.randomBytes(16).toString("base64");
      global.__webpack_nonce__ = res.locals.nonce;
      next();
    });
    if (app.get("env") !== "development") {
      // using helmet for csp and hide powered by only in production mode
      // PRODUCTION: remove development condition
      app.use(
        helmet({
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              scriptSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://code.jquery.com",
                // (_req: Request, res: Response) => `'nonce-${res.locals.nonce}'`,
                ,
              ],
              imgSrc: ["'self'", "https://*", "data:"],
            },
          },
          hidePoweredBy: true,
        })
      );
    }
    app
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
          // PRODUCTION: add secure cookie
          // deepcode ignore WebCookieSecureDisabledByDefault: will be added in production
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
      // adding login router
      .use("/", csrfProtection, loginRoute)
      // defining admin middleware
      .use(adminMiddleware)
      // adding course router
      .use("/course", courseRoute)
      // adding blog router
      .use("/blog", blogRoute)
      // adding admin router
      .use("/admin", adminRoute)
      // adding user router
      .use("/user", userRoute);
    // next route
    app.all("*", (req: Request, res: Response) => {
      return handle(req, res);
    });

    // error handlers
    app.use(errorMiddleware as ErrorRequestHandler);

    // listening to port
    const listener = app.listen(port, () => {
      Logger.info(`Started server on ${JSON.stringify(listener.address())}`);
    });
  })
  .catch((err) => {
    Logger.error(err);
  });

// type setup
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

// handle unhandled process exceptions
process.on("uncaughtException", (err) => {
  Logger.error(err);
});
