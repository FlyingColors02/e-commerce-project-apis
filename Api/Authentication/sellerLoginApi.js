let express =  require("express");
let router = express.Router();
let sModel = require("../../Schemas/sellerModel");
let bcryptjs = require("bcryptjs");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
let AuthIsSeller = require("../../Middlewares/authIsSeller");
 

router.post("/sellerlogin", tryCatchMiddleware(async(req,res)=>{

    //validate emailId
    let validateEmailId = sModel.ValidationLogin(req.body);
    if(validateEmailId.error){ return res.send(validateEmailId.error.details[0].message)};

    //authenticate user EmailId
    let sellerEmailId = await sModel.sellerModel
        .findOne({"sellerLogin.emailId":req.body.emailId});
    if(!sellerEmailId){return res.status(403).send({message:"Invalid EmailId !!"})};

    //authenticate password
    let sellerPassword = await bcryptjs
        .compare(req.body.password,sellerEmailId.sellerLogin.password)
    if(!sellerPassword){return res.status(403).send({message:"Invalid Password !!"})};

    let jwt = sellerEmailId.jwtToken();
    res.header("x-authseller-token",jwt).send({message:"Login Done !!",jwt});
}));

module.exports = router;
