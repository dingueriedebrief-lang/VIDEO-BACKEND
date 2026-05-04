const express = require("express");
const multer = require("multer");

const app = express();

// config upload
const upload = multer({ dest: "uploads/" });

// route test
app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

// 🔥 ROUTE UPLOAD (IMPORTANT)
app.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("Aucun fichier envoyé");
  }

  console.log("Fichier reçu :", req.file);

  res.send("Vidéo reçue avec succès 🎉");
});

// port Railway
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});