/**
 * Storage abstraction layer.
 *
 * Files (uploadFile / streamFile / deleteFile):
 *   - Upload: try GCS first (works in production, persistent across redeploys).
 *             Fall back to local filesystem when GCS is unavailable (dev env).
 *   - Serve:  try local filesystem first, then GCS fallback.
 *             Covers both dev-only uploads and pre-migration GCS files.
 *
 * JSON (readJSON / writeJSON):
 *   - Primary storage: PostgreSQL kv_store (works everywhere).
 *   - readJSON fallback: GCS (recovers data uploaded before this migration).
 *     On successful GCS read the data is promoted to kv_store automatically.
 */

import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { Client } from "@replit/object-storage";
import { db, kvStoreTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Local filesystem fallback (dev environment / emergency)
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
};

// Lazy GCS client — initialised once, reused across requests
let _gcsClient: Client | null = null;
function getGcsClient(): Client {
  if (!_gcsClient) {
    _gcsClient = new Client({ bucketId: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID });
  }
  return _gcsClient;
}

// ── File storage ──────────────────────────────────────────────────────────────

export async function uploadFile(
  folder: string,
  buffer: Buffer,
  ext: string,
  _mimeType: string
): Promise<string> {
  const filename = `${randomUUID()}${ext}`;
  const objectPath = `${folder}/${filename}`;

  // 1. Prefer GCS — persistent across redeployments (works in production)
  try {
    const client = getGcsClient();
    const result = await client.uploadFromBytes(
      `quindici/${objectPath}`,
      buffer,
      { compress: false },
    );
    if (result.ok) {
      return `/api/files/${objectPath}`;
    }
    // GCS upload failed (e.g. dev env 403) — fall through to local filesystem
  } catch { /* GCS not available */ }

  // 2. Local filesystem fallback (dev environment)
  const dir = path.join(UPLOADS_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });
  await fsPromises.writeFile(path.join(dir, filename), buffer);
  return `/api/files/${objectPath}`;
}

export async function deleteFile(servingUrl: string): Promise<void> {
  if (!servingUrl.startsWith("/api/files/")) return;
  const relativePath = servingUrl.slice("/api/files/".length);
  // Both stores — one of them will have the file
  try { await fsPromises.unlink(path.join(UPLOADS_DIR, relativePath)); } catch { /* gone */ }
  try {
    await getGcsClient().delete(`quindici/${relativePath}`, { ignoreNotFound: true });
  } catch { /* GCS unavailable */ }
}

export async function streamFile(gcsRelative: string, res: any): Promise<void> {
  const ext = path.extname(gcsRelative).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  // 1. Local filesystem (dev uploads / cached copies)
  const filePath = path.join(UPLOADS_DIR, gcsRelative);
  try {
    await fsPromises.access(filePath);
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=31536000");
    fs.createReadStream(filePath).pipe(res);
    return;
  } catch { /* not found locally */ }

  // 2. GCS (production uploads, pre-migration files)
  try {
    const client = getGcsClient();
    const objectName = `quindici/${gcsRelative}`;
    const existsResult = await client.exists(objectName);
    if (existsResult.ok && existsResult.value) {
      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=31536000");
      client.downloadAsStream(objectName).pipe(res);
      return;
    }
  } catch { /* GCS unavailable in dev */ }

  res.status(404).end();
}

// ── JSON storage ──────────────────────────────────────────────────────────────

export async function readJSON<T>(key: string): Promise<T | null> {
  // 1. PostgreSQL kv_store — primary for all new writes
  const rows = await db
    .select()
    .from(kvStoreTable)
    .where(eq(kvStoreTable.key, key))
    .limit(1);
  if (rows.length > 0) return rows[0].value as T;

  // 2. GCS fallback — recovers data uploaded before the PostgreSQL migration
  //    (only reaches this path the first time; once promoted it lives in kv_store)
  try {
    const client = getGcsClient();
    const objectName = `quindici/data/${key}.json`;
    const existsResult = await client.exists(objectName);
    if (!existsResult.ok || !existsResult.value) return null;
    const result = await client.downloadAsText(objectName);
    if (!result.ok) return null;
    const parsed = JSON.parse(result.value) as T;
    // Promote to kv_store so future reads skip GCS entirely
    await writeJSON(key, parsed);
    return parsed;
  } catch { /* GCS unavailable (dev env) */ }

  return null;
}

export async function writeJSON(key: string, data: unknown): Promise<void> {
  await db
    .insert(kvStoreTable)
    .values({ key, value: data as any })
    .onConflictDoUpdate({
      target: kvStoreTable.key,
      set: { value: data as any, updatedAt: new Date() },
    });
}
