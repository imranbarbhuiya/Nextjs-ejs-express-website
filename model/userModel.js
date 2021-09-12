import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
const { model, Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, require: true, unique: true },
  name: { type: String, required: true },
  password: String,
  googleId: String,
  githubId: String,
  facebookId: String,
  verified: { type: Boolean, require: true },
  designation: { type: String },
  resetPasswordToken: { type: String, expires: 1000 },
  resetPasswordExpire: { type: String, expires: 1000 },
});

userSchema.plugin(passportLocalMongoose);
const User = new model("User", userSchema);

export default User;
