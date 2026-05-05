require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const path = require("path");

const app = express();

// =====================
// CONFIG
// =====================
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 🔥 CONFIG FFMPEG (compatible Render + Windows)
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// servir frontend
app.use(express.static(__dirname));

// servir thumbnails
app.use("/thumbnails", express.static(path.join(__dirname, "thumbnails")));

// upload config
const upload = multer({ dest: "uploads/" });

// =====================
// TEST API
// =====================
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// =====================
// ANALYSE YOUTUBE
// =====================
app.post("/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL manquante" });
  }

  try {
    let videoId;

    if (url.includes("youtu.be")) {
      videoId = url.split("youtu.be/")[1];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1];
    }

    if (!videoId) {
      return res.status(400).json({ error: "ID vidéo introuvable" });
    }

    videoId = videoId.split("&")[0];

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: "Vidéo non trouvée" });
    }

    const video = data.items[0];

    const title = video.snippet.title;
    const isoDuration = video.contentDetails.duration;

    function convertDuration(iso) {
      const match = iso.match(/PT(\d+M)?(\d+S)?/);
      const minutes = (match[1] || "0M").replace("M", "");
      const seconds = (match[2] || "0S").replace("S", "");
      return `${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
    }

    const duration = convertDuration(isoDuration);
    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    res.json({ title, duration, thumbnail });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur analyse" });
  }
});

// =====================
// THUMBNAIL UPLOAD VIDEO
// =====================
app.post("/thumbnail-upload", upload.single("video"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier envoyé" });
  }

  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, "thumbnails", `${req.file.filename}.jpg`);
  const time = req.body.time || "1";

  console.log("Temps reçu:", time);

  ffmpeg(inputPath)
    .setStartTime(time)
    .frames(1)
    .output(outputPath)
    .on("end", () => {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      res.json({
        message: "Thumbnail généré",
        thumbnail: `${baseUrl}/thumbnails/${req.file.filename}.jpg`
      });
    })
    .on("error", (err) => {
      console.error("FFMPEG ERROR:", err);
      res.status(500).send("Erreur thumbnail");
    })
    .run();
});

// =====================
// THUMBNAIL YOUTUBE
// =====================
app.post("/thumbnail-youtube", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL manquante" });
  }

  try {
    let videoId;

    if (url.includes("youtu.be")) {
      videoId = url.split("youtu.be/")[1];
    } else {
      videoId = url.split("v=")[1];
    }

    videoId = videoId.split("&")[0];

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    res.json({
      message: "Thumbnail YouTube",
      thumbnail
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur YouTube thumbnail" });
  }
});

// =====================
// TEST FFMPEG
// =====================
app.get("/test-ffmpeg", (req, res) => {
  ffmpeg()
    .on("start", () => {})
    .on("error", () => res.send("FFmpeg erreur ❌"))
    .on("end", () => res.send("FFmpeg OK ✅"))
    .save("/dev/null");
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});