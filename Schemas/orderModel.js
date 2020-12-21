const mongoose = require("mongoose");
const Joi =  require("@hapi/joi");
const JoiPhoneNumber = Joi.extend(require("joi-phone-number"));
let mongooseTypePhone = require("mongoose-type-phone");

let OrderSchema = new mongoose.Schema({
    emailId: { type: String, min: 10, max: 100,required: true,trim: true, lowercase: true},
    shipped:{ type: Boolean, required: true},
    cancelled:{ type: Boolean, required: true},
    payedSeller:{type: Boolean,required:true},
    refundedUser:{type:Boolean,required:true},
    orderItem:{
        _id: { type: String, min: 1, max: 100, required: true},
        brandName:{ type: String, min: 1, max: 300, required: true},
        productName: { type: String, min: 3, max: 500, required: true},
        image: { type: String, min: 3, max: 300, required: true},
        price: { type: Number, min: 1, max: 1000000, required: true},
        shippingCharges: { type: Number, required: true},
        quantity: { type:Number, min: 1, max: 20, required: true},
        totalPrice: { type: Number, min: 1, max: 1000000, required: true},
        recordDate: { type:Date, default: Date.now()},
        deliveryDate: { type: Date}
    },
    userDetails:{
        userName:{type:String,min:3,max:30,required:true},
        mobileNo:{type: mongooseTypePhone.Phone },
        userEmailId:{type:String,min:10,max:30,required:true, lowercase: true},
        deliveryAddress: {
            address:{type:String},
            State:{type:String},
            country:{type:String},
            pinCodeNo:{type: Number}}, 
        },
    
});

let OrderModel = mongoose.model("order", OrderSchema);


function orderValidation(data){
    let Schema = Joi.object().keys({
        
       orderItem: Joi.object().keys({
        _id: Joi.string().min(3).max(100).required(),
        brandName:Joi.string().min(3).max(300).required(),
        productName: Joi.string().min(3).max(500).required(),
        image: Joi.string().min(3).max(300).required(),
        price: Joi.number().min(1).max(1000000).required(),
        shippingCharges: Joi.number().required(),
        quantity: Joi.number().min(1).max(10).required(),
        totalPrice: Joi.number().min(1).max(1000000).required(),
        recordDate: Joi.date(),
        deliveryDate: Joi.date().required()
       }),
        userDetails:Joi.object().keys({
        userName:Joi.string().min(3).max(300).required(),
        mobileNo:JoiPhoneNumber.string().phoneNumber(),
        userEmailId:Joi.string().required().min(10).max(30),
        deliveryAddress: Joi.object().keys({
            address: Joi.string().min(10).required(),
            State: Joi.string().required(),
            country: Joi.string().required(),
            pinCodeNo: Joi.number().required()
        })}),
       emailId: Joi.string().email().required(),
       shipped:Joi.boolean().required(),
       cancelled: Joi.boolean().required(),
       payedSeller:Joi.boolean().required(),
       refundedUser:Joi.boolean().required(),
    })
    return Schema.validate(data);
}
module.exports = {OrderModel, orderValidation};