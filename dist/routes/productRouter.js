"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const productRouter = require("express").Router();
productRouter.route("/createProduct").post();
productRouter.route("/getProduct/:id?").get();
productRouter.route("/getAllProduct/:id?").get();
productRouter.route("/getAllProductByCategory/:id?").get();
exports.default = productRouter;
