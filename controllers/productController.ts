import { Request, Response, NextFunction } from "express";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import prisma from "./../prisma/prismaClientExport";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createBucket } from "./../awsConfig/bucketControl";
import s3 from "./../awsConfig/credential";

type Product = {
    id: number;
    title: string;
    subTitle?: string | null;
    price: number;
    description?: string | null;
    thumbNail: string;
};

const returnInputAccMimetype = (
    file: Express.Multer.File,
    bucketName: string,
    key: string
) => {
    const { mimetype } = file;

    if (mimetype === "video/mp4") {
        return {
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: "video/mp4",
            ContentDisposition: "inline",
            CacheControl: "max-age=3153600, public",
        };
    } else {
        return {
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
        };
    }
};

const createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { title, price, description, subTitle } = req.body;
    // Database work:

    const thumbNailKey: string = `${Date.now()}-${req.file!.originalname}`;
    //update the product db
    const product = (await prisma.product.create({
        data: {
            title,
            price,
            description,
            subTitle,
            thumbNail: thumbNailKey,
        },
    })) as Product;

    // Get a signed URL with an infinite expiry date for storing the thumbnail
    const input = {
        Bucket: product.id.toString(),
        Key: thumbNailKey,
    };
    const command1 = new GetObjectCommand(input);
    const url = await getSignedUrl(s3, command1, {});

    // Cloud work:
    // Create a new course bucket
    await createBucket({ Bucket: product.id.toString() });

    // Upload the thumbnail in S3
    const command = new PutObjectCommand({
        Bucket: product.id.toString(),
        Key: thumbNailKey,
        Body: req.file!.buffer,
    });
    await s3.send(command);

    res.status(200).json({
        status: "success",
        product,
    });
};

const deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {};

const updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {};
