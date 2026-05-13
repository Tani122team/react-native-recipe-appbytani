import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";

let dbInstance;

/** Lazily connect so the process can boot (e.g. /api/health) before DATABASE_URL is set. */
export function getDb() {
  if (!ENV.DATABASE_URL) {
    return null;
  }
  if (!dbInstance) {
    dbInstance = drizzle(neon(ENV.DATABASE_URL), { schema });
  }
  return dbInstance;
}
