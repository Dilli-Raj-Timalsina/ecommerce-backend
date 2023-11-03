import express from "express";
import {
    createProduct,
    getSingleProduct,
    deleteProduct,
    editProduct,
    getAllProduct,
    getProductByCategory,
} from "../controllers/productController";
import upload from "../awsConfig/multerSetup";

const productRouter = express.Router();

productRouter
    .route("/createProduct")
    .post(upload.single("binary"), createProduct);
productRouter.route("/getSingleProduct/:id?").get(getSingleProduct);
productRouter.route("/deleteProduct/:id?").post(deleteProduct);
productRouter.route("/editProduct/:id").patch(editProduct);
productRouter.route("/getAllProducts").get(getAllProduct);
productRouter.route("/getProductByCategory/:id").get(getProductByCategory);

export default productRouter;
