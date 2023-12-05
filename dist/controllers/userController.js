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
exports.verifyControl = exports.forgetControl = exports.updateWishList = exports.getWishList = exports.deleteUser = exports.getCartItem = exports.updateCart = exports.loginControl = exports.signupControl = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const util_1 = require("util");
const dotenv_1 = __importDefault(require("dotenv"));
const prismaClientExport_1 = __importDefault(require("../prisma/prismaClientExport"));
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const appError_1 = __importDefault(require("../errors/appError"));
const email_1 = require("../utils/email");
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
    yield createSendToken(user, 200, res);
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
    const cart = yield prismaClientExport_1.default.cart.findMany({
        where: {
            userId: user.id,
        },
    });
    if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
        throw new appError_1.default("Incorrect email or password", 405);
    }
    // c) If everything is ok: send token to the logged in user
    yield createSendToken({ id: user.id, email: user.email, name: user.name, cart: cart }, 200, res);
}));
exports.loginControl = loginControl;
const updateCart = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, userId, productId } = req.body;
    console.log(req.body);
    console.log(amount, userId, productId);
    const cartInfo = {
        amount: amount,
        productId: productId,
    };
    const cartArray = yield prismaClientExport_1.default.cart.findMany({
        where: {
            userId: userId,
        },
    });
    let contains = false;
    let itemID;
    cartArray.forEach((item) => {
        if (item.productId == productId) {
            contains = true;
            itemID = item.id;
        }
    });
    if (contains && amount == 0) {
        yield prismaClientExport_1.default.cart.delete({
            where: {
                id: itemID,
                productId: productId,
            },
        });
    }
    else if (!contains) {
        yield prismaClientExport_1.default.cart.create({
            data: Object.assign(Object.assign({}, cartInfo), { User: {
                    connect: {
                        id: userId,
                    },
                } }),
        });
    }
    res.status(200).json({
        status: "success",
        message: "succesfully updated cart",
    });
}));
exports.updateCart = updateCart;
const deleteUser = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let userId = Number(req.params.id);
    yield prismaClientExport_1.default.user.delete({
        where: { id: userId },
    });
    res.status(200).json({
        status: "success",
        message: "user deleted succesfully",
    });
}));
exports.deleteUser = deleteUser;
const getCartItem = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.id);
    const cartArray = yield prismaClientExport_1.default.cart.findMany({
        where: {
            userId: userId,
        },
        select: {
            amount: true,
            productId: true,
        },
        orderBy: {
            productId: "asc",
        },
    });
    const productIds = cartArray.map((item) => {
        return Number(item.productId);
    });
    const newProduct = yield prismaClientExport_1.default.product.findMany({
        where: {
            id: {
                in: productIds,
            },
        },
        select: {
            id: true,
            title: true,
            category: true,
            thumbNail: true,
            price: true,
        },
    });
    let product = newProduct.map((item, index) => {
        return Object.assign(Object.assign({}, item), cartArray[index]);
    });
    res.status(200).json({
        status: "success",
        product,
    });
}));
exports.getCartItem = getCartItem;
const updateWishList = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = Number(req.body.userId);
    const wishList = String(req.body.wishList);
    let wishListArray = (_a = (yield prismaClientExport_1.default.user.findFirst({
        where: {
            id: userId,
        },
    }))) === null || _a === void 0 ? void 0 : _a.wishList;
    if (!(wishListArray === null || wishListArray === void 0 ? void 0 : wishListArray.includes(wishList))) {
        wishListArray === null || wishListArray === void 0 ? void 0 : wishListArray.push(wishList);
    }
    else {
        wishListArray = wishListArray === null || wishListArray === void 0 ? void 0 : wishListArray.filter((item) => {
            return item != wishList;
        });
    }
    yield prismaClientExport_1.default.user.update({
        where: { id: userId },
        data: {
            wishList: wishListArray,
        },
    });
    res.status(200).json({
        status: "success",
        message: "succesfully updated cart",
    });
}));
exports.updateWishList = updateWishList;
const getWishList = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = Number(req.params.id);
    const wishList = (_b = (yield prismaClientExport_1.default.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            wishList: true,
        },
    }))) === null || _b === void 0 ? void 0 : _b.wishList;
    const wishListNumber = wishList.map(Number);
    const product = yield prismaClientExport_1.default.product.findMany({
        where: {
            id: {
                in: wishListNumber,
            },
        },
    });
    res.status(200).json({
        status: "success",
        product,
    });
}));
exports.getWishList = getWishList;
const forgetControl = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //a) check whether user exist or not
    const { email } = req.body;
    const currUser = yield prismaClientExport_1.default.user.findFirst({
        where: { email: email },
    });
    if (!currUser) {
        throw new appError_1.default("User does not exist", 401);
    }
    //b) generate reset token:
    const resetToken = Math.floor(Math.random() * 9000) + 1000;
    //c) update user's token with salted and hashed token :
    yield prismaClientExport_1.default.user.update({
        where: { email: email },
        data: { token: resetToken + "" },
    });
    //d) preparing credentials to send user an email:
    const options = {
        email: email,
        subject: "Reset password A+ pathshala ",
        message: `Your reset OTP is   : ${resetToken}\n
    please do not share it with anybody `,
    };
    //e) send reset password link to the user's email
    yield (0, email_1.sendMailNormal)(options);
    //f) if everything succeds then send success message
    res.status(200).json({
        status: "success",
        message: "checkout your email to reset password",
    });
}));
exports.forgetControl = forgetControl;
const verifyControl = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //a) getting user reset credential :
    const { email, otp, password } = req.body;
    console.log(email, otp, password);
    //b) if user doesn't exist or token is invalid
    const user = yield prismaClientExport_1.default.user.findFirst({ where: { email: email } });
    if (!user || !(otp == user.token)) {
        throw new appError_1.default("Invalid or expired token, please reset again!!", 403);
    }
    const random = Math.floor(Math.random() * 9000) + 1000;
    //c) hash the password and update , also update otp
    const hash = yield bcrypt_1.default.hash(password, 10);
    yield prismaClientExport_1.default.user.update({
        where: { email: email },
        data: { password: hash, token: random + "" },
    });
    res.status(200).json({
        status: "success",
        message: "verification has done, change the password now",
    });
}));
exports.verifyControl = verifyControl;
