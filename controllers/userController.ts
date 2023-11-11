import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { promisify } from "util";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import prisma from "../prisma/prismaClientExport";
import catchAsync from "../errors/catchAsync";
import AppError from "../errors/appError";

dotenv.config({ path: __dirname + "/.env" });

type User = {
    email: string;
    id: number;
    name?: string;
    cart: string[];
};

// 1:) return new jwt based on passed payload
const signToken = async (user: User) => {
    const payload = {
        email: user.email,
        id: user.id,
    };
    return await jwt.sign(payload, process.env.SECRET!, {
        expiresIn: process.env.EXPIRES_IN,
    });
};

//2:) This function sends cookie to the browser so that is saves the cookie and send atomatically
// in next subsequent request
const createSendToken = async (
    user: User,
    statusCode: number,
    res: Response
) => {
    const token = await signToken(user);
    const cookieOptions = {
        expires: new Date(
            Date.now() +
                Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.httpOnly = true;

    res.cookie("jwt", token, cookieOptions);
    const { id, email, cart } = user;
    const userProfile = {
        id,
        email,
        cart,
    };

    res.status(statusCode).json({
        status: "success",
        token: "Bearer " + token,
        userProfile,
    });
};

// 3:) general token leven authentication for both student and teacher
const generalProtect = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // a) Getting token and check of it's there

        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new AppError(
                "You are not logged in! Please log in to get access.",
                404
            );
        }

        // b) Verification token
        const decoded = (await promisify(jwt.verify)(token)) as unknown as User;

        // c) Check if user still exists
        const currentUser = await prisma.user.findFirst({
            where: { email: decoded.email },
        });

        if (!currentUser) {
            throw new AppError(
                "The user belonging to this token does no longer exist.",
                401
            );
        }

        console.log(currentUser);
        // GRANT ACCESS TO PROTECTED ROUTE
        // req.user = "currentUser";
        next();
    }
);

//6:) signup user based on req.body and return jwt via cookie
const signupControl = catchAsync(async (req: Request, res: Response) => {
    // check whether user already exist or not/ duplicate email
    if (await prisma.user.findFirst({ where: { email: req.body.email } })) {
        throw new AppError("User Already Exist with this Email", 404);
    }
    let { name, email, password } = req.body;
    password = await bcrypt.hash(password, 10);
    const user = (await prisma.user.create({
        data: {
            name,
            email,
            password,
        },
    })) as unknown as User;

    // // if everything is ok :send token to the user
    await createSendToken(user, 200, res);
});

const loginControl = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //a)check if email or password exist:
    if (!email || !password) {
        throw new AppError("email or password not provided", 405);
    }
    // b) Check if user exists && password is correct
    const user = await prisma.user.findFirst({ where: { email: email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AppError("Incorrect email or password", 405);
    }
    //c) If everything is ok: send token to the logged in user
    await createSendToken(
        { id: user.id, email: user.email, name: user.name!, cart: user.cart },
        200,
        res
    );
});

const updateCart = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { cart, userId } = req.body;
        const cartString = cart.map(String);

        await prisma.user.update({
            where: { id: userId },
            data: {
                cart: cartString,
            },
        });
        res.status(200).json({
            status: "success",
            message: "succesfully updated cart",
        });
    }
);

const deleteUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        let userId = Number(req.params.id);
        await prisma.user.delete({
            where: { id: userId },
        });
        res.status(200).json({
            status: "success",
            message: "user deleted succesfully",
        });
    }
);

const getCartItem = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const product = await prisma.product.findMany({
            where: {
                id: {
                    in: req.body.cart,
                },
            },
        });

        res.status(200).json({
            status: "success",
            product,
        });
    }
);

export { signupControl, loginControl, updateCart, getCartItem, deleteUser };
