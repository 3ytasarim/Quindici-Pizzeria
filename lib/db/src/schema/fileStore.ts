import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const fileStoreTable = pgTable("file_store", {
  id: text("id").primaryKey(),          // UUID → used in the URL
  folder: text("folder").notNull(),      // "dishes", "gallery", "pdf", …
  filename: text("filename").notNull(),  // "uuid.png"
  content: text("content").notNull(),    // base64-encoded binary
  mimeType: text("mime_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FileStore = typeof fileStoreTable.$inferSelect;
