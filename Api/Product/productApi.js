let express =  require("express");
let router = express.Router();
let productsModel = require("../../Schemas/productModel");
let multer = require("multer");
let imagePort = "http://localhost:4500";
let AuthUserJwt = require("../../Middlewares/authUserJWT");
let AuthSellerJwt = require("../../Middlewares/authSellerJWT");
let AuthIsSeller =  require("../../Middlewares/authIsSeller");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");
const { object } = require("@hapi/joi");


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
    fileSize: 1024 * 1024 * 4
},
fileFilter: fileFilter
});


//product
router.post( "/addproduct" ,[AuthSellerJwt], uploads.single("image") , tryCatchMiddleware( async ( req, res)=>{

    console.log(req.file);
    console.log(req.body.image);
    console.log(req.body);
    //validate product
    let validate = productsModel.ProductValidation( req.body);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    
    // let subCategory = await productsModel.categoryModel
    // .findOne({"subCat":{$elemMatch:{$eq:{_id:req.body.ProductsubCategoryId}}}})
    // if(!subCategory) { return res.send({message: "Invalid subCategory"})}


    let Category = await productsModel.categoryModel
                            .findOne({$and:
                                [{"categoryName":req.body.productCategoryName},
                                {"subCat":
                                {$elemMatch:
                                    {"subCategoryName":req.body.productSubCategoryName}}}]});
                                    
    if(!Category) { return res.send({message: "Invalid category"})}
   
    //add product
    let newProduct = new productsModel.productModel({
        productName: req.body.productName,
        image: imagePort + "/ProductImages/" + req.file.filename ,
        description: req.body.description,
        price: req.body.price,
        brandName:req.body.brandName,
        offerPrice: req.body.offerPrice,
        percentOff:Math.round(100*((req.body.price-req.body.offerPrice)/req.body.price)),
        stock: req.body.stock,
        shippingCharges:req.body.shippingCharges,
        isAvailable: req.body.isAvailable,
        isTodayOfferAvailable: req.body.isTodayOfferAvailable,
        mainCategoryName: req.body.mainCategoryName,
        productCategoryName:req.body.productCategoryName,
        productSubCategoryName:req.body.productSubCategoryName,
        isSeller: req.body.isSeller,
        sellerDetails:req.body.sellerDetails
    });
    let data = await newProduct.save();
    res.send({message: " Product saved successfully !!", data: data});
}));

router.put("/updateproduct/:id", [ AuthSellerJwt, AuthIsSeller], uploads.single("image"), tryCatchMiddleware( async( req, res)=>{
    console.log(req.file);
    console.log(req.body.image);
    console.log(req.body);
    //validate data
    let validate = productsModel.ProductValidation(req.body);
    console.log(validate.error);
    if(validate.error) { return res.send(validate.error.details[0].message)};

    //update data
    let updateProduct = await productsModel.productModel.findByIdAndUpdate(
        req.params.id,
        {
            productName: req.body.productName,
            image: req.file ? imagePort + "/ProductImages/" + req.file.filename : req.body.image,
            description: req.body.description,
            price: req.body.price,
            brandName:req.body.brandName,
            offerPrice: req.body.offerPrice,
            percentOff:Math.round(((req.body.price-req.body.offerPrice)/req.body.price)*100),
            stock: req.body.stock,
            shippingCharges:req.body.shippingCharges,
            isAvailable: req.body.isAvailable,
            isTodayOfferAvailable: req.body.isTodayOfferAvailable,
            mainCategoryName:req.body.mainCategoryName,
            productCategoryName: req.body.productCategoryName,
            productSubCategoryName: req.body.productSubCategoryName,
            isSeller: req.body.isSeller,
            sellerDetails: req.body.sellerDetails
        },{new : true});

        if(!updateProduct) { 
            return res.status(404).send("Invalid Id !!... Cannot update data")};

        res.send({message: "Data Got Updated", data: updateProduct})
}));


router.delete("/removeproduct/:id", [ AuthSellerJwt, AuthIsSeller], tryCatchMiddleware( async( req, res)=>{

    let removeProductById = await productsModel.productModel
                            .findByIdAndRemove( req.params.id);

    if(!removeProductById) { 
        return res.status(404).send("Invalid Id !!... Cannot remove data")};

    res.send({message: "Data Got Deleted"});
}));

