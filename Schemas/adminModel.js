const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
let jwt = require("jsonwebtoken");
let config = require("config");
const JoiPhoneNumber = Joi.extend(require("joi-phone-number"));
let mongooseTypePhone = require("mongoose-type-phone");

let adminSchema = new mongoose.Schema({
    userName:{type:String,min:4,max:20,required:true},
    mobileNo:{type: mongooseTypePhone.Phone },
    isAdmin:{type:Boolean},
    adminLogin:{
        emailId:{type:String,min:10,max:25,required:true, lowercase: true},
        password:{type:String,min:8,max:25}
    },
    bankDetails: {
        debitCard: {
            debitCardNo:{type:String},
            cvvNo: {type:Number,regex:[/\d{3}/]},
            cardHolderName: {type:String},
            cardExpireDate:{type:String}
        },
        creditCard:{
            creditCardNo:{type:String},
            cvvNo: {type:Number,regex:[/\d{3}/]},
            cardHolderName: {type:String},
            cardExpireDate: {type:String}}
    },
    resetPasswordToken : {type:String},
    resetPasswordExpires :{type:Date},

    Address: {
        address:{type:String},
        State:{type:String},
        country:{type:String},
        pinCodeNo:{type: Number,regex:[/\d{4}^d{6}/]}},
    recordDate: {type:Date, default:Date.now()},
    recordUpdate : {type:Date, default:Date.now()}
});

adminSchema.methods.jwtToken = function(){
    let token = jwt.sign({_id:this._id,emailId: this.adminLogin.emailId,isAdmin:this.isAdmin},config.get("ENV_PASSWORD"));
    return token;
}

let adminModel = mongoose.model("admindetails",adminSchema);

 function Validation(data){
    let Schema = Joi.object({
        userName:Joi.string().min(4).max(20).required(),
        mobileNo: JoiPhoneNumber.string().phoneNumber(),
        adminLogin: Joi.object().keys({
            emailId:Joi.string().email().min(10).max(25).required(),
            password: Joi.string().min(8).max(25).required(),
            confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({'any.only': 'ConfirmPassword must match Password'})
    }),
    bankDetails: Joi.object().keys({
        debitCard: Joi.object().keys({
            debitCardNo: Joi.string().creditCard(),
        cvvNo: Joi.string().regex(/\d{3}/),
        cardHolderName: Joi.string(),
        cardExpireDate: Joi.string()
        }),
        creditCard: Joi.object().keys({
            creditCardNo: Joi.string().creditCard(),
            cvvNo: Joi.string().regex(/\d{3}/),
            cardHolderName: Joi.string(),
            cardExpireDate: Joi.string()
        })
    })  ,Address: Joi.object().keys({
        address: Joi.string().required(),
        State: Joi.string().required(),
        country:Joi.string().required(),
        pinCodeNo: Joi.string().regex(/\d{6}/)
       }),
        isAdmin:Joi.boolean(),
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
        emailId:Joi.string().email(),
        Address: Joi.object().keys({
        address: Joi.string().required(),
        State: Joi.string().required(),
        country:Joi.string().required(),
        pinCodeNo: Joi.string().required().regex(/\d{4}^d{6}/)
       })
    });
    return Schema.validate(data);
}


function ValidationBankDetails(data){
    let Schema = Joi.object().keys({
        emailId: Joi.string().email().required(),
        bankDetails: Joi.object().keys({
            debitCard: Joi.object().keys({
                debitCardNo: Joi.string().creditCard(),
            cvvNo: Joi.string().regex(/\d{3}/),
            cardHolderName: Joi.string(),
            cardExpireDate: Joi.string()
            }),
            creditCard: Joi.object().keys({
                creditCardNo: Joi.string().creditCard(),
                cvvNo: Joi.string().regex(/\d{3}/),
                cardHolderName: Joi.string(),
                cardExpireDate: Joi.string()
            })
        })  
          });
    return Schema.validate(data);
}

module.exports = { adminModel, Validation,ValidationLogin, ValidationEmail,
     ValidationPassword, ValidationAddress, ValidationBankDetails}