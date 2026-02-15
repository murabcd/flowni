"use server";

import { currentOrganizationId } from "@repo/backend/auth/utils";
import { tables } from "@repo/backend/database";
import type {
  AiFeatureRice,
  Feature,
  FeatureConnection,
  FeatureRice,
  FeatureStatus,
  Group,
  Product,
} from "@repo/backend/types";
import { FEEDBACK_PAGE_SIZE } from "@repo/lib/consts";
import { and, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { database } from "@/lib/database";

export type GetFeaturesResponse = (Pick<
  Feature,
  "createdAt" | "id" | "title" | "ownerId"
> & {
  rice: Pick<FeatureRice, "confidence" | "effort" | "impact" | "reach"> | null;
  aiRice: Pick<
    AiFeatureRice,
    "confidence" | "effort" | "impact" | "reach"
  > | null;
  connection: Pick<FeatureConnection, "type" | "href"> | null;
  status: Pick<
    FeatureStatus,
    "color" | "complete" | "id" | "name" | "order"
  > | null;
  product: Pick<Product, "name"> | null;
  group: Pick<Group, "name" | "parentGroupId"> | null;
  _count: {
    feedback: number;
  };
  meta: {
    total: number;
  };
})[];

export type FeatureFilters = {
  search?: string;
  productId?: string;
  groupId?: string;
  statusId?: string;
};

export const getFeatures = async (
  page: number,
  filters?: FeatureFilters
): Promise<
  | {
      data: GetFeaturesResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const organizationId = await currentOrganizationId();

    if (!organizationId) {
      throw new Error("Organization not found");
    }

    const conditions = [eq(tables.feature.organizationId, organizationId)];

    if (filters?.search) {
      conditions.push(ilike(tables.feature.title, `%${filters.search}%`));
    }

    if (filters?.productId) {
      conditions.push(eq(tables.feature.productId, filters.productId));
    }

    if (filters?.groupId) {
      conditions.push(eq(tables.feature.groupId, filters.groupId));
    }

    if (filters?.statusId) {
      conditions.push(eq(tables.feature.statusId, filters.statusId));
    }

    const whereClause =
      conditions.length > 1 ? and(...conditions) : conditions[0];

    const [total, features] = await Promise.all([
      database
        .select({ count: count() })
        .from(tables.feature)
        .where(whereClause)
        .then((rows) => rows[0]?.count ?? 0),
      database
        .select({
          id: tables.feature.id,
          title: tables.feature.title,
          createdAt: tables.feature.createdAt,
          ownerId: tables.feature.ownerId,
          riceReach: tables.featureRice.reach,
          riceImpact: tables.featureRice.impact,
          riceConfidence: tables.featureRice.confidence,
          riceEffort: tables.featureRice.effort,
          aiRiceReach: tables.aiFeatureRice.reach,
          aiRiceImpact: tables.aiFeatureRice.impact,
          aiRiceConfidence: tables.aiFeatureRice.confidence,
          aiRiceEffort: tables.aiFeatureRice.effort,
          connectionHref: tables.featureConnection.href,
          connectionType: tables.featureConnection.type,
          statusId: tables.featureStatus.id,
          statusColor: tables.featureStatus.color,
          statusOrder: tables.featureStatus.order,
          statusComplete: tables.featureStatus.complete,
          statusName: tables.featureStatus.name,
          productName: tables.product.name,
          groupName: tables.group.name,
          groupParentId: tables.group.parentGroupId,
        })
        .from(tables.feature)
        .leftJoin(
          tables.featureRice,
          eq(tables.feature.riceId, tables.featureRice.id)
        )
        .leftJoin(
          tables.aiFeatureRice,
          eq(tables.feature.aiRiceId, tables.aiFeatureRice.id)
        )
        .leftJoin(
          tables.featureConnection,
          eq(tables.feature.connectionId, tables.featureConnection.id)
        )
        .leftJoin(
          tables.featureStatus,
          eq(tables.feature.statusId, tables.featureStatus.id)
        )
        .leftJoin(
          tables.product,
          eq(tables.feature.productId, tables.product.id)
        )
        .leftJoin(tables.group, eq(tables.feature.groupId, tables.group.id))
        .where(whereClause)
        .orderBy(desc(tables.feature.createdAt))
        .limit(FEEDBACK_PAGE_SIZE)
        .offset(page * FEEDBACK_PAGE_SIZE),
    ]);

    const featureIds = features.map((feature) => feature.id);
    const feedbackCounts = featureIds.length
      ? await database
          .select({
            featureId: tables.feedbackFeatureLink.featureId,
            count: count(),
          })
          .from(tables.feedbackFeatureLink)
          .where(inArray(tables.feedbackFeatureLink.featureId, featureIds))
          .groupBy(tables.feedbackFeatureLink.featureId)
      : [];
    const feedbackCountMap = new Map(
      feedbackCounts.map((item) => [item.featureId, item.count])
    );

    const data: GetFeaturesResponse = features.map((feature) => ({
      id: feature.id,
      title: feature.title,
      createdAt: feature.createdAt,
      ownerId: feature.ownerId,
      rice:
        feature.riceReach !== null &&
        feature.riceImpact !== null &&
        feature.riceConfidence !== null &&
        feature.riceEffort !== null
          ? {
              reach: feature.riceReach,
              impact: feature.riceImpact,
              confidence: feature.riceConfidence,
              effort: feature.riceEffort,
            }
          : null,
      aiRice:
        feature.aiRiceReach !== null &&
        feature.aiRiceImpact !== null &&
        feature.aiRiceConfidence !== null &&
        feature.aiRiceEffort !== null
          ? {
              reach: feature.aiRiceReach,
              impact: feature.aiRiceImpact,
              confidence: feature.aiRiceConfidence,
              effort: feature.aiRiceEffort,
            }
          : null,
      connection:
        feature.connectionHref && feature.connectionType
          ? { href: feature.connectionHref, type: feature.connectionType }
          : null,
      status: feature.statusId
        ? {
            id: feature.statusId,
            color: feature.statusColor ?? "",
            order: feature.statusOrder ?? 0,
            complete: feature.statusComplete ?? false,
            name: feature.statusName ?? "",
          }
        : null,
      product: feature.productName ? { name: feature.productName } : null,
      group: feature.groupName
        ? { name: feature.groupName, parentGroupId: feature.groupParentId }
        : null,
      _count: {
        feedback: feedbackCountMap.get(feature.id) ?? 0,
      },
      meta: {
        total,
      },
    }));

    return { data };
  } catch (error) {
    return { error };
  }
};
