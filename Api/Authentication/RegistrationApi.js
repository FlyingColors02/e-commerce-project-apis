let express = require("express");
let router = express.Router();
let bcryptjs = require("bcryptjs");
let uModel = require("../../Schemas/userModel");
let nodemailer = require("nodemailer");
let authUserJwt = require("../../Middlewares/authUserJWT");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

router.post("/register", tryCatchMiddleware(async( req, res) => {

    //validating data
    let {error} = uModel.Validation(req.body);
    if(error){return res.send(error.details[0].message)};

    console.log(req.body);
     //check if user already registered
     let user = await uModel.userModel.findOne({"userLogin.emailId": req.body.userLogin.emailId});
     if(user){return res.status(403).send({message:"EmailId already Registered. LOGIN Please !!"})};
 
    //for new registration
    let newRegistration = new uModel.userModel({
        userName: req.body.userName,
        newsLetterCheck: req.body.newsLetterCheck,
        mobileNo: req.body.mobileNo,
        userLogin: req.body.userLogin,
        isSeller : req.body.isSeller
    });

     
    //encrypting data before saving it
    let Salt = await bcryptjs.genSalt(10);
    newRegistration.userLogin.password = await bcryptjs.hash(newRegistration.userLogin.password,Salt);

    //after data encryption and before saving data->jwt
    let jwt = newRegistration.jwtToken();

     //saving data
     let registrationData = await newRegistration.save();
     res.send({message:"Registration Successful !!", data:registrationData, token: jwt});
 

   
    //sending mail to resetPassword
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

router.put("/userBankDetails", tryCatchMiddleware(async(req, res)=>{
    console.log("in bankDetails",req.body);
    // let {error} = uModel.ValidationBankDetails(req.body);
    // console.log(error);
    // if(error){ return error.details[0].message};

    let data = await uModel.userModel.findOneAndUpdate({"userLogin.emailId":req.body.emailId},{
        bankDetails:req.body.bankDetails},{new:true} 
         )
         console.log("user details in bank details",data);
        if(!data){ return res.status(404).send({message: "Cannot Add Address"})}

        res.send({data:data});

}))

router.put("/deliveryAddress", tryCatchMiddleware(async(req, res)=>{
    console.log("in delivery",req.body)
    let {error} = uModel.ValidationAddress(req.body);
    console.log(error);
    if(error){ return error.details[0].message};

    let data = await uModel.userModel.findOneAndUpdate({"userLogin.emailId":req.body.emailId},{
        deliveryAddress:req.body.deliveryAddress }
         ,{new:true})
        console.log("delivery data",data);
        if(!data){ return res.status(404).send({message: "Cannot Add Address"})}

        res.send({data:data});

}))

router.patch("/changePassword", tryCatchMiddleware(async(req, res)=>{
    console.log("in delivery",req.body)
    let {error} = uModel.ValidationLogin(req.body);
    if(error){ return error.details[0].message};

    //encrypting data before saving it
    let Salt = await bcryptjs.genSalt(10);
    req.body.password = await bcryptjs.hash(req.body.password,Salt);

    let data = await uModel.userModel.findOne({"userLogin.emailId":req.body.emailId});
        if(!data){ return res.status(404).send({message: "Cannot Change Password"})}
        console.log("password changed",data);
        data.userLogin.password = req.body.password;
        data.save();
        res.send({data:data});

}))

router.put("/changeMobileNumber", tryCatchMiddleware(async(req, res)=>{
    console.log("in change Mobile Number",req.body)
    
    let data = await uModel.userModel.findOneAndUpdate({"userLogin.emailId":req.body.emailId},{
        mobileNo: req.body.mobileNo}
         ,{new:true})
       
        if(!data){ return res.status(404).send({message: "Cannot Change Mobile Number"})}
        console.log("change mobile number",data);
        res.send({data:data});

}))

router.put("/changeUserName", tryCatchMiddleware(async(req, res)=>{
    console.log("in change UserName",req.body)
    
    let data = await uModel.userModel.findOneAndUpdate({"userLogin.emailId":req.body.emailId},{
        userName: req.body.userName }
         ,{new:true})
        console.log("change user name",data);
        if(!data){ return res.status(404).send({message: "Cannot Change Mobile Number"})}

        res.send({data:data});

}))

router.put("/removeCreditCard", tryCatchMiddleware(async(req, res)=>{
    console.log("in remove credit card",req.body)
  
    let data = await sModel.sellerModel.findOneAndUpdate({"sellerLogin.emailId":req.body.emailId},{
        bankDetails:{$set:{creditCard: null}}}
         ,{new:true})
        console.log("removed credit card",data);
        if(!data){ return res.status(404).send({message: "Cannot Remove Credit Card!!"})}

        res.send({data:data});

}));

router.put("/removeDebitCard", tryCatchMiddleware(async(req, res)=>{
    console.log("in remove debit card",req.body)
    
    let data = await sModel.sellerModel.findOneAndUpdate({"sellerLogin.emailId":req.body.emailId},{
        bankDetails:{$set:{debitCard: null}}}
         ,{new:true})
        console.log("removed debit card",data);
        if(!data){ return res.status(404).send({message: "Cannot Remove Debit Card!!"})}

        res.send({data:data});

}));

router.get("/allusers", authUserJwt, tryCatchMiddleware( async( req, res) => {
    let users = await uModel.userModel.find();
    if(!users) { return res.status(404).send({ message: "Not Found !!"})};
    res.send({data : users});
}));

router.delete("/removeuser", authUserJwt, tryCatchMiddleware( async ( req, res) => {
    console.log(req.body);
    console.log(req.userEmailId.emailId);
    //validate emailId
    let validateEmailId = uModel.ValidationPassword(req.body);
    if(validateEmailId.error){ return res.send(validateEmailId.error.details[0].message)};

    //authenticate user EmailId
    let userEmailId = await uModel.userModel
        .findOne({"userLogin.emailId":req.userEmailId.emailId});
    if(!userEmailId){return res.status(403).send({message:"Invalid EmailId !!"})};

    //authenticate password
    let userPassword = await bcryptjs
        .compare(req.body.password,userEmailId.userLogin.password)
    if(!userPassword){return res.status(403).send({message:"Invalid Password !!"})};

    await uModel.userModel.findOneAndDelete({"userLogin.emailId":req.userEmailId.emailId});
    res.send({message:"Removed Successfully !!"})
}));
module.exports = router;