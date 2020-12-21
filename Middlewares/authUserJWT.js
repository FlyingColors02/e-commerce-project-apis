let jwt = require("jsonwebtoken");
let config = require("config");

function AuthUser( req, res, next){
    let jwtToken = req.header("x-authuser-token");
    if(!jwtToken){
        return res.status(401).send({message:""})
    };
    console.log(jwtToken);
    try{
    let decode = jwt.verify(jwtToken,config.get("ENV_PASSWORD"));
    // console.log(decode);
    // console.log(req.userEmailId);
    req.userEmailId = decode;
    // console.log(req.userEmailId);
    next();}
    catch(ex){
        res.status(403).send({message:"",error: ex.message})
    }
}

module.exports=AuthUser;