import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { count, eq } from "drizzle-orm";

export const FeaturesTrend = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <p className="text-muted-foreground text-sm">No feature data.</p>;
  }

  const features = await database
    .select({
      statusName: tables.featureStatus.name,
      count: count(),
    })
    .from(tables.feature)
    .innerJoin(
      tables.featureStatus,
      eq(tables.feature.statusId, tables.featureStatus.id)
    )
    .where(eq(tables.feature.organizationId, organizationId))
    .groupBy(tables.featureStatus.name);

  if (features.length === 0) {
    return <p className="text-muted-foreground text-sm">No feature data.</p>;
  }

  const highestCountFeature = features.reduce((prev, current) =>
    Number(prev.count) > Number(current.count) ? prev : current
  );

  return (
    <p className="text-muted-foreground text-sm">
      Most of your features are {highestCountFeature.statusName}.
    </p>
  );
};
