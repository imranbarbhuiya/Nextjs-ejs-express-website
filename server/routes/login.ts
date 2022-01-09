// importing dependencies
import { ensureLoggedIn, ensureLoggedOut } from "connect-ensure-login";
import { randomBytes } from "crypto";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { body, query, validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import { apiLimiter, authLimiter } from "../controller/api-rate-limit";
// controllers
import { loginRouteRateLimit } from "../controller/login-controller";
import { verify } from "../controller/verify";
// mail module
import mail from "../lib/mail";
// mongoose models
import type { User } from "../model/userModel";
import UserModel from "../model/userModel";

// init router
const route = Router();
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
// Local passport authenticate
// uses passport-local-mongoose
// for login rate limiter rate-limiter-flexible is used

// file deepcode ignore NoRateLimitingForExpensiveWebOperation: already in place

route
  .get("/login", apiLimiter, (req, res) => {
    res.render("login/login", {
      login: "",
      register: "none",
      csrfToken: req.csrfToken(),
      message: req.flash(),
    });
  })
  .post("/login", loginRouteRateLimit)

  // local register system
  .get("/register", apiLimiter, (req, res) => {
    res.render("login/login", {
      login: "none",
      register: "",
      csrfToken: req.csrfToken(),
      message: req.flash(),
    });
  })
  .post(
    "/register",
    authLimiter,
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
    (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect("/register");
      }
      UserModel.register(
        new UserModel({
          email: req.body.email,
          username: req.body.username,
          verified: false,
          referredBy: req.session.referred,
        }),
        req.body.password,
        (err: Error, _user: User) => {
          if (err) {
            req.flash("error", err.message);
            res.redirect("/register");
          } else {
            passport.authenticate("local")(req, res, () => {
              delete req.session["referred"];
              next();
            });
          }
        }
      );
    },
    verify
  )

  // change password system
  .get(
    "/change",
    ensureLoggedIn({ redirectTo: "/login", setReturnTo: false }),
    apiLimiter,
    (req, res) => {
      res.render("login/change", {
        csrfToken: req.csrfToken(),
      });
    }
  )
  .post(
    "/change",
    authLimiter,
    ensureLoggedIn({ redirectTo: "/login", setReturnTo: false }),

    (req: Request, res: Response) => {
      UserModel.findOne(
        { email: req.user.username },
        (_err: Error, sanitizedUser: User) => {
          if (sanitizedUser) {
            sanitizedUser.changePassword(
              req.body.oldPassword,
              req.body.newPassword,
              () => {
                sanitizedUser.save();
              }
            );
            res.redirect("/");
          }
        }
      );
    }
  )

  // verification system
  .get(
    "/verify",
    ensureLoggedIn("/login"),
    query("next").unescape(),
    authLimiter,
    verify
  )
  .get(
    "/verify/:token",
    authLimiter,
    ensureLoggedIn({ redirectTo: "/login", setReturnTo: false }),
    (req: Request, res: Response) => {
      try {
        const decode: JwtPayload = jwt.verify(
          req.params.token,
          process.env.JWT_SECRET
        ) as JwtPayload;
        UserModel.findOneAndUpdate(
          { email: req.user.email, verificationToken: decode.token },
          { verified: true, $unset: { verificationToken: 1 } },
          function (err: Error, user: User) {
            if (err) {
              console.log(err);
              req.flash("error", "An error occurred");
              res.redirect("/");
            } else if (!user) {
              req.flash("error", "Invalid token");
              res.redirect("/");
            } else {
              req.flash("success", "Verification successful");
              res.redirect(req.session.returnTo || "/");
            }
          }
        );
      } catch (err) {
        req.flash("error", "token expired");
        res.redirect("/");
      }
    }
  )

  // forgot password system
  .get("/reset", ensureLoggedOut(), apiLimiter, (req, res) => {
    res.render("login/forgot", {
      password: false,
      message: req.flash(),
      csrfToken: req.csrfToken(),
    });
  })
  .post("/reset", authLimiter, async (req, res) => {
    const resetPasswordToken = randomBytes(20).toString("hex");
    const mailTo = req.body.email;
    const user = await UserModel.findOneAndUpdate(
      { email: mailTo },
      {
        resetPasswordToken,
      }
    );
    if (!user) {
      req.flash("error", "User doesn't exist");
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
      req.flash("success", "Check email to proceed");
      res.redirect("/reset");
      // TODO: replace html with ejs template
      // deepcode ignore XSS: will be replaced with ejs template
      mail({
        mailTo,
        subject: "Reset Password",
        html: `<p>Reset Password</p>
        <a href="${req.protocol}://${req.headers.host}/reset/${encoded}">Click here</a>`,
      }).catch((error: any) => {
        req.flash("error", "auth fail");
        console.log(error);
      });
    }
  })
  .get(
    "/reset/:token",
    ensureLoggedOut("/"),
    apiLimiter,
    (req: Request, res: Response) => {
      try {
        jwt.verify(req.params.token, process.env.JWT_SECRET);

        res.render("login/forgot", {
          password: true,
          message: req.flash(),
          csrfToken: req.csrfToken(),
        });
      } catch {
        req.flash("error", "token expired");
        res.redirect("/login");
      }
    }
  )
  .post(
    "/reset/:token",
    authLimiter,
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
    (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        return res.redirect("/register");
      }
      try {
        const decode: JwtPayload = jwt.verify(
          req.params.token,
          process.env.JWT_SECRET
        ) as JwtPayload;
        UserModel.findOne(
          { id: decode.id, resetPasswordToken: decode.token },
          function (err: Error, sanitizedUser: User) {
            if (err) {
              console.log(err);
              req.flash("error", "an error occurred please try again");
              res.redirect("/reset");
            } else if (sanitizedUser) {
              sanitizedUser.setPassword(req.body.password, function () {
                sanitizedUser.save();
              });
              UserModel.updateOne(
                { resetPasswordToken: decode.token },
                { $unset: { resetPasswordToken: 1 } },
                (err: Error, _user: User) => {
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
      } catch (error: any) {
        if (error.message == "jwt expired") {
          req.flash("error", "Token expired");
        } else req.flash("error", "Invalid token");
        res.redirect("/verify");
      }
    }
  )

  // logout
  .get("/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) req.flash("error", err.message);
      res.redirect("/");
    });
  });

export default route;
