// requiring dependencies
import { ensureLoggedIn, ensureLoggedOut } from "connect-ensure-login";
import { randomBytes } from "crypto";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import passport from "passport";
// requiring local modules
import { loginRouteRateLimit } from "../controller/rate-limit-controller.js";
import User from "../model/userModel.js";
import mail from "../module/mail.js";

// init router
const route = Router();

// auth setup
// google
route
  .get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["email", "profile"],
    })
  )

  .get(
    "/auth/google/login",
    passport.authenticate("google", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  )

  // github
  .get(
    "/auth/github",
    passport.authenticate("github", { scope: ["read:user", "user:email"] })
  )
  .get(
    "/auth/github/login",
    passport.authenticate("github", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  )

  // facebook
  .get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["public_profile", "email"] })
  )
  .get(
    "/auth/facebook/login",
    passport.authenticate("facebook", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

// local login system
route
  .get("/login", function (req, res) {
    res.locals.message = req.flash();
    res.render("login/login", {
      login: "",
      register: "none",
    });
  })
  .post("/login", loginRouteRateLimit)

  // local register system
  .get("/register", function (req, res) {
    res.locals.message = req.flash();
    res.render("login/login", {
      login: "none",
      register: "",
    });
  })
  .post(
    "/register",
    body("username")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide your username!")
      .isAlpha()
      .withMessage("Name must be alphabet letters."),
    body("email").isEmail().withMessage("Email is invalid"),
    body("password")
      .isLength({ min: 8, max: 50 })
      .withMessage("Password length should be 8-50 character long.")
      .matches(/^(?=.*[a-z]).+$/)
      .withMessage("Password should contain lowercase letter.")
      .matches(/^(?=.*[A-Z]).+$/)
      .withMessage("Password should contain Uppercase letter.")
      .matches(/^(?=.*?[#?!@$%^&*-])/)
      .withMessage("Password should contain Special character.")
      .matches(/^(?=.*?[0-9])/)
      .withMessage("Password should contain Number."),
    body("cPassword").custom(async (confirmPassword, { req }) => {
      const password = req.body.password;
      if (password !== confirmPassword) {
        throw new Error("Passwords and confirm password must be same");
      }
    }),
    function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect("/register");
      }
      User.register(
        {
          email: req.body.email,
          username: req.body.username,
          verified: false,
          referredBy: req.session.referred,
        },
        req.body.password,
        function (err, user) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/register");
          } else {
            passport.authenticate("local")(req, res, function () {
              delete req.session.referred;
              res.redirect("/verify");
            });
          }
        }
      );
    }
  )

  // change password system
  .get("/change", ensureLoggedIn("/login"), function (req, res) {
    res.render("login/change");
  })
  .post("change", function (req, res) {
    User.findOne({ email: req.user.username }, function (err, sanitizedUser) {
      if (sanitizedUser) {
        sanitizedUser.changePassword(
          req.body.oldPassword,
          req.body.newPassword,
          function () {
            sanitizedUser.save();
          }
        );
        res.redirect("/");
      }
    });
  })

  // verification system
  .get("/verify", ensureLoggedIn("/login"), function (req, res) {
    if (req.user.verified) return res.redirect("/");
    res.locals.message = req.flash();
    res.render("login/verify", { email: req.user.email });
  })
  .post("/verify", ensureLoggedIn("/login"), async (req, res) => {
    let verificationToken = randomBytes(20).toString("hex");
    const encoded = jwt.sign(
      {
        id: req.user.id,
        token: verificationToken,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const mailTo = req.user.email;
    await User.findOneAndUpdate(
      { email: mailTo },
      {
        verificationToken: verificationToken,
      }
    );
    res.locals.message = req.flash("success", "Check email to proceed");
    res.redirect("/verify");
    mail(
      mailTo,
      "Verify account",
      `<p>Verify account</p>
        <a href="${req.protocol}://${req.headers.host}/verify/${encoded}">Click here</a>`
    ).catch((error) => {
      req.flash("error", "auth fail");
      console.log(error);
    });
  })
  .get("/verify/:token", ensureLoggedIn("/login"), function (req, res) {
    try {
      let decode = jwt.decode(req.params.token, process.env.JWT_SECRET);
      User.findOneAndUpdate(
        { email: req.user.email, verificationToken: decode.token },
        { verified: true, $unset: { verificationToken: 1 } },
        function (err, user) {
          if (err) {
            console.log(err);
            req.flash("error", "An error occurred");
            res.redirect("/verify");
          } else if (!user) {
            req.flash("error", "Invalid token");
            res.redirect("/login");
          } else {
            req.flash("success", "Verification successful");
            res.redirect(req.session.returnTo || "/");
          }
        }
      );
    } catch (err) {
      req.flash("error", "token expired");
      res.redirect("/verify");
    }
  })

  // forgot password system
  .get("/reset", ensureLoggedOut(), function (req, res) {
    res.locals.message = req.flash();
    res.render("login/forgot", { password: false });
  })
  .post("/reset", async function (req, res) {
    let resetPasswordToken = randomBytes(20).toString("hex");
    const mailTo = req.body.email;
    const user = await User.findOneAndUpdate(
      { email: mailTo },
      {
        resetPasswordToken: resetPasswordToken,
      }
    );
    if (!user) {
      res.locals.message = req.flash("error", "User doesn't exist");
      res.redirect("/reset");
    } else {
      const encoded = jwt.sign(
        {
          id: user.id,
          token: resetPasswordToken,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.locals.message = req.flash("success", "Check email to proceed");
      res.redirect("/reset");
      mail(
        mailTo,
        "Reset Password",
        `<p>Reset Password</p>
        <a href="${req.protocol}://${req.headers.host}/reset/${encoded}">Click here</a>`
      ).catch((error) => {
        req.flash("error", "auth fail");
        console.log(error);
      });
    }
  })
  .get("/reset/:token", ensureLoggedOut("/"), function (req, res) {
    jwt.verify(req.params.token, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        req.flash("error", "token expired");
        res.redirect("/login");
      } else {
        res.locals.message = req.flash();
        res.render("login/forgot", { password: true });
      }
    });
  })
  .post(
    "/reset/:token",
    body("password")
      .isLength({ min: 8, max: 50 })
      .withMessage("Password length should be 8-50 character long.")
      .matches(/^(?=.*[a-z]).+$/)
      .withMessage("Password should contain lowercase letter.")
      .matches(/^(?=.*[A-Z]).+$/)
      .withMessage("Password should contain Uppercase letter.")
      .matches(/^(?=.*?[#?!@$%^&*-])/)
      .withMessage("Password should contain Special character.")
      .matches(/^(?=.*?[0-9])/)
      .withMessage("Password should contain Number."),
    body("cPassword").custom(async (confirmPassword, { req }) => {
      const password = req.body.password;
      if (password !== confirmPassword) {
        throw new Error("Passwords and confirm password must be same");
      }
    }),
    function (req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect("/register");
      }
      try {
        let decode = jwt.verify(req.params.token, process.env.JWT_SECRET);
        User.findOne(
          { id: decode.id, resetPasswordToken: decode.token },
          function (err, sanitizedUser) {
            if (err) {
              console.log(err);
              req.flash("error", "an error occurred please try again");
              res.redirect("/reset");
            } else if (sanitizedUser) {
              sanitizedUser.setPassword(req.body.password, function () {
                sanitizedUser.save();
              });
              User.updateOne(
                { resetPasswordToken: decode.token },
                { $unset: { resetPasswordToken: 1 } },
                function (err, user) {
                  if (err) req.flash("error", err.message);
                }
              );
              req.flash("success", "Password reset successful");
            } else {
              req.flash("error", "Invalid token");
            }
            res.redirect("/login");
          }
        );
      } catch (error) {
        if (error.message == "jwt expired") {
          req.flash("error", "Token expired");
        } else req.flash("error", "Invalid token");
        res.redirect("/verify");
      }
    }
  )

  // logout
  .get("/logout", function (req, res) {
    req.session.destroy(function (err) {
      res.redirect("/");
    });
  });

export default route;
