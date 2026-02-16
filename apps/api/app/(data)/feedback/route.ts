import { database, tables } from "@repo/backend/database";
import type { JsonValue } from "@repo/backend/drizzle/schema";
import { createId } from "@repo/backend/id";
import { textToContent } from "@repo/editor/lib/tiptap";
import { getGravatarUrl } from "@repo/lib/gravatar";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod/v3";

const FeedbackProperties = z.object({
  title: z.string(),
  text: z.string(),
  user: z
    .object({
      name: z.string(),
      email: z.string(),
    })
    .optional(),
  organization: z
    .object({
      name: z.string(),
      domain: z.string(),
    })
    .optional(),
});

const getApiKey = async (key: string) =>
  database
    .select({
      id: tables.apiKey.id,
      organizationId: tables.apiKey.organizationId,
    })
    .from(tables.apiKey)
    .where(eq(tables.apiKey.key, key))
    .limit(1)
    .then((rows) => rows[0] ?? null);

const ensureFeedbackOrganization = async (
  organization: z.infer<typeof FeedbackProperties>["organization"],
  apiKey: { id: string; organizationId: string }
): Promise<{ id: string } | null> => {
  if (!organization) {
    return null;
  }

  const existingOrganization = await database
    .select({ id: tables.feedbackOrganization.id })
    .from(tables.feedbackOrganization)
    .where(
      and(
        eq(tables.feedbackOrganization.domain, organization.domain),
        eq(tables.feedbackOrganization.organizationId, apiKey.organizationId)
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (existingOrganization) {
    return existingOrganization;
  }

  const feedbackOrganizationId = createId();
  const now = new Date().toISOString();

  await database.insert(tables.feedbackOrganization).values([
    {
      id: feedbackOrganizationId,
      domain: organization.domain,
      name: organization.name,
      organizationId: apiKey.organizationId,
      source: "API",
      apiKeyId: apiKey.id,
      updatedAt: now,
    },
  ]);

  return { id: feedbackOrganizationId };
};

const ensureFeedbackUser = async (
  user: z.infer<typeof FeedbackProperties>["user"],
  apiKey: { id: string; organizationId: string },
  feedbackOrganizationId: string | null
): Promise<{ id: string; feedbackOrganizationId: string | null } | null> => {
  if (!user) {
    return null;
  }

  const existingUser = await database
    .select({
      id: tables.feedbackUser.id,
      feedbackOrganizationId: tables.feedbackUser.feedbackOrganizationId,
    })
    .from(tables.feedbackUser)
    .where(
      and(
        eq(tables.feedbackUser.email, user.email),
        eq(tables.feedbackUser.organizationId, apiKey.organizationId)
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!existingUser) {
    const feedbackUserId = createId();
    const now = new Date().toISOString();
    await database.insert(tables.feedbackUser).values([
      {
        id: feedbackUserId,
        email: user.email,
        name: user.name,
        organizationId: apiKey.organizationId,
        feedbackOrganizationId,
        imageUrl: await getGravatarUrl(user.email),
        source: "API",
        apiKeyId: apiKey.id,
        updatedAt: now,
      },
    ]);
    return { id: feedbackUserId, feedbackOrganizationId };
  }

  if (existingUser.feedbackOrganizationId) {
    return existingUser;
  }

  await database
    .update(tables.feedbackUser)
    .set({
      feedbackOrganizationId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tables.feedbackUser.id, existingUser.id));

  return { id: existingUser.id, feedbackOrganizationId };
};

const getOrganization = async (organizationId: string) =>
  database
    .select({ id: tables.organization.id })
    .from(tables.organization)
    .where(eq(tables.organization.id, organizationId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as unknown;
  const parse = FeedbackProperties.safeParse(body);
  const authorization = request.headers.get("Authorization");
  const key = authorization?.split("Bearer ")[1];

  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = await getApiKey(key);

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!parse.success) {
    return NextResponse.json({ error: parse.error }, { status: 400 });
  }

  const feedbackOrganizationPromise = ensureFeedbackOrganization(
    parse.data.organization,
    apiKey
  );
  const feedbackUserPromise = feedbackOrganizationPromise.then(
    (feedbackOrganization) =>
      ensureFeedbackUser(
        parse.data.user,
        apiKey,
        feedbackOrganization?.id ?? null
      )
  );
  const organizationPromise = getOrganization(apiKey.organizationId);

  const [_feedbackOrganization, feedbackUser, organization] = await Promise.all(
    [feedbackOrganizationPromise, feedbackUserPromise, organizationPromise]
  );

  if (!organization) {
    throw new Error("Organization not found");
  }

  const now = new Date().toISOString();

  await database.insert(tables.feedback).values([
    {
      id: createId(),
      content: textToContent(parse.data.text) as JsonValue,
      organizationId: organization.id,
      title: parse.data.title,
      feedbackUserId: feedbackUser ? feedbackUser.id : null,
      source: "API",
      apiKeyId: apiKey.id,
      updatedAt: now,
    },
  ]);

  return NextResponse.json({ success: true });
};
