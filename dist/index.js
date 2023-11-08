"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const productRouter_1 = __importDefault(require("./routes/productRouter"));
const utilsRouter_1 = __importDefault(require("./routes/utilsRouter"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorController_1 = __importDefault(require("./errors/errorController"));
dotenv_1.default.config({ path: __dirname + "/.env" });
const corsOptions = {
    origin: "http://localhost:3000",
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use((0, helmet_1.default)());
app.use((0, xss_clean_1.default)());
app.use((0, cookie_parser_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", limiter);
app.use("/api/v1/user", userRouter_1.default);
app.use("/api/v1/product", productRouter_1.default);
app.use("/api/v1/utils", utilsRouter_1.default);
app.use("/", (req, res) => {
    res.end("This is our Base URL , please try diffrent /api routes !");
});
app.all("*", (req, res, next) => {
    next(new Error(` Can't find ${req.originalUrl} on this server!`));
});
app.use(errorController_1.default);
app.listen(8000, () => {
    console.log(`[server]: Server is running at http://localhost: 8000}`);
});
