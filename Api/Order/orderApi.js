let express = require("express");
const router = express.Router();
let orderModel = require("../../Schemas/orderModel");
let AuthSellerJwt = require("../../Middlewares/authSellerJWT");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
let AuthUserJwt = require("../../Middlewares/authUserJWT");
const AuthAdminJwt = require("../../Middlewares/authAdminJWT");

router.get("/sellerorders", AuthSellerJwt, tryCatchMiddleware(async (req, res) => {
    console.log("\nIN SELLER ORDERS\n",req.sellerEmailId.emailId);
    let orderProduct = await orderModel.OrderModel.find({$and:[{ "emailId": req.sellerEmailId.emailId },{ shipped: false}]});
    if (!orderProduct[0]) { return res.status(404).send({ message: "Not Found !!" }) };
    res.send(orderProduct);
}));

router.get("/allShippedOrders",AuthAdminJwt, tryCatchMiddleware( async ( req, res) => {
    
    let orderProduct = await orderModel.OrderModel.find({"shipped":true,"cancelled":false,payedSeller:false});
    if(!orderProduct[0]) { return res.status(404).send({message:"Not Found !!"})};
     res.send(orderProduct);
}));

router.get("/sellershippedorders",AuthSellerJwt, tryCatchMiddleware( async ( req, res) => {
    console.log("IN SELLER SHIPPED ORDERS",req.sellerEmailId.emailId);
    let orderProduct = await orderModel.OrderModel.find({$and:[{"emailId": req.sellerEmailId.emailId},{shipped:true}]});
    if(!orderProduct[0]) { return res.status(404).send({message:"Not Found !!"})};
     res.send(orderProduct);
}));

router.get("/userorders", AuthUserJwt, tryCatchMiddleware(async (req, res) => {
    console.log(req.userEmailId.emailId);
    let orderProduct = await orderModel.OrderModel.find({ "userDetails.userEmailId": req.userEmailId.emailId });
    if (!orderProduct[0]) { return res.status(404).send({ message: "Not Found !!" }) };
    res.send(orderProduct);
}));

router.get("/allCancelledOrders", AuthAdminJwt, tryCatchMiddleware(async(req,res)=>{
    let cancelledOrders =  await orderModel.OrderModel.find({"cancelled":true,"shipped":false,"refundedUser":false});
    if(!cancelledOrders[0]){ return res.status(404).send({message:"Not Found !!"})};
    res.send(cancelledOrders);
}))

router.post("/place-order", tryCatchMiddleware(async (req, res) => {
    console.log(req.body);
    let validate = orderModel.orderValidation(req.body);
    if (validate.error) {
        return res.send(validate.error.details[0].message);
    }

    let placeOrder = new orderModel.OrderModel({
        emailId: req.body.emailId,
        shipped: req.body.shipped,
        cancelled:req.body.cancelled,
        payedSeller:req.body.payedSeller,
        refundedUser:req.body.refundedUser,
        orderItem: req.body.orderItem,
        userDetails: req.body.userDetails
    });
    let data = await placeOrder.save();
    res.send({ message: "success", data: data });

}));

router.put("/shipped/:id", tryCatchMiddleware(async(req,res)=>{
    console.log("in shipped-order");
    let shippedOrder=  await orderModel.OrderModel.findByIdAndUpdate(req.params.id,{"shipped":true},{new:"true"});
    if(!shippedOrder){ return res.status(403).send("Invalid Id!!")};
    res.send({message:"shipped", data: shippedOrder});
}) )

router.put("/cancel-order-by-seller/:orderid", tryCatchMiddleware(async (req, res) => {
    let cancelOrder = await orderModel.OrderModel.findByIdAndUpdate(req.params.orderid,{"cancelled":true},{new : true});
    if (!cancelOrder) { return res.status(403).send("Invalid Product Id !!") };
    res.send({ message: "Removed From Cart !!" });
console.log("in cancel order by seller",cancelOrder);
let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: "true", //true for 465 and false for others
        auth:{
            user:"learnnew00@gmail.com",
            pass:"learnNew@123"
        }
    });
    if(!transporter){ return res.status(200).send({message:"Transporter not Valid !!"})};

    let mailContent = {
        from: "'amyflip APP:'<learnnew00@gmail.com>",
        to: cancelOrder.userDetails.userEmailId,
        subject: "Seller Cancelled the Product Delivery",
        text: "Sorry for Your in-convenance !! \n Seller is not able to deliver at your address temperorily. Your refund will be added to your bank account within 7 days. \n\n HAPPY SHOPPING!!"
    }

    transporter.sendMail(mailContent,(error,info)=>{
        if(error){ return console.log(error)};
        console.log({message:`message send: ${info.messageId}`,token:token,data:user});
    });
    
}));


router.put("/cancel-order-by-user/:orderid",  tryCatchMiddleware(async (req, res) => {
    console.log("in cancel-order by user");
    let cancelOrder = await orderModel.OrderModel.findByIdAndUpdate(req.params.orderid, {"cancelled": true},{new: true});
    if (!cancelOrder) { return res.status(403).send("Invalid Product Id !!") };
    res.send({ message: "Removed From Cart !!" });
    console.log("in cancel order by user",cancelOrder);
    let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: "true", //true for 465 and false for others
            auth:{
                user:"learnnew00@gmail.com",
                pass:"learnNew@123"
            }
        });
        if(!transporter){ return res.status(200).send({message:"Transporter not Valid !!"})};
    
        let mailContent = {
            from: "'amyflip APP:'<learnnew00@gmail.com>",
            to: cancelOrder.userDetails.userEmailId,
            subject: "Successfully Cancelled the Product Delivery",
            text: `Successfully cancelled the product delivery for order id ${cancelOrder._id} !! \n Your refund will be added to your bank account within 7 days. \n\n HAPPY SHOPPING!!`
        }
    
        transporter.sendMail(mailContent,(error,info)=>{
            if(error){ return console.log(error)};





            console.log({message:`message send: ${info.messageId}`,token:token,data:user});
        });

}));

module.exports = router;
