import { createClient } from "@repo/atlassian";
import { database, tables } from "@repo/backend/database";
import { createId } from "@repo/backend/id";
import { logger, serializeError } from "@repo/lib/logger";
import { parseError } from "@repo/lib/parse-error";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod/v3";

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = "force-dynamic";

const webhookEventSchema = z.object({
  matchedWebhookIds: z.array(z.number()),
  issue: z.object({
    id: z.string(),
    key: z.string(),
  }),
  webhookEvent: z.enum(["jira:issue_created", "jira:issue_updated"]),
});

const fieldsSchema = z
  .object({
    summary: z.string(),
    status: z.object({
      id: z.string(),
    }),
    fixVersions: z.array(
      z.object({
        self: z.string().url(),
        id: z.string(),
        description: z.string().optional(),
        name: z.string(),
        archived: z.boolean(),
        released: z.boolean(),
        releaseDate: z.string().optional(),
      })
    ),
    description: z.unknown(),
  })
  .catchall(z.unknown());

const baseIssueFields = ["summary", "status", "fixVersions", "description"];

const getInstallation = async (organizationId: string) =>
  database
    .select({
      accessToken: tables.atlassianInstallation.accessToken,
      email: tables.atlassianInstallation.email,
      siteUrl: tables.atlassianInstallation.siteUrl,
    })
    .from(tables.atlassianInstallation)
    .where(eq(tables.atlassianInstallation.organizationId, organizationId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

const getFieldMappings = async (organizationId: string) =>
  database
    .select()
    .from(tables.installationFieldMapping)
    .where(
      and(
        eq(tables.installationFieldMapping.organizationId, organizationId),
        eq(tables.installationFieldMapping.type, "JIRA")
      )
    );

const buildIssueFields = (
  fieldMappings: Awaited<ReturnType<typeof getFieldMappings>>
) => {
  const issueFields = [...baseIssueFields];

  for (const field of fieldMappings) {
    issueFields.push(field.externalId);
  }

  return issueFields;
};

const fetchIssueFields = async (
  atlassian: ReturnType<typeof createClient>,
  issueKey: string,
  fields: string[]
) => {
  const issue = await atlassian.GET("/rest/api/2/issue/{issueIdOrKey}", {
    params: {
      path: {
        issueIdOrKey: issueKey,
      },
      query: {
        fields,
      },
    },
  });

  if (issue.error) {
    throw new Error(`Failed to get issue: ${issueKey}`);
  }

  if (!issue.data?.fields) {
    throw new Error(`Issue response does not contain fields: ${issueKey}`);
  }

  const validationResult = fieldsSchema.safeParse(issue.data.fields);

  if (!validationResult.success) {
    logger.error({
      event: "jira_invalid_issue_fields",
      issue_key: issueKey,
      errors: validationResult.error.errors,
    });
    throw new Error(`Invalid issue fields for issue: ${issueKey}`);
  }

  return validationResult.data;
};

const getFeatureConnection = async (
  organizationId: string,
  externalId: string
) =>
  database
    .select({
      id: tables.featureConnection.id,
      featureId: tables.featureConnection.featureId,
      organizationId: tables.featureConnection.organizationId,
    })
    .from(tables.featureConnection)
    .where(
      and(
        eq(tables.featureConnection.externalId, externalId),
        eq(tables.featureConnection.type, "JIRA"),
        eq(tables.featureConnection.organizationId, organizationId)
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

const upsertReleaseFromFixVersion = async (
  fixVersion: z.infer<typeof fieldsSchema>["fixVersions"][number] | undefined,
  organizationId: string
) => {
  if (!fixVersion) {
    return;
  }

  logger.info({
    event: "jira_fix_version_update_start",
  });

  let existingRelease = await database
    .select({ id: tables.release.id })
    .from(tables.release)
    .where(
      and(
        eq(tables.release.jiraId, fixVersion.id),
        eq(tables.release.organizationId, organizationId)
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  let state: "COMPLETED" | "CANCELLED" | undefined;

  if (fixVersion.released) {
    state = "COMPLETED";
  } else if (fixVersion.archived) {
    state = "CANCELLED";
  }

  if (existingRelease) {
    await database
      .update(tables.release)
      .set({
        title: fixVersion.name,
        description: fixVersion.description,
        endAt: fixVersion.releaseDate ?? undefined,
        state,
        updatedAt: new Date().toISOString(),
      })
      .where(
        and(
          eq(tables.release.organizationId, organizationId),
          eq(tables.release.jiraId, fixVersion.id)
        )
      );
  } else {
    const releaseId = createId();
    await database.insert(tables.release).values([
      {
        id: releaseId,
        title: fixVersion.name,
        description: fixVersion.description,
        endAt: fixVersion.releaseDate ?? undefined,
        jiraId: fixVersion.id,
        state,
        organizationId,
        updatedAt: new Date().toISOString(),
      },
    ]);
    existingRelease = { id: releaseId };
  }

  return existingRelease.id;
};

const resolveStatusId = async (organizationId: string, statusId: string) => {
  const installationStatusMapping = await database
    .select({
      featureStatusId: tables.installationStatusMapping.featureStatusId,
    })
    .from(tables.installationStatusMapping)
    .where(
      and(
        eq(tables.installationStatusMapping.organizationId, organizationId),
        eq(tables.installationStatusMapping.eventId, statusId),
        eq(tables.installationStatusMapping.type, "JIRA")
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  return installationStatusMapping?.featureStatusId;
};

const resolveCustomDates = (
  fieldMappings: Awaited<ReturnType<typeof getFieldMappings>>,
  fields: z.infer<typeof fieldsSchema>
) => {
  let startAt: string | undefined;
  let endAt: string | undefined;

  for (const field of fieldMappings) {
    const fieldValue = fields[field.externalId];

    logger.info({
      event: "jira_custom_field_update_attempt",
      field_id: field.externalId,
      field_value: fieldValue,
    });

    if (!fieldValue) {
      continue;
    }

    if (
      field.internalId === "STARTAT" &&
      typeof fieldValue === "string" &&
      new Date(fieldValue).toString() !== "Invalid Date"
    ) {
      startAt = new Date(fieldValue).toISOString();
    }

    if (
      field.internalId === "ENDAT" &&
      typeof fieldValue === "string" &&
      new Date(fieldValue).toString() !== "Invalid Date"
    ) {
      endAt = new Date(fieldValue).toISOString();
    }
  }

  return { startAt, endAt };
};

const handleIssueEvent = async (
  event: z.infer<typeof webhookEventSchema>,
  organizationId: string
) => {
  const [installation, fieldMappings] = await Promise.all([
    getInstallation(organizationId),
    getFieldMappings(organizationId),
  ]);

  if (!installation) {
    throw new Error("Installation not found");
  }

  const issueFields = buildIssueFields(fieldMappings);
  const atlassian = createClient(installation);
  const issueData = await fetchIssueFields(
    atlassian,
    event.issue.key,
    issueFields
  );
  const featureConnection = await getFeatureConnection(
    organizationId,
    event.issue.id
  );

  if (!featureConnection) {
    logger.info({
      event: "jira_feature_connection_not_found",
      organization_id: organizationId,
      issue_id: event.issue.id,
    });
    return NextResponse.json(
      { message: "FeatureConnection not found" },
      { status: 200 }
    );
  }

  const title = issueData.summary;
  const releaseId = await upsertReleaseFromFixVersion(
    issueData.fixVersions.at(0),
    featureConnection.organizationId
  );
  const statusId = await resolveStatusId(
    featureConnection.organizationId,
    issueData.status.id
  );
  const { startAt, endAt } = resolveCustomDates(fieldMappings, issueData);

  logger.info({
    event: "jira_feature_update_fields",
    title,
    release_id: releaseId,
    status_id: statusId,
  });

  await database
    .update(tables.feature)
    .set({
      title,
      releaseId,
      statusId,
      startAt,
      endAt,
      content:
        issueData.description && typeof issueData.description === "object"
          ? (issueData.description as object)
          : undefined,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tables.feature.id, featureConnection.featureId));

  return NextResponse.json(
    { message: "🧑‍💻 Issue event handled" },
    { status: 200 }
  );
};

type JiraWebhookContext = {
  params: Promise<{
    slug: string;
  }>;
};

export const POST = async (
  request: Request,
  context: JiraWebhookContext
): Promise<Response> => {
  try {
    const { slug } = await context.params;
    const data = await request.json();

    const organization = await database
      .select()
      .from(tables.organization)
      .where(eq(tables.organization.slug, slug))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    const validationResult = webhookEventSchema.safeParse(data);
    if (!validationResult.success) {
      logger.error({
        event: "jira_invalid_webhook_event",
        errors: validationResult.error.errors,
      });
      return NextResponse.json(
        { message: "Invalid webhook event data" },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    switch (validatedData.webhookEvent) {
      case "jira:issue_created":
      case "jira:issue_updated": {
        return handleIssueEvent(data, organization.id);
      }
      default: {
        logger.info({
          event: "jira_unhandled_webhook_event",
          webhook_event: validatedData.webhookEvent,
        });
        return NextResponse.json(
          { message: "🧑‍💻 Unhandled Atlassian Issue event" },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    const message = parseError(error);
    logger.error({
      event: "jira_webhook_error",
      message,
      error: serializeError(error),
    });

    return NextResponse.json({ message }, { status: 500 });
  }
};
