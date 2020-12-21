let express = require("express");
const router = express.Router();
let orderModel = require("../../Schemas/orderModel");
let AuthAdminJwt = require("../../Middlewares/authAdminJWT");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

router.put("/paySeller/:id", tryCatchMiddleware( async ( req, res) => {
    
    let orderProduct = await orderModel.OrderModel.findByIdAndUpdate(req.params.id,{payedSeller:true},{new:true});
    if(!orderProduct) { return res.status(404).send({message:"Not Found !!"})};
     res.send(orderProduct);
}));

router.put("/refundUser/:id", tryCatchMiddleware( async ( req, res) => {
    
    let orderProduct = await orderModel.OrderModel.findByIdAndUpdate(req.params.id,{refundedUser:true},{new:true});
    if(!orderProduct) { return res.status(404).send({message:"Not Found !!"})};
     res.send(orderProduct);
}));
module.exports = router;