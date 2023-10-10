import express from "express";
import cors, { CorsOptions } from "cors";
import { z } from "zod";
import jwt from "jsonwebtoken";

const corsOptions: CorsOptions = {
    origin: "http://localhost:8081",
};

const app = express();
app.use(cors(corsOptions));

// const myName = z.string();
// type User = z.infer<typeof myName>;

app.get("/", (req, res) => {
    res.send("hey I am from server");
});

app.listen(3005, () => {
    console.log(`[server]: Server is running at http://localhost: 3005}`);
});
