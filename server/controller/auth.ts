// requiring dependencies
import axios from "axios";
import { CallbackError } from "mongoose";
import passport from "passport";
import {
  Profile as FacebookProfile,
  Strategy as FacebookStrategy,
} from "passport-facebook";
import {
  Profile as GithubProfile,
  Strategy as GitHubStrategy,
} from "passport-github2";
import {
  Profile as GoogleProfile,
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
// mongoose model
import UserModel, { User } from "../model/userModel";
//

// setup the google facebook and github strategy
const passportSocialAuth = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: `/auth/google/login`,
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        passReqToCallback: false,
      },
      (
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfile,
        next: VerifyCallback
      ) => {
        UserModel.findOne(
          {
            email: profile.emails?.[0].value,
          },
          (err: Error, user: User) => {
            if (err) {
              return next(err);
            }
            if (user) {
              if (user.authId === profile.id) return next(err, user);
              else
                return next(null, undefined, {
                  message: `You'd authenticated with ${
                    user.authProvider || "password"
                  }`,
                });
            } else {
              user = new UserModel({
                authProvider: profile.provider,
                authId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0].value,
                verified: true,
              });
              user.save((err: CallbackError, user: User) => {
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
        clientID: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        callbackURL: "/auth/github/login",
      },
      async (
        accessToken: string,
        _refreshToken: string,
        profile: GithubProfile,
        next: (
          error: string | Error | null,
          user?: User,
          info?: { message: string }
        ) => any
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
              return next(null, undefined, {
                message: `${profile.provider} isn't providing any email address try different method`,
              });
            }
            UserModel.findOne(
              {
                email: primaryEmail,
              },
              (err: Error, user: User) => {
                if (err) {
                  return next(err);
                }
                if (user) {
                  if (user.authId === profile.id) return next(err, user);
                  else
                    return next(null, undefined, {
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
                  user.save((err: CallbackError, user: User) => {
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
        clientID: process.env.FACEBOOK_APP_ID as string,
        clientSecret: process.env.FACEBOOK_APP_SECRET as string,
        callbackURL: "/auth/facebook/login",
        enableProof: true,
        profileFields: ["id", "emails", "displayName"],
      },
      (
        _accessToken: string,
        _refreshToken: string,
        profile: FacebookProfile,
        next: (
          error: string | Error | null,
          user?: User,
          info?: { message: string }
        ) => any
      ) => {
        if (!profile.emails?.[0].value) {
          return next(null, undefined, {
            message: `${profile.provider} isn't providing any email address try different method`,
          });
        }
        UserModel.findOne(
          {
            email: profile.emails?.[0].value,
          },
          (err: Error, user: User) => {
            if (err) {
              return next(err);
            }
            if (user) {
              if (user.authId === profile.id) return next(err, user);
              else
                return next(null, undefined, {
                  message: `You'd authenticated with ${
                    user.authProvider || "password"
                  }`,
                });
            } else {
              user = new UserModel({
                authProvider: profile.provider,
                authId: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0].value,
                verified: true,
              });
              user.save((err: CallbackError, user: User) => {
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
