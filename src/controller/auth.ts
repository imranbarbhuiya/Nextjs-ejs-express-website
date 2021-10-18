// requiring dependencies
import axios from "axios";
import {
  Profile as FacebookProfile,
  Strategy as FacebookStrategy,
} from "passport-facebook";
import { Strategy as GitHubStrategy } from "passport-github2";
import {
  Profile,
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
// mongoose model
import UserModel, { User } from "../model/userModel";

// setup the google facebook and github strategy
const passportSocialAuth = (passport: any) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `/auth/google/login`,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        passReqToCallback: false,
      },
      (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        next: VerifyCallback
      ) => {
        UserModel.findOne(
          {
            email: profile.emails[0].value,
          },
          (err: Error, user: any) => {
            if (err) {
              return next(err);
            }
            if (user) {
              if (user.authId === profile.id) return next(err, user);
              else
                return next(null, null, {
                  message: `You'd authenticated with ${
                    user.authProvider || "password"
                  }`,
                });
            } else {
              user = new UserModel({
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
        accessToken: string,
        _refreshToken: string,
        profile: {
          provider: string;
          id: string;
          username: string;
          displayName: string;
        },
        next: (arg0: any, arg1?: any, arg2?: { message: string }) => any
      ) => {
        let primaryEmail: string;
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
            UserModel.findOne(
              {
                email: primaryEmail,
              },
              (err: any, user: User) => {
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
                  user = new UserModel({
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
        _accessToken: string,
        _refreshToken: string,
        profile: FacebookProfile,
        next: (arg0: any, arg1?: any, arg2?: { message: string }) => any
      ) => {
        if (!profile.emails[0].value) {
          return next(null, null, {
            message: `${profile.provider} isn't providing any email address try different method`,
          });
        }
        UserModel.findOne(
          {
            email: profile.emails[0].value,
          },
          (err: any, user: User) => {
            if (err) {
              return next(err);
            }
            if (user) {
              if (user.authId === profile.id) return next(err, user);
              else
                return next(null, null, {
                  message: `You'd authenticated with ${
                    user.authProvider || "password"
                  }`,
                });
            } else {
              user = new UserModel({
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
