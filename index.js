const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(express.json());
// 🔥 IMPORTANT
app.use(cors());

const upload = multer({ dest: "uploads/" });

app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier envoyé");
  }

  res.send("Upload réussi 🎉");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
// =====================
// 🎥 ANALYSE YOUTUBE
// =====================
app.post("/analyze", (req, res) => {
  const { url } = req.body;

  console.log("URL reçue :", url);

  if (!url) {
    return res.status(400).json({ error: "Aucun lien fourni" });
  }

  // Pour l'instant on simule
  res.json({
    message: "Analyse OK 🚀",
    url: url
  });
});