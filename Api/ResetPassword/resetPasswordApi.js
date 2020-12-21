let express = require("express");
let router = express.Router();
let bcryptjs = require("bcryptjs");
let uModel = require("../../Schemas/userModel");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

router.post(`/reset-password/:token`, tryCatchMiddleware( async(req,res)=>{
    console.log(new Date());
    //authenticating token and expirytime
    let user = await uModel.userModel.findOne({ 
        resetPasswordToken: req.params.token,
       
     });
    if(!user){ return res.status(403).send({message:"Invalid Token Or Token Expired !!"})};

    //validating password
    let validatePassword = uModel.ValidationPassword(req.body);
    if(validatePassword.error) { return res.send(validatePassword.error.details[0].message)};

     user.userLogin.password = req.body.password;
     user.resetPasswordToken = undefined;
     user.resetPasswordExpires = undefined;

     let salt = await bcryptjs.genSalt(10);
     user.userLogin.password = await bcryptjs.hash(user.userLogin.password,salt);

     console.log("userId: "+user.userLogin.emailId+"\n password: " +user.userLogin.password)

    user = await user.save();
    res.send({message: "password Updated !!",
                data:user
            });
}));

module.exports = router;