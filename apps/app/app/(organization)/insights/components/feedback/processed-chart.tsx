import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import {
  PieChart,
  type PieChartProperties,
} from "@repo/design-system/components/charts/pie";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { count, eq } from "drizzle-orm";
import { EyeIcon } from "lucide-react";

export const ProcessedChart = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const feedback = await database
    .select({
      processed: tables.feedback.processed,
      count: count(),
    })
    .from(tables.feedback)
    .where(eq(tables.feedback.organizationId, organizationId))
    .groupBy(tables.feedback.processed);

  const data: {
    status: string;
    count: number;
    fill: string;
  }[] = [
    {
      status: "Processed",
      count: 0,
      fill: colors.emerald,
    },
    {
      status: "Unprocessed",
      count: 0,
      fill: colors.gray,
    },
  ];

  const config: PieChartProperties["config"] = {};

  for (const item of feedback) {
    if (item.processed) {
      data[0].count += Number(item.count);
    } else {
      data[1].count += Number(item.count);
    }
  }

  return (
    <StackCard icon={EyeIcon} title="Processed Feedback">
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
