import { database, tables } from "@repo/backend/database";
import { asc } from "drizzle-orm";
import { BuildingIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Companies",
  description: "View all companies who have provided feedback.",
});

const CompanyIndexPage = async () => {
  const feedbackOrganization = await database
    .select({ id: tables.feedbackOrganization.id })
    .from(tables.feedbackOrganization)
    .orderBy(asc(tables.feedbackOrganization.name))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!feedbackOrganization) {
    return (
      <EmptyState
        description="No companies have provided feedback yet."
        icon={BuildingIcon}
        title="No companies found"
      />
    );
  }

  return redirect(`/data/companies/${feedbackOrganization.id}`);
};

export default CompanyIndexPage;
