import mongoose from "mongoose";

const courseDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
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

const courseDataModel = mongoose.model("course-data", courseDataSchema);

export default courseDataModel;
