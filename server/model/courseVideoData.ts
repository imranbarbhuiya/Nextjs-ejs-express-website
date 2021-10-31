import { model, Schema } from "mongoose";

interface CourseVideoData extends Document {
  courseId: string;
  videos: {
    title: string;
    thumbnail: string;
    description: string;
    videoUrl: string;
    videoId: string;
  }[];
}

const courseVideoDataSchema = new Schema<CourseVideoData>({
  courseId: { type: String, require: true, unique: true },
  videos: [
    {
      videoId: { type: String, require: true, unique: true },
      videoUrl: {
        type: String,
        require: true,
      },
      title: String,
      thumbnail: String,
      description: String,
    },
  ],
});

const courseVideoDataModel = model<CourseVideoData>(
  "courseVideoData",
  courseVideoDataSchema
);

export default courseVideoDataModel;
export type { CourseVideoData };
