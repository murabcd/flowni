import { currentOrganizationId } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { and, desc, eq } from "drizzle-orm";
import { MessageCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Feedback",
  description: "View and manage feedback.",
});

const FeedbackIndexPage = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          description="No feedback has been provided yet. Check back later."
          icon={MessageCircleIcon}
          title="No feedback found"
        />
      </div>
    );
  }

  const [feedback] = await database
    .select({ id: tables.feedback.id })
    .from(tables.feedback)
    .where(
      and(
        eq(tables.feedback.organizationId, organizationId),
        eq(tables.feedback.processed, false)
      )
    )
    .orderBy(desc(tables.feedback.createdAt))
    .limit(1);

  if (!feedback) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          description="No feedback has been provided yet. Check back later."
          icon={MessageCircleIcon}
          title="No feedback found"
        />
      </div>
    );
  }

  return redirect(`/feedback/${feedback.id}`);
};

export default FeedbackIndexPage;
