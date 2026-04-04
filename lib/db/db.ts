import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { environment } from "../util/env";
import * as schema from "./schema";

// Parvat — Drizzle singleton backed by Supabase Postgres.
//
// Always connects via the PgBouncer pooler (transaction mode) so behaviour
// is identical across local dev and production.
//
// prepare: false is required — PgBouncer transaction mode does not support
// prepared statements (each transaction may land on a different DB connection,
// so a server-side prepared statement from a prior connection won't exist).
//
// If you need a direct connection (migrations, LISTEN/NOTIFY, COPY, advisory
// locks, long-running transactions), use createDirectDb() below — it bypasses
// the pooler entirely. Call .end() when done; it is NOT a singleton.

const poolerClient = postgres({
  host:     environment.PARVAT_POOLER_HOST,
  port:     environment.PARVAT_POOLER_PORT,
  user:     environment.PARVAT_USER,
  password: environment.PARVAT_PASSWORD,
  database: environment.PARVAT_DATABASE,
  ssl:      "require",
  prepare:  false,
  max:      10,
});

export const db = drizzle(poolerClient, { schema });

// Direct connection — bypasses PgBouncer entirely.
// Use for: migrations, LISTEN/NOTIFY, COPY, advisory locks, long transactions.
// Call .end() on the returned client when done — not a singleton.
export function createDirectDb(): ReturnType<typeof drizzle<typeof schema>> {
  const directClient = postgres({
    host:     environment.PARVAT_HOST,
    port:     environment.PARVAT_PORT,
    user:     environment.PARVAT_USER,
    password: environment.PARVAT_PASSWORD,
    database: environment.PARVAT_DATABASE,
    ssl:      "require",
    max:      3,
  });

  return drizzle(directClient, { schema });
}
