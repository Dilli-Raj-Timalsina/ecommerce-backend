import nodemailer from "nodemailer";
import AppError from "../errors/appError";

require("dotenv").config();

interface Options {
    email: string;
    subject: string;
    message: string;
}
const sendMailNormal = async (options: Options) => {
    try {
        // 1) Create a transporter
        const transporter = nodemailer.createTransport({
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
            from: "Ram Shah <r30846797@gmail.com>",
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        // 3) Actually send the email
        await transporter.sendMail(message);
    } catch (err) {
        console.log(err);
        throw new AppError("Error from Nodemailer sendMailNormal", 500);
    }
};

export { sendMailNormal };
