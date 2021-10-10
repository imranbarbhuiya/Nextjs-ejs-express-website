const video = document.getElementById("my-video");
const src = "/videos/test.m3u8";

if (Hls.isSupported()) {
  const hls = new Hls();

  hls.loadSource(src);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.play();
  });
} else {
  console.log("no");
}
