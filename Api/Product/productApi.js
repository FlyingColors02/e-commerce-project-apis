let express =  require("express");
let router = express.Router();
let productsModel = require("../../Schemas/productModel");
let multer = require("multer");
let imagePort = "http://localhost:4500";
let AuthUserJwt = require("../../Middlewares/authUserJWT");
let AuthIsAdmin =  require("../../Middlewares/authIsAdmin");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");


let storage = multer.diskStorage({
    destination: function( req, file, cb){
        cb( null, "./ProductImages/");
    },
    filename: function( req, file, cb){
        cb( null, Date.now()+file.originalname);
    }
});

const fileFilter = (req, file, cb)=>{
if( file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" 
|| file.mimetype === "image/png" || file.mimetype === "image/tiff" 
|| file.mimetype === "image/gif" || file.mimetype === "image/pdf" )
{
    cb( null, true);
}
else{
    cb( null, false);
};
}

let uploads = multer({
storage: storage,
limits:{
    fileSize: 1024 * 1024 * 5
},
fileFilter: fileFilter
});


//product
router.post( "/addproduct" , [ AuthUserJwt, AuthIsAdmin], uploads.single("image") , tryCatchMiddleware( async ( req, res)=>{

    //validate product
    let validate = productsModel.ProductValidation( req.body);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    
    // let subCategory = await productsModel.categoryModel
    // .findOne({"subCat":{$elemMatch:{$eq:{_id:req.body.ProductsubCategoryId}}}})
    // if(!subCategory) { return res.send({message: "Invalid subCategory"})}


    let Category = await productsModel.categoryModel
                            .findOne({$and:
                                [{"_id":req.body.ProductcategoryId},
                                {"subCat":
                                {$elemMatch:
                                    {_id:req.body.ProductsubCategoryId}}}]});
                                    
    if(!Category) { return res.send({message: "Invalid category"})}
   
   
    //add product
    let newProduct = new productsModel.productModel({
        productName: req.body.productName,
        image: imagePort + "/ProductImages/" + req.file.filename ,
        description: req.body.description,
        price: req.body.price,
        brandName:req.body.brandName,
        offerPrice: req.body.offerPrice,
        stock: req.body.stock,
        isAvailable: req.body.isAvailable,
        isTodayOfferAvailable: req.body.isTodayOfferAvailable,
        Productcategory:{"_id":Category._id,"categoryName":Category.categoryName},
        ProductsubCategory:Category.subCat,
        isAdmin: req.body.isAdmin,
    });
    let data = await newProduct.save();
    res.send({message: " Product saved successfully !!", data: data});
}));

router.put("/updateproduct/:id", [ AuthUserJwt, AuthIsAdmin], uploads.single("image"), tryCatchMiddleware( async( req, res)=>{

    //validate data
    let validate = productsModel.ProductValidation(req.body);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    //update data
    let updateProduct = await productsModel.productModel.findByIdAndUpdate(
        req.params.id,
        {
            productName: req.body.name,
            image: imagePort + "/ProductImages/" + req.file.filename ,
            description: req.body.description,
            price: req.body.price,
            brandName:req.body.brandName,
            offerPrice: req.body.offerPrice,
            stock: req.body.stock,
            isAvailable: req.body.isAvailable,
            isTodayOfferAvailable: req.body.isTodayOfferAvailable,
            Maincategory: req.body.category,
            ProductsubCategory: req.body.subCategory,
            isAdmin: req.body.isAdmin,
        },{new : true});

        if(!updateProduct) { 
            return res.status(404).send("Invalid Id !!... Cannot update data")};

        res.send({message: "Data Got Updated", data: updateProduct})
}));

router.delete("/removeproduct/:id", [ AuthUserJwt, AuthIsAdmin], tryCatchMiddleware( async( req, res)=>{

    let removeProductById = await productsModel.productModel
                            .findByIdAndRemove( req.params.id);

    if(!removeProductById) { 
        return res.status(404).send("Invalid Id !!... Cannot remove data")};

    res.send({message: "Data Got Deleted"});
}));

router.get("/allproduct", tryCatchMiddleware( async ( req, res)=>{

    let allProduct = await productsModel.productModel.find();

    if(!allProduct) { return res.status(404).send({message: "Not Found"})};

    res.send({message: "Found Data !!", data: allProduct});
}));

router.get("/findproduct/:id", tryCatchMiddleware( async( req, res) => {

    let findProductById = await productsModel.productModel.findById(req.params.id);

    if(!findProductById) { return res.status(403).send({ message: "Product Not  Found !!"})};

    res.send({
        message: "Product Found",
        data: findProductById
    });

}));



