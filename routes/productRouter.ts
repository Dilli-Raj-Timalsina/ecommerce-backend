import express from "express";
import {
    createProduct,
    getSingleProduct,
    deleteProduct,
    editProduct,
    getAllProduct,
    getProductByCategory,
} from "../controllers/productController";

const productRouter = express.Router();

productRouter.route("/createProduct").post(createProduct);
productRouter.route("/getSingleProduct/:id?").get(getSingleProduct);
productRouter.route("/deleteProduct/:id?").get(deleteProduct);
productRouter.route("/editProduct/:id").patch(editProduct);
productRouter.route("/getAllProducts").get(getAllProduct);
productRouter.route("/getProductByCategory/:id").get(getProductByCategory);

export default productRouter;
