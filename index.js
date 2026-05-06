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

    console.log("======= FICHIER UPLOAD =======");
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Aucune vidéo reçue"
      });
    }

    // URL de la vidéo
    const videoUrl = req.file.path;

    // PUBLIC ID CLOUDINARY
    // IMPORTANT :
    // utiliser public_id et PAS filename
    const publicId = req.file.public_id;

    console.log("PUBLIC ID :", publicId);

    // Génération thumbnail
    const thumbnailUrl = cloudinary.url(publicId, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        {
          width: 480,
          height: 270,
          crop: "fill",
          quality: "auto"
        }
      ]
    });

    console.log("THUMBNAIL :", thumbnailUrl);

    return res.json({
      success: true,
      video: videoUrl,
      thumbnail: thumbnailUrl
    });

  } catch (error) {

    console.log("======= ERREUR COMPLETE =======");
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message,
      details: error
    });
  }

});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});