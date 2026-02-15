import { getUserName } from "@repo/backend/auth/format";
import {
  database,
  getJsonColumnFromTable,
  tables,
} from "@repo/backend/database";
import { Prose } from "@repo/design-system/components/prose";
import { Badge } from "@repo/design-system/components/ui/badge";
import { contentToMarkdown } from "@repo/editor/lib/tiptap";
import { formatDate } from "@repo/lib/format";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AvatarTooltip } from "@/components/avatar-tooltip";
import { MemoizedReactMarkdown } from "@/components/markdown";
import { handleAuthedState } from "@/lib/auth";
import { createMetadata } from "@/lib/metadata";
import { LoginForm } from "./components/form";
import { UrlErrors } from "./components/url-errors";

const title = "Sign in";
const description = "Sign in to your account.";

export const metadata: Metadata = createMetadata({ title, description });

const ContributorAvatar = async ({ userId }: { readonly userId: string }) => {
  const user = await database
    .select()
    .from(tables.user)
    .where(eq(tables.user.id, userId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!user) {
    return <div />;
  }

  return (
    <AvatarTooltip
      fallback="E"
      src={user.image ?? ""}
      subtitle="Flowni team"
      title={getUserName(user)}
    />
  );
};

const SignInPage = async () => {
  await handleAuthedState();

  const latestUpdate = await database
    .select({
      id: tables.changelog.id,
      title: tables.changelog.title,
      publishAt: tables.changelog.publishAt,
    })
    .from(tables.changelog)
    .where(eq(tables.changelog.status, "PUBLISHED"))
    .orderBy(desc(tables.changelog.publishAt))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  const [contributors, tags] = latestUpdate
    ? await Promise.all([
        database
          .select({ userId: tables.changelogContributor.userId })
          .from(tables.changelogContributor)
          .where(eq(tables.changelogContributor.changelogId, latestUpdate.id)),
        database
          .select({
            id: tables.changelogTag.id,
            name: tables.changelogTag.name,
          })
          .from(tables.changelogToChangelogTag)
          .innerJoin(
            tables.changelogTag,
            eq(tables.changelogTag.id, tables.changelogToChangelogTag.b)
          )
          .where(eq(tables.changelogToChangelogTag.a, latestUpdate.id)),
      ])
    : [[], []];

  const latestUpdateWithRelations = latestUpdate
    ? { ...latestUpdate, contributors, tags }
    : null;
  const content = latestUpdate
    ? await getJsonColumnFromTable("changelog", "content", latestUpdate.id)
    : null;
  const markdown = content ? await contentToMarkdown(content) : "No content.";

  return (
    <div className="grid h-screen w-screen divide-x lg:grid-cols-2">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[400px] space-y-8">
          <LoginForm />
          <p className="text-balance text-center text-muted-foreground text-sm">
            By signing in, you agree to our{" "}
            <a
              className="font-medium text-primary underline"
              href="https://www.flowni.ai/legal/terms"
              rel="noreferrer noopener"
              target="_blank"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="font-medium text-primary underline"
              href="https://www.flowni.ai/legal/privacy"
              rel="noreferrer noopener"
              target="_blank"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      <div className="hidden h-full w-full items-start justify-center overflow-y-auto bg-background px-24 py-24 lg:flex">
        <div className="flex w-full flex-col gap-8">
          {latestUpdateWithRelations ? (
            <Prose
              className="mx-auto prose-img:rounded-lg"
              key={latestUpdateWithRelations.id}
            >
              <p className="font-medium text-muted-foreground text-sm">
                Latest update
              </p>

              <h1 className="mt-6 font-semibold! text-4xl!">
                {latestUpdateWithRelations.title}
              </h1>

              <div className="mt-4 mb-12 flex items-center gap-2">
                <span className="text-sm">by</span>
                <div className="not-prose flex items-center -space-x-1 hover:space-x-1 [&>*]:transition-all">
                  {latestUpdateWithRelations.contributors.map((contributor) => (
                    <div key={contributor.userId}>
                      <ContributorAvatar userId={contributor.userId} />
                    </div>
                  ))}{" "}
                </div>
                <span className="text-sm">
                  on {formatDate(new Date(latestUpdateWithRelations.publishAt))}
                </span>
              </div>

              <MemoizedReactMarkdown>{markdown}</MemoizedReactMarkdown>

              <div className="my-8 flex flex-wrap items-center gap-1">
                {latestUpdateWithRelations.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </Prose>
          ) : (
            <p className="text-muted-foreground text-sm">No updates yet.</p>
          )}
        </div>
      </div>
      <Suspense fallback={null}>
        <UrlErrors />
      </Suspense>
    </div>
  );
};

export default SignInPage;
