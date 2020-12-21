let express = require("express");
let router = express.Router();
let productsModel = require("../../Schemas/productModel");
let AuthUserJwt = require("../../Middlewares/authUserJWT");
let AuthIsSeller = require("../../Middlewares/authIsSeller");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");


//category
router.post("/addmaincategory", tryCatchMiddleware(async (req, res) => {
console.log(req.body);
    let validate = productsModel.maincategoryValidation(req.body);
    if (validate.error) { return res.send(validate.error.details[0].message) }

    for (let k in req.body.category) {


        let alreadyExists = await productsModel.mainCategoryModel.findOne
            ({
                $and: [{ "mainCategoryName": req.body.mainCategoryName },
                {
                    "category":
                    {
                        $elemMatch:
                            { "categoryName": req.body.category[k].categoryName }
                    }
                }]
            })
            .populate({
                path: "categoryrecords",
                model: productsModel.categoryModel
            });

        if (alreadyExists) {
            // return res.status(200).send(
            //             { message: "Category {" + req.body.category[k].categoryName + 
            //                 "} Already Exists  in Main Category {"+req.body.mainCategoryName+
            //                 "}!!.....Previous data Saved Successfully"})
            continue;
        };

        let validCategory = await productsModel.categoryModel.findOne({ "categoryName": req.body.category[k].categoryName });
        if (!validCategory) { return res.status(403).send({ message: "Invalid Category!!" }) }

        let mainCategoryCheck = await productsModel.mainCategoryModel.findOne({ "mainCategoryName": req.body.mainCategoryName });
        if (mainCategoryCheck) {
            await productsModel.mainCategoryModel.findOneAndUpdate({ "mainCategoryName": req.body.mainCategoryName }, {
                $push: { category: validCategory }
            }, { new: true });
        }
        else {
            let mainCategory = new productsModel.mainCategoryModel({
                mainCategoryName: req.body.mainCategoryName,
                category: validCategory
            });
            let data = await mainCategory.save();
        }
    }
    res.send({ message: "success" });
}));

router.post("/addcategory", tryCatchMiddleware(async (req, res) => {

    let validate = productsModel.CategoryValidation(req.body);
    if (validate.error) { return res.send(validate.error.details[0].message) };

    // console.log(req.body.subCat[0].subCategoryName);//skin-care
    // let abc=req.body.subCat[0];
    // console.log(abc);//{"subcategoryName":"skin-care"}

    for (let k in req.body.subCat) {

        console.log(req.body.subCat[k].subCategoryName);

        let alreadyExists = await productsModel.categoryModel.findOne
            ({
                $and: [{ "categoryName": req.body.categoryName },
                {
                    "subCat":
                    {
                        $elemMatch:
                            { "subCategoryName": req.body.subCat[k].subCategoryName }
                    }
                }]
            })
            .populate({
                path: "subcategoryrecords",
                model: productsModel.subCategoryModel
            });

        if (alreadyExists) {
            // return res.status(200).send(
            //             { message: "SubCategory {" + req.body.subCat[k].subCategoryName + 
            //                 "} Already Exists  in Category {"+req.body.categoryName+
            //                 "}!!.....Previous data Saved Successfully"})
            continue;
        };


        let subCategory = await productsModel.subCategoryModel
            .findOne({ "subCategoryName": req.body.subCat[k].subCategoryName });

        if (!subCategory) {
            return res.send({
                message:
                    "Invalid SubCategory {"
                    + req.body.subCat[k].subCategoryName +
                    "} !! Previous Data Saved Successfully!!"
            });
        };

        // let subCategoryexists = await productsModel.categoryModel.findOne({ "subCat.subCategoryName": req.body.categoryName })
        // if (subCategoryexists) {
        //     console.log("hii");
        //     let alreadyExists = await productsModel.categoryModel.findOne
        //         ({
        //             $and: [{
        //                 "subCat":
        //                 {
        //                     $elemMatch:
        //                         { "subCategoryName": req.body.categoryName }
        //                 }
        //             },
        //             {
        //                 "subCat":
        //                 {
        //                     $elemMatch:
        //                         { "subCat": { $elemMatch: { "subCategoryName": req.body.subCat[k].subCategoryName } } }
        //                 }
        //             }]
        //         })
        //         .populate({
        //             path: "subcategoryrecords",
        //             model: productsModel.subCategoryModel
        //         });

        //     if (alreadyExists) {
        //         // return res.status(200).send(
        //         //             { message: "SubCategory {" + req.body.subCat[k].subCategoryName + 
        //         //                 "} Already Exists  in Category {"+req.body.categoryName+
        //         //                 "}!!.....Previous data Saved Successfully"})
        //         continue;
        //     };

        //     await productsModel.categoryModel.update({ "subCat.subCategoryName": req.body.categoryName }, { $push: { "subCat.$[outer].subCat": subCategory } }, { "arrayFilters": [{ "outer.subCategoryName": req.body.categoryName }] })
        // }
        // else {
            let categoryExists = await productsModel.categoryModel.findOne({ "categoryName": req.body.categoryName })
            if (categoryExists) {
                await productsModel.categoryModel.findOneAndUpdate({ "categoryName": req.body.categoryName }, { $push: { subCat: subCategory } })
            }
            else {
                var newCategory = new productsModel.categoryModel({
                    categoryName: req.body.categoryName,
                    subCat: subCategory
                });
                newCategory = await newCategory.save();
            }
        }

    // }

    res.send({ message: "Category added successfully !!" })

}));

