import { defineConfig } from "drizzle-kit";
import { environment } from "./lib/util/env";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: environment.PARVAT_SUPABASE_DIRECT_CONNECTION_STRING,
    host: environment.PARVAT_HOST,
    port: environment.PARVAT_PORT,
    user: environment.PARVAT_USER,
    password: environment.PARVAT_PASSWORD,
    database: environment.PARVAT_DATABASE,
    ssl: true,
  },
});
