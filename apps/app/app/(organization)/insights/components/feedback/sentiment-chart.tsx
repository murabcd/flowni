import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import {
  RadarChart,
  type RadarChartProperties,
} from "@repo/design-system/components/charts/radar";
import { StackCard } from "@repo/design-system/components/stack-card";
import { colors } from "@repo/design-system/lib/colors";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { SmileIcon } from "lucide-react";

export const SentimentChart = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const feedback = await database
    .select({
      aiSentiment: tables.feedback.aiSentiment,
      count: count(),
    })
    .from(tables.feedback)
    .where(
      and(
        eq(tables.feedback.organizationId, organizationId),
        isNotNull(tables.feedback.aiSentiment)
      )
    )
    .groupBy(tables.feedback.aiSentiment);

  const sentimentCounts = new Map(
    feedback.map((item) => [item.aiSentiment, Number(item.count)])
  );
  const positive = sentimentCounts.get("POSITIVE") ?? 0;
  const neutral = sentimentCounts.get("NEUTRAL") ?? 0;
  const negative = sentimentCounts.get("NEGATIVE") ?? 0;
  const angry = sentimentCounts.get("ANGRY") ?? 0;
  const confused = sentimentCounts.get("CONFUSED") ?? 0;
  const informative = sentimentCounts.get("INFORMATIVE") ?? 0;

  const data: RadarChartProperties["data"] = [
    {
      sentiment: "Positive",
      value: positive,
    },
    {
      sentiment: "Neutral",
      value: neutral,
    },
    {
      sentiment: "Negative",
      value: negative,
    },
    {
      sentiment: "Angry",
      value: angry,
    },
    {
      sentiment: "Confused",
      value: confused,
    },
    {
      sentiment: "Informative",
      value: informative,
    },
  ];

  const config: RadarChartProperties["config"] = {
    value: {
      label: "Feedback",
      color: colors.violet,
    },
  };

  return (
    <StackCard icon={SmileIcon} title="Sentiment">
      <RadarChart
        axisKey="sentiment"
        className="mx-auto h-full max-h-[20rem] w-full"
        config={config}
        data={data}
        dataKey="value"
      />
    </StackCard>
  );
};
