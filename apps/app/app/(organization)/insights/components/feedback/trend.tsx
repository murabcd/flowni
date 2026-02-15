import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { and, count, eq, isNotNull } from "drizzle-orm";

export const FeedbackTrend = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <p className="text-muted-foreground text-sm">No data.</p>;
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
  const negative = sentimentCounts.get("NEGATIVE") ?? 0;
  const angry = sentimentCounts.get("ANGRY") ?? 0;

  let trend = "mostly neutral";

  if (positive > negative + angry) {
    trend = "up";
  } else if (positive < negative + angry) {
    trend = "down";
  }

  return (
    <p className="text-muted-foreground text-sm">
      Overall, your feedback is trending {trend}.
    </p>
  );
};
