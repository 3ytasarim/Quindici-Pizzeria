import { objectStorageClient } from "./objectStorage";
import { randomUUID } from "crypto";

const BUCKET_ID = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID ?? "";

function getBucket() {
  if (!BUCKET_ID) throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID not set");
  return objectStorageClient.bucket(BUCKET_ID);
}

export async function uploadFile(
  folder: string,
  buffer: Buffer,
  ext: string,
  mimeType: string
): Promise<string> {
  const filename = `${randomUUID()}${ext}`;
  const objectName = `quindici/${folder}/${filename}`;
  const file = getBucket().file(objectName);
  await file.save(buffer, { contentType: mimeType, resumable: false });
  return `/api/files/${folder}/${filename}`;
}

export async function deleteFile(servingUrl: string): Promise<void> {
  if (!servingUrl.startsWith("/api/files/")) return;
  const relativePath = servingUrl.slice("/api/files/".length);
  const objectName = `quindici/${relativePath}`;
  try {
    await getBucket().file(objectName).delete();
  } catch {}
}

export async function streamFile(gcsRelative: string, res: any): Promise<void> {
  const objectName = `quindici/${gcsRelative}`;
  const file = getBucket().file(objectName);
  const [exists] = await file.exists();
  if (!exists) {
    res.status(404).end();
    return;
  }
  const [metadata] = await file.getMetadata();
  res.set("Content-Type", (metadata.contentType as string) || "application/octet-stream");
  res.set("Cache-Control", "public, max-age=31536000");
  file.createReadStream().pipe(res);
}

export async function readJSON<T>(key: string): Promise<T | null> {
  const objectName = `quindici/data/${key}.json`;
  const file = getBucket().file(objectName);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [content] = await file.download();
  return JSON.parse(content.toString()) as T;
}

export async function writeJSON(key: string, data: unknown): Promise<void> {
  const objectName = `quindici/data/${key}.json`;
  const file = getBucket().file(objectName);
  await file.save(JSON.stringify(data, null, 2), {
    contentType: "application/json",
    resumable: false,
  });
}
