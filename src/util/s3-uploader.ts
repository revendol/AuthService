import * as aws from "aws-sdk";
import {CreateBucketRequest} from 'aws-sdk/clients/s3';
import fs from 'fs';
import envVars from "@shared/env-vars";

aws.config.update({
  secretAccessKey: envVars.aws.secret,
  accessKeyId: envVars.aws.access,
  region: envVars.aws.region
});

/**
 * @name checkBucket
 * @param {S3} s3
 * @returns {Promise<{success:boolean; message: string; data:string;}>}
 */
export const checkBucket = async (s3: aws.S3, bucket: string) => {
  try {
    await s3.headBucket({Bucket: bucket}).promise();
    return {success: true, message: "Bucket already Exist", data: {}};
  } catch (error:unknown) {
    return {success: false, message: "Error bucket don't exsit", data: error};
  }
};
/**
 * @name createBucket
 * @param {S3} s3
 * @returns {Promise<{success:boolean; message: string; data:string;}>}
 */
export const createBucket = async (s3: aws.S3) => {
  const params: CreateBucketRequest = {
    Bucket: envVars.aws.bucket,
    CreateBucketConfiguration: {
      // Set your region here
      LocationConstraint: envVars.aws.region
    }
  };
  try {
    const res = await s3.createBucket(params).promise();
    return {success: true, message: "Bucket created successfully", data: res.Location};
  } catch (error:unknown) {
    return {success: false, message: "Unable to create bucket", data: error};
  }
};

/**
 * @name initBucket
 * @returns {void}
 */
export const initBucket = async (s3: aws.S3) => {
  const bucketStatus = await checkBucket(s3, envVars.aws.bucket);

  if (!bucketStatus.success) { // check if the bucket don't exist
    await createBucket(s3); // create new bucket
  }
};

/**
 * @name uploadToS3
 * @param {S3} s3
 * @param {File} fileData
 * @returns {Promise<{success:boolean; message: string; data: object;}>}
 */
export const uploadToS3 = async (s3: aws.S3, fileData?: Express.Multer.File) => {
  try {
    const fileContent = fs.readFileSync(fileData!.path);
    const ext = fileData!.originalname
      .split('.')
      .filter(Boolean)
      .slice(1)
      .join('.');
    const uniqueSuffix = Date.now().toString()
      + '-'
      + Math.round(Math.random() * 1E9).toString()
      + '.'
      + ext;
    const params = {
      Bucket: envVars.aws.bucket,
      Key: fileData!.originalname + '-' + uniqueSuffix,
      Body: fileContent
    };

    try {
      const res = await s3.upload(params).promise();
      return {success: true, message: "File uploaded successfully", data: res.Location};
    } catch (error:unknown) {
      return {success: false, message: "Unable to Upload the file", data: error};
    }
  } catch (error:unknown) {
    return {success: false, message: "Unable to access this file", data: {}};
  }
};