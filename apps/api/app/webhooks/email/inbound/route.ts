import { database, tables } from "@repo/backend/database";
import { createId } from "@repo/backend/id";
import { htmlToContent } from "@repo/editor/lib/tiptap";
import { getGravatarUrl } from "@repo/lib/gravatar";
import { logger } from "@repo/lib/logger";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v3";

const messageSchema = z.object({
  From: z.string(),
  MessageStream: z.string(),
  FromName: z.string(),
  FromFull: z.object({
    Email: z.string(),
    Name: z.string(),
    MailboxHash: z.string(),
  }),
  To: z.string(),
  ToFull: z.array(
    z.object({
      Email: z.string(),
      Name: z.string(),
      MailboxHash: z.string(),
    })
  ),
  Cc: z.string(),
  CcFull: z.array(
    z.object({
      Email: z.string(),
      Name: z.string(),
      MailboxHash: z.string(),
    })
  ),
  Bcc: z.string(),
  BccFull: z.array(
    z.object({
      Email: z.string(),
      Name: z.string(),
      MailboxHash: z.string(),
    })
  ),
  OriginalRecipient: z.string(),
  ReplyTo: z.string(),
  Subject: z.string(),
  MessageID: z.string(),
  Date: z.string(),
  MailboxHash: z.string(),
  TextBody: z.string(),
  HtmlBody: z.string(),
  StrippedTextReply: z.string(),
  Tag: z.string(),
  Headers: z.array(
    z.object({
      Name: z.string(),
      Value: z.string(),
    })
  ),
  Attachments: z.array(
    z.object({
      Name: z.string(),
      Content: z.string(),
      ContentType: z.string(),
      ContentLength: z.number(),
      ContentID: z.string(),
    })
  ),
});

const inboundEmailRegex = /org_([a-zA-Z0-9]+)@inbound\.flowni\.ai/;

// Should come in from reply+{organizationId}@inbound.flowni.ai
export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as object;
  const parse = messageSchema.safeParse(body);

  logger.info({
    event: "inbound_email_received",
    source: "postmark",
    parse_success: parse.success,
  });

  if (!parse.success) {
    return new Response(`Bad Request: ${parse.error.errors.join(",")}`, {
      status: 400,
    });
  }

  if (parse.data.MessageStream !== "inbound") {
    return new Response("Not an inbound message", { status: 400 });
  }

  const match = [
    parse.data.To,
    parse.data.OriginalRecipient,
    parse.data.Cc,
    parse.data.Bcc,
  ]
    .flatMap((recipient) => recipient.match(inboundEmailRegex))
    .find((result) => result !== null);

  if (!match || match.length < 2) {
    logger.error({
      event: "inbound_email_invalid_recipient",
      to: parse.data.To,
      original_recipient: parse.data.OriginalRecipient,
      cc: parse.data.Cc,
      bcc: parse.data.Bcc,
    });
    return new Response("Invalid recipient email format", { status: 400 });
  }

  const organizationId = `org_${match[1]}`;

  const organization = await database
    .select({ id: tables.organization.id })
    .from(tables.organization)
    .where(eq(tables.organization.id, organizationId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!organization) {
    logger.error({
      event: "inbound_email_organization_not_found",
      organization_id: organizationId,
    });
    return new Response("Organization not found", { status: 404 });
  }

  const email = parse.data.FromFull.Email;
  const name = parse.data.FromFull.Name;

  let feedbackUser = await database
    .select({ id: tables.feedbackUser.id })
    .from(tables.feedbackUser)
    .where(
      and(
        eq(tables.feedbackUser.email, email),
        eq(tables.feedbackUser.organizationId, organization.id)
      )
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!feedbackUser) {
    const id = createId();
    const now = new Date().toISOString();

    await database.insert(tables.feedbackUser).values([
      {
        id,
        organizationId,
        email,
        name,
        imageUrl: await getGravatarUrl(email),
        createdAt: now,
        updatedAt: now,
      },
    ]);

    feedbackUser = { id };
  }

  const now = new Date().toISOString();
  await database.insert(tables.feedback).values([
    {
      id: createId(),
      organizationId,
      content: htmlToContent(parse.data.HtmlBody),
      title: parse.data.Subject,
      source: "EMAIL",
      feedbackUserId: feedbackUser.id,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  return new Response("OK", { status: 200 });
};
