import type { Document } from "mongoose";
import { model, Schema } from "mongoose";

interface UserCourseData extends Document {
  userId: string;
  subscribedCourses?: {
    courseId: string;
    price: number;
    createdAt: Date;
  }[];
  yourCourses?: {
    courseId: string;
    price: number;
    createdAt: Date;
  }[];
}

const userCourseDataSchema = new Schema<UserCourseData>({
  userId: {
    type: String,
    required: true,
  },
  subscribedCourses: [
    {
      courseId: { type: String, require: true, unique: true },
      price: { type: Number },
      createdAt: {
        type: Date,
        required: true,
        default: new Date(),
      },
    },
  ],
  yourCourses: [
    {
      courseId: { type: String, require: true, unique: true },
      price: { type: Number },
      createdAt: {
        type: Date,
        required: true,
        default: new Date(),
      },
    },
  ],
});

const userCourseDataModel = model<UserCourseData>(
  "user-course-data",
  userCourseDataSchema
);

export default userCourseDataModel;
export type { UserCourseData };
