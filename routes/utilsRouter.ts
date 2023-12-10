import express from "express";
import {
    contactUs,
    nofifyPurchase,
    createHero,
    getHero,
    confirmDelivery,
    confirmOrder,
    getOrderProfile,
} from "../controllers/utilsController";
const utilsRouter = express.Router();

// general authentication routes :
utilsRouter.route("/contactUs").post(contactUs);
utilsRouter.route("/notifyPurchase").post(nofifyPurchase);
utilsRouter.route("/createHero").post(createHero);
utilsRouter.route("/getHero").get(getHero);
utilsRouter.route("/confirmDelivery").post(confirmDelivery);
utilsRouter.route("/confirmOrder").post(confirmOrder);
utilsRouter.route("/getOrderProfile/:id").get(getOrderProfile);

export default utilsRouter;
