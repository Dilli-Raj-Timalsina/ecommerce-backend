import express from "express";
import {
    signupControl,
    loginControl,
    updateCart,
    getCartItem,
    deleteUser,
} from "../controllers/userController";

const userRouter = express.Router();

// general authentication routes :
userRouter.route("/signup").post(signupControl);
userRouter.route("/login").post(loginControl);
userRouter.route("/updateCart").patch(updateCart);
userRouter.route("/getCartItem").post(getCartItem);
userRouter.route("/delete/:id").delete(deleteUser);

export default userRouter;
