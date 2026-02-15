import { eq } from "drizzle-orm";
import { cache } from "react";
import { database, tables } from "../database";
import type { User } from "./index";
import { currentUser as currentUserFromSession } from "./server";

const cachedCurrentUser = cache(async () => currentUserFromSession());
export const currentUser = async () => cachedCurrentUser();

const cachedCurrentOrganizationId = cache(async () => {
  const user = await cachedCurrentUser();

  if (!user?.organizationId) {
    return null;
  }

  return user.organizationId;
});

export const currentOrganizationId = async () => cachedCurrentOrganizationId();

const mapUserRow = (row: typeof tables.user.$inferSelect): User => ({
  id: row.id,
  name: row.name ?? "",
  email: row.email ?? "",
  emailVerified: row.emailVerified,
  image: row.image,
  organizationId: row.organizationId,
  organizationRole: row.organizationRole,
  createdAt: row.createdAt ?? undefined,
  updatedAt: row.updatedAt ?? undefined,
});

export const getMembers = async (organizationId: string) => {
  if (!organizationId) {
    return [];
  }

  const members = await database
    .select()
    .from(tables.user)
    .where(eq(tables.user.organizationId, organizationId));

  return members.map(mapUserRow);
};

const cachedGetMembers = cache(async (organizationId: string) =>
  getMembers(organizationId)
);

export const currentMembers = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return [];
  }

  return cachedGetMembers(organizationId);
};
