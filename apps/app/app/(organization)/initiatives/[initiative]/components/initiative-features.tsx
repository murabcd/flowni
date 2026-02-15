import type { User } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import {
  currentMembers,
  currentOrganizationId,
} from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import type {
  Feature,
  FeatureConnection,
  FeatureStatus,
} from "@repo/backend/types";
import { Link } from "@repo/design-system/components/link";
import { StackCard } from "@repo/design-system/components/stack-card";
import { formatDate } from "@repo/lib/format";
import { and, eq, inArray } from "drizzle-orm";
import { TablePropertiesIcon } from "lucide-react";
import Image from "next/image";
import { AvatarTooltip } from "@/components/avatar-tooltip";
import { InitiativeTimeline } from "./initiative-timeline";

type InitiativeFeaturesProps = {
  readonly initiativeId: string;
};

const InitiativeFeature = ({
  feature,
  owner,
}: {
  feature: Pick<Feature, "id" | "title" | "ownerId" | "startAt" | "endAt"> & {
    status: Pick<FeatureStatus, "color">;
    connection: Pick<FeatureConnection, "type"> | null;
  };
  readonly owner: User | undefined;
}) => {
  const featureConnectionSource = feature.connection ? "/jira.svg" : null;
  const hasConnectionSource = featureConnectionSource !== null;
  let dateLabel: string | null = null;
  const startDate = feature.startAt ? new Date(feature.startAt) : null;
  const endDate = feature.endAt ? new Date(feature.endAt) : null;

  if (startDate && endDate) {
    dateLabel = `${formatDate(startDate)} - ${formatDate(endDate)}`;
  } else if (startDate) {
    dateLabel = `Started ${formatDate(startDate)}`;
  } else if (endDate) {
    dateLabel = `Due ${formatDate(endDate)}`;
  }

  return (
    <Link
      className="flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-card"
      href={`/features/${feature.id}`}
      key={feature.id}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: feature.status.color }}
      />
      <span className="flex-1 truncate font-medium text-sm">
        {feature.title}
      </span>
      <span className="text-muted-foreground text-sm">{dateLabel}</span>
      {hasConnectionSource ? (
        <Image
          alt="Feature connection source"
          height={16}
          src={featureConnectionSource}
          width={16}
        />
      ) : null}
      {owner ? (
        <AvatarTooltip
          fallback={owner.email?.slice(0, 2).toUpperCase() ?? "??"}
          src={owner.image ?? undefined}
          subtitle={owner.email ?? ""}
          title={getUserName(owner)}
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-card" />
      )}
    </Link>
  );
};

export const InitiativeFeatures = async ({
  initiativeId,
}: InitiativeFeaturesProps) => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [
    initiativeRows,
    members,
    directFeatureLinks,
    groupLinks,
    productLinks,
  ] = await Promise.all([
    database
      .select({ title: tables.initiative.title })
      .from(tables.initiative)
      .where(
        and(
          eq(tables.initiative.id, initiativeId),
          eq(tables.initiative.organizationId, organizationId)
        )
      )
      .limit(1),
    currentMembers(),
    database
      .select({ featureId: tables.featureToInitiative.a })
      .from(tables.featureToInitiative)
      .where(eq(tables.featureToInitiative.b, initiativeId)),
    database
      .select({ groupId: tables.groupToInitiative.a })
      .from(tables.groupToInitiative)
      .where(eq(tables.groupToInitiative.b, initiativeId)),
    database
      .select({ productId: tables.initiativeToProduct.b })
      .from(tables.initiativeToProduct)
      .where(eq(tables.initiativeToProduct.a, initiativeId)),
  ]);

  const initiative = initiativeRows[0];

  if (!initiative) {
    return <div />;
  }

  const groupIds = groupLinks.map((row) => row.groupId);
  const productIds = productLinks.map((row) => row.productId);

  const [groupFeatureIds, productFeatureIds] = await Promise.all([
    groupIds.length === 0
      ? []
      : await database
          .select({ id: tables.feature.id })
          .from(tables.feature)
          .where(inArray(tables.feature.groupId, groupIds)),
    productIds.length === 0
      ? []
      : await database
          .select({ id: tables.feature.id })
          .from(tables.feature)
          .where(inArray(tables.feature.productId, productIds)),
  ]);

  const featureIds = new Set<string>([
    ...directFeatureLinks.map((row) => row.featureId),
    ...groupFeatureIds.map((row) => row.id),
    ...productFeatureIds.map((row) => row.id),
  ]);

  const featureRows =
    featureIds.size === 0
      ? []
      : await database
          .select({
            id: tables.feature.id,
            title: tables.feature.title,
            startAt: tables.feature.startAt,
            endAt: tables.feature.endAt,
            ownerId: tables.feature.ownerId,
            statusColor: tables.featureStatus.color,
            connectionType: tables.featureConnection.type,
          })
          .from(tables.feature)
          .innerJoin(
            tables.featureStatus,
            eq(tables.feature.statusId, tables.featureStatus.id)
          )
          .leftJoin(
            tables.featureConnection,
            eq(tables.featureConnection.featureId, tables.feature.id)
          )
          .where(
            and(
              eq(tables.feature.organizationId, organizationId),
              inArray(tables.feature.id, Array.from(featureIds))
            )
          );

  const uniqueFeatures = featureRows.map((feature) => ({
    id: feature.id,
    title: feature.title,
    startAt: feature.startAt,
    endAt: feature.endAt,
    ownerId: feature.ownerId,
    status: { color: feature.statusColor },
    connection: feature.connectionType
      ? { type: feature.connectionType }
      : null,
  }));

  const roadmapFeatures = uniqueFeatures
    .filter((feature) => feature.startAt && feature.endAt)
    .map((feature) => ({
      ...feature,
      startAt: new Date(feature.startAt as string),
      endAt: new Date(feature.endAt as string),
      status: { color: feature.status.color },
      connection: feature.connection,
    }));

  return (
    <>
      {uniqueFeatures.length > 0 && (
        <StackCard
          className="max-h-[20rem] w-full overflow-y-auto p-2"
          icon={TablePropertiesIcon}
          title="Features"
        >
          {uniqueFeatures.map((feature) => (
            <InitiativeFeature
              feature={feature}
              key={feature.id}
              owner={members.find((member) => member.id === feature.ownerId)}
            />
          ))}
        </StackCard>
      )}
      {roadmapFeatures.length > 0 && (
        <InitiativeTimeline
          features={roadmapFeatures as never}
          members={members}
          title={initiative.title}
        />
      )}
    </>
  );
};
