let express = require("express");
let router = express.Router();
let nodemailer = require("nodemailer");
const fModel = require("../Schemas/feedbackModel");
const uModel = require("../Schemas/userModel");
let tryCatchMiddleware = require("../Middlewares/tryCatchMiddleware");

router.post("/feedback", tryCatchMiddleware( async(req,res)=>{

    //validating data
    let validate = fModel.Validation(req.body);
    if(validate.error) {return res.send(validate.error.details[0].message)}

    //authenticating user
    let user = await uModel.userModel.findOne({"userLogin.emailId":req.body.emailId});
    if(!user){return res.status(404).send({message:"Invalid EmailId!!"})};

    //fetching data
    let newFeedBackData = new fModel.feedbackModel({
        name: req.body.name,
        emailId: req.body.emailId,
        message: req.body.message
    });
    //saving data
    let data = await newFeedBackData.save();

    //sending "thankyou" mail to user
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: "true",
        auth:{
            user: "shraduborse97@gmail.com",
            password: "loveumom&d@d"
        }
    });
    if(!transporter)res.status(404).send({message: "Transporter not Valid!!"});

    let mailContent = {
        from: "'amyzon APP:'<shraduborse97@gmail.com>",
        to: user.emailId,
        subject: "ThankYou for your Feedback.",
        text: "ThankYou For Your Feedback."
    }
    transporter.sendMail(mailContent,(error,info)=>{
        if(error){return console.log(error);}
        console.log( `message send :) ${info.messageId}`);
    });

    res.send({message:"feedback successful!! Go to the mailBox.",data:data});
}));

module.exports = router;