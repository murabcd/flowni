"use server";

import { getUserName } from "@repo/backend/auth/format";
import { currentMembers } from "@repo/backend/auth/utils";
import {
  database,
  getJsonColumnFromTable,
  tables,
} from "@repo/backend/database";
import type { Feature } from "@repo/backend/types";
import { contentToText } from "@repo/editor/lib/tiptap";
import { FEEDBACK_PAGE_SIZE } from "@repo/lib/consts";
import { desc } from "drizzle-orm";

export type GetFeatureResponse = Pick<
  Feature,
  "endAt" | "id" | "ownerId" | "startAt" | "title"
> & {
  readonly text: string;
  readonly owner: {
    readonly name: string | undefined;
    readonly email: string | undefined;
    readonly imageUrl: string | undefined;
  } | null;
};

export const getFeature = async (
  page: number
): Promise<
  | {
      data: GetFeatureResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const feature = await database
      .select({
        id: tables.feature.id,
        title: tables.feature.title,
        startAt: tables.feature.startAt,
        endAt: tables.feature.endAt,
        ownerId: tables.feature.ownerId,
      })
      .from(tables.feature)
      .orderBy(desc(tables.feature.createdAt))
      .limit(FEEDBACK_PAGE_SIZE)
      .offset(page * FEEDBACK_PAGE_SIZE)
      .then((rows) => rows[0] ?? null);

    const members = await currentMembers();

    if (!feature) {
      throw new Error("Feature not found");
    }

    const owner = feature.ownerId
      ? members.find(({ id }) => id === feature.ownerId)
      : null;

    const content = await getJsonColumnFromTable(
      "feature",
      "content",
      feature.id
    );

    return {
      data: {
        ...feature,
        text: content ? contentToText(content) : "",
        owner: owner
          ? {
              name: getUserName(owner),
              email: owner.email ?? undefined,
              imageUrl: owner.image ?? undefined,
            }
          : null,
      },
    };
  } catch (error) {
    return { error };
  }
};
