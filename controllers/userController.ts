import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { promisify } from "util";
import { Request, Response } from "@aws-sdk/types";

type User = {
    email: string;
    id: string;
    name: string;
    role: string;
};
// 1:) return new jwt based on passed payload
const signToken = async (user: User) => {
    const payload = {
        email: user.email,
        id: user.id,
    };
    return await jwt.sign(payload, "process.env.SECRET", {
        expiresIn: process.env.EXPIRES_IN,
    });
};

// const createSendToken = async (user:User, statusCode:number, res:Response) => {
//     const token = await signToken(user);
//     const cookieOptions = {
//         expires: new Date(
//             Date.now() + 12 * 24 * 60 * 60 * 1000
//         ),
//         httpOnly: true,
//     };
//     if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

//     res.cookie("jwt", token, cookieOptions);
//     const { id, name, email, role } = user;
//     const userProfile = {
//         id,
//         name,
//         email,
//         role,
//     };

//     res.status(statusCode).json({
//         status: "success",
//         token: "Bearer " + token,
//         userProfile,
//     });
// };
