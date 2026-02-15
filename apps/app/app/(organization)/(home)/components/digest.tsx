import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { StackCard } from "@repo/design-system/components/stack-card";
import { formatDate } from "@repo/lib/format";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { SparklesIcon } from "lucide-react";
import { MemoizedReactMarkdown } from "@/components/markdown";

const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
const lastDayIso = lastDay.toISOString();

export const Digest = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return null;
  }

  const [feedbackCount, featureCount, aiDigest] = await Promise.all([
    database
      .select({ value: count() })
      .from(tables.feedback)
      .where(
        and(
          eq(tables.feedback.organizationId, organizationId),
          gte(tables.feedback.createdAt, lastDayIso)
        )
      )
      .then((rows) => rows[0]?.value ?? 0),
    database
      .select({ value: count() })
      .from(tables.feature)
      .where(
        and(
          eq(tables.feature.organizationId, organizationId),
          gte(tables.feature.createdAt, lastDayIso)
        )
      )
      .then((rows) => rows[0]?.value ?? 0),
    database
      .select({ summary: tables.digest.summary })
      .from(tables.digest)
      .where(eq(tables.digest.organizationId, organizationId))
      .orderBy(desc(tables.digest.createdAt))
      .limit(1)
      .then((rows) => rows[0]?.summary ?? null),
  ]);
  const basicDigest = [
    "Welcome back! In the last 24 hours, you received",
    `${feedbackCount} feedback items, and`,
    `${featureCount} features were created.`,
  ].join(" ");

  if (aiDigest) {
    return (
      <StackCard
        title={
          <span className="text-primary">
            <SparklesIcon className="inline-block align-text-top" size={16} />{" "}
            AI Digest for {formatDate(lastDay)}
          </span>
        }
      >
        <MemoizedReactMarkdown>{aiDigest}</MemoizedReactMarkdown>
      </StackCard>
    );
  }

  return (
    <StackCard title={`Digest for ${formatDate(lastDay)}`}>
      <p className="text-muted-foreground">{basicDigest}</p>
    </StackCard>
  );
};
