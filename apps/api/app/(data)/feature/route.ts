import { database, tables } from "@repo/backend/database";
import { createId } from "@repo/backend/id";
import { textToContent } from "@repo/editor/lib/tiptap";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod/v3";

const FeatureProperties = z.object({
  title: z.string(),
  text: z.string(),
  custom: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as unknown;
  const parse = FeatureProperties.safeParse(body);
  const authorization = request.headers.get("Authorization");
  const key = authorization?.split("Bearer ")[1];

  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = await database
    .select({
      id: tables.apiKey.id,
      creatorId: tables.apiKey.creatorId,
      organizationId: tables.apiKey.organizationId,
    })
    .from(tables.apiKey)
    .where(eq(tables.apiKey.key, key))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!parse.success) {
    return NextResponse.json({ error: parse.error }, { status: 400 });
  }

  const organization = await database
    .select({ id: tables.organization.id })
    .from(tables.organization)
    .where(eq(tables.organization.id, apiKey.organizationId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!organization) {
    throw new Error("Organization not found");
  }

  const featureStatus = await database
    .select({ id: tables.featureStatus.id })
    .from(tables.featureStatus)
    .where(eq(tables.featureStatus.organizationId, apiKey.organizationId))
    .orderBy(asc(tables.featureStatus.order))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!featureStatus) {
    throw new Error("You must have a feature status to create a feature.");
  }

  const featureId = createId();
  const now = new Date().toISOString();

  await database.insert(tables.feature).values([
    {
      id: featureId,
      creatorId: apiKey.creatorId,
      organizationId: apiKey.organizationId,
      ownerId: apiKey.creatorId,
      title: parse.data.title,
      statusId: featureStatus.id,
      source: "API",
      apiKeyId: apiKey.id,
      content: textToContent(parse.data.text),
      createdAt: now,
      updatedAt: now,
    },
  ]);

  if (parse.data.custom?.length) {
    await database.insert(tables.featureCustomFieldValue).values(
      parse.data.custom.map((field) => ({
        id: createId(),
        customFieldId: field.key,
        value: field.value,
        organizationId: apiKey.organizationId,
        featureId,
        createdAt: now,
        updatedAt: now,
      }))
    );
  }

  return NextResponse.json({ success: true });
};
