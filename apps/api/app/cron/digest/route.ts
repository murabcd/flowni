import { database, tables } from "@repo/backend/database";
import { createId } from "@repo/backend/id";
import { logger } from "@repo/lib/logger";
import { generateText } from "ai";
import { subDays } from "date-fns";
import { and, asc, eq, gte, notInArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = "force-dynamic";

export const GET = async (): Promise<Response> => {
  logger.info({
    event: "digest_scan_start",
    scope: "cron_digest",
  });

  const yesterday = subDays(new Date(), 1).toISOString();
  const recentDigests = await database
    .select({ organizationId: tables.digest.organizationId })
    .from(tables.digest)
    .where(gte(tables.digest.createdAt, yesterday));
  const recentDigestOrgIds = recentDigests.map(
    (digest) => digest.organizationId
  );

  const organizations = await database
    .select({ id: tables.organization.id })
    .from(tables.organization)
    .where(
      recentDigestOrgIds.length
        ? notInArray(tables.organization.id, recentDigestOrgIds)
        : undefined
    )
    .limit(10);

  if (!organizations.length) {
    logger.info({
      event: "digest_no_organizations",
      scope: "cron_digest",
    });
    return NextResponse.json(
      { message: "No organizations found." },
      { status: 200 }
    );
  }

  logger.info({
    event: "digest_organizations_found",
    scope: "cron_digest",
    organization_count: organizations.length,
  });

  const transactions: Promise<unknown>[] = [];

  for (const organization of organizations) {
    const [
      feedback,
      features,
      changelog,
      initiatives,
      initiativePages,
      initiativeCanvases,
      releases,
    ] = await Promise.all([
      database
        .select({
          title: tables.feedback.title,
          feedbackUserName: tables.feedbackUser.name,
          feedbackOrganizationName: tables.feedbackOrganization.name,
        })
        .from(tables.feedback)
        .leftJoin(
          tables.feedbackUser,
          eq(tables.feedback.feedbackUserId, tables.feedbackUser.id)
        )
        .leftJoin(
          tables.feedbackOrganization,
          eq(
            tables.feedbackUser.feedbackOrganizationId,
            tables.feedbackOrganization.id
          )
        )
        .where(
          and(
            eq(tables.feedback.organizationId, organization.id),
            gte(tables.feedback.createdAt, yesterday)
          )
        ),
      database
        .select({
          title: tables.feature.title,
          productName: tables.product.name,
          groupName: tables.group.name,
        })
        .from(tables.feature)
        .leftJoin(
          tables.product,
          eq(tables.feature.productId, tables.product.id)
        )
        .leftJoin(tables.group, eq(tables.feature.groupId, tables.group.id))
        .where(
          and(
            eq(tables.feature.organizationId, organization.id),
            gte(tables.feature.createdAt, yesterday)
          )
        ),
      database
        .select({ title: tables.changelog.title })
        .from(tables.changelog)
        .where(
          and(
            eq(tables.changelog.organizationId, organization.id),
            gte(tables.changelog.createdAt, yesterday)
          )
        ),
      database
        .select({ title: tables.initiative.title })
        .from(tables.initiative)
        .where(
          and(
            eq(tables.initiative.organizationId, organization.id),
            gte(tables.initiative.createdAt, yesterday)
          )
        ),
      database
        .select({ title: tables.initiativePage.title })
        .from(tables.initiativePage)
        .where(
          and(
            eq(tables.initiativePage.organizationId, organization.id),
            gte(tables.initiativePage.createdAt, yesterday)
          )
        ),
      database
        .select({ title: tables.initiativeCanvas.title })
        .from(tables.initiativeCanvas)
        .where(
          and(
            eq(tables.initiativeCanvas.organizationId, organization.id),
            gte(tables.initiativeCanvas.createdAt, yesterday)
          )
        ),
      database
        .select({ title: tables.release.title })
        .from(tables.release)
        .where(
          and(
            eq(tables.release.organizationId, organization.id),
            gte(tables.release.endAt, new Date().toISOString())
          )
        )
        .orderBy(asc(tables.release.endAt))
        .limit(1),
    ]);

    const mappedFeedback = feedback.map((item) => ({
      title: item.title,
      feedbackUser: item.feedbackUserName
        ? {
            name: item.feedbackUserName,
            feedbackOrganization: item.feedbackOrganizationName
              ? { name: item.feedbackOrganizationName }
              : null,
          }
        : null,
    }));

    const mappedFeatures = features.map((item) => ({
      title: item.title,
      product: item.productName ? { name: item.productName } : null,
      group: item.groupName ? { name: item.groupName } : null,
    }));

    const prompt = [
      "Feedback created:",
      JSON.stringify(mappedFeedback),
      "------",
      "Features created:",
      JSON.stringify(mappedFeatures),
      "------",
      "Initiatives created:",
      JSON.stringify(initiatives),
      "------",
      "Initiative pages created:",
      JSON.stringify(initiativePages),
      "------",
      "Initiative canvases created:",
      JSON.stringify(initiativeCanvases),
      "------",
      "Changelogs created:",
      JSON.stringify(changelog),
      "------",
      "Next release:",
      JSON.stringify(releases),
    ].join("\n");

    const [text, summary] = await Promise.all([
      generateText({
        model: "openai/gpt-5-nano",
        system: [
          "You are an AI that creates a digest of the most important things that happened in the last 24 hours.",
          "Be as comprehensive as possible.",
          "Use markdown formatting to highlight important parts of the digest.",
        ].join("\n"),
        prompt,
      }),
      generateText({
        model: "openai/gpt-5-nano",
        system: [
          "You are an AI that creates a digest of the most important things that happened in the last 24 hours.",
          "You have maximum 2000 characters to describe the digest.",
          "Do not include any markdown formatting.",
        ].join("\n"),
        prompt,
      }),
    ]);

    const transaction = database.insert(tables.digest).values([
      {
        id: createId(),
        text: text.text,
        organizationId: organization.id,
        summary: summary.text,
        updatedAt: new Date().toISOString(),
      },
    ]);

    transactions.push(transaction);
  }

  await Promise.all(transactions);

  return new Response("OK", { status: 200 });
};
