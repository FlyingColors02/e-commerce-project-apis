const mongoose = require("mongoose");
const Joi =  require("@hapi/joi");

let cartSchema = new mongoose.Schema({
    productId: { type: String, min: 1, max: 100, required: true},
    brandName:{ type: String, min: 1, max: 100, required: true},
    productName: { type: String, min: 3, max: 100, required: true},
    image: { type: String, min: 3, max: 300, required: true},
    price: { type: Number, min: 1, max: 1000000, required: true},
    quantity: { type:Number, min: 1, max: 10, required: true},
    totalPrice: { type: Number, min: 1, max: 1000000, required: true},
    recordDate: { type:Date, default: Date.now()},
    updateDate: { type: Date, default: Date.now()}
});

let cartItemModel = mongoose.model("cartitemsrecord", cartSchema);

let chechOutUserCartSchema = new mongoose.Schema({
    emailId: { type: String, min: 10, max: 100,required: true},
    cartItem:{type:[ cartSchema],ref:"cartItemModel"}
});

let checkOutUserCartModel = mongoose.model("usercartitem", chechOutUserCartSchema);

function Validation(data){
    let Schema = Joi.object({
        productId: Joi.string().min(3).max(100).required(),
        brandName:Joi.string().min(3).max(100).required(),
        productName: Joi.string().min(3).max(100).required(),
        image: Joi.string().min(3).max(300).required(),
        price: Joi.number().min(1).max(1000000).required(),
        quantity: Joi.number().min(1).max(10).required(),
        totalPrice: Joi.number().min(1).max(1000000).required(),
        recordDate: Joi.date(),
        updateDate: Joi.date()
    });
    return Schema.validate(data);
}

function chechOutValidation(data){
    let Schema = Joi.object().keys({
        emailId: Joi.string().email().required(),
       cartItem: Joi.array().items({
        productId: Joi.string().min(3).max(100).required(),
        brandName:Joi.string().min(3).max(100).required(),
        productName: Joi.string().min(3).max(100).required(),
        image: Joi.string().min(3).max(300).required(),
        price: Joi.number().min(1).max(1000000).required(),
        quantity: Joi.number().min(1).max(10).required(),
        totalPrice: Joi.number().min(1).max(1000000).required(),
        recordDate: Joi.date(),
        updateDate: Joi.date()
       })
    })
    return Schema.validate(data);
}
module.exports = {checkOutUserCartModel, cartItemModel, Validation, chechOutValidation};