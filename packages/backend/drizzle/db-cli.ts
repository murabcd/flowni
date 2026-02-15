import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { keys } from "../keys";
import { schema } from "./schema";

const env = keys();

const client = postgres(env.POSTGRES_URL_NON_POOLING, {
  prepare: false,
});

export const dbCli = drizzle(client, { schema });
