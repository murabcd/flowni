import {
  currentMembers,
  currentOrganizationId,
} from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { Emoji } from "@repo/design-system/components/emoji";
import { StackCard } from "@repo/design-system/components/stack-card";
import { desc, eq } from "drizzle-orm";
import { CompassIcon } from "lucide-react";
import { InitiativePageCard } from "./initiative-page-card";

export const NewInitiatives = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [initiatives, members] = await Promise.all([
    database
      .select({
        id: tables.initiative.id,
        title: tables.initiative.title,
        createdAt: tables.initiative.createdAt,
        ownerId: tables.initiative.ownerId,
        emoji: tables.initiative.emoji,
      })
      .from(tables.initiative)
      .where(eq(tables.initiative.organizationId, organizationId))
      .orderBy(desc(tables.initiative.createdAt))
      .limit(10),
    currentMembers(),
  ]);

  const getOwner = (userId: string) =>
    members.find((member) => member.id === userId);

  return (
    <StackCard className="p-0" icon={CompassIcon} title="New Initiatives">
      <div className="flex flex-col gap-px p-1">
        {initiatives.map((initiative) => (
          <InitiativePageCard
            date={new Date(initiative.createdAt)}
            icon={() => (
              <div className="flex h-4 w-4 items-center justify-center">
                <Emoji id={initiative.emoji} size="0.825rem" />
              </div>
            )}
            id={initiative.id}
            key={initiative.id}
            owner={getOwner(initiative.ownerId)}
            title={initiative.title}
          />
        ))}
      </div>
    </StackCard>
  );
};
