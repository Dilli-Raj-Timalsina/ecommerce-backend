import express from "express";
import cors, { CorsOptions } from "cors";
import userRouter from "./routes/userRouter";
import productRouter from "./routes/productRouter";
import utilsRouter from "./routes/utilsRouter";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import xss from "xss-clean";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const corsOptions: CorsOptions = {
    origin: "http://localhost:3000",
};

const app = express();

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(helmet());

app.use(xss());

app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", limiter);

app.use("/api/v1/user", userRouter);

app.use("/api/v1/product", productRouter);

app.use("/api/v1/utils", utilsRouter);

app.use("/", (req, res) => {
    res.end("This is our Base URL , please try diffrent /api routes !");
});

app.all("*", (req, res, next) => {
    next(new Error(` Can't find ${req.originalUrl} on this server!`));
});

app.listen(3000, () => {
    console.log(`[server]: Server is running at http://localhost: 3000}`);
});
