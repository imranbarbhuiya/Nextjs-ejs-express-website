// requiring dependencies
import { ensureLoggedIn, ensureLoggedOut } from "connect-ensure-login";
import { randomBytes } from "crypto";
import { Router } from "express";
import { body, validationResult } from "express-validator";
import passport from "passport";
import { loginRouteRateLimit } from "../controller/rate-limit-controller.js";
// requiring local modules
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
    }),
    function (req, res) {
      res.redirect("/");
    }
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
    }),
    function (req, res) {
      res.redirect("/");
    }
  );

// local login system
route
  .get("/login", function (req, res) {
    res.locals.message = req.flash();
    res.render("login", {
      login: "",
      register: "none",
    });
  })
  .post("/login", loginRouteRateLimit)

  // local register system
  .get("/register", function (req, res) {
    res.locals.message = req.flash();
    res.render("login", {
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
        },
        req.body.password,
        function (err, user) {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/register");
          } else {
            passport.authenticate("local")(req, res, function () {
              // res.redirect(req.session.returnTo || "/");
              res.redirect("/verify");
              delete req.session.returnTo;
            });
          }
        }
      );
    }
  )

  // change password system
  .get("/change", ensureLoggedIn("/login"), function (req, res) {
    res.render("change");
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
    res.render("verify", { email: req.user.email });
  })
  .post("/verify", ensureLoggedIn("/login"), async (req, res) => {
    let verificationToken = randomBytes(20).toString("hex");
    let verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    const mailTo = req.user.email;
    const user = await User.findOneAndUpdate(
      { email: mailTo },
      {
        verificationToken: verificationToken,
        verificationTokenExpire: verificationTokenExpire,
      }
    );
    res.locals.message = req.flash("success", "Check email to proceed");
    res.redirect("/verify");
    mail(
      mailTo,
      "Verify account",
      `<p>Verify account</p>
        <a href="https://${req.headers.host}/verify/${req.user.id}/${verificationToken}">Click here</a>`
    ).catch((error) => {
      req.flash("error", "auth fail");
      console.log(error);
    });
  })
  .get("/verify/:id/:token", function (req, res) {
    if (!req.user.email) return res.redirect("/login");
    {
      User.findOne(
        { id: req.params.id, verificationToken: req.params.token },
        function (err, sanitizedUser) {
          if (sanitizedUser) {
            const now = Date.now();
            if (sanitizedUser.verificationTokenExpire - now > 0) {
              User.findOneAndUpdate(
                { email: req.user.email, verificationToken: req.params.token },
                { verified: true },
                function (err, user) {
                  if (err) {
                    req.flash("error", "An error occurred");
                    res.redirect("/login");
                  } else if (!user) {
                    req.flash("error", "unauthorized");
                    res.redirect("/login");
                  } else {
                    req.flash("success", "Verification successful");
                    res.redirect(req.session.returnTo || "/");
                  }
                }
              );
            }
            User.updateOne(
              { email: req.user.email, verificationToken: req.params.token },
              { $unset: { verificationTokenExpire: 1, verificationToken: 1 } },
              function (err, user) {
                if (err) console.log(err);
              }
            );
          } else {
            req.flash("error", "Invalid token");
            res.redirect("/login");
          }
        }
      );
    }
  })

  // forgot password system
  .get("/reset", ensureLoggedOut(), function (req, res) {
    res.locals.message = req.flash();
    res.render("forgot", { password: false });
  })
  .post("/reset", async function (req, res) {
    let resetPasswordToken = randomBytes(20).toString("hex");
    let resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    const mailTo = req.body.email;
    const user = await User.findOneAndUpdate(
      { email: mailTo },
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
        <a href="https://${req.headers.host}/reset/${user.id}/${resetPasswordToken}">Click here</a>`
      ).catch((error) => {
        req.flash("error", "auth fail");
        console.log(error);
      });
    }
  })
  .get("/reset/:id/:token", ensureLoggedOut("/"), function (req, res) {
    res.locals.message = req.flash();
    res.render("forgot", { password: true });
  })
  .post("/reset/:id/:token", function (req, res) {
    User.findOne(
      { id: req.params.id, resetPasswordToken: req.params.token },
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

  // logout
  .get("/logout", function (req, res) {
    req.session.destroy(function (err) {
      res.redirect("/");
    });
  });

export default route;
