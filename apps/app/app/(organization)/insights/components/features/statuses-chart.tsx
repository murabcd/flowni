import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import type { PieChartProperties } from "@repo/design-system/components/charts/pie";
import { PieChart } from "@repo/design-system/components/charts/pie";
import { StackCard } from "@repo/design-system/components/stack-card";
import { slugify } from "@repo/lib/slugify";
import { count, eq } from "drizzle-orm";
import { ListIcon } from "lucide-react";

export const StatusesChart = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const features = await database
    .select({
      statusColor: tables.featureStatus.color,
      statusName: tables.featureStatus.name,
      count: count(),
    })
    .from(tables.feature)
    .innerJoin(
      tables.featureStatus,
      eq(tables.feature.statusId, tables.featureStatus.id)
    )
    .where(eq(tables.feature.organizationId, organizationId))
    .groupBy(tables.featureStatus.name, tables.featureStatus.color);

  const data: {
    status: string;
    count: number;
    fill: string;
  }[] = [];

  const config: PieChartProperties["config"] = {};

  for (const feature of features) {
    const slug = slugify(feature.statusName);

    config[slug] = {
      label: feature.statusName,
      color: feature.statusColor,
    };

    data.push({
      status: feature.statusName,
      count: Number(feature.count),
      fill: feature.statusColor,
    });
  }

  return (
    <StackCard icon={ListIcon} title="Feature Statuses">
      <PieChart
        className="mx-auto h-80"
        config={config}
        data={data}
        dataKey="count"
        nameKey="status"
      />
    </StackCard>
  );
};
