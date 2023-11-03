import { Request, Response, NextFunction } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import prisma from "./../prisma/prismaClientExport";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
    createBucket,
    deleteBucket,
    // deleteAllBucketAtOnce,
} from "./../awsConfig/bucketControl";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

import s3 from "./../awsConfig/credential";

type Product = {
    id: number;
    title: string;
    subTitle?: string | null;
    price: number;
    description?: string | null;
    thumbNail: string;
};

const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // await deleteBucket(req.body.bucketName, req.body.keyName);

    const id = Number(req.params.id);
    await prisma.product.delete({
        where: {
            id,
        },
    });

    res.status(200).json({
        status: "success",
        message: "Product deleted successfully ",
    });
};

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

const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, price, description, subTitle } = req.body;
    const thumbNailKey: string = `${Date.now()}-${req.file!.originalname}`;

    const product = (await prisma.product.create({
        data: {
            title,
            price: price * 1,
            description,
            subTitle,
            thumbNail: thumbNailKey,
        },
    })) as Product;

    const input = {
        Bucket: product.id + "somerandom",
        Key: thumbNailKey,
    };

    // Cloud work:
    await createBucket({ Bucket: product.id + "somerandom" });
    const command = new PutObjectCommand({
        Bucket: product.id + "somerandom",
        Key: thumbNailKey,
        Body: req.file!.buffer,
    });
    await s3.send(command);

    const command1 = new GetObjectCommand(input);
    const url = await getSignedUrl(s3, command1, {});

    res.status(200).json({
        status: "success",
        url,
        product,
    });
};

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { fileLink, bucketName } = req.body;
    let input;

    if (fileLink.split(".")[1] === "mp4") {
        input = {
            Bucket: bucketName,
            Key: `${fileLink}`,
            ResponseContentType: "video/mp4",
        };
    } else {
        input = {
            Bucket: bucketName,
            Key: `${fileLink}`,
        };
    }
    const command = new GetObjectCommand(input);
    const url = await getSignedUrl(s3, command, { expiresIn: 360000 });
    res.status(200).json({
        status: "success",
        url,
    });
};

export { createProduct, getProduct, deleteProduct, editProduct };
