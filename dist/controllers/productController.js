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
const prismaClientExport_1 = __importDefault(require("./../prisma/prismaClientExport"));
const client_s3_1 = require("@aws-sdk/client-s3");
const credential_1 = __importDefault(require("./../awsConfig/credential"));
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const appError_1 = __importDefault(require("../errors/appError"));
const deleteProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const product = yield prismaClientExport_1.default.product.findUnique({
        where: {
            id: id,
        },
        select: {
            sideImages: true,
        },
    });
    const objects = product === null || product === void 0 ? void 0 : product.sideImages.map((value) => {
        return { Key: value };
    });
    const input = {
        Bucket: "9somerandom",
        Delete: {
            Objects: objects,
        },
    };
    const command = new client_s3_1.DeleteObjectsCommand(input);
    yield credential_1.default.send(command);
    yield prismaClientExport_1.default.product.delete({
        where: {
            id,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Product deleted successfully !",
    });
}));
exports.deleteProduct = deleteProduct;
const editProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const { title, subTitle, description } = req.body;
    const price = req.body.price * 1;
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
const createProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, price, description, subTitle, category, sideImage, thumbnail, } = req.body;
    // Cloud work:
    let sideImageURL = [];
    let inputs = sideImage.map((name, index) => {
        sideImageURL.push(`${category}/${"photo" + Math.random() * 10000000000}.${name.split("/")[1]}`);
        return new client_s3_1.PutObjectCommand({
            Bucket: "9somerandom",
            Key: sideImageURL[index],
            ContentType: name,
        });
    });
    let thumbNailKey = `${category}/${"photo" + Math.random() * 10000000000}.${thumbnail.split("/")[1]}`;
    inputs.push(new client_s3_1.PutObjectCommand({
        Bucket: "9somerandom",
        Key: thumbNailKey,
        ContentType: `image/${thumbnail.split("/")[1]}`,
    }));
    let urls = yield Promise.all(inputs.map((input) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, s3_request_presigner_1.getSignedUrl)(credential_1.default, input, { expiresIn: 3600 }); })));
    //1:) create db product
    const product = (yield prismaClientExport_1.default.product.create({
        data: {
            title,
            category,
            price: price * 1,
            description,
            subTitle,
            thumbNail: `https://9somerandom.s3.ap-south-1.amazonaws.com/${thumbNailKey}`,
            sideImages: sideImageURL,
        },
    }));
    res.status(200).json({
        status: "success",
        urls,
        thumbnail: urls[urls.length - 1],
        sideImageURL,
        thumbNailKey,
    });
}));
exports.createProduct = createProduct;
const getSingleProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let productId = Number(req.params.id);
    const product = yield prismaClientExport_1.default.product.findFirst({
        where: {
            id: productId,
        },
    });
    if (!product) {
        throw new appError_1.default(`Product with ${productId} Product ID doesnot exist`, 500);
    }
    res.status(200).json({
        status: "success",
        product,
    });
}));
exports.getSingleProduct = getSingleProduct;
const getAllProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield prismaClientExport_1.default.product.findMany({});
    res.status(200).json({
        status: "success",
        products,
    });
}));
exports.getAllProduct = getAllProduct;
const getProductByCategory = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.getProductByCategory = getProductByCategory;
