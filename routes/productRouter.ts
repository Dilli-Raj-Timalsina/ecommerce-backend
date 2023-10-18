import express from "express";
import { createProduct, getProduct } from "../controllers/productController";
import upload from "../awsConfig/multerSetup";

const productRouter = express.Router();

productRouter
    .route("/createProduct")
    .post(upload.single("binary"), createProduct);
productRouter.route("/getProduct/:id?").get(getProduct);
// productRouter.route("/getAllProduct/:id?").get();
// productRouter.route("/getAllProductByCategory/:id?").get();

export default productRouter;
