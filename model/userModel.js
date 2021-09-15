import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
const { model, Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, require: true, unique: true },
  username: { type: String, required: true },
  password: String,
  googleId: String,
  githubId: String,
  facebookId: String,
  verified: { type: Boolean, require: true },
  designation: { type: String },
  resetPasswordToken: { type: String, expires: 1000 },
  resetPasswordExpire: { type: String, expires: 1000 },
  verificationToken: { type: String },
  verificationTokenExpire: { type: String },
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  limitAttempts: true,
  maxAttempts: 100,
  maxInterval: 500,
  errorMessages: {
    NoSaltValueStoredError:
      "Your account was created with social auth. Try signing in with social auth.",
    IncorrectPasswordError: "Incorrect password entered",
    IncorrectUsernameError: "User with the given email id doesn't exist",
    MissingUsernameError: "No email id provided",
    UserExistsError: "User with the given email id already exist",
    TooManyAttemptsError:
      "Account locked permanently due to too many failed login attempts. Please reset password to unlock.",
    AttemptTooSoonError: "You're trying too fast please wait and try again.",
  },
});
const User = new model("User", userSchema);

export default User;
