import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as authSchema from "./auth-schema";

const connectionString = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing SUPABASE_DATABASE_URL or DATABASE_URL");
}

const client = postgres(connectionString, {
  max: 1,
  ssl: "require",
});

export const db = drizzle(client, { schema: { ...schema, ...authSchema } });
