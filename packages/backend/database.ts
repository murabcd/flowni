import "server-only";
import { sql } from "drizzle-orm";
import { db } from "./drizzle/db";
import { schema } from "./drizzle/schema";

export const database = db;
export const tables = schema;

/* Workaround for https://github.com/prisma/prisma/issues/11842 */
export const getJsonColumnFromTable = async (
  tableName: string,
  column: string,
  id: string
) => {
  const result = await db.execute(
    sql`select ${sql.raw(column)} from ${sql.raw(
      tableName
    )} where id = ${id} limit 1`
  );

  const row = result[0] as Record<string, unknown> | undefined;
  const value = row?.[column];

  return (value ?? null) as object | null;
};
