import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import Ffmpeg from "fluent-ffmpeg";

Ffmpeg.setFfmpegPath(ffmpegInstaller.path);
Ffmpeg("public/videos/test.mp4", { timeout: 432000 })
  .addOptions([
    "-profile:v baseline",
    "-level 3.0",
    "-start_number 0",
    "-hls_time 10",
    "-hls_list_size 0",
    "-f hls",
  ])
  .output("public/videos/test.m3u8")
  .on("end", () => {
    console.log("end");
  })
  .run();
