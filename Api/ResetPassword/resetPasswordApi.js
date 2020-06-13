let express = require("express");
let router = express.Router();
let bcryptjs = require("bcryptjs");
let uModel = require("../../Schemas/userModel");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

router.post(`/resetpassword/:token`, tryCatchMiddleware( async(req,res)=>{
    
    //authenticating token and expirytime
    let user = await uModel.userModel.findOne({ 
        resetPasswordToken: req.params.token,
        resetPasswordExpires:{
            $gt: Date.now()
        }
     });
    if(!user){ return res.status(403).send({message:"Invalid Token Or Token Expired !!"})};

    //validating password
    let validatePassword = uModel.ValidationPassword(req.body);
    if(validatePassword.error) { return res.send(validatePassword.error.details[0].message)};

     let OldNewPasswordSame = await bcryptjs.compare(req.body.password,user.userLogin.password);
     if(OldNewPasswordSame) { return res.send({message:"Previous Password...Please try different !!"})};

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