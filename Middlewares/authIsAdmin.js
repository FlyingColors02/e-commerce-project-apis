function Admin( req, res, next){
    console.log("is admin")
    console.log(req.adminEmailId)
    if(req.adminEmailId.isAdmin === false){return res.status(403).send({message:"Not Admin!!"})};
    next();
}

module.exports = Admin;