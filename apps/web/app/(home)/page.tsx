import { database, tables } from "@repo/backend/database";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import type { ReactElement } from "react";
import { createMetadata } from "@/lib/metadata";
import { Hero } from "./components/hero";

export const metadata: Metadata = createMetadata({
  title: "Build your product roadmap at lightspeed",
  description:
    "Portal is a home for product teams to explore problems, ideate solutions, prioritize features and plan roadmaps with the help of AI.",
});

const Home = async (): Promise<ReactElement> => {
  const latestUpdate = await database
    .select({ title: tables.changelog.title })
    .from(tables.changelog)
    .where(eq(tables.changelog.status, "PUBLISHED"))
    .orderBy(desc(tables.changelog.publishAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  return <Hero id="hero" latestUpdate={latestUpdate?.title} />;
};

export default Home;
