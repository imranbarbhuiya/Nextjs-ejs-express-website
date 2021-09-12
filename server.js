// requiring dependencies

import flash from "connect-flash";
import connect_mongo from "connect-mongo";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
// splitted routes
// splitted routes
import auth from "./auth/auth.js";
// local modules
import userModel from "./model/userModel.js";
import courseRoute from "./routes/course.js";
import loginRoute from "./routes/login.js";
dotenv.config();
const { create } = connect_mongo;
const { connect } = mongoose;

const app = express();

// express setup

app
  .use(express.static("public"))
  .set("view engine", "ejs")
  .use(
    express.urlencoded({
      extended: true,
    })
  )
  .set("trust proxy", 1)
  .use(cookieParser())
  .use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: create({ mongoUrl: process.env.MONGODB_SRV }),
      cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    })
  )
  .use(flash())

  .use(passport.initialize())
  .use(passport.session());

// mongodb connect with mongoose

connect(process.env.MONGODB_SRV, (err) => {
  if (err) console.log(err);
  else console.log("Connected to the database successfully.");
});

const port = process.env.PORT;

// passport setup

passport.use(userModel.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  userModel.findById(id, function (err, user) {
    done(err, user);
  });
});

auth(passport);
app.use("/", loginRoute);

app.use("/course", courseRoute);

// will be removed in future
app
  .get("/", function (req, res) {
    res.render("index", {
      user: req.user ? req.user : null,
    });
  })

  // listening to port

  .listen(port, () => {
    console.log(`Server started at port ${port}`);
  });
