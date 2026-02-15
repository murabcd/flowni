import { FlowniRole, type User } from "@repo/backend/auth";
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { eq } from "drizzle-orm";
import { Team } from "./team";

export const TeamMenu = async () => {
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);

  if (!(user && organizationId)) {
    return null;
  }

  const organization = await database
    .select({ id: tables.organization.id })
    .from(tables.organization)
    .where(eq(tables.organization.id, organizationId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!organization) {
    return null;
  }

  if (user.organizationRole === FlowniRole.Member) {
    return null;
  }

  const resolveDate = (value: unknown) => {
    if (value instanceof Date) {
      return value;
    }
    if (value) {
      return new Date(value as string);
    }
    return new Date();
  };

  const safeUser: User = {
    ...user,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? undefined,
    organizationId: user.organizationId ?? undefined,
    organizationRole: user.organizationRole ?? FlowniRole.Member,
    emailVerified: Boolean(user.emailVerified),
    createdAt: resolveDate(user.createdAt),
    updatedAt: resolveDate(user.updatedAt),
  };

  return (
    <div className="px-2">
      <Team
        members={members}
        organizationId={organization.id}
        user={safeUser}
      />
    </div>
  );
};
