"use server";

import { database, tables } from "@repo/backend/database";
import type { Feedback, FeedbackUser } from "@repo/backend/types";
import { contentToText } from "@repo/editor/lib/tiptap";
import { FEEDBACK_PAGE_SIZE } from "@repo/lib/consts";
import { desc, eq } from "drizzle-orm";

export type GetFeedbackResponse = (Pick<
  Feedback,
  "aiSentiment" | "createdAt" | "id" | "title"
> & {
  readonly text: string;
  readonly feedbackUser: Pick<
    FeedbackUser,
    "email" | "imageUrl" | "name"
  > | null;
})[];

export const getFeedback = async (
  page: number,
  showProcessed: boolean
): Promise<
  | {
      data: GetFeedbackResponse;
    }
  | {
      error: unknown;
    }
> => {
  try {
    const feedbacks = await database
      .select({
        id: tables.feedback.id,
        title: tables.feedback.title,
        createdAt: tables.feedback.createdAt,
        audioUrl: tables.feedback.audioUrl,
        videoUrl: tables.feedback.videoUrl,
        aiSentiment: tables.feedback.aiSentiment,
        content: tables.feedback.content,
        feedbackUserName: tables.feedbackUser.name,
        feedbackUserEmail: tables.feedbackUser.email,
        feedbackUserImageUrl: tables.feedbackUser.imageUrl,
      })
      .from(tables.feedback)
      .leftJoin(
        tables.feedbackUser,
        eq(tables.feedbackUser.id, tables.feedback.feedbackUserId)
      )
      .where(showProcessed ? undefined : eq(tables.feedback.processed, false))
      .orderBy(desc(tables.feedback.createdAt))
      .limit(FEEDBACK_PAGE_SIZE)
      .offset(page * FEEDBACK_PAGE_SIZE);

    const data = feedbacks.map(
      ({ audioUrl, videoUrl, content, ...feedback }) => {
        let text = content ? contentToText(content) : "No content.";

        if (audioUrl) {
          text = "Audio feedback";
        } else if (videoUrl) {
          text = "Video feedback";
        }

        return {
          id: feedback.id,
          title: feedback.title,
          createdAt: feedback.createdAt,
          aiSentiment: feedback.aiSentiment,
          feedbackUser:
            feedback.feedbackUserEmail || feedback.feedbackUserName
              ? {
                  name: feedback.feedbackUserName ?? "",
                  email: feedback.feedbackUserEmail ?? "",
                  imageUrl: feedback.feedbackUserImageUrl ?? "",
                }
              : null,
          text,
        };
      }
    );

    return { data };
  } catch (error) {
    return { error };
  }
};
