import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const reservationsTable = pgTable("reservations", {
  id: text("id").primaryKey(),
  type: text("type").notNull().default("reservation"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: text("guests").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  seen: boolean("seen").notNull().default(false),
  status: text("status").notNull().default("neu"),
});

export type Reservation = typeof reservationsTable.$inferSelect;
export type InsertReservation = typeof reservationsTable.$inferInsert;

export const wartelisteTable = pgTable("warteliste", {
  id: text("id").primaryKey(),
  type: text("type").notNull().default("warteliste"),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  guests: text("guests").notNull().default("2"),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull(),
  notifType: text("notif_type").notNull().default("email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  seen: boolean("seen").notNull().default(false),
});

export type Warteliste = typeof wartelisteTable.$inferSelect;
export type InsertWarteliste = typeof wartelisteTable.$inferInsert;
