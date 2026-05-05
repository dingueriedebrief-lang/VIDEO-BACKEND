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

// ✅ FFmpeg (solution propre Render)
let ffmpegPath;

try {
  ffmpegPath = require("ffmpeg-static");
} catch (e) {
  console.error("❌ ffmpeg-static non trouvé !");
}

// ❌ STOP si FFmpeg introuvable
if (!ffmpegPath) {
  throw new Error("FFmpeg introuvable. Vérifie ffmpeg-static.");
}

// 🔥 FIX IMPORTANT : permissions Linux (Render)
try {
  fs.chmodSync(ffmpegPath, 0o755);
} catch (e) {
  console.log("⚠️ chmod non nécessaire ou déjà appliqué");
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

// créer dossier thumbnails
const thumbnailsDir = path.join(__dirname, "thumbnails");
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

// servir thumbnails
app.use("/thumbnails", express.static(thumbnailsDir));

// upload
const upload = multer({ dest: "uploads/" });

// =====================
// TEST API
// =====================
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// =====================
// THUMBNAIL
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

  console.log("⏱️ Temps:", time);
  console.log("🎬 FFmpeg:", ffmpegPath);

  execFile(ffmpegPath, [
    "-i", inputPath,
    "-ss", `00:00:${String(time).padStart(2, "0")}`,
    "-vframes", "1",
    "-y",
    outputPath
  ], (err, stdout, stderr) => {

    if (err) {
      console.error("❌ FFMPEG ERROR:");
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
  execFile(ffmpegPath, ["-version"], (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Test FFmpeg:", error);
      console.error(stderr);
      return res.send("FFmpeg erreur ❌");
    }
    res.send(`<pre>${stdout}</pre>`);
  });
});

// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});