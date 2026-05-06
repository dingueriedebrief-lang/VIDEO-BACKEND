require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   CLOUDINARY CONFIG
========================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* =========================
   STORAGE CONFIG
========================= */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "videos",
      resource_type: "video"
    };
  }
});

const upload = multer({ storage });

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("🔥 API Cloudinary OK");
});

/* =========================
   THUMBNAIL ROUTE
========================= */
app.post("/thumbnail-upload", upload.single("video"), async (req, res) => {
  try {
    console.log("Fichier reçu :", req.file); // Vérifie le fichier reçu
    if (!req.file) {
      throw new Error("Aucun fichier reçu");
    }

    // URL vidéo
    const videoUrl = req.file.path;

    // PUBLIC ID
    const publicId = req.file.filename;

    // Génération thumbnail
    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        {
          width: 480,
          height: 270,
          crop: "fill"
        }
      ]
    });

    res.json({
      success: true,
      video: videoUrl,
      thumbnail: thumbnailUrl
    });

  } catch (error) {
    console.error("ERREUR CLOUDINARY:", error); // Log détaillé
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack // Optionnel, pour voir la stack si besoin
    });
  }
});