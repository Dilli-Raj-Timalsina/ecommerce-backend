import {
    CreateBucketCommand,
    DeleteBucketCommand,
    ListObjectsCommand,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

import s3 from "./credential";
import AppError from "../errors/appError";

type KeyValue = {
    Key: string;
};

const createBucket = async (
    input: CreateBucketCommand["input"]
): Promise<any> => {
    const command = new CreateBucketCommand(input);
    const response = await s3.send(command);
    return response;
};

const deleteBucket = async (bucketName: string): Promise<any> => {
    try {
        //1:)list all object key using bucketName
        const input1 = {
            Bucket: bucketName,
        };
        const command1 = new ListObjectsCommand(input1);
        const response1 = await s3.send(command1);

        //2:) if object exist in bucket then delete all objects
        if (response1.Contents) {
            const objectList: KeyValue[] = [];
            response1.Contents!.forEach((element) => {
                objectList.push({
                    Key: element.Key!,
                });
            });

            const command2 = new DeleteObjectsCommand({
                Bucket: bucketName,
                Delete: {
                    Objects: objectList,
                },
            });
            await s3.send(command2);
        }
        //3:) finally now delete the empty bucket
        const command3 = new DeleteBucketCommand({
            Bucket: bucketName,
        });
        const response3 = await s3.send(command3);
        return response3;
    } catch (err) {
        throw new AppError(
            " NoSuchBucket: The specified bucket does not exist",
            500
        );
    }
};

const listObjects = async (bucketName: string): Promise<KeyValue[]> => {
    try {
        //1:)list all object key using bucketName
        const input1 = {
            Bucket: bucketName,
        };
        const command1 = new ListObjectsCommand(input1);
        const response1 = await s3.send(command1);

        const objectList: KeyValue[] = [];
        if (response1.Contents) {
            response1.Contents!.forEach((element) => {
                objectList.push({
                    Key: element.Key!,
                });
            });
        }
        return objectList;
    } catch (err) {
        throw new AppError("Bucket doesnot exist", 500);
    }
};

export { createBucket, listObjects, deleteBucket };
