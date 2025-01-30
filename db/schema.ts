import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const scannedItems = sqliteTable("scanned_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  path: text("path"),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mappingData = sqliteTable("mapping_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  path: text("path").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertScannedItemSchema = createInsertSchema(scannedItems);
export const selectScannedItemSchema = createSelectSchema(scannedItems);
export type InsertScannedItem = typeof scannedItems.$inferInsert;
export type SelectScannedItem = typeof scannedItems.$inferSelect;

export const insertMappingDataSchema = createInsertSchema(mappingData);
export const selectMappingDataSchema = createSelectSchema(mappingData);
export type InsertMappingData = typeof mappingData.$inferInsert;
export type SelectMappingData = typeof mappingData.$inferSelect;