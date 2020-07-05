let express = require("express");
const router = express.Router();
let cartModel = require("../Schemas/cartModel");
let AuthUserJwt = require("../Middlewares/authUserJWT");
let tryCatchMiddleware = require("../Middlewares/tryCatchMiddleware");

router.get("/allcartproduct", tryCatchMiddleware( async ( req, res) => {
    let cartProduct = await cartModel.checkOutUserCartModel.find({"emailId":"shraduborse97@gmail.com"});
    if(!cartProduct[0]) { return res.status(404).send({message:"Not Found !!"})};
     res.send(cartProduct);
}));

router.get("/checkout", tryCatchMiddleware( async ( req, res) => {
    let checkout = await cartModel.checkOutUserCartModel.find({'emailId':req.body.emailId});
       //just set email:1 to get only email in projection
       if(!checkout) { return res.status(403).send("Data Not Found")};
      
       res.send({ message:"success", data: checkout});
}));

router.post("/add-to-cart/:id", tryCatchMiddleware( async ( req, res) => {
console.log(req.body.emailId);
    let validate = cartModel.chechOutValidation(req.body);
    if(validate.error) {
        return res.send(validate.error.details[0].message);
    }
    let updateQuantity =  await cartModel.checkOutUserCartModel.findOne({$and:[
                            {"emailId":req.body.emailId},
                            {"cartItem._id":req.body.cartItem._id}]});
   
    if(updateQuantity){
        updateQuantity.cartItem.quantity = parseInt(updateQuantity.cartItem.quantity) + parseInt(req.body.cartItem.quantity)
      let data = await updateQuantity.save();
      res.send({message:"success",data:data});
    }
    else{
        let addToCart = new cartModel.checkOutUserCartModel({
            emailId : req.body.emailId,
            cartItem : req.body.cartItem
        });
        let data = await addToCart.save();
        res.send({message:"success",data:data});
    }
    
   
}));

router.put("/update-to-cart/:id", tryCatchMiddleware( async ( req, res) =>{
    
    let validate = cartModel.chechOutValidation(req.body);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    let updateCart = await cartModel.checkOutUserCartModel.findByIdAndUpdate({_id:req.params.id},{
        cartItem : req.body.cartItem
    },{new:true});
    res.send({message:"Updated Successfully !!", data: updateCart});
}));

router.delete("/remove-from-cart/:productid", tryCatchMiddleware( async ( req, res) => {
    let removeFromCart = await cartModel.checkOutUserCartModel.findByIdAndRemove(req.params.productid);
    if(!removeFromCart) { return res.status(403).send("Invalid Product Id !!")};
    res.send({message:"Removed From Cart !!"});
}));

module.exports = router;
