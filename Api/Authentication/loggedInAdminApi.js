let express =  require("express");
let router = express.Router();
let aModel = require("../../Schemas/adminModel");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
let authAdminJWT = require("../../Middlewares/authAdminJWT");

router.get("/loggedinadmin", authAdminJWT, tryCatchMiddleware( async(req, res)=>{
    console.log("in logged in user",req.adminEmailId.emailId)
    let adminDetails = await aModel.adminModel.findById(req.adminEmailId._id).select("-adminLogin.password");
    if(!adminDetails) { return res.status(402).send({message: ""})}
    res.send({data: adminDetails});
}))

module.exports = router;