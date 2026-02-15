import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const postgresUrl = process.env.POSTGRES_URL_NON_POOLING;

if (!postgresUrl) {
  throw new Error("POSTGRES_URL_NON_POOLING is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: postgresUrl,
  },
  verbose: true,
  strict: true,
});
