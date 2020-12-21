let express = require("express");
let Registration = require("../Api/Authentication/RegistrationApi");
let Login = require("../Api/Authentication/loginApi");
let sendMail = require("../Api/ResetPassword/sendMailApi");
let resetPassword = require("../Api/ResetPassword/resetPasswordApi");
let sellerLogin = require("../Api/Authentication/sellerLoginApi");
let sellerRegistration = require("../Api/Authentication/SellerRegistrationApi");
let loggedInSeller = require("../Api/Authentication/loggedInSellerApi");
let adminLogin = require("../Api/Authentication/adminLoginApi");
let adminRegistration = require("../Api/Authentication/adminRegistrationApi");
let loggedInAdmin = require("../Api/Authentication/loggedInAdminApi");
let feedback = require("../Api/feedbackApi");
let category = require("../Api/Product/categoryApi");
let subCategory = require("../Api/Product/subCategoryApi");
let products = require("../Api/Product/productApi");
let cart = require("../Api/cartApi");
let loggedIn = require("../Api/Authentication/loggedInApi");
let Order = require("../Api/Order/orderApi");
let paySeller = require("../Api/Payment/paySellerAndUser");
let error = require("../Exception/handleError");


module.exports = function(app){
    //to see photo on browser need static function
    app.use("/ProductImages",express.static("ProductImages"));
    //routes 
    app.use("/api/authenticate",Registration);
    app.use("/api/authenticate",Login);
    app.use("/api/admin",loggedInAdmin);
    app.use("/api/admin",adminLogin);
    app.use("/api/admin",adminRegistration);
    app.use("/api/authenticate",loggedIn);
    app.use("/api/seller/authenticate",sellerLogin);
    app.use("/api/seller/authenticate",sellerRegistration);
    app.use("/api/seller/authenticate",loggedInSeller);
    app.use("/api/resetpassword",sendMail);
    app.use("/api/resetpassword",resetPassword);
    app.use("/api/user",feedback);
    app.use("/api/products",category);
    app.use("/api/products",subCategory);
    app.use("/api/products",products);
    app.use("/api/cart",cart);
    app.use("/api/order", Order);
    app.use("/api/payment",paySeller);
    app.use(error);

};