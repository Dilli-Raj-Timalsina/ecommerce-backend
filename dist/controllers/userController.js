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
exports.updateCart = exports.loginControl = exports.signupControl = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const util_1 = require("util");
const dotenv_1 = __importDefault(require("dotenv"));
const prismaClientExport_1 = __importDefault(require("../prisma/prismaClientExport"));
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const appError_1 = __importDefault(require("../errors/appError"));
dotenv_1.default.config({ path: __dirname + "/.env" });
// 1:) return new jwt based on passed payload
const signToken = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        email: user.email,
        id: user.id,
    };
    return yield jsonwebtoken_1.default.sign(payload, process.env.SECRET, {
        expiresIn: process.env.EXPIRES_IN,
    });
});
//2:) This function sends cookie to the browser so that is saves the cookie and send atomatically
// in next subsequent request
const createSendToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield signToken(user);
    const cookieOptions = {
        expires: new Date(Date.now() +
            Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === "production")
        cookieOptions.httpOnly = true;
    res.cookie("jwt", token, cookieOptions);
    const { id, email } = user;
    const userProfile = {
        id,
        email,
    };
    res.status(statusCode).json({
        status: "success",
        token: "Bearer " + token,
        userProfile,
    });
});
// 3:) general token leven authentication for both student and teacher
const generalProtect = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // a) Getting token and check of it's there
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        throw new appError_1.default("You are not logged in! Please log in to get access.", 404);
    }
    // b) Verification token
    const decoded = (yield (0, util_1.promisify)(jsonwebtoken_1.default.verify)(token));
    // c) Check if user still exists
    const currentUser = yield prismaClientExport_1.default.user.findFirst({
        where: { email: decoded.email },
    });
    if (!currentUser) {
        throw new appError_1.default("The user belonging to this token does no longer exist.", 401);
    }
    console.log(currentUser);
    // GRANT ACCESS TO PROTECTED ROUTE
    // req.user = "currentUser";
    next();
}));
//6:) signup user based on req.body and return jwt via cookie
const signupControl = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // check whether user already exist or not/ duplicate email
    if (yield prismaClientExport_1.default.user.findFirst({ where: { email: req.body.email } })) {
        throw new appError_1.default("User Already Exist with this Email", 404);
    }
    let { name, email, password } = req.body;
    password = yield bcrypt_1.default.hash(password, 10);
    const user = (yield prismaClientExport_1.default.user.create({
        data: {
            name,
            email,
            password,
        },
    }));
    // // if everything is ok :send token to the user
    yield createSendToken({ id: user.id, email: user.email }, 200, res);
}));
exports.signupControl = signupControl;
const loginControl = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    //a)check if email or password exist:
    if (!email || !password) {
        throw new appError_1.default("email or password not provided", 405);
    }
    // b) Check if user exists && password is correct
    const user = yield prismaClientExport_1.default.user.findFirst({ where: { email: email } });
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
        throw new appError_1.default("Incorrect email or password", 405);
    }
    //c) If everything is ok: send token to the logged in user
    yield createSendToken({ id: user.id, email: user.email }, 200, res);
}));
exports.loginControl = loginControl;
const updateCart = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseList, userId } = req.body;
    yield prismaClientExport_1.default.user.update({
        where: { id: userId },
        data: {
            cart: courseList,
        },
    });
    res.status(200).json({
        status: "success",
        message: "succesfully updated cart",
    });
}));
exports.updateCart = updateCart;
