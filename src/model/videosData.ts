import mongoose from "mongoose";

const videoSchema = mongoose.Schema({
  courseId: { type: mongoose.Types.ObjectId, require: true, unique: true },
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

const videoModel = mongoose.model("video", videoSchema);

export default videoModel;
