let express =  require("express");
let router = express.Router();
let nodemailer = require("nodemailer");
let crypto = require("crypto");
let uModel = require("../../Schemas/userModel");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

router.post("/sendmail", tryCatchMiddleware( async(req,res)=>{
    console.log(req.body);
    //validating user
    let validate = uModel.ValidationEmail(req.body);
    if( validate.error){ return res.send(validate.error.details[0].message) };

    //authenticating user
    let user = await uModel.userModel.findOne({"userLogin.emailId": req.body.emailId});
    if(!user){ return res.status(403).send({message:"Invalid EmailId !!"})};

    //creating token
    let token = crypto.randomBytes(32).toString("hex");

    //setting resetPasswordToken And resetPasswordExpires
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date().setHours(new Date().getHours()+1);
    console.log(user.resetPasswordExpires);
    user = await user.save();

    //sending mail to resetpassword
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: "true", //true for 465 and false for others
        auth:{
            user:"learnnew00@gmail.com",
            pass:"learnNew@123"
        }
    });
    if(!transporter){ return res.status(200).send({message:"Transporter not Valid !!"})};

    let mailContent = {
        from: "'amyflip APP:'<learnnew00@gmail.com>",
        to: user.userLogin.emailId,
        subject: "Reset your Password",
        text: "open the below link to change your password\n \n http://localhost:3000/reset%20password/"+token
    }

    transporter.sendMail(mailContent,(error,info)=>{
        console.log(error);
        if(error){ return res.send(error)};
        res.send({message:`A mail is send to your EmailId.\n Reset Your Password Using the Link Provided in the mail.`,id:`${info.messageId}`,token:token});
    });

}));

module.exports = router;