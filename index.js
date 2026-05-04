const express = require("express");
const cors = require("cors");
const multer = require("multer");
const ytdl = require("ytdl-core");
const app = express();

// 🔥 CORS AVANT TOUT
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// 🔥 IMPORTANT pour preflight
app.options("*", cors());

app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// =====================
// 🎥 UPLOAD
// =====================
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier envoyé");
  }

  res.send("Upload réussi 🎉");
});

// =====================
// 🎥 ANALYSE YOUTUBE
// =====================
app.post("/analyze", async (req, res) => {
  try {
    const { url } = req.body;

    console.log("URL reçue :", url);

    if (!url) {
      return res.status(400).json({ error: "Aucun lien fourni" });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "Lien YouTube invalide" });
    }

    const info = await ytdl.getInfo(url);

    const title = info.videoDetails.title;
    const duration = info.videoDetails.lengthSeconds;

    res.json({
      message: "Analyse réelle OK 🚀",
      url,
      title,
      duration
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});