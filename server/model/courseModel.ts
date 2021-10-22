import { Document, model, Schema } from "mongoose";
import mongoose_fuzzy_searching, {
  MongooseFuzzyModel,
} from "mongoose-fuzzy-searching";

interface Course extends Document {
  _id: string;
  title: string;
  author: string;
  authorId: string;
  thumbnail: string;
  description: string;
  price: number;
  keywords: string;
  verified?: boolean;
}

const courseSchema = new Schema<Course>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: String, required: true },
  thumbnail: { type: String },
  description: { type: String },
  price: { type: Number, required: true, default: 399 },
  keywords: { type: String },
  verified: { type: Boolean, required: true, default: false },
});

courseSchema.plugin(mongoose_fuzzy_searching, {
  fields: ["keywords", "author", "description", "title"],
});

const courseModel = model<Course>(
  "Course",
  courseSchema
) as MongooseFuzzyModel<Course>;
export default courseModel;
export type { Course };
