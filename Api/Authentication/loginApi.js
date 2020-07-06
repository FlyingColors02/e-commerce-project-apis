let express =  require("express");
let router = express.Router();
let uModel = require("../../Schemas/userModel");
let bcryptjs = require("bcryptjs");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
    

router.post("/login", tryCatchMiddleware(async(req,res)=>{

    //validate emailId
    let validateEmailId = uModel.ValidationLogin(req.body);
    if(validateEmailId.error){ return res.send(validateEmailId.error.details[0].message)};

    //authenticate user EmailId
    let userEmailId = await uModel.userModel
        .findOne({"userLogin.emailId":req.body.emailId});
    if(!userEmailId){return res.status(403).send({message:"Invalid EmailId !!"})};

    //authenticate password
    let userPassword = await bcryptjs
        .compare(req.body.password,userEmailId.userLogin.password)
    if(!userPassword){return res.status(403).send({message:"Invalid Password !!"})};

    let jwt = userEmailId.jwtToken();
    res.header("x-auth-token",jwt).send({message:"Login Done !!",jwt});
}));

module.exports = router;