/**
 * Railway S3-compatible bucket storage for diagnostic media uploads.
 *
 * Required env vars:
 *   S3_ENDPOINT        e.g. https://bucket.r2.cloudflarestorage.com or Railway-provided URL
 *   S3_REGION          e.g. us-east-1
 *   S3_ACCESS_KEY_ID
 *   S3_SECRET_ACCESS_KEY
 *   S3_BUCKET_NAME
 *   S3_PUBLIC_BASE_URL (optional) — if the bucket is exposed via a CDN/public URL,
 *                      presigned URLs are still used by default for privacy.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import type { DiagnosticMedia } from '@/types/diagnostic';

let client: S3Client | null = null;

/** True when all required S3 env vars are present. */
export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME,
  );
}

function getClient(): S3Client {
  if (client) return client;

  const endpoint = process.env.S3_ENDPOINT;
  if (!endpoint) throw new Error('S3_ENDPOINT is not configured');

  client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    // Railway/R2/backblaze all support path-style addressing; force it on for safety.
    forcePathStyle: true,
  });

  return client;
}

/** Build a unique, collision-resistant object key for an upload. */
function buildKey(fileName: string): string {
  const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')) : '';
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `diagnostics/${date}/${randomUUID()}${ext}`;
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Upload a single file buffer to the bucket and return its key + a presigned URL.
 * Presigned URLs are valid for `expiresIn` seconds (default 7 days).
 */
export async function uploadMedia(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  expiresIn = 7 * 24 * 60 * 60,
): Promise<UploadResult> {
  const s3 = getClient();
  const bucket = process.env.S3_BUCKET_NAME!;
  const key = buildKey(fileName);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // Allow the admin to fetch via presigned URL; objects themselves are private.
      ACL: 'private',
    }),
  );

  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn },
  );

  return { key, url };
}

/** Generate a fresh presigned URL for an existing object key. */
export async function getPresignedUrl(key: string, expiresIn = 7 * 24 * 60 * 60): Promise<string> {
  const s3 = getClient();
  const bucket = process.env.S3_BUCKET_NAME!;
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
}

/** Build the DiagnosticMedia record returned to the client / stored in the DB. */
export async function uploadToDiagnosticMedia(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  size: number,
): Promise<DiagnosticMedia> {
  const { key, url } = await uploadMedia(buffer, fileName, mimeType);
  return { key, fileName, mimeType, size, url };
}
