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
exports.getProductByCategory = exports.getAllProduct = exports.editProduct = exports.deleteProduct = exports.getSingleProduct = exports.createProduct = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const prismaClientExport_1 = __importDefault(require("./../prisma/prismaClientExport"));
const client_s3_2 = require("@aws-sdk/client-s3");
const bucketControl_1 = require("./../awsConfig/bucketControl");
const credential_1 = __importDefault(require("./../awsConfig/credential"));
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // await deleteBucket(req.body.bucketName, req.body.keyName);
    const id = Number(req.params.id);
    yield prismaClientExport_1.default.product.delete({
        where: {
            id,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Product deleted successfully ",
    });
});
exports.deleteProduct = deleteProduct;
const editProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const { title, subTitle, description, price } = req.body;
    let editable = [
        { name: "title", value: title },
        { name: "subTitle", value: subTitle },
        { name: "description", value: description },
        { name: "price", value: price },
    ];
    let newEditable = {};
    editable.forEach((element) => {
        if (element.value != undefined) {
            //   @ts-ignore
            newEditable[element.name] = element.value;
        }
    });
    const updated = yield prismaClientExport_1.default.product.update({
        where: {
            id,
        },
        data: newEditable,
    });
    res.status(200).json({
        status: "success",
        message: "product updated successfully",
        updated,
    });
});
exports.editProduct = editProduct;
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, price, description, subTitle, category } = req.body;
    const thumbNailKey = `${Date.now()}-${req.file.originalname}`;
    const product = (yield prismaClientExport_1.default.product.create({
        data: {
            title,
            category,
            price: price * 1,
            description,
            subTitle,
            thumbNail: thumbNailKey,
        },
    }));
    const input = {
        Bucket: product.id + "somerandom",
        Key: thumbNailKey,
    };
    // Cloud work:
    yield (0, bucketControl_1.createBucket)({ Bucket: product.id + "somerandom" });
    const command = new client_s3_2.PutObjectCommand({
        Bucket: product.id + "somerandom",
        Key: thumbNailKey,
        Body: req.file.buffer,
    });
    yield credential_1.default.send(command);
    const command1 = new client_s3_1.GetObjectCommand(input);
    const url = yield (0, s3_request_presigner_1.getSignedUrl)(credential_1.default, command1, {});
    res.status(200).json({
        status: "success",
        url,
        product,
    });
});
exports.createProduct = createProduct;
const getSingleProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileLink, bucketName, id } = req.body;
    // let input;
    // if (fileLink.split(".")[1] === "mp4") {
    //     input = {
    //         Bucket: bucketName,
    //         Key: `${fileLink}`,
    //         ResponseContentType: "video/mp4",
    //     };
    // } else {
    //     input = {
    //         Bucket: bucketName,
    //         Key: `${fileLink}`,
    //     };
    // }
    // const command = new GetObjectCommand(input);
    // const url = await getSignedUrl(s3, command, { expiresIn: 360000 });
    const product = yield prismaClientExport_1.default.product.findFirst({
        where: {
            id,
        },
    });
    res.status(200).json({
        status: "success",
        product,
    });
});
exports.getSingleProduct = getSingleProduct;
const getAllProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield prismaClientExport_1.default.product.findMany({});
    res.status(200).json({
        status: "success",
        products,
    });
});
exports.getAllProduct = getAllProduct;
const getProductByCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const category = req.params.id;
    const products = yield prismaClientExport_1.default.product.findMany({
        where: {
            category,
        },
    });
    res.status(200).json({
        status: "success",
        products,
    });
});
exports.getProductByCategory = getProductByCategory;