//pagination
router.get("/productpage/:pageNo", tryCatchMiddleware( async ( req, res) => {
    let perPageData = 5;
    let pageNumber = parseInt(req.params.pageNo);

    if(pageNumber<=0 ) {
        return res.status(403).send({message:"Invalid Page Number !! Page Number should be greater than Zero"})
    }

    let productTotalCount = await productsModel.productModel.count();
    let productPageNoLimit = Math.ceil( productTotalCount/perPageData );
    if(pageNumber> productPageNoLimit){
        return res.status(403).send({message:"Invalid PageNumber !!"})
    }

    let products  = await productsModel.productModel.find()
    .skip(( perPageData * pageNumber) - perPageData).limit(perPageData);

    if(!products) { return res.status(403).send({message:"Data Not Found :("})};

   res.send({
       message:'Product with Valid Page.',
       data: products,
       pageNumber: pageNumber,
       perPageData: perPageData,
       productTotalCount: productTotalCount,
       productPageNoLimit: productPageNoLimit
   });
}));

router.get("/category/:category/page/:pageNo", tryCatchMiddleware( async ( req, res) =>{
    let perPageData = 5;
    let pageNumber = parseInt( req.params.pageNo);

    if(pageNumber<=0)
    {
        return res.status(403).send({message: "'Invalid page Number!! PageNumber should Be greater than Zero"})
    }

    let productTotalCount = await productsModel.productModel.find({"Productcategory._id" : req.params.category}).count();
    let productPageNoLimit = Math.ceil( productTotalCount/perPageData );
    if(pageNumber> productPageNoLimit){
        return res.status(403).send({message:"Invalid PageNumber !!"})
    }

    
    let products = await productsModel.productModel.find({"Productcategory._id" :req.params.category })
                                                    .skip((perPageData * pageNumber) - perPageData)
                                                    .limit(perPageData);

    if(!products) { return res.status(403).send({message: "Data Not Found !!"})};

    res.send({
        message: "Data Found !!",
        data: products,
        perPageData: perPageData,
        pageNumber: pageNumber,
       productTotalCount:productTotalCount,
        productPageNoLimit: productPageNoLimit
    });
}));

router.get("/category/:category/subcategory/:subcategory/page/:pageNo", tryCatchMiddleware( async( req, res)=>{

    let perPageData = 5;
    let pageNumber = parseInt(req.params.pageNo);

    if(pageNumber<=0)
    {
        return res.status(403).send({message: "'Invalid page Number!! PageNumber should Be greater than Zero"})
    }

    let productTotalCount = await productsModel.productModel.find({"Productcategory._id" : req.params.category,"ProductsubCategory._id":req.params.subcategory}).count();
    let productPageNoLimit = Math.ceil( productTotalCount/perPageData );
    if(pageNumber> productPageNoLimit){
        return res.status(403).send({message:"Invalid PageNumber !!"})
    }

    let products = await productsModel.productModel.find({"Productcategory._id" :req.params.category,"ProductsubCategory._id":req.params.subcategory })
                                                    .skip((perPageData * pageNumber) - perPageData)
                                                    .limit(perPageData);

    if(!products) { return res.status(403).send({message: "Data Not Found !!"})};

    res.send({
        message: "Data Found !!",
        data: products,
        perPageData: perPageData,
        pageNumber: pageNumber,
        productTotalCount: productTotalCount,
        productPageNoLimit: productPageNoLimit
    });
}));

// function DateRecord(){
// //     console.log(date);
// //  return  date.setMonth(new Date().getMonth()-1);
//     if(new Date().getMonth()===1){
//     let year= new Date(new Date().setFullYear(new Date().getFullYear()-1));
//     let newMonth =new Date( new Date().setMonth(1) );
//     return {year,newMonth}   }
//     else{
//     return  new Date(new Date().setMonth(new Date().getMonth()-1));
//     }
// }

router.get("/latestProduct", tryCatchMiddleware( async( req, res) => {
    
    // if(new Date().getMonth()===5){
    // console.log(new Date());}
let date =  new Date(new Date().setDate(new Date().getDate()-7));
console.log(date);
    let latestProduct = await productsModel.productModel.find({$and:[{"recordDate":{"$lte":new Date(), 
         "$gte": new Date(new Date().setMonth(new Date().getMonth()-1))}},
        {"stock":{$gte:1}}]});

    if(!latestProduct[0]) { return res.status(403).send({message:"Not Found !!"})};

    res.send({message:"Data Found !!", data: latestProduct});
}));

router.get("/offerProduct", tryCatchMiddleware( async ( req, res) => {

    let offerProduct = await productsModel.productModel.find({$and:[{"offerPrice":{$gt:0}},{"stock":{$gte:1}}]});
    if(!offerProduct[0]) {return res.status(404).send("NOt Found")};
    res.send({message:"Found Data", data: offerProduct});
}));

module.exports = router;