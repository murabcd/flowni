import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { eq } from "drizzle-orm";

export const InitiativesTrend = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <p className="text-muted-foreground text-sm">No initiatives yet.</p>;
  }

  const initiatives = await database
    .select({ ownerId: tables.initiative.ownerId })
    .from(tables.initiative)
    .where(eq(tables.initiative.organizationId, organizationId));

  // Determine the status with the highest count
  const statusCount: {
    ownerId: string;
    count: number;
  }[] = [];

  for (const initiative of initiatives) {
    const existingStatus = statusCount.find(
      ({ ownerId }) => ownerId === initiative.ownerId
    );

    if (existingStatus) {
      existingStatus.count += 1;
    } else {
      statusCount.push({
        ownerId: initiative.ownerId,
        count: 1,
      });
    }
  }

  if (statusCount.length === 0) {
    return <p className="text-muted-foreground text-sm">No initiatives yet.</p>;
  }

  const highestCountInitiative = statusCount.reduce((prev, current) =>
    prev.count > current.count ? prev : current
  );

  const highestCountOwner = await database
    .select({ name: tables.user.name })
    .from(tables.user)
    .where(eq(tables.user.id, highestCountInitiative.ownerId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  return (
    <p className="text-muted-foreground text-sm">
      Most of your initiatives are owned by{" "}
      {highestCountOwner?.name ?? "Unknown"}.
    </p>
  );
};
