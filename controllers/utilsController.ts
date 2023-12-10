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
        email: "r30846797@gmail.com",
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
    const { name, email, location, phone, item } = req.body;

    let itemDetail = item.reduce((total: string, item: any, i: any) => {
        return (
            total +
            `Item ${i}=> Title : ${item.title} ,
      Price : ${item.price} ,
      Amount : ${item.amount} ,
      \n`
        );
    }, "");

    const options1 = {
        email: "r30846797@gmail.com",
        subject: "New Order Arrived !",
        message: `
          Name : ${name} ,
          Email :${email} ,
          phone : ${phone} ,
          location : ${location},
          item:${itemDetail}
         `,
    };
    const options2 = {
        email: email,
        subject: "Your Order has been Confirmed !",
        message: `
          Name : ${name} ,
          Email :${email} ,
          phone : ${phone} ,
          location : ${location},
          item:${itemDetail}
         `,
    };

    await sendMailNormal(options1);
    await sendMailNormal(options2);

    res.status(200).json({
        status: "success",
        message: "email sent Successfully",
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

const confirmDelivery = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { productIdArr, userId, amount, type } = req.body;
        if (productIdArr.length == 1) {
            await prisma.order.create({
                data: {
                    productId: productIdArr[0],
                    userId,
                    amount,
                    type,
                },
            });
        } else {
            const orders = productIdArr.map((_: any, index: any) => {
                return {
                    productId: productIdArr[index],
                    userId,
                    amount,
                    type,
                };
            });
            await prisma.order.createMany({
                data: orders,
            });
        }

        res.status(200).json({
            status: "success",
            message: "product orders confirmed",
        });
    }
);

const confirmOrder = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { orderId, type } = req.body;

        await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                type: type,
            },
        });

        res.status(200).json({
            status: "success",
            message: "product orders confirmed",
        });
    }
);

const getOrderProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = Number(req.params.id);
        const orders = await prisma.order.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                productId: "asc",
            },
        });
        const productId = orders.map((order, index) => {
            return order.productId;
        });

        const product = await prisma.product.findMany({
            where: {
                id: {
                    in: productId,
                },
            },
            orderBy: {
                id: "asc",
            },
        });

        const OrderProfile = product.map((item, index) => {
            return {
                title: item.title,
                price: item.price,
                thumbNail: item.thumbNail,
                productId: item.id,
                orderType: orders[index].type,
                amount: orders[index].amount,
            };
        });
        res.status(200).json({
            status: "success",
            OrderProfile,
        });
    }
);

export {
    contactUs,
    nofifyPurchase,
    createHero,
    getHero,
    confirmDelivery,
    confirmOrder,
    getOrderProfile,
};
