const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
let jwt = require("jsonwebtoken");
let config = require("config");
const JoiPhoneNumber = Joi.extend(require("joi-phone-number"));
let mongooseTypePhone = require("mongoose-type-phone");

let sellerSchema = new mongoose.Schema({
    userName:{type:String,min:3,max:20,required:true},
    newsLetterCheck:{type:Boolean},
    mobileNo:{type: mongooseTypePhone.Phone },
    sellerLogin:{
        emailId:{type:String,min:10,max:25,required:true, trim: true, lowercase: true},
        password:{type:String,min:8,max:25}
    },
    bankDetails: {
        accountNo:{type:Number,regex:[/\d{15}/]},
        accountHolderName:{type:String},
        ifscCode: {type:Number,regex:[/\d{9}/]}
    },
    pickUpAddress: {
        address:{type:String},
        State:{type:String},
        country:{type:String},
        pinCodeNo:{type: Number,regex:[/^[0-9]{4}$|^[0-9]{6}$/]}
    },
    resetPasswordToken : {type:String},
    resetPasswordExpires :{type:Date},
    isSeller : {type:Boolean},
    recordDate: {type:Date, default:Date.now()},
    recordUpdate : {type:Date, default:Date.now()}
});

sellerSchema.methods.jwtToken = function(){
    let token = jwt.sign({_id:this._id,emailId: this.sellerLogin.emailId,name:this.userName,isSeller:this.isSeller},config.get("ENV_PASSWORD"));
    return token;
}

let sellerModel = mongoose.model("sellerdetails",sellerSchema);

 function Validation(data){
    let Schema = Joi.object({
        userName:Joi.string().min(4).max(20).required(),
        newsLetterCheck:Joi.boolean(),
        mobileNo: JoiPhoneNumber.string().phoneNumber(),
        sellerLogin:{
            emailId:Joi.string().email().min(10).max(25).required(),
            password: Joi.string().min(8).max(25).required(),
            confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({'any.only': 'ConfirmPassword must match Password'})
    },
        isSeller : Joi.boolean(),
        recordDate: Joi.date(),
        recordUpdate: Joi.date()
    });
    return Schema.validate(data);
}

function ValidationLogin(data){
    let Schema = Joi.object().keys({
        emailId:Joi.string().email().min(10).max(25).required(),
        password: Joi.string().min(8).max(25).required().strict() 
          
    });
    return Schema.validate(data);
}

function ValidationEmail(data){
    let Schema = Joi.object().keys({
        emailId:Joi.string().email().min(10).max(25).required(),
    });
    return Schema.validate(data);
}

function ValidationPassword(data){
    let Schema = Joi.object().keys({
        password: Joi.string().min(8).max(25).required().strict(), 
        confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({'any.only': 'ConfirmPassword must match Password'})
    });
    return Schema.validate(data);
}

function ValidationAddress(data){
    let Schema = Joi.object().keys({
        emailId: Joi.string().email().required(),
       pickUpAddress: Joi.object().keys({
        address: Joi.string().required(),
        State: Joi.string().required(),
        country:Joi.string().required(),
        pinCodeNo: Joi.string().regex(/^[0-9]{4}$|^[0-9]{6}$/).required()
       })
    });
    return Schema.validate(data);
}


function ValidationBankDetails(data){
    let Schema = Joi.object().keys({
            accountNo: Joi.string().regex(/\d{15}/).required(),
            accountHolderName: Joi.string().required(),
            ifscCode: Joi.string().regex(/\d{9}/).required() 
          });
    return Schema.validate(data);
}
module.exports = { sellerModel, Validation,ValidationLogin, ValidationEmail,
     ValidationPassword, ValidationAddress, ValidationBankDetails}