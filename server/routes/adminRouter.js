const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const adminController = require("../controller/adminController");
const adminServices = require("../services/adminRender");
const productController = require("../controller/productController");
const categoryController = require("../controller/categoryController");
const middle = require("../middleware/adminMiddleware");

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

router.get("/update-image", middle.loggedIn, adminServices.updateimage); // update page image
router.post(
  "/api/add-product",
  middle.loggedIn,
  upload.array("image", 12),
  productController.newproduct
); // Add new Image
router.post(
  "/upload-image",
  middle.loggedIn,
  upload.array("image", 12),
  productController.uploadimage
); // upload image
router.get("/image-delete", middle.loggedIn, productController.deleteImage); // deleting the image
router.post("/crop-image", middle.loggedIn, productController.cropeimage); // deleting the image

router.get("/adminlogin", middle.notlogged, adminServices.adminlogin); //adminlogin loginpage render
router.post("/adminlogin", middle.notlogged, adminServices.isAdmin); //Checking Admin Post

router.get("/admin-dash", middle.loggedIn, adminController.admindash); //Admin Dashboard render
router.get("/admin-coupon", middle.loggedIn, adminServices.loadCoupon); //Admin Dashboard render
router.get("/deleted-coupon", middle.loggedIn, adminServices.deletedCoupon); //Admin Dashboard render
router.get("/restore-coupon", middle.loggedIn, adminServices.restoreCoupon); //Admin Dashboard render
router.get("/add-coupon", adminController.addCoupon); //Admin Dashboard render
router.post("/save-coupon", middle.loggedIn, adminController.saveCoupon); //Admin Dashboard render
router.get("/delete-coupon", middle.loggedIn, adminController.deleteCoupon); //Admin Dashboard render

router.get("/admin-order", middle.loggedIn, adminServices.adminorder); // admin order render
router.get("/order-details", middle.loggedIn, adminServices.order); // admin order render
router.get("/change-status", middle.loggedIn, adminServices.changeStatus); // admin order render

router.get("/api/users", middle.loggedIn, adminController.find); // find users
router.get("/admin-users", middle.loggedIn, adminServices.adminusers); // admin user render
router.get("/user-details", middle.loggedIn, adminServices.userDetails); // Find Single User details
router.get("/api/block", middle.loggedIn, adminController.block); // Block The user
router.get("/api/unblock", middle.loggedIn, adminController.unblock); // unBlock The user

router.get("/admin-products", middle.loggedIn, adminServices.adminproducts); // Product page
router.get("/unlisted-product", middle.loggedIn, adminServices.softDelete); // unlisted products page
router.get("/add-products", middle.loggedIn, productController.addproducts); // Add Product Render
router.get("/delete-product", middle.loggedIn, productController.deleteProduct); // delete Product Get
router.get("/unlist-product", middle.loggedIn, productController.softDelete); // unlist products
router.get("/update-product",middle.loggedIn,productController.updateproduct1); // update Product Render
router.get("/restore-product",middle.loggedIn,productController.restoreProduct); // restore products
router.get("/api/products", middle.loggedIn, productController.findproduct); // find products
router.post("/api/update-product",middle.loggedIn,productController.updateproduct); //updateProduct Post method

router.get("/admin-catogary",middle.loggedIn,categoryController.admincategory); // all categories render
router.get("/single-catogary",middle.loggedIn,categoryController.singlecategory); // Going Inside one categories
router.get("/unlist-catogary",middle.loggedIn,categoryController.unlistcategory); // Unlisting The Categories from home
router.get("/delete-category",middle.loggedIn,categoryController.deletecategory); // unlisting the category

router.post("/add-Category", middle.loggedIn, categoryController.addcategory); // Add category
router.get("/add-category", middle.loggedIn, categoryController.showcategory); // Add Category Post
router.get("/unlisted-category",middle.loggedIn,categoryController.unlistedcategory); // Unlisted category
router.get("/restore-category",middle.loggedIn,categoryController.restorecategory); // restore category

router.get("/shopping-cart", middle.loggedIn, adminServices.shopingCart); // Find Single User details

router.get("/sales-report", adminController.salesReport);
router.post("/sales-report/download",middle.loggedIn,adminController.download);

router.post("/api/getDetailsChart",middle.loggedIn,adminController.getDetailsChart)

router.get("/adminlogout", middle.loggedIn, adminController.logout); //admin logout

module.exports = router;
