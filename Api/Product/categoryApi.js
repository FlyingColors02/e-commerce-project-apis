let express =  require("express");
let router = express.Router();
let productsModel = require("../../Schemas/productModel");
let AuthUserJwt = require("../../Middlewares/authUserJWT");
let AuthIsAdmin = require("../../Middlewares/authIsAdmin");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");


//category
router.post("/maincategory", [ AuthUserJwt, AuthIsAdmin], tryCatchMiddleware( async( req, res) =>{
    
    let validate = productsModel.maincategoryValidation(req.body);
    if(validate.error)  {return res.send(validate.error.details[0].message)}
    
    let validCategory = await productsModel.categoryModel.find({"categoryName":req.body.category});
    if(validCategory.subCat===null){ return res.status(403).send({message:"Invalid Category!!"})}

    let mainCategory = new productsModel.mainCategoryModel({
        mainCategoryName:req.body.mainCategoryName,
        category:validCategory
    });
    let data = await mainCategory.save();
    res.send({message:"success" , data: data});
}));

router.post("/addcategory", [ AuthUserJwt, AuthIsAdmin] , tryCatchMiddleware( async( req, res)=>{

    let validate =  productsModel.CategoryValidation(req.body);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    // console.log(req.body.subCat[0].subCategoryName);//skin-care
    // let abc=req.body.subCat[0];
    // console.log(abc);//{"subcategoryName":"skin-care"}

    for(let k in req.body.subCat){
        
        console.log(req.body.subCat[k].subCategoryName);

    let alreadyExists = await productsModel.categoryModel.findOne
                        ({$and:[{"categoryName":req.body.categoryName},
                        {"subCat":
                            {$elemMatch:
                                {"subCategoryName": req.body.subCat[k].subCategoryName}}}]})
                        .populate({path:"subcategoryrecords",
                        model:productsModel.subCategoryModel});

    if(alreadyExists) 
        { 
            return res.status(200).send(
                        { message: "SubCategory {" + req.body.subCat[k].subCategoryName + 
                            "} Already Exists  in Category {"+req.body.categoryName+
                            "}!!.....Previous data Saved Successfully"})
        }; 
   
        
    let subCategory = await productsModel.subCategoryModel
                            .findOne({"subCategoryName":req.body.subCat[k].subCategoryName});

    if(!subCategory) 
        { 
            return res.send({message:
                                "Invalid SubCategory {"
                                + req.body.subCat[k].subCategoryName +
                                "} !! Previous Data Saved Successfully!!"});
        };
      
    var newCategory = new productsModel.categoryModel({
        categoryName: req.body.categoryName,
        subCat: subCategory
        });
        newCategory = await newCategory.save();
   }
  
   res.send({ message: "Category added successfully !!"})

}));

//wrong
router.post("/newcategory", tryCatchMiddleware( async( req, res)=>{

    let validate =  productsModel.CategoryValidation(req.body);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    let validsubcategory = await productsModel.subCategoryModel
                                .findOne({"subCat":
                                            {$elemMatch:
                                                {"_id":req.body.subCategoryId}}});
        
    if(!validsubcategory) {return res.send({message:"invalid subcategory"})};

    let alreadyExists = await productsModel.categoryModel.
                                findOne({$and:
                                            [{"categoryName":req.body.categoryName},
                                            {"subCat":
                                                {$elemMatch:
                                                    {_id:req.body.subCategoryName}}}]})
  if(alreadyExists.subCat) 
    { 
        return res.status(200).send({ message: 
                        "SubCategory {" + req.body.subCat + "} Already Exists  in Category {"
                        +req.body.categoryName+"}!! Just ADD PRODUCT"})
    }; 
   
        
    // let subCategory = await productsModel.subCategoryModel.findById({"_id":req.body.subCat[array].subCategoryId});
    // if(!subCategory) { return res.status(403).send({message:"Invalid SubCategory {"+ req.body.subCat[array].subCategoryId+"} Id !! "})}
      
    // if(!alreadyExists)
   {
   let newCategory = new productsModel.categoryModel({
    categoryName: req.body.categoryName,
    subCat: validsubcategory._id
    });
    newCategory = await newCategory.save();
   res.send({ message: "Category added successfully !!",data:newCategory})}

}));


router.get("/allcategory", tryCatchMiddleware( async ( req, res)=>{

    let allCategory = await productsModel.categoryModel
                        .find()
                            .populate("subCategoryRecord","_id");

    if(!allCategory){
        return res.status(404).send("Data Not Found");}
        
    res.send({ message: "found", data: allCategory});
}));

router.get('/findcategory/:id', tryCatchMiddleware( async( req, res)=>{

    let findCategoryById = await productsModel.categoryModel
                            .findById(req.params.id);

    if(!findCategoryById){
        return res.status(403).send("Data Not Found")};

    res.send({ message: "found", data: findCategoryById});
}));

router.delete('/deletecategory/:id', [ AuthUserJwt, AuthIsAdmin], tryCatchMiddleware( async( req, res)=>{

    let deleteCategoryById = await productsModel.categoryModel
                            .findByIdAndRemove(req.params.id)

    if(!deleteCategoryById){return res.status(403).send("Data Not Found");}
    res.send({ message: "deleted category :("});
}));

module.exports = router;