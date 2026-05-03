const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/clip", upload.single("video"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `output-${Date.now()}.mp4`;

  ffmpeg(inputPath)
    .setStartTime(0)
    .setDuration(30)
    .output(outputPath)
    .on("end", () => {
      res.download(outputPath);
    })
    .on("error", (err) => {
      console.error(err);
      res.status(500).send("Erreur");
    })
    .run();
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});