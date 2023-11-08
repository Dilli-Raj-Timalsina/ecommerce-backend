import express from "express";
import {
    signupControl,
    loginControl,
    updateCart,
    getCartItem,
} from "../controllers/userController";

const userRouter = express.Router();

// general authentication routes :
userRouter.route("/signup").post(signupControl);
userRouter.route("/login").post(loginControl);
userRouter.route("/updateCart").patch(updateCart);
userRouter.route("/getCartItem").post(getCartItem);

export default userRouter;
