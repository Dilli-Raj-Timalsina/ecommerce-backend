"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const productRouter = express_1.default.Router();
productRouter.route("/createProduct").post(productController_1.createProduct);
productRouter.route("/getSingleProduct/:id?").get(productController_1.getSingleProduct);
productRouter.route("/deleteProduct/:id?").get(productController_1.deleteProduct);
productRouter.route("/editProduct/:id").patch(productController_1.editProduct);
productRouter.route("/getAllProducts").get(productController_1.getAllProduct);
productRouter.route("/getProductByCategory/:id").get(productController_1.getProductByCategory);
exports.default = productRouter;
