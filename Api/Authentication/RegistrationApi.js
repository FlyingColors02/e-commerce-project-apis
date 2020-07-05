let express = require("express");
let router = express.Router();
let bcryptjs = require("bcryptjs");
let uModel = require("../../Schemas/userModel");
let nodemailer = require("nodemailer");
let authUserJwt = require("../../Middlewares/authUserJWT");
let authIsAdmin = require("../../Middlewares/authIsAdmin");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

router.post("/register", tryCatchMiddleware(async( req, res) => {

    //validating data
    let {error} = uModel.Validation(req.body);
    if(error){return res.send(error.details[0].message)};

     //check if user already registered
     let user = await uModel.userModel.findOne({"userLogin.emailId": req.body.userLogin.emailId});
     if(user){return res.status(403).send({message:"EmailId already Registered. LOGIN Please !!"})};
 
    //for new registration
    let newRegistration = new uModel.userModel({
        userName: req.body.userName,
        newsLetterCheck: req.body.newsLetterCheck,
        mobileNo: req.body.mobileNo,
        userLogin: req.body.userLogin,
        isAdmin : req.body.isAdmin
    });

     
    //encrypting data before saving it
    let Salt = await bcryptjs.genSalt(10);
    newRegistration.userLogin.password = await bcryptjs.hash(newRegistration.userLogin.password,Salt);

    //after data encryption and before saving data->jwt
    let jwt = newRegistration.jwtToken();

     //saving data
     let registrationData = await newRegistration.save();
     res.send({message:"Registration Successful !!", data:registrationData, token: jwt});
 

   
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
        to: newRegistration.userLogin.emailId,
        subject: "WELCOME TO amYflip.",
        text: "WELCOME To amYflip !! \n Get the Latest Product ONLY on amYflip \n\n HAPPY SHOPPING!!"
    }

    transporter.sendMail(mailContent,(error,info)=>{
        if(error){ return console.log(error)};
        console.log({message:`message send: ${info.messageId}`,token:token,data:user});
    });
    

}));

router.get("/allusers", [  authUserJwt, authIsAdmin], tryCatchMiddleware( async( req, res) => {
    let users = await uModel.userModel.find();
    if(!users) { return res.status(404).send({ message: "Not Found !!"})};
    res.send({data : users});
}));

router.delete("/removeuser/:userid", [ authUserJwt, authIsAdmin], tryCatchMiddleware( async ( req, res) => {
    let userEmailId = await uModel.userModel.findByIdAndRemove(req.params.userid);
    if(!userEmailId)  { return res.status(404).send({message:"Invalid User !!"})}
    res.send({message:"Removed Successfully !!"})
}));
module.exports = router;