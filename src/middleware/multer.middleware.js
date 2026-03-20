const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dating-app/users",
    resource_type: "auto", // Allow image, video, and audio
    transformation: [
      { width: 1080, height: 1080, crop: "limit" }
    ]
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Increased to 50MB for video support
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", "image/png", "image/jpg",
      "video/mp4", "video/mpeg", "video/quicktime",
      "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/aac"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only images, videos, and audio files are allowed"), false);
    }

    cb(null, true);
  }
});

module.exports = upload;
