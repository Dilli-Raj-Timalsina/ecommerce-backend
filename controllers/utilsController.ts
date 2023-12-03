import { Request, Response, NextFunction } from "express";
import { sendMailNormal } from "../utils/email";
import catchAsync from "../errors/catchAsync";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "./../prisma/prismaClientExport";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

import s3 from "./../awsConfig/credential";

const contactUs = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, subject, message, contact } = req.body;

    const options = {
        email: email,
        subject: subject,
        message: ` 
          Name : ${name} ,
          Email :${email} ,
          contact : ${contact} ,
          message : ${message},
         `,
    };

    await sendMailNormal(options);

    res.status(200).json({
        status: "success",
        message: "email sent Successfully",
        data: {
            options,
        },
    });
};

const nofifyPurchase = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { name, email, location, phone } = req.body;

    const options = {
        email: "r30846797@gmail.com",
        subject: "Order confirmed",
        message: ` 
          Name : ${name} ,
          Email :${email} ,
          phone : ${phone} ,
          location : ${location},
           
         `,
    };

    await sendMailNormal(options);

    res.status(200).json({
        status: "success",
        message: "email sent Successfully",
        data: {
            options,
        },
    });
};
const createHero = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            h1title,
            h1subTitle,
            h2title,
            h2subTitle,
            h3title,
            h3subTitle,
            imageFirst,
            imageSecond,
            imageThird,
            category1,
            category2,
            category3,
        } = req.body;

        //if previous hero exist than delete it first

        const hero1 = await prisma.hero.findMany({});
        if (hero1) {
            const objects = [
                {
                    Key: hero1[0].imageFirst,
                },
                {
                    Key: hero1[0].imageSecond,
                },
                {
                    Key: hero1[0].imageThird,
                },
            ];
            const input = {
                Bucket: "9somerandom",
                Delete: {
                    Objects: objects,
                },
            };

            const command = new DeleteObjectsCommand(input);
            await s3.send(command);

            await prisma.hero.deleteMany({
                where: {},
            });
        }

        let inputs = [];

        let key1 = `hero/${"photo" + Math.random() * 10000000000}.${
            imageFirst.split("/")[1]
        }`;
        let key2 = `hero/${"photo" + Math.random() * 10000000000}.${
            imageSecond.split("/")[1]
        }`;
        let key3 = `hero/${"photo" + Math.random() * 10000000000}.${
            imageThird.split("/")[1]
        }`;

        inputs.push(
            new PutObjectCommand({
                Bucket: "9somerandom",
                Key: key1,
                ContentType: `image/${imageFirst.split("/")[1]}`,
            })
        );

        inputs.push(
            new PutObjectCommand({
                Bucket: "9somerandom",
                Key: key2,
                ContentType: `image/${imageSecond.split("/")[1]}`,
            })
        );

        inputs.push(
            new PutObjectCommand({
                Bucket: "9somerandom",
                Key: key3,
                ContentType: `image/${imageThird.split("/")[1]}`,
            })
        );

        let urls = await Promise.all(
            inputs.map(
                async (input: PutObjectCommand) =>
                    await getSignedUrl(s3, input, { expiresIn: 3600 })
            )
        );

        //1:) create db product
        const hero = await prisma.hero.create({
            data: {
                h1title,
                h1subTitle,
                h2title,
                h2subTitle,
                h3title,
                h3subTitle,
                imageFirst: key1,
                imageSecond: key2,
                imageThird: key3,
                category1,
                category2,
                category3,
            },
        });

        res.status(200).json({
            status: "success",
            urls,
            hero,
        });
    }
);

const getHero = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const heros = await prisma.hero.findMany({});
        res.status(200).json({
            status: "success",
            heros,
        });
    }
);

export { contactUs, nofifyPurchase, createHero, getHero };

type Heros = {
    id: number;
    h1title: string;
    h1subTitle: string;
    h2title: string;
    h2subTitle: string;
    h3title: string;
    h3subTitle: string;
    imageFirst: string;
    imageSecond: string;
    imageThird: string;
    category1: string;
    category2: string;
    category3: string;
    createdDate: Date;
};
