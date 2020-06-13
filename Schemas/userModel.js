const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
let jwt = require("jsonwebtoken");
let config = require("config");

let userSchema = new mongoose.Schema({
    firstname:{type:String,min:3,max:30,required:true},
    lastname:{type:String,min:3,max:30,required:true},
    newsLetterCheck:{type:Boolean},
    mobileNo:{type:Number},
    userLogin:{
        emailId:{type:String,min:10,max:30,required:true},
        password:{type:String,min:8,max:50,required:true}
    },
    resetPasswordToken : {type:String},
    resetPasswordExpires :{type:Date},
    isAdmin : {type:Boolean},
    recordDate: {type:Date, default:Date.now()},
    recordUpdate : {type:Date, default:Date.now()}
});

userSchema.methods.jwtToken = function(){
    let token = jwt.sign({_id:this._id,emailId: this.userLogin.emailId,isAdmin:this.isAdmin},config.get("ENV_PASSWORD"));
    return token;
}

let userModel = mongoose.model("userdetails",userSchema);

 function Validation(data){
    let Schema = Joi.object({
        firstname:Joi.string().min(4).max(30).required(),
        lastname:Joi.string().min(3).max(30).required(),
        newsLetterCheck:Joi.boolean(),
        mobileNo: Joi.number().optional(),
        userLogin:{
            emailId:Joi.string().email().min(10).max(30).required(),
            password: Joi.string().min(8).max(50).required(),
            confirmPassword: Joi.string().valid(Joi.ref('password')).required().strict() 
    },
        isAdmin : Joi.boolean(),
        recordDate: Joi.date(),
        recordUpdate: Joi.date()
    });
    return Schema.validate(data);
}

function ValidationLogin(data){
    let Schema = Joi.object().keys({
        emailId:Joi.string().email().min(10).max(30).required(),
        password: Joi.string().min(8).max(50).required().strict() 
          
    });
    return Schema.validate(data);
}

module.exports = { userModel, Validation,ValidationLogin}