// requiring dependencies
import axios from "axios";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// connecting to user model
import User from "../model/userModel.js";

// auth setup
export default (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `/auth/google/login`,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      function (accessToken, refreshToken, profile, cb) {
        User.findOne(
          {
            email: profile.emails[0].value,
          },
          function (err, user) {
            if (err) {
              return cb(err);
            }
            if (user) {
              if (user.authId == profile.id) return cb(err, user);
              else
                return cb(null, false, {
                  message: `You'd authenticated with ${
                    user.authProvider || "password"
                  }`,
                });
            } else {
              user = new User({
                authProvider: profile.provider,
                authId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                verified: true,
              });
              user.save(function (err, user) {
                if (err) {
                  console.log(err);
                  return cb(err);
                }
                return cb(err, user);
              });
            }
          }
        );
      }
    )
  );
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/login",
      },
      async function (accessToken, refreshToken, profile, done) {
        let primaryEmail;
        await axios
          .get(`https://api.github.com/user/emails`, {
            headers: { authorization: `token ${accessToken}` },
          })
          .catch((err) => {
            console.log(err);
          })
          .then((data) => {
            primaryEmail = data.data.filter((email) => email.primary == true)[0]
              .email;
            if (!primaryEmail) {
              return cb(null, false, {
                message: `${profile.provider} isn't providing any email address try different method`,
              });
            }
            User.findOne(
              {
                email: primaryEmail,
              },
              function (err, user) {
                if (err) {
                  return done(err);
                }
                if (user) {
                  if (user.authId == profile.id) return done(err, user);
                  else
                    return cb(null, false, {
                      message: `You'd authenticated with${
                        user.authProvider || "password"
                      }`,
                    });
                } else {
                  user = new User({
                    authProvider: profile.provider,
                    authId: profile.id,
                    username: profile.username || profile.displayName,
                    email: primaryEmail,
                    verified: true,
                  });
                  user.save(function (err, user) {
                    if (err) {
                      console.log(err);
                      return done(err);
                    }
                    return done(err, user);
                  });
                }
              }
            );
          });
      }
    )
  );
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/login",
        enableProof: true,
        profileFields: ["id", "emails", "displayName"],
      },
      function (accessToken, refreshToken, profile, cb) {
        if (!profile.emails[0].value) {
          return cb(null, false, {
            message: `${profile.provider} isn't providing any email address try different method`,
          });
        }
        User.findOne(
          {
            email: profile.emails[0].value,
          },
          function (err, user) {
            if (err) {
              return cb(err);
            }
            if (user) {
              if (user.authId == profile.id) return cb(err, user);
              else
                return cb(null, false, {
                  message: `You'd authenticated with ${
                    user.authProvider || "password"
                  }`,
                });
            } else {
              user = new User({
                authProvider: profile.provider,
                authId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                verified: true,
              });
              user.save(function (err, user) {
                if (err) {
                  console.log(err);
                  return cb(err);
                }
                return cb(err, user);
              });
            }
          }
        );
      }
    )
  );
};
