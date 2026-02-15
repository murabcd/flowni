import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { keys } from "../keys";
import { schema } from "./schema";

const env = keys();

const client = postgres(env.POSTGRES_PRISMA_URL, {
  prepare: false,
  max: 2,
});

export const db = drizzle(client, { schema });
