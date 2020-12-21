const mongoose = require("mongoose");
const Joi =  require("@hapi/joi");

let chechOutUserCartSchema = new mongoose.Schema({
    emailId: { type: String, min: 10, max: 100,required: true,trim: true, lowercase: true},
    cartItem:{
        _id: { type: String, min: 1, max: 100, required: true},
        brandName:{ type: String, min: 1, max: 300, required: true},
        productName: { type: String, min: 3, max: 500, required: true},
        image: { type: String, min: 3, max: 300, required: true},
        price: { type: Number, min: 1, max: 1000000, required: true},
        stock: {type: Number,required: true },
        quantity: { type:Number, min: 1, max: 20, required: true},
        totalPrice: { type: Number, min: 1, max: 1000000, required: true},
        shippingCharges: { type: Number, max: 200, required:true},
        sellerEmailId: {type: String,min:10,max:100, required: true,  trim:true, lowercase:true },
        recordDate: { type:Date, default: Date.now()},
        updateDate: { type: Date, default: Date.now()}
    }
});

let checkOutUserCartModel = mongoose.model("usercartitem", chechOutUserCartSchema);


function chechOutValidation(data){
    let Schema = Joi.object().keys({
        
       cartItem: Joi.object().keys({
        _id: Joi.string().min(3).max(100).required(),
        brandName:Joi.string().min(3).max(300).required(),
        productName: Joi.string().min(3).max(500).required(),
        image: Joi.string().min(3).max(300).required(),
        price: Joi.number().min(1).max(1000000).required(),
        stock: Joi.number().required(),
        quantity: Joi.number().min(1).max(10).required(),
        totalPrice: Joi.number().min(1).max(1000000).required(),
        shippingCharges: Joi.number().max(200).required(),
        sellerEmailId: Joi.string().email().required(),
        recordDate: Joi.date(),
        updateDate: Joi.date()
       }),
       emailId: Joi.string().email().required()
    })
    return Schema.validate(data);
}
module.exports = {checkOutUserCartModel, chechOutValidation};