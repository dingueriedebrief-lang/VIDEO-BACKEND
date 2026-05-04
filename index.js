const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

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