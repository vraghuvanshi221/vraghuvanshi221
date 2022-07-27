const productModel = require("../models/productModel")
const { isValid, 
    isValidRequest, 
    isValidObjectId, 
    removeExtraSpace,
    isValidSize,
    isFloat } = require("../validator/validation")
const { uploadFile } = require("../AWS/aws")

const createProduct = async function (req, res) {
    try {
        console.log(req.body)
        
        const files = req.files

       if (!isValidRequest(req.body)) {
            return res.status(400).send({ status: false, message: "Invalid Request" })
        }
        const data = JSON.parse(req.body.data)

        //extracting params form request body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        let newProductDetail={}

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required" })
        }
        title = removeExtraSpace(title)
        let isTitleAlreadyExist = await productModel.findOne({ title: title, isDeleted: false })
        if (isTitleAlreadyExist) {
            return res.status(409).send({ status: false, message: "product  with this title already exist" })
        }
        newProductDetail.title=title

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "description is required" })
        }
        newProductDetail.description=description

        if (!isValid(price) && isNaN(Number(price))) {
            return res.status(400).send({ status: false, message: "price is mandatory and should be a valid number" })
        }
        newProductDetail.price=price

        if(isValid(currencyId)){
            if(currencyId!="INR"){
                return res.status(400).send({ status: false, message: "currency Id should be INR" })
            }
        }
        else{
            currencyId="INR"
        }
        newProductDetail.currencyId=currencyId
        
        if(isValid(currencyFormat)){
            if(currencyFormat!='₹'){
                return res.status(400).send({ status: false, message: "currency Format should be '₹'" })
            }
        }
        else{
            currencyFormat="₹"
        }
        newProductDetail.currencyFormat=currencyFormat

        if(isFreeShipping){
            if(!(isFreeShipping=='true'||isFreeShipping=='false')){
            return res.status(400).send({ status: false, message: "isFreeShipping can be either 'true' or 'false'" })}
            else
            newProductDetail.isFreeShipping=isFreeShipping
        }
        


        if(style){
         if(!isValid(style)){
            return res.status(400).send({ status: false, message: "please send some value is style" })
            }
         else
        newProductDetail.style=removeExtraSpace(style)
        }

     
       
        
        if(availableSizes){
            if(!isValidSize(availableSizes)){
                return res.status(400).send({ status: false, message: "sizes should be among [S, XS , M , X, L, XXL,X]" })
            }
            newProductDetail.availableSizes=availableSizes
        }

        if(installments){
            if(isNaN(Number(price)&&isFloat(installments))){
                return res.status(400).send({ status: false, message: "please send some value is style" })
            }
            newProductDetail.installments=installments
        }


        //uploading Product Image
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0])
            newProductDetail.productImage = uploadedFileURL
        }
        else {
           return res.status(400).send({ status: false, message: "product image file is required" })
        }

        const newProduct=await productModel.create(newProductDetail)
         res.status(201).send({status:true,message: "Product created successfully",data:newProduct})

 }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


// *************************** Get product by Id **************************

const getProductsById = async function (req, res) {
    try {
        let productId = req.params.productId;

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid productId' })
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (product == null) return res.status(404).send({ status: false, message: "No product found" })

        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}



// ************************** Delete product by Id *************************

const deleteProductById = async function (req, res) {

    try {

        let id = req.params.productId;
        if (!isValidObjectId(id)) {
            return res.status(400).send({ status: false, message: "product Id is invalid." });
        }

        let findProduct = await productModel.findOne({ _id: id });

        if (findProduct == null) {
            return res.status(404).send({ status: false, msg: "No such Product found" });
        }
        if (findProduct.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "Product is already deleted" });
        }
        if (findProduct.isDeleted == false) {
            let Update = await productModel.findOneAndUpdate(
                { _id: id },
                { isDeleted: true, deletedAt: Date() },
                { new: true }
              );
              return res.status(200).send({status: true,message: "successfully deleted the product",data:Update});
        }

    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, Error: err.message });
    }

}











module.exports={createProduct,getProductsById, deleteProductById}