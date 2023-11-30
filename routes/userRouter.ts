import express from "express";
import {
    signupControl,
    loginControl,
    updateCart,
    getCartItem,
    deleteUser,
    updateWishList,
    getWishList,
} from "../controllers/userController";

const userRouter = express.Router();

// general authentication routes :
userRouter.route("/signup").post(signupControl);
userRouter.route("/login").post(loginControl);
userRouter.route("/updateCart").patch(updateCart);
userRouter.route("/getCartItem").post(getCartItem);
userRouter.route("/updateWishList").patch(updateCart);
userRouter.route("/getWishList").post(getCartItem);
userRouter.route("/delete/:id").delete(deleteUser);

export default userRouter;
