import {
  currentMembers,
  currentOrganizationId,
} from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import type { GanttFeature } from "@repo/design-system/components/kibo-ui/gantt";
import { StackCard } from "@repo/design-system/components/stack-card";
import { endOfQuarter, startOfQuarter } from "date-fns";
import { and, eq, gte, lte, or } from "drizzle-orm";
import { toMemberInfoList } from "@/lib/serialization";
import { QuarterlyRoadmapGantt } from "./gantt";

export const QuarterlyRoadmap = async () => {
  const today = new Date();
  const quarterStart = startOfQuarter(today);
  const quarterEnd = endOfQuarter(today);
  const quarterStartIso = quarterStart.toISOString();
  const quarterEndIso = quarterEnd.toISOString();
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [members, features] = await Promise.all([
    currentMembers(),
    database
      .select({
        id: tables.feature.id,
        title: tables.feature.title,
        startAt: tables.feature.startAt,
        endAt: tables.feature.endAt,
        ownerId: tables.feature.ownerId,
        productName: tables.product.name,
        statusId: tables.featureStatus.id,
        statusColor: tables.featureStatus.color,
        statusName: tables.featureStatus.name,
      })
      .from(tables.feature)
      .leftJoin(tables.product, eq(tables.feature.productId, tables.product.id))
      .innerJoin(
        tables.featureStatus,
        eq(tables.feature.statusId, tables.featureStatus.id)
      )
      .where(
        and(
          eq(tables.feature.organizationId, organizationId),
          or(
            and(
              gte(tables.feature.startAt, quarterStartIso),
              lte(tables.feature.startAt, quarterEndIso)
            ),
            and(
              gte(tables.feature.endAt, quarterStartIso),
              lte(tables.feature.endAt, quarterEndIso)
            ),
            and(
              lte(tables.feature.startAt, quarterStartIso),
              gte(tables.feature.endAt, quarterEndIso)
            )
          )
        )
      ),
  ]);
  const membersLite = toMemberInfoList(members);

  const createGroupedFeatures = () => {
    const groupedData: Record<string, (GanttFeature & { ownerId: string })[]> =
      {};

    for (const feature of features) {
      const groupKey = feature.productName ?? "No Product";

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      groupedData[groupKey].push({
        id: feature.id,
        name: feature.title,
        startAt: feature.startAt ? new Date(feature.startAt) : quarterStart,
        endAt: feature.endAt ? new Date(feature.endAt) : quarterEnd,
        status: {
          color: feature.statusColor,
          name: feature.statusName,
          id: feature.statusId,
        },
        ownerId: feature.ownerId,
      });
    }

    // Sort groups alphabetically
    return Object.fromEntries(
      [...Object.entries(groupedData)].sort(([nameA], [nameB]) =>
        nameA.localeCompare(nameB)
      )
    );
  };

  const groups = createGroupedFeatures();

  return (
    <StackCard className="p-0" title="Quarterly Roadmap">
      <QuarterlyRoadmapGantt groups={groups} members={membersLite} />
    </StackCard>
  );
};
