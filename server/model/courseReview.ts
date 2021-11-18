import type { Document } from "mongoose";
import { model, Schema } from "mongoose";

interface CourseReview extends Document {
  courseId: string;
  reviews: {
    userId: string;
    star: number;
    comment: string;
  }[];
}
const reviewSchema = new Schema<CourseReview>({
  courseId: { type: String, require: true, unique: true },
  reviews: [
    {
      userId: { type: String, require: true, unique: true },
      star: { type: Number, require: true },
      comment: {
        type: String,
      },
    },
  ],
});

const reviewModel = model<CourseReview>("review", reviewSchema);

export default reviewModel;
export type { CourseReview };
