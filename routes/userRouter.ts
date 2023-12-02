import express from "express";
import {
    signupControl,
    loginControl,
    updateCart,
    getCartItem,
    deleteUser,
    updateWishList,
    getWishList,
    forgetControl,
    verifyControl,
} from "../controllers/userController";

const userRouter = express.Router();

// general authentication routes :
userRouter.route("/signup").post(signupControl);
userRouter.route("/login").post(loginControl);
userRouter.route("/forgetPassword").post(forgetControl);
userRouter.route("/verifyToken").post(verifyControl);
userRouter.route("/updateCart").patch(updateCart);
userRouter.route("/getCartItem/:id").get(getCartItem);
userRouter.route("/updateWishList").patch(updateWishList);
userRouter.route("/getWishList/:id").get(getWishList);
userRouter.route("/delete/:id").delete(deleteUser);

export default userRouter;
