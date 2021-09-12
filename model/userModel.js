const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
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
const User = new mongoose.model("User", userSchema);

module.exports = User;
