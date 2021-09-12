// requiring dependencies

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require("connect-flash");

// local modules
const User = require("./model/userModel");

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
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_SRV }),
      cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
    })
  )
  .use(flash())

  .use(passport.initialize())
  .use(passport.session());

// mongodb connect with mongoose

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_SRV, (err) => {
  if (err) console.log(err);
  else console.log("Connected to the database successfully.");
});

const port = process.env.PORT;

// passport setup

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// splitted routes

require("./auth/auth")(passport);
const loginRoute = require("./routes/login");
app.use("/", loginRoute);

const courseRoute = require("./routes/course");
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
