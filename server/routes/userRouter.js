const express = require("express");
const router = express.Router();
const userServices = require("../services/userRender");
const userController = require("../controller/userController");
const cartController = require("../controller/cartController");
const wishlistController = require("../controller/wishlistController");
const orderController = require("../controller/orderController.js");
const paymentController = require("../controller/paymentController");
const middle = require("../middleware/UserMiddleware.js");
const productController = require("../controller/productController.js");
const reviewController = require("../controller/reviewController.js");


// USER HOME RENDER 
router.get("/", userController.userHome); // User home render 


// OUR STORE PAGE
router.get("/our-store", userController.products); //Our Store Page Render
router.get("/header", userServices.header); // Header render
router.get('/products',userController.products) // Pagination,search,sort,filter  REST API


// LOGIN 
router.get("/login", userServices.login); //Login Render
router.post("/api/login", userController.isUser); //For login the user


// REGISTER
router.get("/register", userServices.register); //Register render
router.post("/api/registeruser", userController.newuser); //For Saving new user


// ACCOUNT DETALIS
router.get("/account-details",middle.loggedIn, userServices.account); //Account Details
router.get("/forget-password", userServices.forgetPassword); //forgot password render
router.post("/forget-password", userController.forgetPassword); //rendering post page for forgot password
router.post("/new-Password", userServices.newPassword); //rendering post page for forgot password
router.post("/verify-password", userController.newPassword); //rendering post page for forgot password


// ADDRESS MANAGEMENT
router.get("/Add-address", userServices.addaddress); // add user to another collction
router.post("/Add-address", userController.addaddress); // add user to another collction
router.get("/Add-address/checkout", userController.renderaddaddresscheckout); // add user to another collction
router.post("/Add-address/checkout", userController.addaddresscheckout); // add user to another collction
router.get ("/Account/address", userServices.address); // add user to another collction
router.get("/delete-address", userController.deleteAddress); // add user to another collction
router.get("/update-address", userServices.updateAddress); // add user to another collction
router.post("/api/update-address", userController.updateAddress); // add user to another collction


// PRODUCTS
router.get("/product-details", userServices.productdetalis); // add user to another collction
router.get("/save-singleProduct-session", userServices.SaveSession); // add user to another collction
router.post("/add-review", reviewController.review); // add user to another collction


// OTP MANAGEMENT
router.get("/otpLogin", userServices.otp); //otp render
router.post("/verifyOTP", userController.otp); //For login the user
router.post("/resendOTP", userController.resendOTP); //For login the user
router.get("/verifyUser", userController.verifyuser); //For login the user


// USER CART MANAGEMENT
router.get("/api/cart", cartController.AddToCart); //For login the user
router.get("/MyCart", cartController.MyCart); //For login the user
router.get("/remove-product", cartController.RemoveProduct); //For login the user
router.get("/cart/update",cartController.cartUpdate)


// USER WISHLIST
router.get("/wishlist",userServices.wishlist)//wishlist
router.get("/api/wishlist", wishlistController.AddToWishlist); //add item to wishlist
router.get("/Mywishlist", wishlistController.Mywishlist); //user wishlist
router.get("/remove-wishlist", wishlistController.RemoveProduct); //remove items from the wishlist


// USER CHECKOUT
router.post("/checkout-page", userServices.loadcheckout); //For login the user
router.post("/checkout/address", userServices.changeAddress); //For login the user
router.post("/apply-promo", userController.promoCode); //For login the user
router.post("/apply-wallet", userController.wallet); //For login the user


// USER PAYMENT
router.post("/payment", userServices.loadPayment); //For login the user
router.post('/payment-verified',orderController.payment)


// ORDER MANAGEMENT
router.get('/successOrder', userServices.Success);
router.post("/submit-order", orderController.order); //For login the user
router.get('/order-success',orderController.orderid)
router.get("/my-Orders", orderController.MyOrders); //For login the user
router.post("/create-order", paymentController.createOrder); //For login the user
router.get("/cancel-product", orderController.cancelOrder); //For login the user
router.get("/return-product", orderController.returnOrder); //For login the user
router.get("/myorder/OrderDetailes", orderController.OrderDetailes); //For login the user


// USER LOG-OUT
router.get("/logout", userController.logout); // User logout


module.exports = router;
