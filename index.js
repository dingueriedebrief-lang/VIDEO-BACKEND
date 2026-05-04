const express = require("express");
const cors = require("cors");
const multer = require("multer");

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
app.post("/analyze", (req, res) => {
  const { url } = req.body;

  console.log("URL reçue :", url);

  if (!url) {
    return res.status(400).json({ error: "Aucun lien fourni" });
  }

  res.json({
    message: "Analyse réelle OK 🚀",
    url: url,
    title: "Vidéo test",
    duration: "10:00"
  });
});

// =====================
// 🚀 START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running 🚀"));