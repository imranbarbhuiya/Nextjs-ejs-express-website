// requiring dependencies
import axios from "axios";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// mongoose model
import User from "../model/userModel";

// setup the google facebook and github strategy
const passportSocialAuth = (passport: any) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `/auth/google/login`,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      (
        _accessToken: any,
        _refreshToken: any,
        profile: {
          emails: { value: any }[];
          id: any;
          provider: any;
          displayName: any;
        },
        next: (arg0: any, arg1?: any, arg2?: { message: string }) => any
      ) => {
        User.findOne(
          {
            email: profile.emails[0].value,
          },
          (
            err: any,
            user: {
              authId: any;
              authProvider: any;
              save: (arg0: (err: any, user: any) => any) => void;
            }
          ) => {
            if (err) {
              return next(err);
            }
            if (user) {
              if (user.authId === profile.id) return next(err, user);
              else
                return next(null, false, {
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
              user.save((err: Error, user: any) => {
                if (err) {
                  return next(err);
                }
                return next(err, user);
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
      async (
        accessToken: any,
        _refreshToken: any,
        profile: { provider: any; id: any; username: any; displayName: any },
        next: (arg0: any, arg1?: any, arg2?: { message: string }) => any
      ) => {
        let primaryEmail: any;
        await axios
          .get(`https://api.github.com/user/emails`, {
            headers: { authorization: `token ${accessToken}` },
          })
          .catch((err) => {
            return next(err);
          })
          .then((data) => {
            primaryEmail = data.data.filter(
              (email: { primary: boolean }) => email.primary === true
            )[0].email;
            if (!primaryEmail) {
              return next(null, false, {
                message: `${profile.provider} isn't providing any email address try different method`,
              });
            }
            User.findOne(
              {
                email: primaryEmail,
              },
              (
                err: any,
                user: {
                  authId: any;
                  authProvider: any;
                  save: (arg0: (err: any, user: any) => any) => void;
                }
              ) => {
                if (err) {
                  return next(err);
                }
                if (user) {
                  if (user.authId === profile.id) return next(err, user);
                  else
                    return next(null, false, {
                      message: `You'd authenticated with ${
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
                  user.save((err: any, user: any) => {
                    if (err) {
                      return next(err);
                    }
                    return next(err, user);
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
      (
        _accessToken: any,
        _refreshToken: any,
        profile: {
          emails: { value: any }[];
          provider: any;
          id: any;
          displayName: any;
        },
        next: (arg0: any, arg1?: any, arg2?: { message: string }) => any
      ) => {
        if (!profile.emails[0].value) {
          return next(null, false, {
            message: `${profile.provider} isn't providing any email address try different method`,
          });
        }
        User.findOne(
          {
            email: profile.emails[0].value,
          },
          (
            err: any,
            user: {
              authId: any;
              authProvider: any;
              save: (arg0: (err: any, user: any) => any) => void;
            }
          ) => {
            if (err) {
              return next(err);
            }
            if (user) {
              if (user.authId === profile.id) return next(err, user);
              else
                return next(null, false, {
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
              user.save((err: any, user: any) => {
                if (err) {
                  return next(err);
                }
                return next(err, user);
              });
            }
          }
        );
      }
    )
  );
};

export default passportSocialAuth;
