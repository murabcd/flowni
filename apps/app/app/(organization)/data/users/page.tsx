import { database, tables } from "@repo/backend/database";
import { asc } from "drizzle-orm";
import { UserCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Users",
  description: "View all users who have provided feedback.",
});

const UserIndexPage = async () => {
  const feedbackUser = await database
    .select({ id: tables.feedbackUser.id })
    .from(tables.feedbackUser)
    .orderBy(asc(tables.feedbackUser.name))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!feedbackUser) {
    return (
      <EmptyState
        description="No users have provided feedback yet."
        icon={UserCircleIcon}
        title="No users found"
      />
    );
  }

  return redirect(`/data/users/${feedbackUser.id}`);
};

export default UserIndexPage;
