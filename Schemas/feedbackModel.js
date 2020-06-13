const mongoose = require("mongoose");
const Joi  = require("@hapi/joi");

let feedbackSchema = new mongoose.Schema({
    name:{type:String,min:4,max:50,required:true},
    emailId:{type:String,min:10,required:true},
    message:{type:String,min:5,max:20000}
});

let feedbackModel = mongoose.model("feedback",feedbackSchema);


function Validation(data){
    let Schema = Joi.object({
        name:Joi.string().min(4).max(50).required(),
        emailId:Joi.string().email().min(10).max(30).required(),
        message:Joi.string().min(5).max(20000)
    });
    return Schema.validate(data);
}

module.exports = {feedbackModel,Validation};