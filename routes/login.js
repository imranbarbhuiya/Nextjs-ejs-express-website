const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const express = require("express");
const passport = require("passport");
const crypto = require("crypto");

const User = require("../model/userSchema");
const mail = require("../module/mail");

const route = express.Router();

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
    }),
    function (req, res) {
      res.redirect("/");
    }
  )
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
    }),
    function (req, res) {
      res.redirect("/");
    }
  )
  .get("/login", function (req, res) {
    res.locals.message = req.flash();
    res.render("login", { login: "", register: "none" });
  })
  .post(
    "/login",
    passport.authenticate("local", {
      successReturnToOrRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  )
  .get("/register", function (req, res) {
    res.locals.message = req.flash();
    res.render("login", { login: "none", register: "" });
  })
  .post("/register", function (req, res) {
    User.register(
      {
        username: req.body.username,
        name: req.body.name,
        verified: false,
      },
      req.body.password,
      function (err, user) {
        if (err) {
          req.flash("error", err.message);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect(req.session.returnTo || "/");
          });
        }
      }
    );
  })
  .get("/change", ensureLoggedIn("/login"), function (req, res) {
    res.render("change");
  })
  .post("change", function (req, res) {
    User.findOne(
      { username: req.user.username },
      function (err, sanitizedUser) {
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
      }
    );
  })
  .get("/reset", ensureLoggedOut(), function (req, res) {
    res.locals.message = req.flash();
    res.render("forgot", { password: false });
  })
  .post("/reset", async function (req, res) {
    resetPasswordToken = crypto.randomBytes(20).toString("hex");
    resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    const mailTo = req.body.username;
    const user = await User.findOneAndUpdate(
      { username: mailTo },
      {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: resetPasswordExpire,
      }
    );
    if (!user) {
      res.locals.message = req.flash("error", "User doesn't exist");
      res.redirect("/reset");
    } else {
      res.locals.message = req.flash("success", "Check email to proceed");
      res.redirect("/reset");
      mail(
        mailTo,
        "Reset Password",
        `<p>Reset Password</p>
        <a href="https://${req.headers.host}/reset/${resetPasswordToken}">Click here</a>`
      ).catch((error) => {
        req.flash("error", "auth fail");
        console.log(error);
      });
    }
  })
  .get("/reset/:token", ensureLoggedOut("/"), function (req, res) {
    res.locals.message = req.flash();
    res.render("forgot", { password: true });
  })
  .post("/reset/:token", function (req, res) {
    User.findOne(
      { resetPasswordToken: req.params.token },
      function (err, sanitizedUser) {
        if (sanitizedUser) {
          const now = Date.now();
          if (sanitizedUser.resetPasswordExpire - now > 0) {
            sanitizedUser.setPassword(req.body.password, function () {
              sanitizedUser.save();
            });
          }
          User.updateOne(
            { resetPasswordToken: req.params.token },
            { $unset: { resetPasswordExpire: 1, resetPasswordToken: 1 } },
            function (err, user) {
              if (err) console.log(err);
            }
          );
          req.flash("success", "Password reset successful");
        } else {
          req.flash("error", "Invalid token");
        }
        res.redirect("/login");
      }
    );
  })
  .get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

module.exports = route;