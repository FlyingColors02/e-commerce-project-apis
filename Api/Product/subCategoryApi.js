let express = require("express");
let router = express.Router();
let productsModel = require("../../Schemas/productModel");
let AuthUserJwt = require("../../Middlewares/authUserJWT");
let AuthIsSeller = require("../../Middlewares/authIsSeller");
let tryCatchMiddleware = require("../../Middlewares/tryCatchMiddleware");

//subcategory

router.post("/addsubcategory", tryCatchMiddleware(async (req, res) => {
    console.log("in subCategory", req.body);
    let validate = productsModel.subCategoryValidation(req.body);
    console.log(validate.error);
    if (validate.error) { return res.status(403).send(validate.error.details[0].message) };
    console.log(req.body.subCategoryName);

    for (let k in req.body.subcategory) {

        console.log(req.body.subcategory[k].subCategoryName);

        let alreadyExists = await productsModel.subCategoryModel.findOne
            (
                { "subCategoryName": req.body.subcategory[k].subCategoryName }

            );

        if (alreadyExists) {

            continue;
        };


        let newSubCategory = new productsModel.subCategoryModel({
            subCategoryName: req.body.subcategory[k].subCategoryName
        })
        let data = await newSubCategory.save();
    
    }

    res.send({ message: "Sub-Category added successfully !!" })

}));

router.get("/allsubcategory", tryCatchMiddleware(async (req, res) => {

    let allsubCategory = await productsModel.subCategoryModel.find();

    if (!allsubCategory) {
        return res.status(404).send("Data Not Found");
    }
    res.send({ message: "found", data: allsubCategory.reverse() });
}));

router.get('/findsubcategory/:id', tryCatchMiddleware(async (req, res) => {

    let findsubCategoryById = await productsModel.subCategoryModel
        .findById(req.params.id);

    if (!findsubCategoryById) {
        return res.status(403).send("Data Not Found")
    };

    res.send({ message: "found", data: findsubCategoryById });
}));

router.delete('/deletesubcategory/:id', [AuthUserJwt, AuthIsSeller], tryCatchMiddleware(async (req, res) => {

    let deletesubCategoryById = await productsModel.subCategoryModel
        .findByIdAndRemove(req.params.id)

    if (!deletesubCategoryById) { return res.status(403).send("Data Not Found"); }
    res.send({ message: "deleted category :(" });
}));

module.exports = router;