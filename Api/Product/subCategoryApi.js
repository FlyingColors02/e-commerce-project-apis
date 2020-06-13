let express =  require("express");
let router = express.Router();
let productsModel = require("../../Schemas/productModel");
let AuthUserJwt = require("../../Middlewares/authUserJWT");
let AuthIsAdmin = require("../../Middlewares/authIsAdmin");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

//subcategory

router.post("/addsubcategory", [ AuthUserJwt, AuthIsAdmin], tryCatchMiddleware( async( req, res)=>{

    let validate = productsModel.subCategoryValidation(req.body);
    if(validate.error) { return res.status(403).send(validate.error.details[0].message)};
    console.log(req.body.subCategoryName);
    let alreadyExists = await productsModel.subCategoryModel.findOne({"subCategoryName": req.body.subCategoryName});
    if(alreadyExists) { return res.status(200).send({ message: "Already Exists !!"})}; 

    let newSubCategory = new productsModel.subCategoryModel({
        subCategoryName: req.body.subCategoryName
    })
    let data = await newSubCategory.save();

    res.send({
        message: "SubCategory Added Successfully !!",
        data:  data
    });
}));

router.get("/allsubcategory", tryCatchMiddleware( async( req, res) => {

    let allsubCategory = await productsModel.subCategoryModel.find();

    if(!allsubCategory){
        return res.status(404).send("Data Not Found");}
    res.send({ message: "found", data: allsubCategory});
}));

router.get('/findsubcategory/:id', tryCatchMiddleware( async( req, res)=>{

    let findsubCategoryById = await productsModel.subCategoryModel
                            .findById(req.params.id);

    if(!findsubCategoryById){
        return res.status(403).send("Data Not Found")};

    res.send({ message: "found", data: findsubCategoryById});
}));

router.delete('/deletesubcategory/:id', [ AuthUserJwt, AuthIsAdmin], tryCatchMiddleware( async( req, res)=>{

    let deletesubCategoryById = await productsModel.subCategoryModel
                            .findByIdAndRemove(req.params.id)

    if(!deletesubCategoryById){return res.status(403).send("Data Not Found");}
    res.send({ message: "deleted category :("});
}));

module.exports = router;