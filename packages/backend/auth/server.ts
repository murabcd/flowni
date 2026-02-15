import "server-only";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { database, tables } from "../database";
import { auth } from "./auth";

export const getSession = async () =>
  auth.api.getSession({
    headers: await headers(),
  });

export const currentUser = async () => {
  const session = await getSession();
  const user = session?.user ?? null;

  if (!user) {
    return null;
  }

  if (user.organizationId && user.organizationRole) {
    return user;
  }

  const dbUser = await database
    .select()
    .from(tables.user)
    .where(eq(tables.user.id, user.id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  return dbUser ?? user;
};
