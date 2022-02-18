import fuzzySearching, {
  MongoosePluginModel,
} from "@imranbarbhuiya/mongoose-fuzzy-searching";
import type { Document } from "mongoose";
import { model, Schema } from "mongoose";

interface Course extends Document {
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

// @ts-expect-error
courseSchema.plugin(fuzzySearching, {
  fields: ["keywords", "author", "description", "title"],
});

const courseModel = model<Course>(
  "Course",
  courseSchema
) as MongoosePluginModel<Course>;
export default courseModel;
export type { Course };
