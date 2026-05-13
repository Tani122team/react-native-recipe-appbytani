import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { ENV } from "./env.js";
import * as schema from "../db/schema.js";

let dbInstance;

/** Neon's serverless driver uses HTTP; strip channel_binding (TCP SCRAM option) to avoid connection errors. */
export function sanitizeNeonDatabaseUrl(url) {
  const q = url.indexOf("?");
  if (q === -1) return url;
  const base = url.slice(0, q);
  const params = new URLSearchParams(url.slice(q + 1));
  params.delete("channel_binding");
  const rest = params.toString();
  return rest ? `${base}?${rest}` : base;
}

/** Lazily connect so the process can boot (e.g. /api/health) before DATABASE_URL is set. */
export function getDb() {
  if (!ENV.DATABASE_URL) {
    return null;
  }
  if (!dbInstance) {
    const connectionString = sanitizeNeonDatabaseUrl(ENV.DATABASE_URL);
    dbInstance = drizzle(neon(connectionString), { schema });
  }
  return dbInstance;
}
