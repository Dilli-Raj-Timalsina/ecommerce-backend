import { S3Client } from "@aws-sdk/client-s3";
import {
    ListBucketsCommand,
    CreateBucketCommand,
    DeleteBucketCommand,
    GetBucketLocationCommand,
    HeadBucketCommand,
    ListObjectsCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { Request, Response, NextFunction } from "express";

import s3 from "./credential";

interface Configuration {
    region?: string;
    credentials?: {
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
    };
}

// All bucket related operations: CRUD operations
// All the below methods take input parameter which defines the input format and send a request to s3

const createBucket = async (
    input: CreateBucketCommand["input"]
): Promise<any> => {
    const command = new CreateBucketCommand(input);
    const response = await s3.send(command);
    return response;
};

const deleteBucket = async (
    bucketName: string,
    keyName: string
): Promise<any> => {
    //first delete all the object from the bucket
    const command1 = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: keyName,
    });
    const response1 = await s3.send(command1);
    // now delete the empty bucket
    const command = new DeleteBucketCommand({
        Bucket: bucketName,
    });
    const response = await s3.send(command);
    return response;
};

const listBuckets = async (
    input: ListBucketsCommand["input"]
): Promise<any> => {
    const command = new ListBucketsCommand(input);
    const response = await s3.send(command);
    return response;
};

const getBucketLocation = async (
    input: GetBucketLocationCommand["input"]
): Promise<any> => {
    const command = new GetBucketLocationCommand(input);
    const response = await s3.send(command);
    return response;
};

const existBucket = async (input: HeadBucketCommand["input"]): Promise<any> => {
    const command = new HeadBucketCommand(input);
    return await s3.send(command);
};

// const deleteAllBucketAtOnce = async (
//     req: Request,
//     res: Response,
//     next: NextFunction
// ): Promise<void> => {
//     // First delete all objects inside the bucket:

//     // Then only bucket deletion tasks start
//     const buckets = await listBuckets({});
//     for (const bucket of buckets.Buckets || []) {
//         // Get an array of keys
//         const command1 = new ListObjectsCommand({
//             Bucket: bucket.Name,
//         });

//         const keysArray = await s3.send(command1);

//         // Extract all keys and make an array of inputs
//         if (keysArray.Contents) {
//             const inputs = (keysArray.Contents || []).map((keyfile) => {
//                 return {
//                     Key: keyfile.Key,
//                 };
//             });
//             // Delete all keys based on an array of inputs
//             const params = {
//                 Bucket: bucket.Name,
//                 Delete: {
//                     Objects: inputs,
//                     Quiet: false,
//                 },
//             };

//             // Deletion command executed
//             const command2 = new DeleteObjectsCommand(params);
//             await s3.send(command2);
//         }
//         const input = {
//             Bucket: bucket.Name,
//         };
//         await deleteBucket(input);
//     }

//     res.status(204).json({
//         status: "success",
//         message: "successfully deleted",
//     });
// };

// Exporting the functions
export {
    createBucket,
    listBuckets,
    getBucketLocation,
    existBucket,
    deleteBucket,
};
