const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dating-app/users",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 1080, height: 1080, crop: "limit" }
    ]
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG and PNG images allowed"), false);
    }

    cb(null, true);
  }
});

module.exports = upload;