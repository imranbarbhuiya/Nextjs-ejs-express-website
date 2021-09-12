import mongoose from "mongoose";
import mongoose_fuzzy_searching from "mongoose-fuzzy-searching";
const { model, Schema } = mongoose;

const courseSchema = new Schema({
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

export default model("Course", courseSchema);
