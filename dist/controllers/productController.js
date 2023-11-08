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
exports.uploadSideImages = exports.getProductByCategory = exports.getAllProduct = exports.editProduct = exports.deleteProduct = exports.getSingleProduct = exports.createProduct = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const prismaClientExport_1 = __importDefault(require("./../prisma/prismaClientExport"));
const client_s3_2 = require("@aws-sdk/client-s3");
const bucketControl_1 = require("./../awsConfig/bucketControl");
const credential_1 = __importDefault(require("./../awsConfig/credential"));
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const appError_1 = __importDefault(require("../errors/appError"));
const returnInputAccMimetype = (file, bucketName, key) => {
    return {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
    };
};
const deleteProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const resp = yield (0, bucketControl_1.deleteBucket)(id + "somerandom");
    yield prismaClientExport_1.default.product.delete({
        where: {
            id,
        },
    });
    res.status(200).json({
        status: "success",
        message: "Product deleted successfully !",
        resp,
    });
}));
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
const createProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    console.log(req.file);
    console.log(req.files);
    // const { title, price, description, subTitle, category } = req.body;
    // const thumbNailKey: string = `${Date.now()}-${req.file!.originalname}`;
    // //1:) create db product
    // const product = (await prisma.product.create({
    //     data: {
    //         title,
    //         category,
    //         price: price * 1,
    //         description,
    //         subTitle,
    //         thumbNail: thumbNailKey,
    //     },
    // })) as Product;
    // // Cloud work:
    // await createBucket({ Bucket: product.id + "somerandom" });
    // const command = new PutObjectCommand({
    //     Bucket: product.id + "somerandom",
    //     Key: thumbNailKey,
    //     Body: req.file!.buffer,
    // });
    // await s3.send(command);
    // const input1 = {
    //     Bucket: product.id + "somerandom",
    //     Key: thumbNailKey,
    // };
    // const command1 = new GetObjectCommand(input1);
    // const url = await getSignedUrl(s3, command1, {});
    // const updated = await prisma.product.update({
    //     where: {
    //         id: product.id,
    //     },
    //     data: {
    //         thumbNail: url,
    //     },
    // });
    res.status(200).json({
        status: "success",
        // updated,
    });
}));
exports.createProduct = createProduct;
const uploadSideImages = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let productId = Number(req.params.id);
    let sideImages = [];
    //   @ts-ignore
    req.files.forEach((file) => {
        sideImages.push(file.originalname);
    });
    const product = yield prismaClientExport_1.default.product.update({
        where: { id: productId },
        data: {
            sideImages: sideImages,
        },
    });
    //@ts-ignore
    const inputs = req.files.map((file, index) => {
        let bucketName = Date.now() + sideImages[index];
        sideImages[index] = bucketName;
        return returnInputAccMimetype(file, product.id + "somerandom", bucketName);
    });
    yield Promise.all(inputs.map((input) => credential_1.default.send(new client_s3_2.PutObjectCommand(input))));
    //get all url of side image
    let sideImagesURL = [];
    for (const value of sideImages) {
        const input1 = {
            Bucket: product.id + "somerandom",
            Key: value,
        };
        const command1 = new client_s3_1.GetObjectCommand(input1);
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(credential_1.default, command1, {});
        sideImagesURL.push(url);
        console.log(sideImagesURL, "test1");
    }
    let updatedProduct;
    if (sideImagesURL.length >= 1) {
        updatedProduct = yield prismaClientExport_1.default.product.update({
            where: {
                id: product.id,
            },
            data: {
                sideImages: sideImagesURL,
            },
        });
    }
    res.status(200).json({
        status: "Success",
        updatedProduct: updatedProduct,
    });
}));
exports.uploadSideImages = uploadSideImages;
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
    let input;
    input = {
        Bucket: productId + "somerandom",
        Key: `${product === null || product === void 0 ? void 0 : product.thumbNail}`,
    };
    const command = new client_s3_1.GetObjectCommand(input);
    const thumbNailURL = yield (0, s3_request_presigner_1.getSignedUrl)(credential_1.default, command);
    //get sideImageURL now
    let sideImageURL = [];
    if (product.sideImages.length >= 1) {
        const objectList = yield (0, bucketControl_1.listObjects)(productId + "somerandom");
        objectList.forEach((value) => __awaiter(void 0, void 0, void 0, function* () {
            const input1 = {
                Bucket: productId + "somerandom",
                Key: value.Key,
            };
            const command = new client_s3_1.GetObjectCommand(input1);
            const url = yield (0, s3_request_presigner_1.getSignedUrl)(credential_1.default, command);
            sideImageURL.push(url);
        }));
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
