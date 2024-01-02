const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const fileName = `${uniqueSuffix}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      const error = new Error("Only image files are allowed!");
      error.status = 400;
      return cb(error, false);
    }
    cb(null, true);
  },
}).array("image", 12)

// Middleware to resize and crop images to 100x100 pixels
const resizeAndCropImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const outputImagePath = path.join(__dirname, `../images/resize_${req.file.filename}`);

  sharp(imagePath)
    .resize(100, 100)
    .crop(sharp.strategy.entropy) // You can change the strategy as needed
    .toFile(outputImagePath, (err) => {
      if (err) {
        return next(err);
      }
      req.file.path = outputImagePath; // Update the file path to the cropped version
      next();
    });
};

module.exports = {
  resizeAndCropImage,
  upload
}
