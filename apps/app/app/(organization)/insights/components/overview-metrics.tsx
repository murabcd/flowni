import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { Link } from "@repo/design-system/components/link";
import { StackCard } from "@repo/design-system/components/stack-card";
import { and, count, eq, gt } from "drizzle-orm";

export const OverviewMetrics = async () => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId)) {
    return <div />;
  }

  const nowIso = new Date().toISOString();
  const [features, feedbackCounts, releaseCounts] = await Promise.all([
    database
      .select({
        id: tables.feature.id,
        ownerId: tables.feature.ownerId,
        statusId: tables.feature.statusId,
        complete: tables.featureStatus.complete,
      })
      .from(tables.feature)
      .innerJoin(
        tables.featureStatus,
        eq(tables.feature.statusId, tables.featureStatus.id)
      )
      .where(eq(tables.feature.organizationId, organizationId)),
    database
      .select({ count: count() })
      .from(tables.feedback)
      .where(
        and(
          eq(tables.feedback.organizationId, organizationId),
          eq(tables.feedback.processed, false)
        )
      ),
    database
      .select({ count: count() })
      .from(tables.release)
      .where(
        and(
          eq(tables.release.organizationId, organizationId),
          gt(tables.release.endAt, nowIso)
        )
      ),
  ]);

  const closedStatuses = new Set<string>();
  const openStatuses = new Set<string>();

  for (const feature of features) {
    if (feature.complete) {
      closedStatuses.add(feature.statusId);
    } else {
      openStatuses.add(feature.statusId);
    }
  }

  const openFeatures = features.filter((feature) =>
    openStatuses.has(feature.statusId)
  );
  const yourFeatures = features.filter(
    (feature) => feature.ownerId === user.id
  );

  const openFeaturesSearchParams = new URLSearchParams();
  openFeaturesSearchParams.set("id", "status");
  openFeaturesSearchParams.set(
    "value",
    `[${Array.from(openStatuses)
      .map((status) => `"${status}"`)
      .join(",")}]`
  );

  const closedFeaturesSearchParams = new URLSearchParams();
  closedFeaturesSearchParams.set("id", "status");
  closedFeaturesSearchParams.set(
    "value",
    `[${Array.from(closedStatuses)
      .map((status) => `"${status}"`)
      .join(",")}]`
  );

  const yourFeaturesSearchParams = new URLSearchParams();
  yourFeaturesSearchParams.set("id", "owner");
  yourFeaturesSearchParams.set("value", `["${user.id}"]`);

  const cards = [
    {
      title: "Open Features",
      count: openFeatures.length,
      href: `/features?${openFeaturesSearchParams.toString()}`,
    },
    {
      title: "New Feedback",
      count: feedbackCounts[0]?.count ?? 0,
      href: "/feedback",
    },
    {
      title: "Upcoming Releases",
      count: releaseCounts[0]?.count ?? 0,
      href: "/releases",
    },
    {
      title: "Your Features",
      count: yourFeatures.length,
      href: `/features?${yourFeaturesSearchParams.toString()}`,
    },
  ];

  return (
    <StackCard className="grid divide-y p-0 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
      {cards.map((card) => (
        <Link
          className="flex flex-col items-center gap-1 p-4 transition-colors hover:bg-card"
          href={card.href}
          key={card.title}
        >
          <p className="m-0 text-center font-semibold text-lg">{card.count}</p>
          <p className="m-0 text-center text-muted-foreground text-sm">
            {card.title}
          </p>
        </Link>
      ))}
    </StackCard>
  );
};
