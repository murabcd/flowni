import { FlowniRole } from "@repo/backend/auth";
import {
  currentMembers,
  currentOrganizationId,
  currentUser,
} from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { eq } from "drizzle-orm";
import { toMemberInfo, toMemberInfoList } from "@/lib/serialization";
import { Team } from "./team";

export const TeamMenu = async () => {
  const [user, organizationId, members] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
    currentMembers(),
  ]);
  const membersLite = toMemberInfoList(members);

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

  const safeUser = toMemberInfo({
    ...user,
    name: user.name ?? "",
    email: user.email ?? "",
    image: user.image ?? undefined,
    organizationRole: user.organizationRole ?? FlowniRole.Member,
  });

  return (
    <div className="px-2">
      <Team
        members={membersLite}
        organizationId={organization.id}
        user={safeUser}
      />
    </div>
  );
};
