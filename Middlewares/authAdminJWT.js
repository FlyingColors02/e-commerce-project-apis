let jwt = require("jsonwebtoken");
let config = require("config");

function AuthAdmin( req, res, next){
    let jwtToken = req.header("x-authadmin-token");
    if(!jwtToken){
        return res.status(401).send({message:""})
    };
    console.log(jwtToken);
    try{
    let decode = jwt.verify(jwtToken,config.get("ENV_PASSWORD"));
    // console.log(decode);
    // console.log(req.sellerEmailId);
    req.adminEmailId = decode;
    // console.log(req.sellerEmailId);
    next();}
    catch(ex){
        res.status(403).send({message:"",error: ex.message})
    }
}

module.exports=AuthAdmin;