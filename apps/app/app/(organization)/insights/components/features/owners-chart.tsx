import { getUserName } from "@repo/backend/auth/format";
import {
  currentMembers,
  currentOrganizationId,
} from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import type { BarChartProperties } from "@repo/design-system/components/charts/bar";
import { BarChart } from "@repo/design-system/components/charts/bar";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { slugify } from "@repo/lib/slugify";
import { count, eq } from "drizzle-orm";
import { UserCircleIcon } from "lucide-react";

export const OwnersChart = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [features, members] = await Promise.all([
    database
      .select({
        ownerId: tables.feature.ownerId,
        count: count(),
      })
      .from(tables.feature)
      .where(eq(tables.feature.organizationId, organizationId))
      .groupBy(tables.feature.ownerId),
    currentMembers(),
  ]);

  const data: {
    id: string;
    name: string;
    count: number;
  }[] = [];

  for (const feature of features) {
    if (!feature.ownerId) {
      continue;
    }

    const owner = members.find(({ id }) => id === feature.ownerId);
    const name = owner ? getUserName(owner) : "Unknown";
    const slug = slugify(name ?? "Unknown");
    const existing = data.find((item) => item.id === slug);

    if (existing) {
      existing.count += Number(feature.count);
    } else {
      data.push({
        id: slug,
        name,
        count: Number(feature.count),
      });
    }
  }

  const config: BarChartProperties["config"] = {};

  for (const [_index, item] of data.entries()) {
    config[item.id] = {
      label: item.name,
      color: colors.violet,
    };
  }

  return (
    <StackCard className="p-8" icon={UserCircleIcon} title="Feature Owners">
      <BarChart
        className="mx-auto h-80"
        color={colors.violet}
        config={config}
        data={data}
        xAxisKey="count"
        yAxisKey="name"
      />
    </StackCard>
  );
};
