const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

let subCategorySchema = new  mongoose.Schema({
    subCategoryName:{type: String, min: 3, max: 300,trim:true}
});

let subCategoryModel = mongoose.model( "subcategoryrecords", subCategorySchema);

let CategorySchema  = new mongoose.Schema({
    categoryName: { type: String, min: 3, max: 100,trim:true},
    subCat: {type:[subCategorySchema], ref:"subcategoryrecords"}
});

let categoryModel = mongoose.model( "categoryrecords", CategorySchema);

let mainCategorySchema = new mongoose.Schema({
    mainCategoryName: {type: String, min:3, max:50, required: true,trim:true},
    category : [CategorySchema]
});

let mainCategoryModel = mongoose.model("maincategory",mainCategorySchema);

let ProductSchema = new mongoose.Schema({
    productName: { type: String, min: 3, max: 300, required: true},
    image: { type: String, min: 2, max: 500, required: true},
    description: { type: String, required: true, min: 3, max: 10000},
    price: { type: Number, required: true, min: 1},
    brandName: { type: String, required:true,min:3,lowercase: true},
    offerPrice: { type: Number, required: true, min: 1},
    percentOff:{type : Number,required:true},
    isAvailable: { type: Boolean, required: true},
    stock:{type:Number, required: true},
    mainCategoryName:{type: mainCategorySchema, ref:"maincategory"},
    Productcategory: { type: String, min:3, max: 100, required: true},
    ProductsubCategory: { type: String, min:3, max: 100, required: true},
    isAdmin: { type: Boolean},
    recordDate: { type: Date,default: Date.now()},
    updateDate: { type:Date,default: Date.now()}
});

let productModel = mongoose.model("productrecords",ProductSchema);

function ProductValidation(data){
    let Schema = Joi.object().keys({
        productName: Joi.string().min(3).max(300).required(),
        image: Joi.string(),
        description: Joi.string().min(3).max(10000).required(),
        price: Joi.number().min(1).required().positive(),
        brandName: Joi.string().required().min(3),
        offerPrice: Joi.number().required().positive(),
        isAvailable: Joi.boolean().required(),
        stock : Joi.number().min(1).required().positive(),
        mainCategoryName: Joi.string().min(1).max(100).required(),
        ProductcategoryId: Joi.string().required(),
        ProductsubCategoryId:Joi.string().required(),
        isAdmin: Joi.boolean().required(),
        recordDate: Joi.date(),
        updateDate: Joi.date(),
    })
    return Schema.validate(data);
}

function CategoryValidation(data){
    let Schema = Joi.object().keys({
        categoryId:Joi.string(),
        categoryName: Joi.string().min(3).max(300),
        subCat: Joi.array().required()    
    }).or("categoryId","categoryName");
    
    return Schema.validate(data);
}

function subCategoryValidation(data){
    let Schema = Joi.object().keys({
        subCategoryId: Joi.string(),
        subCategoryName: Joi.string().min(3)
    }).or("subCategoryId","subCategoryName");
    return Schema.validate(data);
}

function maincategoryValidation(data){
    let Schema = Joi.object().keys({
        mainCategoryName: Joi.string().required(),
        category:Joi.string().required()
    })
    return Schema.validate(data);
}
module.exports = { subCategoryModel, categoryModel, productModel, mainCategoryModel,
     ProductValidation, CategoryValidation, subCategoryValidation, maincategoryValidation};