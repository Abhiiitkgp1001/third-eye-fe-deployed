import { config } from "dotenv";
import { parseEnv } from "znv";
import { z } from "zod";

// Mirrors env.ts from backend/clean/src/lib/util/env.ts
// Load .env from multiple locations so scripts can be run from any depth.
// Swallow dotenv warnings when a path doesn't exist.
const originalWarn = console.warn;
console.warn = () => {};
config({ path: ".env" });
config({ path: ".env.local" });
config({ path: "../.env" });
config({ path: "../.env.local" });
config({ path: "../../.env" });
config({ path: "../../.env.local" });
console.warn = originalWarn;

export const DeploymentTypeSchema = z.enum([
  "development",
  "production",
]);

export type DeploymentType = z.infer<typeof DeploymentTypeSchema>;

// Strips surrounding quotes added by Docker (Docker treats quotes as part of the value)
const EnvStringSchema = z.string().transform((val: string): string => {
  if (val.length >= 2) {
    const firstChar = val[0];
    const lastChar = val[val.length - 1];
    if (
      firstChar != null &&
      lastChar != null &&
      (firstChar === '"' || firstChar === "'") &&
      firstChar === lastChar
    ) {
      return val.slice(1, -1);
    }
  }
  return val;
});

export const environment = parseEnv(process.env, {
  NODE_ENV: DeploymentTypeSchema.optional().default("development"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: EnvStringSchema,
  CLERK_SECRET_KEY: EnvStringSchema,
  CLERK_WEBHOOK_SECRET: EnvStringSchema.optional().default(""),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: EnvStringSchema,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: EnvStringSchema,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: EnvStringSchema,
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: EnvStringSchema,
  API_SKELETON_KEY: EnvStringSchema.optional().default(""),
  // Parvat — Supabase Postgres (project: naojfvqtiurghlsicrvt)
  // DIRECT: port 5432, used by drizzle-kit (migrations/introspection) only.
  // POOLER: port 6543 PgBouncer transaction mode, used by the runtime server.
  PARVAT_SUPABASE_DIRECT_CONNECTION_STRING: EnvStringSchema.optional().default(""),
  PARVAT_HOST: EnvStringSchema,
  PARVAT_POOLER_HOST: EnvStringSchema,
  PARVAT_PORT: z.coerce.number(),
  PARVAT_POOLER_PORT: z.coerce.number(),
  PARVAT_USER: EnvStringSchema,
  PARVAT_PASSWORD: EnvStringSchema,
  PARVAT_DATABASE: EnvStringSchema,
});
