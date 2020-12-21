let express = require("express");
let router = express.Router();
let bcryptjs = require("bcryptjs");
let aModel = require("../../Schemas/adminModel");
let nodemailer = require("nodemailer");
let authUserJwt = require("../../Middlewares/authUserJWT");
let authIsSeller = require("../../Middlewares/authIsSeller");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");


router.post("/adminRegister", tryCatchMiddleware(async( req, res) => {

    //validating data
    let {error} = aModel.Validation(req.body);
    if(error){return res.send(error.details[0].message)};

    console.log(req.body);
     //check if user already registered
     let admin = await aModel.adminModel.findOne({"adminLogin.emailId": req.body.adminLogin.emailId});
     if(admin){return res.status(403).send({message:"EmailId already Registered. LOGIN Please !!"})};
 
    //for new registration
    let newRegistration = new aModel.adminModel({
        userName: req.body.userName,
        mobileNo: req.body.mobileNo,
        adminLogin: req.body.adminLogin,
        isAdmin : req.body.isAdmin,
        bankDetails: req.body.bankDetails,
        Address: req.body.Address,
    });

     console.log(newRegistration);
    //encrypting data before saving it
    let Salt = await bcryptjs.genSalt(10);
    newRegistration.adminLogin.password = await bcryptjs.hash(newRegistration.adminLogin.password,Salt);

    //after data encryption and before saving data->jwt
    let jwt = newRegistration.jwtToken();

     //saving data
     let registrationData = await newRegistration.save();
     res.send({ message: "Registration Successful !!", data: registrationData, token: jwt});
 

   
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
        to: newRegistration.adminLogin.emailId,
        subject: "WELCOME TO amYflip.",
        text: "WELCOME To amYflip !! \n HAPPY TO SEE U JOINED!!"
    }

    transporter.sendMail(mailContent,(error,info)=>{
        if(error){ return console.log(error)};
        console.log({message:`message send: ${info.messageId}`,token:token,data:user});
    });
    

}));

router.put("/address",tryCatchMiddleware(async(req,res)=>{
     //validating data
     let {error} = aModel.ValidationAddress(req.body);
     if(error){return res.send(error.details[0].message)};
 
    let adminEmailId = await aModel.adminModel.findOneAndUpdate({"adminLogin.emailId": req.body.emailId},{
        Address: req.body.Address},{new: true})

        if(!adminEmailId) { return res.status(404).send({message:" Not Updated !!"})}
        res.send({data: adminEmailId});
}));

router.put("/adminBankDetails",tryCatchMiddleware(async(req,res)=>{
     //validating data
     let {error} = aModel.ValidationBankDetails(req.body);
     if(error){return res.send(error.details[0].message)};
 
    console.log("in seller Bank",req.body)
    let data = await aModel.adminModel.findOneAndUpdate({"adminLogin.emailId": req.body.emailId},{
        bankDetails: req.body.bankDetails},{new: true})

        if(!data) { return res.status(404).send({message:" Not Updated !!"})}

        res.send({data: data});
}));

router.put("/changePassword", tryCatchMiddleware(async(req, res)=>{
    console.log("in password",req.body)
    let {error} = aModel.ValidationPassword(req.body);
    if(error){ return error.details[0].message};

    let Salt = await bcryptjs.genSalt(10);
    req.body.password = await bcryptjs.hash(req.body.password,Salt);

    let data = await aModel.adminModel.findOne({"adminLogin.emailId":req.body.emailId});
        if(!data){ return res.status(404).send({message: "Invalid EmailId!!"})}
        console.log("password changed",data);
        data.adminLogin.password = req.body.password;
        data.save();
        res.send({data:data});

}))

router.put("/changeMobileNumber", tryCatchMiddleware(async(req, res)=>{
    console.log("in change Mobile Number",req.body)
    let data = await aModel.adminModel.findOneAndUpdate({"adminLogin.emailId":req.body.emailId},{
        mobileNo: req.body.mobileNo }
         ,{new:true})
        console.log("change mobile number",data);
        if(!data){ return res.status(404).send({message: "Cannot Change Mobile Number"})}

        res.send({data:data});

}))

router.put("/changeUserName", tryCatchMiddleware(async(req, res)=>{
    console.log("in change User Name",req.body)
    
    let data = await aModel.adminModel.findOneAndUpdate({"adminLogin.emailId":req.body.emailId},{
        userName: req.body.userName }
         ,{new:true})
        console.log("change user name",data);
        if(!data){ return res.status(404).send({message: "Cannot Change User Name"})}

        res.send({data:data});

}));

router.get("/adminallusers", [  authUserJwt, authIsSeller], tryCatchMiddleware( async( req, res) => {
    let admin = await aModel.adminModel.find();
    if(!admin) { return res.status(404).send({ message: "Not Found !!"})};
    res.send({data : admin});
}));

router.delete("/removeuser/:adminid", [ authUserJwt, authIsSeller], tryCatchMiddleware( async ( req, res) => {
    let adminEmailId = await aModel.adminModel.findByIdAndRemove(req.params.adminid);
    if(!adminEmailId)  { return res.status(404).send({message:"Invalid User !!"})}
    res.send({message:"Removed Successfully !!"})
}));

module.exports = router;