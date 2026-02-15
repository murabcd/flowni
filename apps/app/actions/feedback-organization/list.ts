"use server";

import { database, tables } from "@repo/backend/database";
import type { FeedbackOrganization } from "@repo/backend/types";
import { FEEDBACK_PAGE_SIZE } from "@repo/lib/consts";
import { asc } from "drizzle-orm";

export type GetFeedbackCompaniesResponse = Pick<
  FeedbackOrganization,
  "createdAt" | "domain" | "id" | "name"
>[];

export const getFeedbackCompanies = async (
  page: number
): Promise<
  | {
      data: GetFeedbackCompaniesResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const data = await database
      .select({
        id: tables.feedbackOrganization.id,
        name: tables.feedbackOrganization.name,
        domain: tables.feedbackOrganization.domain,
        createdAt: tables.feedbackOrganization.createdAt,
      })
      .from(tables.feedbackOrganization)
      .orderBy(asc(tables.feedbackOrganization.name))
      .limit(FEEDBACK_PAGE_SIZE)
      .offset(page * FEEDBACK_PAGE_SIZE);

    return { data };
  } catch (error) {
    return { error };
  }
};
