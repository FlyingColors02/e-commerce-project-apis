let express = require("express");
let router = express.Router();
let bcryptjs = require("bcryptjs");
let sModel = require("../../Schemas/sellerModel");
let nodemailer = require("nodemailer");
let authUserJwt = require("../../Middlewares/authUserJWT");
let authIsSeller = require("../../Middlewares/authIsSeller");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");


router.post("/sellerregister", tryCatchMiddleware(async( req, res) => {

    //validating data
    let {error} = sModel.Validation(req.body);
    if(error){return res.send(error.details[0].message)};

    console.log(req.body);
     //check if user already registered
     let seller = await sModel.sellerModel.findOne({"sellerLogin.emailId": req.body.sellerLogin.emailId});
     if(seller){return res.status(403).send({message:"EmailId already Registered. LOGIN Please !!"})};
 
    //for new registration
    let newRegistration = new sModel.sellerModel({
        userName: req.body.userName,
        newsLetterCheck: req.body.newsLetterCheck,
        mobileNo: req.body.mobileNo,
        sellerLogin: req.body.sellerLogin,
        isSeller : req.body.isSeller
    });

     console.log(newRegistration);
    //encrypting data before saving it
    let Salt = await bcryptjs.genSalt(10);
    newRegistration.sellerLogin.password = await bcryptjs.hash(newRegistration.sellerLogin.password,Salt);

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
        to: newRegistration.sellerLogin.emailId,
        subject: "WELCOME TO amYflip.",
        text: "WELCOME To amYflip !! \n Get the Latest Product ONLY on amYflip \n\n HAPPY SHOPPING!!"
    }

    transporter.sendMail(mailContent,(error,info)=>{
        if(error){ return console.log(error)};
        console.log({message:`message send: ${info.messageId}`,token:token,data:user});
    });
    

}));

router.put("/pickupaddress",tryCatchMiddleware(async(req,res)=>{
    let {error} = sModel.ValidationAddress(req.body);
    if(error){ return res.send(error.details[0].message)}
    
    let sellerEmailId = await sModel.sellerModel.findOneAndUpdate({"sellerLogin.emailId": req.body.emailId},{
        pickUpAddress: req.body.pickUpAddress},{new: true})

        if(!sellerEmailId) { return res.status(404).send({message:" Not Updated !!"})}
        res.send({data: sellerEmailId});
}));

router.put("/sellerBankDetails",tryCatchMiddleware(async(req,res)=>{
    let {error} = sModel.ValidationBankDetails(req.body);
    if(error){ return res.send(error.details[0].message)}
    
    console.log("in seller Bank",req.body)
    let data = await sModel.sellerModel.findOneAndUpdate({"sellerLogin.emailId": req.body.emailId},{
        bankDetails: req.body.bankDetails},{new: true})

        if(!data) { return res.status(404).send({message:" Not Updated !!"})}

        res.send({data: data});
}));

router.put("/changePassword", tryCatchMiddleware(async(req, res)=>{
    console.log("in password",req.body)
    let {error} = sModel.ValidationLogin(req.body);
    if(error){ return error.details[0].message};

    let Salt = await bcryptjs.genSalt(10);
    req.body.password = await bcryptjs.hash(req.body.password,Salt);

    let data = await sModel.sellerModel.findOne({"sellerLogin.emailId":req.body.emailId});
        if(!data){ return res.status(404).send({message: "Invalid EmailId!!"})}
        console.log("password changed",data);
        data.sellerLogin.password = req.body.password;
        data.save();
        res.send({data:data});

}))

router.put("/changeMobileNumber", tryCatchMiddleware(async(req, res)=>{
    console.log("in change Mobile Number",req.body)
    
    let data = await sModel.sellerModel.findOneAndUpdate({"sellerLogin.emailId":req.body.emailId},{
        mobileNo: req.body.mobileNo }
         ,{new:true})
        console.log("change mobile number",data);
        if(!data){ return res.status(404).send({message: "Cannot Change Mobile Number"})}

        res.send({data:data});

}))

router.put("/changeUserName", tryCatchMiddleware(async(req, res)=>{
    console.log("in change User Name",req.body)
    
    let data = await sModel.sellerModel.findOneAndUpdate({"sellerLogin.emailId":req.body.emailId},{
        userName: req.body.userName }
         ,{new:true})
        console.log("change user name",data);
        if(!data){ return res.status(404).send({message: "Cannot Change User Name"})}

        res.send({data:data});

}));

router.get("/sellerallusers", [  authUserJwt, authIsSeller], tryCatchMiddleware( async( req, res) => {
    let sellers = await sModel.sellerModel.find();
    if(!sellers) { return res.status(404).send({ message: "Not Found !!"})};
    res.send({data : sellers});
}));

router.delete("/removeSeller", [ authUserJwt, authIsSeller], tryCatchMiddleware( async ( req, res) => {
    console.log(req.body);

    //validate emailId
    let validateEmailId = sModel.ValidationLogin(req.body);
    if(validateEmailId.error){ return res.send(validateEmailId.error.details[0].message)};

    //authenticate user EmailId
    let userEmailId = await sModel.sellerModel
        .findOne({"sellerLogin.emailId":req.userEmailId.emailId});
    if(!userEmailId){return res.status(403).send({message:"Invalid EmailId !!"})};

    //authenticate password
    let userPassword = await bcryptjs
        .compare(req.body.password,userEmailId.sellerLogin.password)
    if(!userPassword){return res.status(403).send({message:"Invalid Password !!"})};

    await uModel.userModel.findOneAndDelete({"sellerLogin.emailId":req.userEmailId.emailId});
    res.send({message:"Removed Successfully !!"})
}));

module.exports = router;