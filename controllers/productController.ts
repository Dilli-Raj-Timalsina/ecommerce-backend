import { Request, Response, NextFunction } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import prisma from "./../prisma/prismaClientExport";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
    createBucket,
    deleteBucket,
    listObjects,
} from "./../awsConfig/bucketControl";

import s3 from "./../awsConfig/credential";
import catchAsync from "../errors/catchAsync";
import AppError from "../errors/appError";

type Product = {
    id: number;
    title: string;
    subTitle?: string | null;
    price: number;
    description?: string | null;
    thumbNail: string;
};

const returnInputAccMimetype = (file: any, bucketName: any, key: any) => {
    return {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
    };
};

const deleteProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const resp = await deleteBucket(id + "somerandom");

        await prisma.product.delete({
            where: {
                id,
            },
        });

        res.status(200).json({
            status: "success",
            message: "Product deleted successfully !",
            resp,
        });
    }
);
const editProduct = async (req: Request, res: Response, next: NextFunction) => {
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

    const updated = await prisma.product.update({
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
};

const createProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, price, description, subTitle, category } = req.body;
        const thumbNailKey: string = `${Date.now()}-${req.file!.originalname}`;
        //1:) create db product
        const product = (await prisma.product.create({
            data: {
                title,
                category,
                price: price * 1,
                description,
                subTitle,
                thumbNail: thumbNailKey,
            },
        })) as Product;

        // Cloud work:

        await createBucket({ Bucket: product.id + "somerandom" });
        const command = new PutObjectCommand({
            Bucket: product.id + "somerandom",
            Key: thumbNailKey,
            Body: req.file!.buffer,
        });
        await s3.send(command);

        const input1 = {
            Bucket: product.id + "somerandom",
            Key: thumbNailKey,
        };

        const command1 = new GetObjectCommand(input1);
        const url = await getSignedUrl(s3, command1, {});

        const updated = await prisma.product.update({
            where: {
                id: product.id,
            },
            data: {
                thumbNail: url,
            },
        });

        res.status(200).json({
            status: "success",
            updated,
        });
    }
);

const uploadSideImages = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        let productId = Number(req.params.id);
        let sideImages: string[] = [];
        //   @ts-ignore
        req.files.forEach((file: Express.Multer.File) => {
            sideImages.push(file.originalname);
        });

        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                sideImages: sideImages,
            },
        });
        //@ts-ignore
        const inputs = req.files.map((file: Express.Multer.File, index) => {
            let bucketName = Date.now() + sideImages[index];
            sideImages[index] = bucketName;
            return returnInputAccMimetype(
                file,
                product.id + "somerandom",
                bucketName
            );
        });

        await Promise.all(
            inputs.map((input: PutObjectCommandInput) =>
                s3.send(new PutObjectCommand(input))
            )
        );

        //get all url of side image
        let sideImagesURL: string[] = [];
        for (const value of sideImages) {
            const input1 = {
                Bucket: product.id + "somerandom",
                Key: value,
            };

            const command1 = new GetObjectCommand(input1);
            const url = await getSignedUrl(s3, command1, {});
            sideImagesURL.push(url);
            console.log(sideImagesURL, "test1");
        }

        let updatedProduct;
        if (sideImagesURL.length >= 1) {
            updatedProduct = await prisma.product.update({
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
    }
);

const getSingleProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        let productId = Number(req.params.id);

        const product = await prisma.product.findFirst({
            where: {
                id: productId,
            },
        });
        if (!product) {
            throw new AppError(
                `Product with ${productId} Product ID doesnot exist`,
                500
            );
        }
        let input;
        input = {
            Bucket: productId + "somerandom",
            Key: `${product?.thumbNail}`,
        };
        const command = new GetObjectCommand(input);
        const thumbNailURL = await getSignedUrl(s3, command);

        //get sideImageURL now
        let sideImageURL: string[] = [];
        if (product.sideImages.length >= 1) {
            const objectList = await listObjects(productId + "somerandom");

            objectList.forEach(async (value) => {
                const input1 = {
                    Bucket: productId + "somerandom",
                    Key: value.Key,
                };
                const command = new GetObjectCommand(input1);
                const url = await getSignedUrl(s3, command);
                sideImageURL.push(url);
            });
        }

        res.status(200).json({
            status: "success",
            product,
            thumbNailURL,
            sideImageURL,
        });
    }
);

const getAllProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await prisma.product.findMany({});

        res.status(200).json({
            status: "success",
            products,
        });
    }
);

const getProductByCategory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const category = req.params.id;
        const products = await prisma.product.findMany({
            where: {
                category,
            },
        });
        res.status(200).json({
            status: "success",
            products,
        });
    }
);
export {
    createProduct,
    getSingleProduct,
    deleteProduct,
    editProduct,
    getAllProduct,
    getProductByCategory,
    uploadSideImages,
};
