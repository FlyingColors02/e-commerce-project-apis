function Admin( req, res, next){
    console.log(req.userEmailId)
    if(!req.userEmailId.isAdmin){return res.status(403).send({message:"Not Admin!!"})};
    next();
}

module.exports = Admin;