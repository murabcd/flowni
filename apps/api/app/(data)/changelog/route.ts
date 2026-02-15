import { getUserName } from "@repo/backend/auth/format";
import { getMembers } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { contentToMarkdown } from "@repo/editor/lib/tiptap";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (request: Request): Promise<Response> => {
  const authorization = request.headers.get("Authorization");
  const key = authorization?.split("Bearer ")[1];

  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = await database
    .select({
      organizationId: tables.apiKey.organizationId,
    })
    .from(tables.apiKey)
    .where(eq(tables.apiKey.key, key))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [changelogs, members] = await Promise.all([
    database
      .select({
        id: tables.changelog.id,
        title: tables.changelog.title,
        publishAt: tables.changelog.publishAt,
        slug: tables.changelog.slug,
        content: tables.changelog.content,
      })
      .from(tables.changelog)
      .where(
        and(
          eq(tables.changelog.organizationId, apiKey.organizationId),
          eq(tables.changelog.status, "PUBLISHED")
        )
      )
      .orderBy(desc(tables.changelog.publishAt)),
    getMembers(apiKey.organizationId),
  ]);

  const changelogIds = changelogs.map((changelog) => changelog.id);
  const [tags, contributors] = await Promise.all([
    changelogIds.length
      ? database
          .select({
            changelogId: tables.changelogToChangelogTag.a,
            name: tables.changelogTag.name,
          })
          .from(tables.changelogToChangelogTag)
          .innerJoin(
            tables.changelogTag,
            eq(tables.changelogTag.id, tables.changelogToChangelogTag.b)
          )
          .where(inArray(tables.changelogToChangelogTag.a, changelogIds))
      : [],
    changelogIds.length
      ? database
          .select({
            changelogId: tables.changelogContributor.changelogId,
            userId: tables.changelogContributor.userId,
          })
          .from(tables.changelogContributor)
          .where(inArray(tables.changelogContributor.changelogId, changelogIds))
      : [],
  ]);

  const tagsByChangelog = new Map<string, string[]>();
  for (const tag of tags) {
    const list = tagsByChangelog.get(tag.changelogId) ?? [];
    list.push(tag.name);
    tagsByChangelog.set(tag.changelogId, list);
  }

  const contributorsByChangelog = new Map<string, string[]>();
  for (const contributor of contributors) {
    const member = members.find((user) => user.id === contributor.userId);
    if (!member) {
      continue;
    }
    const list = contributorsByChangelog.get(contributor.changelogId) ?? [];
    list.push(getUserName(member));
    contributorsByChangelog.set(contributor.changelogId, list);
  }

  const data = await Promise.all(
    changelogs.map(async (changelog) => {
      const markdown = changelog.content
        ? await contentToMarkdown(changelog.content)
        : "";

      return {
        id: changelog.id,
        title: changelog.title,
        description: markdown,
        publishAt: changelog.publishAt,
        slug: changelog.slug,
        tags: tagsByChangelog.get(changelog.id) ?? [],
        contributors: contributorsByChangelog.get(changelog.id) ?? [],
      };
    })
  );

  return NextResponse.json({ data });
};
