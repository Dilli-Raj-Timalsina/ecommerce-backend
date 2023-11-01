"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const multerSetup_1 = __importDefault(require("../awsConfig/multerSetup"));
const productRouter = express_1.default.Router();
productRouter
    .route("/createProduct")
    .post(multerSetup_1.default.single("binary"), productController_1.createProduct);
productRouter.route("/getProduct/:id?").get(productController_1.getProduct);
productRouter.route("/deleteProduct").post(productController_1.deleteProduct);
exports.default = productRouter;
