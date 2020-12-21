function Seller( req, res, next){
    console.log("is seller")
    console.log(req.sellerEmailId)
    if(req.sellerEmailId.isSeller === false){return res.status(403).send({message:"Not Seller!!"})};
    next();
}

module.exports = Seller;