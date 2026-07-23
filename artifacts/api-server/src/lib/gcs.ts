/**
 * Storage layer — veritabanı tabanlı (PostgreSQL).
 *
 * Dosyalar (resimler, PDF):  file_store tablosunda base64 olarak saklanır.
 *   → Redeploy'da, sunucu yeniden başlamada asla kaybolmaz.
 *   → Hem geliştirme hem üretim ortamında aynı şekilde çalışır.
 *
 * JSON verisi (yemekler, galeri, pizza, SEO…):  kv_store tablosunda.
 *   → GCS fallback: ilk okumada eski GCS verisini otomatik taşır.
 */

import { randomUUID } from "crypto";
import path from "path";
import { db, kvStoreTable, fileStoreTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
};

// ── Dosya depolama (PostgreSQL file_store) ────────────────────────────────────

export async function uploadFile(
  folder: string,
  buffer: Buffer,
  ext: string,
  mimeType: string,
): Promise<string> {
  const id = randomUUID();
  const filename = `${id}${ext}`;
  const content = buffer.toString("base64");

  await db.insert(fileStoreTable).values({ id, folder, filename, content, mimeType });
  return `/api/files/${folder}/${filename}`;
}

export async function deleteFile(servingUrl: string): Promise<void> {
  if (!servingUrl.startsWith("/api/files/")) return;
  const parts = servingUrl.slice("/api/files/".length).split("/");
  if (parts.length < 2) return;
  const [folder, filename] = parts;
  await db
    .delete(fileStoreTable)
    .where(and(eq(fileStoreTable.folder, folder), eq(fileStoreTable.filename, filename)));
}

export async function streamFile(gcsRelative: string, res: any): Promise<void> {
  // gcsRelative = "folder/uuid.ext"
  const parts = gcsRelative.split("/");
  if (parts.length < 2) { res.status(404).end(); return; }
  const [folder, filename] = parts;

  // 1. Veritabanında ara (birincil depolama)
  const rows = await db
    .select()
    .from(fileStoreTable)
    .where(and(eq(fileStoreTable.folder, folder), eq(fileStoreTable.filename, filename)))
    .limit(1);

  if (rows.length > 0) {
    const row = rows[0];
    const ext = path.extname(filename).toLowerCase();
    res.set("Content-Type", CONTENT_TYPES[ext] || row.mimeType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=31536000");
    res.end(Buffer.from(row.content, "base64"));
    return;
  }

  // 2. GCS fallback — geçiş öncesi yüklenen eski dosyalar (üretimde çalışır)
  try {
    const { Client } = await import("@replit/object-storage");
    const client = new Client({ bucketId: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID });
    const objectName = `quindici/${gcsRelative}`;
    const existsResult = await client.exists(objectName);
    if (existsResult.ok && existsResult.value) {
      const dlResult = await client.downloadAsBytes(objectName);
      if (dlResult.ok) {
        const buffer = dlResult.value[0];
        const ext = path.extname(filename).toLowerCase();
        const mimeType = CONTENT_TYPES[ext] || "application/octet-stream";
        // Veritabanına taşı — bir daha GCS'e gitme
        const id = filename.replace(/\.[^.]+$/, "");
        await db
          .insert(fileStoreTable)
          .values({ id, folder, filename, content: buffer.toString("base64"), mimeType })
          .onConflictDoNothing();
        res.set("Content-Type", mimeType);
        res.set("Cache-Control", "public, max-age=31536000");
        res.end(buffer);
        return;
      }
    }
  } catch { /* GCS geliştirme ortamında erişilemez — sorun değil */ }

  res.status(404).end();
}

// ── JSON depolama (PostgreSQL kv_store) ───────────────────────────────────────

export async function readJSON<T>(key: string): Promise<T | null> {
  // 1. kv_store — birincil
  const rows = await db
    .select()
    .from(kvStoreTable)
    .where(eq(kvStoreTable.key, key))
    .limit(1);
  if (rows.length > 0) return rows[0].value as T;

  // 2. GCS fallback — geçiş öncesi veri (üretimde çalışır, kv_store'a taşır)
  try {
    const { Client } = await import("@replit/object-storage");
    const client = new Client({ bucketId: process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID });
    const objectName = `quindici/data/${key}.json`;
    const existsResult = await client.exists(objectName);
    if (!existsResult.ok || !existsResult.value) return null;
    const result = await client.downloadAsText(objectName);
    if (!result.ok) return null;
    const parsed = JSON.parse(result.value) as T;
    await writeJSON(key, parsed); // kv_store'a taşı
    return parsed;
  } catch { /* GCS geliştirme ortamında erişilemez */ }

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
