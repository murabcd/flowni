"use server";

import { database, tables } from "@repo/backend/database";
import type { FeedbackUser } from "@repo/backend/types";
import { FEEDBACK_PAGE_SIZE } from "@repo/lib/consts";
import { asc } from "drizzle-orm";

export type GetFeedbackUsersResponse = Pick<
  FeedbackUser,
  "createdAt" | "email" | "id" | "imageUrl" | "name"
>[];

export const getFeedbackUsers = async (
  page: number
): Promise<
  | {
      data: GetFeedbackUsersResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const data = await database
      .select({
        id: tables.feedbackUser.id,
        name: tables.feedbackUser.name,
        imageUrl: tables.feedbackUser.imageUrl,
        email: tables.feedbackUser.email,
        createdAt: tables.feedbackUser.createdAt,
      })
      .from(tables.feedbackUser)
      .orderBy(asc(tables.feedbackUser.name))
      .limit(FEEDBACK_PAGE_SIZE)
      .offset(page * FEEDBACK_PAGE_SIZE);

    return { data };
  } catch (error) {
    return { error };
  }
};
