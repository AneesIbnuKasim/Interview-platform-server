const multer = require("multer");
const env = require("../../config/env");
const { AppError } = require("../../util/errors");

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    callback(
      new AppError(
        "Only PNG, JPEG, and WebP screenshots are allowed",
        400,
        "INVALID_SCREENSHOT_TYPE",
      ),
    );
    return;
  }

  callback(null, true);
};

const uploadScreenshot = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploads.screenshotMaxBytes,
    files: 1,
  },
  fileFilter,
}).single("screenshot");

module.exports = {
  uploadScreenshot,
};
