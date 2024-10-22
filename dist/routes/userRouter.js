"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const userRouter = express_1.default.Router();
// general authentication routes :
userRouter.route("/signup").post(userController_1.signupControl);
userRouter.route("/login").post(userController_1.loginControl);
userRouter.route("/forgetPassword").post(userController_1.forgetControl);
userRouter.route("/verifyToken").post(userController_1.verifyControl);
userRouter.route("/updateCart").patch(userController_1.updateCart);
userRouter.route("/getCartItem/:id").get(userController_1.getCartItem);
userRouter.route("/updateWishList").patch(userController_1.updateWishList);
userRouter.route("/getWishList/:id").get(userController_1.getWishList);
userRouter.route("/delete/:id").delete(userController_1.deleteUser);
userRouter.route("/deleteAllCart/:id").delete(userController_1.deleteAllCart);
exports.default = userRouter;
