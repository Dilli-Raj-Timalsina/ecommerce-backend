"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailNormal = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const appError_1 = __importDefault(require("../errors/appError"));
require("dotenv").config();
const sendMailNormal = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Create a transporter
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        // 2) Define the email options
        const message = {
            from: "Dilli Raj Timalsina <dillirajtimalsina354@gmail.com>",
            to: options.email,
            subject: options.subject,
            text: options.message,
        };
        // 3) Actually send the email
        yield transporter.sendMail(message);
    }
    catch (err) {
        console.log(err);
        throw new appError_1.default("Error from Nodemailer sendMailNormal", 500);
    }
});
exports.sendMailNormal = sendMailNormal;
