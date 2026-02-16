import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { keys } from "../keys";
import { schema } from "./schema";

const env = keys();

const pool = new Pool({
  connectionString: env.POSTGRES_PRISMA_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
});

export const db = drizzle(pool, { schema });
