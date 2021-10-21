import mongoose, { Document, model, Schema } from "mongoose";

interface Course extends Document {
  userId: string;
  courses: object;
}

const courseDataSchema = new Schema<Course>({
  userId: {
    type: String,
    required: true,
  },
  courses: [
    {
      courseId: { type: mongoose.Types.ObjectId },
      price: { type: Number },
      createdAt: {
        type: Date,
        required: true,
        default: new Date(),
      },
    },
  ],
});

const courseDataModel = model<Course>("course-data", courseDataSchema);

export default courseDataModel;
