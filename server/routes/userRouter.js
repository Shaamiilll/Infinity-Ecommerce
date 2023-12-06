const express = require("express");
const router = express.Router();

const userServices = require("../services/userRender");
const userController = require("../controller/userController");
const cartController = require("../controller/cartController");
const wishlistController = require("../controller/wishlistController");
const orderController = require("../controller/orderController.js");
const paymentController = require("../controller/paymentController");
const middle = require("../middleware/UserMiddleware.js");

router.get("/", userController.userHome); //home render
router.get("/our-store", userController.products); //Our Store
router.get("/header", userServices.header); //otp product

router.get("/login", userServices.login); //Login Render
router.get("/register", userServices.register); //Register render
router.post("/api/registeruser", userController.newuser); //For Saving new user
router.post("/api/login", userController.isUser); //For login the user
router.get("/account-details",middle.loggedIn, userServices.account); //Account Details
router.get("/logout", userController.logout); // User logout
router.get("/Add-address", userServices.addaddress); // add user to another collction
router.post("/Add-address", userController.addaddress); // add user to another collction
router.get("/Add-address/checkout", userController.renderaddaddresscheckout); // add user to another collction
router.post("/Add-address/checkout", userController.addaddresscheckout); // add user to another collction
router.get ("/Account/address", userServices.address); // add user to another collction
router.get("/delete-address", userController.deleteAddress); // add user to another collction
router.get("/update-address", userServices.updateAddress); // add user to another collction
router.post("/api/update-address", userController.updateAddress); // add user to another collction



router.get('/successOrder', userServices.Success);



router.get("/forget-password", userServices.forgetPassword); //forgot password render
router.post("/forget-password", userController.forgetPassword); //rendering post page for forgot password
router.post("/new-Password", userServices.newPassword); //rendering post page for forgot password
router.post("/verify-password", userController.newPassword); //rendering post page for forgot password


router.get("/product", userServices.product); //otp product
router.get("/product-details", userServices.productdetalis); // add user to another collction

//otp
router.get("/otpLogin", userServices.otp); //otp render
router.post("/verifyOTP", userController.otp); //For login the user
router.post("/resendOTP", userController.resendOTP); //For login the user
router.get("/verifyUser", userController.verifyuser); //For login the user

//Login/Register

//Cart

router.get("/api/cart", cartController.AddToCart); //For login the user
router.get("/MyCart", cartController.MyCart); //For login the user
router.get("/remove-product", cartController.RemoveProduct); //For login the user
router.get("/cart/inc", cartController.inc); // add user to another collction
router.get("/cart/dec", cartController.decre); // add user to another collction

router.get("/wishlist",userServices.wishlist)
router.get("/api/wishlist", wishlistController.AddToWishlist); //For login the user
router.get("/Mywishlist", wishlistController.Mywishlist); //For login the user
router.get("/remove-wishlist", wishlistController.RemoveProduct); //For login the user


// router.get("/checkout-page", userServices.loadcheckout); //For login the user
router.post("/checkout-page", userServices.loadcheckout); //For login the user
router.post("/checkout/address", userServices.changeAddress); //For login the user

router.post("/payment", userServices.loadPayment); //For login the user
router.post("/submit-order", orderController.order); //For login the user
router.get('/order-success',orderController.orderid)
router.post('/payment-verified',orderController.payment)
router.get("/my-Orders", orderController.MyOrders); //For login the user
router.post("/create-order", paymentController.createOrder); //For login the user






//pagination serch sort filter

router.get('/products',userController.products)


module.exports = router;
