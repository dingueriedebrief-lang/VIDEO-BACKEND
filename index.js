require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();

// =====================
// CONFIG CLOUDINARY
// =====================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// =====================
// STORAGE CLOUDINARY
// =====================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    resource_type: "video",
    folder: "videos"
  }
});

const upload = multer({ storage });

// =====================
app.use(cors());
app.use(express.json());

// =====================
// TEST API
// =====================
app.get("/", (req, res) => {
  res.send("API Cloudinary OK 🚀");
});

// =====================
// UPLOAD + THUMBNAIL
// =====================
app.post("/thumbnail-upload", upload.single("video"), async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier uploadé" });
    }

    const publicId = req.file.filename; // Cloudinary ID

    const thumbnail = cloudinary.url(publicId, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        { width: 480, height: 270, crop: "fill" }
      ]
    });

    res.json({
      message: "Thumbnail OK",
      thumbnail: thumbnail
    });

  } catch (error) {
    console.error("ERREUR BACK:", error);
    res.status(500).json({ error: error.message });
  }
});