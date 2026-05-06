require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();

app.use(cors());
app.use(express.json());

/* CLOUDINARY CONFIG */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* STORAGE */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi", "mkv"]
  })
});

const upload = multer({ storage });

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API WORKING"
  });
});

/* THUMBNAIL ROUTE */
app.post("/thumbnail-upload", upload.single("video"), async (req, res) => {

  try {

    console.log("FILE:");
    console.log(req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No video uploaded"
      });
    }

    const videoUrl = req.file.path;

    const publicId = req.file.filename;

    const thumbnailUrl = cloudinary.url(publicId + ".jpg", {
      resource_type: "video",
      transformation: [
        {
          width: 480,
          height: 270,
          crop: "fill"
        }
      ]
    });

    return res.json({
      success: true,
      video: videoUrl,
      thumbnail: thumbnailUrl
    });

  } catch (error) {

    console.log("FULL ERROR:");
    console.log(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

});

/* IMPORTANT FOR VERCEL */
module.exports = app;

app.listen(3000, () => {
  console.log("SERVER RUNNING ON PORT 3000");
});