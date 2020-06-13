let express = require("express");
let Registration = require("../Api/Authentication/RegistrationApi");
let Login = require("../Api/Authentication/loginApi");
let sendMail = require("../Api/ResetPassword/sendMailApi");
let resetPassword = require("../Api/ResetPassword/resetPasswordApi");
let feedback = require("../Api/feedbackApi");
let category = require("../Api/Product/categoryApi");
let subCategory = require("../Api/Product/subCategoryApi");
let products = require("../Api/Product/productApi");
let cart = require("../Api/cartApi");
let error = require("../Exception/handleError");

module.exports = function(app){
    //to see photo on browser need static function
    app.use("/ProductImages",express.static("ProductImages"));
    //routes 
    app.use("/api/authenticate",Registration);
    app.use("/api/authenticate",Login);
    app.use("/api/password",sendMail);
    app.use("/api/password",resetPassword);
    app.use("/api/user",feedback);
    app.use("/api/product",category);
    app.use("/api/product",subCategory);
    app.use("/api/product",products);
    app.use("/api/cart",cart);
    app.use(error);

};