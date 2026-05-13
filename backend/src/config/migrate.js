import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { ENV } from "./env.js";
import { sanitizeNeonDatabaseUrl } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  if (!ENV.DATABASE_URL) return;
  try {
    const connectionString = sanitizeNeonDatabaseUrl(ENV.DATABASE_URL);
    const sql = neon(connectionString);
    const db = drizzle(sql);
    const migrationsFolder = path.join(__dirname, "..", "db", "migrations");
    await migrate(db, { migrationsFolder });
    console.log("Database migrations finished");
  } catch (err) {
    console.error("Database migration failed:", err);
  }
}
