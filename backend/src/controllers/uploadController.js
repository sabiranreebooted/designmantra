const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "../../uploads");
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, callback) => {
      try {
        await fs.mkdir(uploadDirectory, { recursive: true });
        callback(null, uploadDirectory);
      } catch (error) {
        callback(error);
      }
    },
    filename: (req, file, callback) => {
      const extension = allowedTypes.get(file.mimetype);
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Only JPG, PNG, GIF, or WebP images are allowed.");
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

function respondWithUploads(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "Choose at least one image to upload." });
  }

  const files = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    name: file.originalname,
  }));
  return res.status(201).json({ success: true, data: files });
}

module.exports = { imageUpload, respondWithUploads };
