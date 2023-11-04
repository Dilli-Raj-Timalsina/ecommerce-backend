//Note : please Never ever pass any function which is not middleware function , This function is
// designed only for middleware function , if you pass any other helper async function ,It will
// create bug which will be hard to debug

import { Request, Response, NextFunction } from "express";

const catchAsync = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((err) => {
            next(err);
        });
    };
};

export default catchAsync;
