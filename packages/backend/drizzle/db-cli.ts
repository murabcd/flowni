import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { keys } from "../keys";
import { schema } from "./schema";

const env = keys();

const pool = new Pool({
  connectionString: env.POSTGRES_URL_NON_POOLING,
  max: 1,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 2000,
});

export const dbCli = drizzle(pool, { schema });
