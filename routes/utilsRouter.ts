import express from "express";
import { contactUs, nofifyPurchase } from "../controllers/utilsController";
const utilsRouter = express.Router();

// general authentication routes :
utilsRouter.route("/contactUs").post(contactUs);
utilsRouter.route("/notifyPurchase").post(nofifyPurchase);

export default utilsRouter;
