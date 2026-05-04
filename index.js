const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

// =====================
// 🔧 MIDDLEWARES
// =====================
app.use(cors());
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
app.post("/analyze", (req, res) => {
  const { url } = req.body;

  console.log("URL reçue :", url);

  if (!url) {
    return res.status(400).json({ error: "Aucun lien fourni" });
  }

  // Simulation pour l'instant
  res.json({
    message: "Analyse OK 🚀",
    url: url,
    title: "Vidéo test",
    duration: "10:00"
  });
});

// =====================
// 🚀 START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});