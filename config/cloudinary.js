const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// connect to your cloudinary account using .env variables
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// create a storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "MyShivalikProfilePics", // all uploads go to this folder
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// initialize multer with cloudinary storage
const upload = multer({ storage });

module.exports = { cloudinary, upload };
