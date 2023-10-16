import express from "express";
import { signupControl, loginControl } from "../controllers/userController";

const userRouter = express.Router();

// general authentication routes :
userRouter.route("/signup").post(signupControl);
userRouter.route("/login").post(loginControl);
userRouter.route("/forgetPassword").post();
userRouter.route("/verifyToken").post();

export default userRouter;
