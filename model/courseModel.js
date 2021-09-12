const mongoose = require("mongoose");
const mongoose_fuzzy_searching = require("mongoose-fuzzy-searching");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  thumbnail: { type: String },
  description: { type: String },
  videos: { type: Array },
  comments: { type: Array },
  reviews: { type: Array },
  price: { type: Number },
  keywords: { type: String },
});

courseSchema.plugin(mongoose_fuzzy_searching, { fields: ["keywords"] });

module.exports = mongoose.model("Course", courseSchema);
