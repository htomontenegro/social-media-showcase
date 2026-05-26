import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getEnv } from "./env";

export type UploadResult = {
  key: string;
  url: string;
  bytes: number;
};

function getS3Client(): S3Client | null {
  const env = getEnv();
  if (
    env.STORAGE_MODE !== "s3" ||
    !env.AWS_REGION ||
    !env.AWS_ACCESS_KEY_ID ||
    !env.AWS_SECRET_ACCESS_KEY ||
    !env.AWS_S3_BUCKET
  ) {
    return null;
  }
  return new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadBuffer(
  buffer: Buffer,
  mime: string,
  ext: string
): Promise<UploadResult> {
  const env = getEnv();
  const key = `entries/${randomUUID()}.${ext}`;
  const s3 = getS3Client();

  if (s3 && env.AWS_S3_BUCKET) {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mime,
      })
    );
    const url = `${env.CDN_BASE_URL.replace(/\/$/, "")}/${key}`;
    return { key, url, bytes: buffer.length };
  }

  const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR, "entries");
  await mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);
  const publicKey = `uploads/entries/${filename}`;
  const url = `${env.CDN_BASE_URL.replace(/\/$/, "")}/${publicKey}`;
  return { key: publicKey, url, bytes: buffer.length };
}

export async function deleteStoredObject(
  imageKey: string | null | undefined
): Promise<void> {
  if (!imageKey) return;

  const env = getEnv();
  const s3 = getS3Client();

  if (s3 && env.AWS_S3_BUCKET && imageKey.startsWith("entries/")) {
    await s3
      .send(
        new DeleteObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: imageKey,
        })
      )
      .catch(() => null);
    return;
  }

  const rel = imageKey.startsWith("uploads/")
    ? imageKey.slice("uploads/".length)
    : imageKey;
  const filePath = path.join(process.cwd(), env.UPLOAD_DIR, rel);
  await unlink(filePath).catch(() => null);
}