//wrong
router.post("/newcategory", tryCatchMiddleware(async (req, res) => {

    let validate = productsModel.CategoryValidation(req.body);
    if (validate.error) { return res.send(validate.error.details[0].message) };

    let validsubcategory = await productsModel.subCategoryModel
        .findOne({ "subCategoryName": req.body.subCategoryName });

    if (!validsubcategory) { return res.send({ message: "invalid subcategory" }) };

    let alreadyExists = await productsModel.categoryModel.
        findOne({
            $and:
                [{ "categoryName": req.body.categoryName },
                {
                    "subCat":
                    {
                        $elemMatch:
                            { subCategoryName: req.body.subCategoryName }
                    }
                }]
        })
    if (alreadyExists.subCat) {
        return res.status(200).send({
            message:
                "SubCategory {" + req.body.subCat + "} Already Exists  in Category {"
                + req.body.categoryName + "}!!"
        })
    };

    let categoryExists = await productsModel.categoryModel.findOne({ "categoryName": req.body.categoryName })
    if (categoryExists) {
        return await productsModel.categoryModel.findOneAndUpdate({ "categoryName": req.body.categoryName }, { $push: { subCat: validsubcategory } })
    }
    // let subCategory = await productsModel.subCategoryModel.findById({"_id":req.body.subCat[array].subCategoryId});
    // if(!subCategory) { return res.status(403).send({message:"Invalid SubCategory {"+ req.body.subCat[array].subCategoryId+"} Id !! "})}

    // if(!alreadyExists)
    {
        let newCategory = new productsModel.categoryModel({
            categoryName: req.body.categoryName,
            subCat: validsubcategory._id
        });
        newCategory = await newCategory.save();
        res.send({ message: "Category added successfully !!", data: newCategory })
    }

}));

router.get("/allmaincategory", tryCatchMiddleware(async (req, res) => {
    console.log("main category")
    let allCategory = await productsModel.mainCategoryModel
        .find()
        .populate("categoryrecords", "_id");

    if (!allCategory) {
        return res.status(404).send("Data Not Found");
    }

    res.send({ message: "found", data: allCategory });
}));

router.get("/allcategory", tryCatchMiddleware(async (req, res) => {

    let allCategory = await productsModel.categoryModel
        .find()
        .populate("subCategoryRecord", "_id");

    if (!allCategory) {
        return res.status(404).send("Data Not Found");
    }

    res.send({ message: "found", data: allCategory.reverse() });
}));

router.get('/findcategory/:id', tryCatchMiddleware(async (req, res) => {

    let findCategoryById = await productsModel.categoryModel
        .findById(req.params.id);

    if (!findCategoryById) {
        return res.status(403).send("Data Not Found")
    };

    res.send({ message: "found", data: findCategoryById });
}));

router.delete('/deletecategory/:id', [AuthUserJwt, AuthIsSeller], tryCatchMiddleware(async (req, res) => {

    let deleteCategoryById = await productsModel.categoryModel
        .findByIdAndRemove(req.params.id)

    if (!deleteCategoryById) { return res.status(403).send("Data Not Found"); }
    res.send({ message: "deleted category :(" });
}));

module.exports = router;