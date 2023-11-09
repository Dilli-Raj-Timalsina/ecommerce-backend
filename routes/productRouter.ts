import express from "express";
import {
    createProduct,
    getSingleProduct,
    deleteProduct,
    editProduct,
    getAllProduct,
    getProductByCategory,
    uploadSideImages,
} from "../controllers/productController";
import upload from "../awsConfig/multerSetup";

const productRouter = express.Router();

productRouter
    .route("/uploadSideImages/:id?")
    .post(upload.array("binary", 15), uploadSideImages);

productRouter
    .route("/createProduct")
    .post(upload.single("binary"), createProduct);

productRouter.route("/getSingleProduct/:id?").get(getSingleProduct);
productRouter.route("/deleteProduct/:id?").get(deleteProduct);
productRouter.route("/editProduct/:id").patch(editProduct);
productRouter.route("/getAllProducts").get(getAllProduct);
productRouter.route("/getProductByCategory/:id").get(getProductByCategory);

export default productRouter;
