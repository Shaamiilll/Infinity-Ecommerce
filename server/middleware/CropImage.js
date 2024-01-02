const multer = require("multer");
const path = require("path");
const sharp = require("sharp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}-${file.originalname}`;
    cb(null, fileName);
  },
});

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    const error = new Error("Only image files are allowed!");
    error.status = 400;
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
});

// Middleware to resize images to 100x100 pixels
const resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  sharp(imagePath)
    .resize(100, 100)
    .toFile(path.join(__dirname, `../images/resize_${req.file.filename}`), (err) => {
      if (err) {
        return next(err);
      }
      next();
    });
};

module.exports = { upload, resizeImage };
