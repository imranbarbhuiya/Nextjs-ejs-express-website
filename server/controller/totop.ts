import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategy } from "passport-totp";
import { User } from "../model/userModel";

const keys = {};

function findKeyForUserId(id: string, done: Function) {
  return done(null, keys[id]);
}

function saveKeyForUserId(id: string, key: string, done: Function) {
  keys[id] = key;
  return done(null);
}
const totpAuth = () => {
  passport.use(
    new Strategy(function (user: User, done: Function) {
      // setup function, supply key and period to done callback
      findKeyForUserId(
        user.id,
        function (err: Error, obj: { key: string; period: number }) {
          if (err) {
            return done(err);
          }
          return done(null, obj.key, obj.period);
        }
      );
    })
  );
};
function ensureSecondFactor(req: Request, res: Response, next: NextFunction) {
  if (req.session.secondFactor == "totp") {
    return next();
  }
  res.redirect("/login-otp");
}

export { findKeyForUserId, saveKeyForUserId, ensureSecondFactor, totpAuth };
