const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

// =====================
// 🔧 MIDDLEWARES
// =====================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// =====================
// 📁 CONFIG UPLOAD
// =====================
const upload = multer({ dest: "uploads/" });

// =====================
// 🧪 ROUTE TEST
// =====================
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// =====================
// 🎬 UPLOAD VIDEO
// =====================
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier envoyé");
  }

  console.log("Fichier reçu :", req.file);

  res.send("Upload réussi 🎉");
});

// =====================
// 🎥 ANALYSE YOUTUBE
// =====================
const ytdl = require("ytdl-core");

app.post("/analyze", async (req, res) => {
  const { url } = req.body;

  console.log("URL reçue :", url);

  if (!url) {
    return res.status(400).json({ error: "Aucun lien fourni" });
  }

  try {
    const info = await ytdl.getInfo(url);

    const title = info.videoDetails.title;
    const duration = info.videoDetails.lengthSeconds;

    res.json({
      message: "Analyse réelle OK 🚀",
      title,
      duration
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur analyse vidéo" });
  }
});