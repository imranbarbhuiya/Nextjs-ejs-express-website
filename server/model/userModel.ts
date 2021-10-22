import {
  Document,
  model,
  PassportLocalDocument,
  PassportLocalErrorMessages,
  PassportLocalModel,
  PassportLocalOptions,
  PassportLocalSchema,
  Schema,
} from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
//#region Test Models
interface User extends PassportLocalDocument {
  _id: string;
  email: string;
  username: string;
  authId?: string;
  authProvider?: string;
  verified?: boolean;
  role?: string;
  referralCode?: string;
  referredBy?: string;
  resetPasswordToken?: string;
  verificationToken?: string;
}
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, default: "guest" },
  authId: String,
  authProvider: String,
  verified: { type: Boolean, required: true, default: false },
  role: { type: String, required: true, default: "student" },
  referralCode: {
    type: String,
    default: function () {
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
}) as PassportLocalSchema;

let options: PassportLocalOptions = <PassportLocalOptions>{};
options.usernameField = "email";
options.limitAttempts = true;
options.maxAttempts = 100;
options.maxInterval = 500;

let errorMessages: PassportLocalErrorMessages = {};
errorMessages.NoSaltValueStoredError =
  "Your account was created with social auth. Try signing in with social auth.";
errorMessages.IncorrectPasswordError = "Incorrect password entered";
errorMessages.IncorrectUsernameError =
  "User with the given email id doesn't exist";
errorMessages.MissingUsernameError = "No email id provided";
errorMessages.UserExistsError = "User with the given email id already exist";
errorMessages.TooManyAttemptsError =
  "Account locked permanently due to too many failed login attempts. Please reset password to unlock.";
errorMessages.AttemptTooSoonError =
  "You're trying too fast please wait and try again.";

options.errorMessages = errorMessages;
userSchema.plugin(passportLocalMongoose, options);
interface UserModel<T extends Document> extends PassportLocalModel<T> {}
const UserModel: UserModel<User> = model<User>("User", userSchema);

export default UserModel;
export type { User };
