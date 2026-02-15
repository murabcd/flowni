import { database, tables } from "@repo/backend/database";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

const Changelog = async () => {
  const changelogs = await database
    .select({ id: tables.changelog.id })
    .from(tables.changelog)
    .orderBy(desc(tables.changelog.createdAt))
    .limit(1);

  const first = changelogs.at(0);

  if (!first) {
    return null;
  }

  return redirect(`/changelog/${first.id}`);
};

export default Changelog;
