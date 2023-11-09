import { Request, Response, NextFunction } from "express";
import { sendMailNormal } from "../utils/email";

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
        email: email,
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

export { contactUs, nofifyPurchase };
