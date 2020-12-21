let express =  require("express");
let router = express.Router();
let sModel = require("../../Schemas/sellerModel");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
let authSellerJWT = require("../../Middlewares/authSellerJWT");
let authIsSeller = require("../../Middlewares/authIsSeller");

router.get("/loggedinseller", [authSellerJWT, authIsSeller], tryCatchMiddleware( async(req, res)=>{
    
    let sellerDetails = await sModel.sellerModel.findById(req.sellerEmailId._id).select("-sellerLogin.password");
    if(!sellerDetails) { return res.status(402).send({message: ""})}
    res.send({data: sellerDetails});
}))

module.exports = router;