import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import fsPromises from "fs/promises";
import { db, kvStoreTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── File storage (local filesystem) ──────────────────────────────────────────

export async function uploadFile(
  folder: string,
  buffer: Buffer,
  ext: string,
  _mimeType: string
): Promise<string> {
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOADS_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });
  await fsPromises.writeFile(path.join(dir, filename), buffer);
  return `/api/files/${folder}/${filename}`;
}

export async function deleteFile(servingUrl: string): Promise<void> {
  if (!servingUrl.startsWith("/api/files/")) return;
  const relativePath = servingUrl.slice("/api/files/".length);
  const filePath = path.join(UPLOADS_DIR, relativePath);
  try {
    await fsPromises.unlink(filePath);
  } catch {
    // ignore — file may already be gone
  }
}

export async function streamFile(gcsRelative: string, res: any): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, gcsRelative);
  try {
    await fsPromises.access(filePath);
  } catch {
    res.status(404).end();
    return;
  }
  const ext = path.extname(gcsRelative).toLowerCase();
  const contentTypeMap: Record<string, string> = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".gif": "image/gif", ".webp": "image/webp", ".pdf": "application/pdf",
    ".svg": "image/svg+xml",
  };
  res.set("Content-Type", contentTypeMap[ext] || "application/octet-stream");
  res.set("Cache-Control", "public, max-age=31536000");
  fs.createReadStream(filePath).pipe(res);
}

// ── JSON storage (PostgreSQL kv_store) ───────────────────────────────────────

export async function readJSON<T>(key: string): Promise<T | null> {
  const rows = await db
    .select()
    .from(kvStoreTable)
    .where(eq(kvStoreTable.key, key))
    .limit(1);
  if (rows.length === 0) return null;
  return rows[0].value as T;
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
