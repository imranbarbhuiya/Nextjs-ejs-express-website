import mongoose from "mongoose";
import mongoose_fuzzy_searching from "mongoose-fuzzy-searching";
const { model, Schema } = mongoose;

const courseSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  thumbnail: { type: String },
  description: { type: String },
  videos: { type: Array },
  comments: { type: Array },
  reviews: { type: Array },
  price: { type: Number, required: true, default: 399 },
  keywords: { type: String },
  verified: { type: Boolean, required: true, default: false },
});

courseSchema.plugin(mongoose_fuzzy_searching, {
  fields: ["keywords", "author", "description", "title"],
});

export default model("Course", courseSchema);
