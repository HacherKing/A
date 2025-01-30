import { defineConfig } from "drizzle-kit";
import { resolve } from "path";

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  driver: 'better-sqlite',
  dialect: 'sqlite',
  dbCredentials: {
    url: resolve("data/sqlite.db")
  }
});