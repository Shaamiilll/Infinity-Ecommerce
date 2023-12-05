const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const adminController = require("../controller/adminController");
const userController = require("../controller/userController");
const adminServices = require("../services/adminRender");
const productController = require("../controller/productController");
const categoryController = require("../controller/categoryController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const uniqueSuffix = Date.now(); // Corrected to use a semicolon
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uniqueSuffix}-${file.originalname}`; // Use string interpolation to concatenate the parts
    cb(null, fileName);
  },
});
const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif||PNG)$/)) {
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

router.get("/update-image", adminServices.updateimage); // update page image
router.post("/api/add-product",upload.array("image", 12),productController.newproduct); // Add new Image
router.post("/upload-image",upload.array("image", 12),productController.uploadimage); // upload image



router.get("/image-delete", productController.deleteImage); // Find Single User details

router.get("/adminlogin", adminServices.adminlogin); //adminlogin loginpage render

router.get("/admin-dash", adminServices.admindash); //Admin Dashboard render
router.get("/admin-order", adminServices.adminorder); // admin order render
router.get("/order-details", adminServices.order); // admin order render

router.get("/admin-products", adminServices.adminproducts); // admin order render
router.get("/add-products", productController.addproducts); // Add Product Render
router.get("/unlisted-product", adminServices.softDelete); // unlist products
router.get("/delete-product", productController.deleteProduct); // delete Product Get
router.get("/unlist-product", productController.softDelete); // unlist products
router.get("/update-product", productController.updateproduct1); // update Product Render
router.get("/restore-product", productController.restoreProduct); // unlist products
router.get("/api/products", productController.findproduct); // find products
router.post("/api/update-product", productController.updateproduct);

router.get("/admin-users", adminServices.adminusers); // admin user render
router.get("/user-details", adminServices.userDetails); // Find Single User details
router.get("/api/block", adminController.block); // aBlock The user

router.get("/admin-catogary", categoryController.admincategory); // all categories render
router.get("/single-catogary", categoryController.singlecategory); // Going Inside one categories
router.get("/unlist-catogary", categoryController.unlistcategory); // Unlisting The Categories from home
router.get("/delete-category", categoryController.deletecategory);

router.post("/add-Category", categoryController.addcategory); // admin order render
router.get("/add-category", categoryController.showcategory); // admin order render
router.get("/unlisted-category", categoryController.unlistedcategory); // admin order render
router.get("/restore-category", categoryController.restorecategory); // admin order render

router.post("/adminlogin", adminServices.isAdmin); //Checking Admin Post
router.get("/api/users", adminController.find); // find users

router.get("/shopping-cart", adminServices.shopingCart); // Find Single User details

router.get("/sales-report",adminController.salesReport)
router.post("/sales-report/download",adminController.download)

module.exports = router;
