let express = require("express");
const router = express.Router();
let cartModel = require("../Schemas/cartModel");
let AuthUserJwt = require("../Middlewares/authUserJWT");
let tryCatchMiddleware = require("../Middlewares/tryCatchMiddleware");

router.get("/allcartproduct", AuthUserJwt , tryCatchMiddleware( async ( req, res) => {
    let cartProduct = await cartModel.checkOutUserCartModel.find({"emailId":req.body.emailId});
    console.log(cartProduct);
    if(!cartProduct) { return res.status(404).send({message:"Not Found !!"})};
     res.send({data: cartProduct});
}));

router.get("/checkout", AuthUserJwt, tryCatchMiddleware( async ( req, res) => {
    let checkout = await cartModel.checkOutUserCartModel.find({'emailId':req.body.emailId});
       //just set email:1 to get only email in projection
       if(!checkout) { return res.status(403).send("Data Not Found")};
      
       res.send({ message:"success", data: checkout});
}));

router.post("/add-to-cart", AuthUserJwt , tryCatchMiddleware( async ( req, res) => {

    let validate = cartModel.chechOutValidation(req.body);
    if(validate.error) {
        return res.send(validate.error.details[0].message);
    }

    let addToCart = new cartModel.checkOutUserCartModel({
        emailId : req.body.emailId,
        cartItem : req.body.cartItem
    });
    let data = await addToCart.save();
    res.send({message:"success",data:data});
}));

router.put("/update-to-cart", AuthUserJwt, tryCatchMiddleware( async ( req, res) =>{
    
    let validate = cartModel.chechOutValidation(req.body);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    let updateCart = await cartModel.cartItemModel.update({emailId:req.body.emailId},{
        emailId : req.body.emailId,
        cartItem : req.body.cartItem
    },{new:true});
    res.send({message:"Updated Successfully !!", data: updateCart});
}));

router.delete("/remove-from-cart/:productid", AuthUserJwt, tryCatchMiddleware( async ( req, res) => {
    let removeFromCart = await cartModel.checkOutUserCartModel.findByIdAndRemove(req.params.productid);
    if(!removeFromCart) { return res.status(403).send("Invalid Product Id !!")};
    res.send({message:"Removed From Cart !!"});
}));

module.exports = router;
