import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import {
  AreaChart,
  type AreaChartProperties,
} from "@repo/design-system/components/charts/area";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { ChartAreaIcon } from "lucide-react";

export const IncomingChart = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const startIso = startMonth.toISOString();

  const feedback = await database
    .select({
      month: sql<string>`date_trunc('month', ${tables.feedback.createdAt})`,
      count: count(),
    })
    .from(tables.feedback)
    .where(
      and(
        eq(tables.feedback.organizationId, organizationId),
        gte(tables.feedback.createdAt, startIso)
      )
    )
    .groupBy(sql`date_trunc('month', ${tables.feedback.createdAt})`)
    .orderBy(sql`date_trunc('month', ${tables.feedback.createdAt})`);

  const config: AreaChartProperties["config"] = {
    feedback: {
      label: "Feedback",
      color: colors.violet,
    },
  };

  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return d.toLocaleString("default", { month: "long", year: "numeric" });
  }).reverse();

  const formatMonth = (value: string) =>
    new Date(value).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  const countsByMonth = new Map(
    feedback.map((item) => [formatMonth(item.month), Number(item.count)])
  );
  const data = last12Months.map((month) => ({
    month,
    count: countsByMonth.get(month) ?? 0,
  }));

  return (
    <StackCard className="p-0" icon={ChartAreaIcon} title="Incoming Feedback">
      <AreaChart
        axisKey="month"
        className="h-[20rem]"
        config={config}
        data={data}
        dataKey="count"
      />
    </StackCard>
  );
};
