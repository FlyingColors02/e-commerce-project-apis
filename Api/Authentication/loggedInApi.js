let express =  require("express");
let router = express.Router();
let uModel = require("../../Schemas/userModel");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
let authUserJWT = require("../../Middlewares/authUserJWT");

router.get("/loggedinuser", authUserJWT, tryCatchMiddleware( async(req, res)=>{
    console.log("in logged in user",req.userEmailId.emailId)
    let userDetails = await uModel.userModel.findById(req.userEmailId._id).select("-userLogin.password");
    if(!userDetails) { return res.status(402).send({message: ""})}
    res.send({data: userDetails});
}))

module.exports = router;