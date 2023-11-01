import express from "express";
import {
    createProduct,
    getProduct,
    deleteProduct,
} from "../controllers/productController";
import upload from "../awsConfig/multerSetup";

const productRouter = express.Router();

productRouter
    .route("/createProduct")
    .post(upload.single("binary"), createProduct);
productRouter.route("/getProduct/:id?").get(getProduct);
productRouter.route("/deleteProduct").post(deleteProduct);

export default productRouter;
