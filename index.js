require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();

// =====================
// CONFIG
// =====================
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// 🔥 FORCE FFmpeg Linux (solution ultime Render)
let ffmpegPath;

try {
  ffmpegPath = require("ffmpeg-static");
} catch (e) {
  console.error("❌ ffmpeg-static introuvable !");
}

// 🔥 SÉCURITÉ : empêcher tout chemin Windows
if (!ffmpegPath || ffmpegPath.includes("C:\\")) {
  console.log("⚠️ Mauvais ffmpeg détecté, fallback Linux...");
  ffmpegPath = "/usr/bin/ffmpeg";
}

// 🔥 DEBUG
console.log("🚀 FFmpeg utilisé :", ffmpegPath);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// servir frontend
app.use(express.static(__dirname));

// 🔥 créer dossier thumbnails si inexistant
const thumbnailsDir = path.join(__dirname, "thumbnails");
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

// servir thumbnails
app.use("/thumbnails", express.static(thumbnailsDir));

// upload config
const upload = multer({ dest: "uploads/" });

// =====================
// TEST API
// =====================
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// =====================
// THUMBNAIL UPLOAD VIDEO
// =====================
app.post("/thumbnail-upload", upload.single("video"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier envoyé" });
  }

  const inputPath = req.file.path;
  const outputPath = path.join(thumbnailsDir, `${req.file.filename}.jpg`);

  let time = parseInt(req.body.time) || 1;
  if (time < 1) time = 1;
  if (time > 59) time = 59;

  console.log("⏱️ Temps reçu:", time);
  console.log("🎬 FFmpeg utilisé :", ffmpegPath);

  execFile(ffmpegPath, [
    "-i", inputPath,
    "-ss", `00:00:${String(time).padStart(2, "0")}`,
    "-vframes", "1",
    "-y",
    outputPath
  ], (err, stdout, stderr) => {

    if (err) {
      console.error("❌ ERREUR FFMPEG:");
      console.error(err);
      console.error(stderr);

      return res.status(500).json({
        error: "Erreur génération thumbnail",
        details: stderr
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({
      message: "Thumbnail généré",
      thumbnail: `${baseUrl}/thumbnails/${req.file.filename}.jpg`
    });
  });
});

// =====================
// TEST FFMPEG
// =====================
app.get("/test-ffmpeg", (req, res) => {
  execFile(ffmpegPath, ["-version"], (error, stdout) => {
    if (error) {
      console.error(error);
      return res.send("FFmpeg erreur ❌");
    }
    res.send(`<pre>${stdout}</pre>`);
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});