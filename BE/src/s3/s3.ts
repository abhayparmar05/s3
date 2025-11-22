import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3.send(command);

  return fileName;
};

export const getSignedFileUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};

export const listS3Files = async () => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME!,
    });

    const response = await s3.send(command);

    if (!response.Contents) return [];

    const files = await Promise.all(
      response.Contents.map(async (file) => ({
        key: file.Key!,
        url: await getSignedFileUrl(file.Key!), // secure presigned URL
      }))
    );

    return files;
  } catch (error) {
    console.error("❌ REAL S3 LIST ERROR:", error);
    throw error;
  }
};

export const deleteS3File = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  await s3.send(command);
};
