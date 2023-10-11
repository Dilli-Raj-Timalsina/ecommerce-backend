import express from "express";
import cors, { CorsOptions } from "cors";
import userRouter from "./routes/userRouter";
import productRouter from "./routes/productRouter";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const corsOptions: CorsOptions = {
    origin: "http://localhost:8081",
};

const app = express();

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("hey I am from server");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);

app.all("*", (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server!`));
});

app.listen(3005, () => {
    console.log(`[server]: Server is running at http://localhost: 3005}`);
});
