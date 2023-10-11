const userRouter = require("express").Router();

// general authentication routes :
userRouter.route("/signup").post();
userRouter.route("/login").post();
userRouter.route("/forgetPassword").post();
userRouter.route("/verifyToken").post();

export default userRouter;
