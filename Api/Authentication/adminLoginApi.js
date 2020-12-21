let express =  require("express");
let router = express.Router();
let aModel = require("../../Schemas/adminModel");
let bcryptjs = require("bcryptjs");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
    

router.post("/login", tryCatchMiddleware(async(req,res)=>{

    //validate emailId
    let validateEmailId = aModel.ValidationLogin(req.body);
    if(validateEmailId.error){ return res.send(validateEmailId.error.details[0].message)};

    //authenticate user EmailId
    let adminEmailId = await aModel.adminModel
        .findOne({"adminLogin.emailId":req.body.emailId});
    if(!adminEmailId){return res.status(403).send({message:"Invalid EmailId !!"})};

    //authenticate password
    let adminPassword = await bcryptjs
        .compare(req.body.password,adminEmailId.adminLogin.password)
    if(!adminPassword){return res.status(403).send({message:"Invalid Password !!"})};

    let jwt = adminEmailId.jwtToken();
    res.header("x-authadmin-token",jwt).send({message:"Login Done !!",jwt});
}));


module.exports = router;