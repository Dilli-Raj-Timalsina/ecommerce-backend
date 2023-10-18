import express from "express";
import { contactUs } from "../controllers/utilsController";
const utilsRouter = express.Router();

// general authentication routes :
utilsRouter.route("/contactUs").post(contactUs);
utilsRouter.route("/").post();

export default utilsRouter;
