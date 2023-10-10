"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const corsOptions = {
    origin: "http://localhost:8081",
};
const app = (0, express_1.default)();
app.use((0, cors_1.default)(corsOptions));
// const myName = z.string();
// type User = z.infer<typeof myName>;
app.get("/", (req, res) => {
    res.send("hey I am from server");
});
app.listen(3005, () => {
    console.log(`[server]: Server is running at http://localhost: 3005}`);
});
