import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  courseId: { type: mongoose.Types.ObjectId, require: true, unique: true },
  reviews: [
    {
      userId: { type: mongoose.Types.ObjectId, require: true, unique: true },
      star: { type: Number, require: true },
      comment: {
        type: String,
      },
    },
  ],
});

const reviewModel = mongoose.model("review", reviewSchema);

export default reviewModel;
