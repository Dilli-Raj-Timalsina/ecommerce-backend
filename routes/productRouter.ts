import express from "express";
import {
    createProduct,
    getProduct,
    deleteProduct,
    editProduct,
} from "../controllers/productController";
import upload from "../awsConfig/multerSetup";

const productRouter = express.Router();

productRouter
    .route("/createProduct")
    .post(upload.single("binary"), createProduct);
productRouter.route("/getProduct/:id?").get(getProduct);
productRouter.route("/deleteProduct/:id?").post(deleteProduct);
productRouter.route("/editProduct/:id").patch(editProduct);

export default productRouter;
