import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { StackCard } from "@repo/design-system/components/stack-card";
import { and, eq } from "drizzle-orm";
import { CheckCircleIcon } from "lucide-react";
import Link from "next/link";

export const AssignedFeatures = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    return <div />;
  }

  const features = await database
    .select({
      id: tables.feature.id,
      title: tables.feature.title,
      createdAt: tables.feature.createdAt,
      ownerId: tables.feature.ownerId,
      statusName: tables.featureStatus.name,
      statusColor: tables.featureStatus.color,
      statusComplete: tables.featureStatus.complete,
    })
    .from(tables.feature)
    .innerJoin(
      tables.featureStatus,
      eq(tables.feature.statusId, tables.featureStatus.id)
    )
    .where(
      and(
        eq(tables.feature.ownerId, user.id),
        eq(tables.feature.organizationId, organizationId)
      )
    );

  return (
    <StackCard className="p-0" icon={CheckCircleIcon} title="Assigned to you">
      <div className="flex flex-col gap-px p-1.5">
        {features.slice(0, 10).map((feature) => (
          <Link
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-card"
            href={`/features/${feature.id}`}
            key={feature.id}
          >
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: feature.statusColor }}
            />
            <p className="flex-1 truncate font-medium">{feature.title}</p>
            <p className="shrink-0 text-muted-foreground">
              {feature.statusComplete ? "Complete" : "In Progress"}
            </p>
          </Link>
        ))}
      </div>
      {features.length > 10 && (
        <div className="border-t p-3">
          <p className="text-center text-muted-foreground text-sm">
            +{features.length - 10} more
          </p>
        </div>
      )}
    </StackCard>
  );
};
