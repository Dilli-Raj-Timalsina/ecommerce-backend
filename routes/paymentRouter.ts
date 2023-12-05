import express from "express";
import prisma from "./../prisma/prismaClientExport";
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const paymentRouter = express.Router();

// stripe webhook for handeling payment success or failure
paymentRouter.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        // Verify the event is from Stripe
        try {
            const stripeEvent = stripe.webhooks.constructEvent(
                req.body,
                req.headers["stripe-signature"],
                process.env.STRIPE_WEBHOOK_SECRET
            );
            const data = stripeEvent.data.object;
            // Handle successful payment events
            if (stripeEvent.type === "payment_intent.succeeded") {
                stripe.customers
                    .retrieve(data.customer)
                    .then(async (customer: any) => {
                        const userId = customer.metadata.userId;
                        const products = JSON.parse(customer.metadata.products);

                        console.log(userId, products);
                    });

                // Respond to the webhook with a 200 status to acknowledge receipt
                res.status(200).end();
            }
        } catch (error) {
            console.error("Error handling webhook:", error);
            res.status(400).send("Webhook Error");
        }
    }
);

//stripe hitting endpoint from fronted
paymentRouter
    .route("/create-checkout-session")
    .post(express.json(), async (req, res) => {
        const { products, userId, email, phone } = req.body;
        console.log(products);

        // customer object created for webhook event , it is used for db update
        const customer = await stripe.customers.create({
            email: email,
            phone: phone,
            metadata: {
                userId: userId,
                products: JSON.stringify(products),
            },
        });

        const lineItems = products.map((product: any) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: product.title,
                    metadata: {
                        id: userId,
                    },
                },
                unit_amount: product.price * 100,
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            currency: "inr",
            line_items: lineItems,
            mode: "payment",
            customer: customer.id,
            success_url: "http://localhost:3000/Cart",
            cancel_url: "http://localhost:3000/",
        });

        res.json({ id: session.id });
    });

export default paymentRouter;
