"use server";

import {
  database,
  getJsonColumnFromTable,
  tables,
} from "@repo/backend/database";
import type { Changelog } from "@repo/backend/types";
import { contentToText } from "@repo/editor/lib/tiptap";
import { FEEDBACK_PAGE_SIZE } from "@repo/lib/consts";
import { desc } from "drizzle-orm";

export type GetChangelogResponse = (Pick<
  Changelog,
  "id" | "publishAt" | "status" | "title"
> & {
  text: string;
})[];

export const getChangelog = async (
  page: number
): Promise<
  | {
      data: GetChangelogResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const changelogs = await database
      .select({
        id: tables.changelog.id,
        title: tables.changelog.title,
        publishAt: tables.changelog.publishAt,
        status: tables.changelog.status,
      })
      .from(tables.changelog)
      .orderBy(desc(tables.changelog.publishAt))
      .limit(FEEDBACK_PAGE_SIZE)
      .offset(page * FEEDBACK_PAGE_SIZE);

    const modifiedData = changelogs.map(async (changelog) => {
      const content = await getJsonColumnFromTable(
        "changelog",
        "content",
        changelog.id
      );

      return {
        ...changelog,
        text: content ? contentToText(content) : "No description provided.",
      };
    });

    const data = await Promise.all(modifiedData);

    return { data };
  } catch (error) {
    return { error };
  }
};
