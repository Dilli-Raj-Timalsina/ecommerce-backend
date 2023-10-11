const productRouter = require("express").Router();
import upload from "./../awsConfig/multerSetup"; // Multer setup for file uploads

productRouter.route("/createProduct").post();
productRouter.route("/getProduct/:id?").get();
productRouter.route("/getAllProduct/:id?").get();
productRouter.route("/getAllProductByCategory/:id?").get();

export default productRouter;
