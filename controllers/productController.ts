import { Request, Response, NextFunction } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "./../prisma/prismaClientExport";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

import { deleteBucket } from "./../awsConfig/bucketControl";

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

const deleteProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const id = Number(req.params.id);
        const product = await prisma.product.findUnique({
            where: {
                id: id,
            },
            select: {
                sideImages: true,
            },
        });
        const objects = product?.sideImages.map((value: string) => {
            return { Key: value };
        });

        const input = {
            Bucket: "9somerandom", // required
            Delete: {
                Objects: objects,
            },
        };
        const command = new DeleteObjectsCommand(input);
        await s3.send(command);

        await prisma.product.delete({
            where: {
                id,
            },
        });

        res.status(200).json({
            status: "success",
            message: "Product deleted successfully !",
        });
    }
);
const editProduct = async (req: Request, res: Response, next: NextFunction) => {
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
        const {
            title,
            price,
            description,
            subTitle,
            category,
            sideImage,
            thumbnail,
        } = req.body;

        // Cloud work:
        let sideImageURL: string[] = [];
        let inputs = sideImage.map((name: string, index: number) => {
            sideImageURL.push(
                `${category}/${"photo" + Math.random() * 10000000000}.${
                    name.split("/")[1]
                }`
            );
            return new PutObjectCommand({
                Bucket: "9somerandom",
                Key: sideImageURL[index],
                ContentType: name,
            });
        });
        let thumbNailKey = `${category}/${
            "photo" + Math.random() * 10000000000
        }.${thumbnail.split("/")[1]}`;

        inputs.push(
            new PutObjectCommand({
                Bucket: "9somerandom",
                Key: thumbNailKey,
                ContentType: `image/${thumbnail.split("/")[1]}`,
            })
        );

        let urls = await Promise.all(
            inputs.map(
                async (input: PutObjectCommand) =>
                    await getSignedUrl(s3, input, { expiresIn: 3600 })
            )
        );

        //1:) create db product
        const product = (await prisma.product.create({
            data: {
                title,
                category,
                price: price * 1,
                description,
                subTitle,
                thumbNail: `https://9somerandom.s3.ap-south-1.amazonaws.com/${thumbNailKey}`,
                sideImages: sideImageURL,
            },
        })) as Product;

        res.status(200).json({
            status: "success",
            urls,
            thumbnail: urls[urls.length - 1],
            sideImageURL,
            thumbNailKey,
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

        res.status(200).json({
            status: "success",
            product,
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
};
