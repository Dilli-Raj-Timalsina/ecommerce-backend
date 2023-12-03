import express from "express";
import {
    contactUs,
    nofifyPurchase,
    createHero,
    getHero,
} from "../controllers/utilsController";
const utilsRouter = express.Router();

// general authentication routes :
utilsRouter.route("/contactUs").post(contactUs);
utilsRouter.route("/notifyPurchase").post(nofifyPurchase);
utilsRouter.route("/createHero").post(createHero);
utilsRouter.route("/getHero").get(getHero);

export default utilsRouter;
