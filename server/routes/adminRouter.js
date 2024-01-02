const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const adminServices = require("../services/adminRender");
const productController = require("../controller/productController");
const categoryController = require("../controller/categoryController");
const bannerController = require("../controller/bannerController");
const couponController = require("../controller/couponController");
const middle = require("../middleware/adminMiddleware");
const  upload  = require("../middleware/multerSetup"); // Import the updated middlewares



// ADMIN LOGIN PAGE
router.get("/adminlogin", middle.notlogged, adminServices.adminlogin); //adminlogin loginpage render
router.post("/adminlogin", middle.notlogged, adminServices.isAdmin); //Checking Admin Post


// ADMIN DASBOARD
router.get("/admin-dash", middle.loggedIn, adminController.admindash); //Admin Dashboard render


// ADMIN BANNER MANAGEMENT
router.get('/admin-banner',adminServices.adminBanner)
router.get('/add-admin-banner',adminServices.loadAddAdminBanner)
router.post('/add-admin-banner',upload.upload,upload.resizeAndCropImage,adminController.addAdminBanner)
router.get('/delete-banner',bannerController.deleteBanner)
router.get('/restore-banner',bannerController.restoreBanner)
router.get('/deleted-banner',adminServices.deletedBanner)
router.get('/edit-banner',adminServices.editBanner)
router.post('/update-admin-banner',bannerController.UpdateBanner)


// COUPON MANAGEMENT
router.get("/admin-coupon", middle.loggedIn, adminServices.loadCoupon); //Coupon Page Render
router.get("/deleted-coupon", middle.loggedIn, adminServices.deletedCoupon); //Delted Coupon Page Render
router.get("/restore-coupon", middle.loggedIn, adminServices.restoreCoupon); //Restore Coupon Page Render
router.get("/add-coupon",middle.loggedIn, couponController.addCoupon); //Add Coupon page Render
router.post("/save-coupon", middle.loggedIn, couponController.saveCoupon); //save The Coupon
router.get("/delete-coupon", middle.loggedIn, couponController.deleteCoupon); //Delete Coupon


// ADMIN ORDER MANAGEMENT
router.get("/admin-order", middle.loggedIn, adminServices.adminorder); // Admin order Page Render
router.get("/order-details", middle.loggedIn, adminServices.order); // Admin Order Detail Page Render
router.get("/change-status", middle.loggedIn, adminServices.changeStatus); // Admin Order Change Status


// USER MANAGEMENT
router.get("/api/users", middle.loggedIn, adminController.find); // find users
router.get("/admin-users", middle.loggedIn, adminServices.adminusers); // admin All user render
router.get("/user-details", middle.loggedIn, adminServices.userDetails); // Find Single User details
router.get("/api/block", middle.loggedIn, adminController.block); // Block The user
router.get("/api/unblock", middle.loggedIn, adminController.unblock); // unBlock The user


// ADMIN PRODUCT MANAGEMENT
router.get("/admin-products", middle.loggedIn, adminServices.adminproducts); // Product page Render
router.get("/unlisted-product", middle.loggedIn, adminServices.softDelete); // unlisted products page
router.get("/add-products", middle.loggedIn, productController.addproducts); // Add Product Render
router.get("/delete-product", middle.loggedIn, productController.deleteProduct); // delete Product Get
router.get("/unlist-product", middle.loggedIn, productController.softDelete); // unlist products
router.get("/update-product",middle.loggedIn,productController.updateproduct1); // update Product Render
router.get("/restore-product",middle.loggedIn,productController.restoreProduct); // restore products
router.get("/api/products", middle.loggedIn, productController.findproduct); // find products
router.post("/api/update-product",middle.loggedIn,productController.updateproduct); //updateProduct Post method
router.get("/image-delete", middle.loggedIn, productController.deleteImage); // deleting the image
router.post("/crop-image", middle.loggedIn, productController.cropeimage); // deleting the image
router.get("/update-image", middle.loggedIn, adminServices.updateimage); // update page image
router.post( "/api/add-product",middle.loggedIn, upload.upload,upload.resizeAndCropImage, productController.newproduct); // Add new Image
router.post("/upload-image",middle.loggedIn,upload.upload,upload.resizeAndCropImage,productController.uploadimage); // upload image


// ADMIN CATEGORY MANAGEMENT
router.get("/admin-catogary",middle.loggedIn,categoryController.admincategory); // all categories render
router.get("/single-catogary",middle.loggedIn,categoryController.singlecategory); // Going Inside one categories
router.get("/unlist-catogary",middle.loggedIn,categoryController.unlistcategory); // Unlisting The Categories from home
router.get("/delete-category",middle.loggedIn,categoryController.deletecategory); // unlisting the category
router.post("/add-Category", middle.loggedIn, categoryController.addcategory); // Add category
router.get("/add-category", middle.loggedIn, categoryController.showcategory); // Add Category Post
router.get("/unlisted-category",middle.loggedIn,categoryController.unlistedcategory); // Unlisted category
router.get("/restore-category",middle.loggedIn,categoryController.restorecategory); // restore category


// ADMIN SALES REPORT
router.get("/sales-report", adminController.salesReport); // Render the sales Report and Download
router.post("/api/getDetailsChart",middle.loggedIn,adminController.getDetailsChart)


// ADMIN LOG-OUT
router.get("/adminlogout", middle.loggedIn, adminController.logout); //admin logout

module.exports = router;