router.get("/seller/products/:pageNo",AuthSellerJwt, tryCatchMiddleware( async ( req, res)=>{
    let perPageData = 2;
    let pageNumber = parseInt(req.params.pageNo);

    if(pageNumber<=0 ) {
        return res.status(403).send({message:"Invalid Page Number !! Page Number should be greater than Zero"})
    }
    console.log(req.sellerEmailId.emailId);
    let products = await productsModel.productModel.find({"sellerDetails.emailId":req.sellerEmailId.emailId})
    .skip(( perPageData * pageNumber) - perPageData).limit(perPageData);;

    if(!products) { return res.status(404).send({message: "Not Found"})};
    
    let productTotalCount = await productsModel.productModel.find({"sellerDetails.emailId":req.sellerEmailId.emailId}).count();
    let productPageNoLimit = Math.ceil( productTotalCount/perPageData );
    if(pageNumber> productPageNoLimit){
        return res.status(403).send({message:"Invalid PageNumber !!"})
    }

   res.send({
       message:'Product with Valid Page.',
       data: products,
       pageNumber: pageNumber,
       perPageData: perPageData,
       productTotalCount: productTotalCount,
       productPageNoLimit: productPageNoLimit
   });
 }));

router.get("/allproducts", tryCatchMiddleware( async ( req, res)=>{

    let allProduct = await productsModel.productModel.find();

    if(!allProduct) { return res.status(404).send({message: "Not Found"})};
    res.send({data: allProduct});

 }));


router.get("/productbyid/:id", tryCatchMiddleware( async( req, res) => {
    console.log("hii",req.params.id);
    if(req.params.id==="1"){
       let product = 0;
        res.send({
            message: "Product Found",
            data: product
        })
    }
else{


    let findProductById = await productsModel.productModel.findById(req.params.id);

    if(!findProductById) { return res.status(403).send({ message: "Product Not  Found !!"})};

    res.send({
        message: "Product Found",
        data: findProductById
    });
}
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

router.post("/searchproductpage/:pageNo", tryCatchMiddleware( async ( req, res) => {
    
    let product = Object.values(req.body.product).length;
    console.log(product);
    // product.product.length();
    // let prod = req.body;
    // console.log(prod);
    let perPageData = 2;
    let pageNumber = parseInt(req.params.pageNo);

    if(pageNumber<=0 ) {
        return res.status(403).send({message:"Invalid Page Number !! Page Number should be greater than Zero"})
    }

    let productTotalCount = product;
    let productPageNoLimit = Math.ceil( productTotalCount/perPageData );
    if(pageNumber> productPageNoLimit){
        return res.status(403).send({message:"Invalid PageNumber !!"})
    }
    let skip = ( perPageData * pageNumber) - perPageData
    console.log(skip);
    if(skip>=perPageData){
        var products  = Object.values(req.body.product).splice(skip).slice(0,perPageData);
    }
    else{
        products= Object.values(req.body.product).slice(0,perPageData)
    }
    

    // .skip(( perPageData * pageNumber) - perPageData).limit(perPageData);
    console.log(products)
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
    console.log(req.params);
    let perPageData = 5;
    let pageNumber = parseInt( req.params.pageNo);

    if(pageNumber<=0)
    {
        return res.status(403).send({message: "'Invalid page Number!! PageNumber should Be greater than Zero"})
    }

    let productTotalCount = await productsModel.productModel.find({"productCategoryName" : req.params.category}).count();
    
    if(!productTotalCount) { return res.status(403).send({message: "Data Not Found !!"})};


    let productPageNoLimit = Math.ceil( productTotalCount/perPageData );
    if(pageNumber> productPageNoLimit){
        return res.status(403).send({message:"Invalid PageNumber !!"})
    }

    
    let products = await productsModel.productModel.find({"productCategoryName" :req.params.category })
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

router.get("/subcategory/:subCategory/page/:pageNo", tryCatchMiddleware( async( req, res)=>{
console.log(req.params);
    let perPageData = 5;
    let pageNumber = parseInt(req.params.pageNo);

    if(pageNumber<=0)
    {
        return res.status(403).send({message: "'Invalid page Number!! PageNumber should Be greater than Zero"})
    }

    let productTotalCount = await productsModel.productModel.find({"productSubCategoryName":req.params.subCategory}).count();
    if(!productTotalCount) { return res.status(403).send({message: "Data Not Found !!"})};

    let productPageNoLimit = Math.ceil( productTotalCount/perPageData );
    if(pageNumber> productPageNoLimit){
        return res.status(403).send({message:"Invalid PageNumber !!"})
    }

    let products = await productsModel.productModel.find({"productSubCategoryName":req.params.subCategory })
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
let date =  new Date(new Date().setMonth(new Date().getMonth()-3));
console.log(date);
    let latestProduct = await productsModel.productModel.find({$and:[{"recordDate":{"$lte":new Date(), 
         "$gte": new Date(new Date().setDate(new Date().getDate()-7))}},
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