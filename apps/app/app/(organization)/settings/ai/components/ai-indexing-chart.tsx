import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import {
  RadialChart,
  type RadialChartProperties,
} from "@repo/design-system/components/charts/radial";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { DatabaseIcon } from "lucide-react";

export const AiIndexingChart = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [
    totalFeedbacks,
    totalFeatures,
    aiSummaryCount,
    aiSentimentCount,
    aiRiceFeatureCount,
  ] = await Promise.all([
    database
      .select({ value: count() })
      .from(tables.feedback)
      .where(eq(tables.feedback.organizationId, organizationId))
      .then((rows) => rows[0]?.value ?? 0),
    database
      .select({ value: count() })
      .from(tables.feature)
      .where(eq(tables.feature.organizationId, organizationId))
      .then((rows) => rows[0]?.value ?? 0),
    database
      .select({ value: count() })
      .from(tables.feedbackAnalysis)
      .where(eq(tables.feedbackAnalysis.organizationId, organizationId))
      .then((rows) => rows[0]?.value ?? 0),
    database
      .select({ value: count() })
      .from(tables.feedback)
      .where(
        and(
          eq(tables.feedback.organizationId, organizationId),
          isNotNull(tables.feedback.aiSentiment)
        )
      )
      .then((rows) => rows[0]?.value ?? 0),
    database
      .select({ value: count() })
      .from(tables.aiFeatureRice)
      .where(eq(tables.aiFeatureRice.organizationId, organizationId))
      .then((rows) => rows[0]?.value ?? 0),
  ]);

  const aiSummaryPercentage = totalFeedbacks
    ? (aiSummaryCount / totalFeedbacks) * 100
    : 0;
  const aiSentimentPercentage = totalFeedbacks
    ? (aiSentimentCount / totalFeedbacks) * 100
    : 0;
  const aiRiceFeaturePercentage = totalFeatures
    ? (aiRiceFeatureCount / totalFeatures) * 100
    : 0;

  const config: RadialChartProperties["config"] = {
    value: {
      label: "Indexed",
    },
    summarize: {
      label: "AI Feedback Summarization",
      color: colors.amber,
    },
    sentiment: {
      label: "AI Sentiment Analysis",
      color: colors.emerald,
    },
    rice: {
      label: "AI RICE Score Estimation",
      color: colors.indigo,
    },
  };

  const data: RadialChartProperties["data"] = [
    {
      type: "summarize",
      value: aiSummaryPercentage,
      fill: "var(--color-summarize)",
    },
    {
      type: "sentiment",
      value: aiSentimentPercentage,
      fill: "var(--color-sentiment)",
    },
    { type: "rice", value: aiRiceFeaturePercentage, fill: "var(--color-rice)" },
  ];

  return (
    <StackCard icon={DatabaseIcon} title="AI Indexing">
      <RadialChart
        className="mx-auto h-80"
        config={config}
        data={data}
        dataKey="value"
        nameKey="type"
      />
    </StackCard>
  );
};
