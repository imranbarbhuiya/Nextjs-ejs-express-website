import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
const { model, Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, default: "guest" },
  authId: String,
  authProvider: String,
  verified: { type: Boolean, required: true, default: false },
  role: { type: String, required: true, default: "student" },
  referralCode: {
    type: String,
    default() {
      let hash = 0;
      for (let i = 0; i < this.email.length; i++) {
        hash = this.email.charCodeAt(i) + ((hash << 5) - hash);
      }
      const res = (hash & 0x00ffffff).toString(16).toUpperCase();
      return "00000".substring(0, 6 - res.length) + res;
    },
  },
  referredBy: { type: String, default: null },
  resetPasswordToken: { type: String },
  verificationToken: { type: String },
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
const User = model("User", userSchema);

export default User;
