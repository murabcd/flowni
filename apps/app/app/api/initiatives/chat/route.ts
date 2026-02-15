import { getUserName } from "@repo/backend/auth/format";
import { currentMembers } from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { contentToText } from "@repo/editor/lib/tiptap";
import { logger } from "@repo/lib/logger";
import { convertToModelMessages, streamText } from "ai";
import { eq, inArray } from "drizzle-orm";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export const POST = async (req: Request) => {
  const { messages, initiativeId, organizationId } = await req.json();

  logger.info({
    event: "initiative_chat_request_start",
    organization_id: organizationId,
    initiative_id: initiativeId,
    message_count: Array.isArray(messages) ? messages.length : 0,
  });

  if (!(initiativeId && organizationId)) {
    logger.error({
      event: "initiative_chat_missing_ids",
      organization_id: organizationId,
      initiative_id: initiativeId,
    });
    return new Response("Initiative ID and organization ID are required", {
      status: 400,
    });
  }

  logger.info({
    event: "initiative_chat_fetch_start",
    organization_id: organizationId,
    initiative_id: initiativeId,
  });
  const [initiative, organization, members] = await Promise.all([
    database
      .select({
        id: tables.initiative.id,
        title: tables.initiative.title,
        emoji: tables.initiative.emoji,
        createdAt: tables.initiative.createdAt,
        state: tables.initiative.state,
        ownerId: tables.initiative.ownerId,
        creatorId: tables.initiative.creatorId,
      })
      .from(tables.initiative)
      .where(eq(tables.initiative.id, initiativeId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    database
      .select({ name: tables.organization.name })
      .from(tables.organization)
      .where(eq(tables.organization.id, organizationId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
    currentMembers(),
  ]);

  if (!organization) {
    logger.error({
      event: "initiative_chat_organization_not_found",
      organization_id: organizationId,
    });
    return new Response("Organization not found", { status: 404 });
  }

  if (!initiative) {
    logger.error({
      event: "initiative_chat_not_found",
      initiative_id: initiativeId,
    });
    return new Response("Initiative not found", { status: 404 });
  }

  logger.info({
    event: "initiative_chat_context_loaded",
    organization_id: organizationId,
    initiative_id: initiativeId,
  });
  const [
    team,
    canvases,
    externalLinks,
    pages,
    linkedFeaturesRaw,
    linkedGroupsRaw,
    linkedProductsRaw,
  ] = await Promise.all([
    database
      .select({ userId: tables.initiativeMember.userId })
      .from(tables.initiativeMember)
      .where(eq(tables.initiativeMember.initiativeId, initiativeId)),
    database
      .select({ title: tables.initiativeCanvas.title })
      .from(tables.initiativeCanvas)
      .where(eq(tables.initiativeCanvas.initiativeId, initiativeId)),
    database
      .select({
        title: tables.initiativeExternalLink.title,
        href: tables.initiativeExternalLink.href,
      })
      .from(tables.initiativeExternalLink)
      .where(eq(tables.initiativeExternalLink.initiativeId, initiativeId)),
    database
      .select({
        title: tables.initiativePage.title,
        default: tables.initiativePage.default,
        content: tables.initiativePage.content,
      })
      .from(tables.initiativePage)
      .where(eq(tables.initiativePage.initiativeId, initiativeId)),
    database
      .select({ title: tables.feature.title })
      .from(tables.featureToInitiative)
      .innerJoin(
        tables.feature,
        eq(tables.feature.id, tables.featureToInitiative.a)
      )
      .where(eq(tables.featureToInitiative.b, initiativeId)),
    database
      .select({ id: tables.group.id, name: tables.group.name })
      .from(tables.groupToInitiative)
      .innerJoin(tables.group, eq(tables.group.id, tables.groupToInitiative.a))
      .where(eq(tables.groupToInitiative.b, initiativeId)),
    database
      .select({ id: tables.product.id, name: tables.product.name })
      .from(tables.initiativeToProduct)
      .innerJoin(
        tables.product,
        eq(tables.product.id, tables.initiativeToProduct.b)
      )
      .where(eq(tables.initiativeToProduct.a, initiativeId)),
  ]);

  const groupIds = linkedGroupsRaw.map((group) => group.id);
  const productIds = linkedProductsRaw.map((product) => product.id);

  const [groupFeaturesRaw, productFeaturesRaw, productGroupsRaw] =
    await Promise.all([
      groupIds.length
        ? database
            .select({
              groupId: tables.feature.groupId,
              title: tables.feature.title,
            })
            .from(tables.feature)
            .where(inArray(tables.feature.groupId, groupIds))
        : Promise.resolve([]),
      productIds.length
        ? database
            .select({
              productId: tables.feature.productId,
              title: tables.feature.title,
            })
            .from(tables.feature)
            .where(inArray(tables.feature.productId, productIds))
        : Promise.resolve([]),
      productIds.length
        ? database
            .select({
              id: tables.group.id,
              name: tables.group.name,
              productId: tables.group.productId,
            })
            .from(tables.group)
            .where(inArray(tables.group.productId, productIds))
        : Promise.resolve([]),
    ]);

  const productGroupIds = productGroupsRaw.map((group) => group.id);
  const productGroupFeaturesRaw = productGroupIds.length
    ? await database
        .select({
          groupId: tables.feature.groupId,
          title: tables.feature.title,
        })
        .from(tables.feature)
        .where(inArray(tables.feature.groupId, productGroupIds))
    : [];

  const initiativeWithRelations = {
    ...initiative,
    team,
    canvases,
    externalLinks,
    pages,
    features: linkedFeaturesRaw,
    groups: linkedGroupsRaw.map((group) => ({
      name: group.name,
      features: groupFeaturesRaw
        .filter((feature) => feature.groupId === group.id)
        .map((feature) => ({ title: feature.title })),
    })),
    products: linkedProductsRaw.map((product) => ({
      name: product.name,
      features: productFeaturesRaw
        .filter((feature) => feature.productId === product.id)
        .map((feature) => ({ title: feature.title })),
      groups: productGroupsRaw
        .filter((group) => group.productId === product.id)
        .map((group) => ({
          name: group.name,
          features: productGroupFeaturesRaw
            .filter((feature) => feature.groupId === group.id)
            .map((feature) => ({ title: feature.title })),
        })),
    })),
  };
  const owner = members.find((member) => member.id === initiative.ownerId);
  const creator = members.find((member) => member.id === initiative.creatorId);
  const participants = members.filter((member) =>
    initiativeWithRelations.team.some(
      (teamMember) => teamMember.userId === member.id
    )
  );
  const linkedFeatures = [
    ...initiativeWithRelations.features,
    ...initiativeWithRelations.groups.flatMap((group) => group.features),
    ...initiativeWithRelations.products.flatMap((product) => product.features),
  ];

  logger.info({
    event: "initiative_chat_participants_resolved",
    organization_id: organizationId,
    initiative_id: initiativeId,
    participant_count: participants.length,
  });
  const defaultPageContent = initiativeWithRelations.pages.find(
    (page) => page.default
  )?.content;
  const nonDefaultPagesContent = initiativeWithRelations.pages
    .filter((page) => !page.default)
    .map((page) => {
      const content = page.content;

      if (!content) {
        return null;
      }

      return `${page.title}: ${contentToText(content)}`;
    });

  logger.info({
    event: "initiative_chat_prompt_build_start",
    organization_id: organizationId,
    initiative_id: initiativeId,
  });
  const prompt = [
    "You are a helpful assistant that answers questions about a company's product initiative.",
    `The company is called "${organization.name}" and the initiative is called "${initiative.title}".`,
    "Here are all the details about the initiative:",
    `- Created At: ${initiative.createdAt}`,
    `- Created By: ${creator ? getUserName(creator) : "Unknown"}`,
    `- Owner: ${owner ? getUserName(owner) : "Unknown"}`,
    `- Participants: ${participants.map((participant) => getUserName(participant)).join(", ")}`,
    `- Status: ${initiative.state}`,
    `- Emoji: ${initiative.emoji}`,
    `- Linked Features: ${linkedFeatures.map((feature) => feature.title).join(", ")}`,
    `- Linked Products: ${initiativeWithRelations.products.map((product) => product.name).join(", ")}`,
    `- Linked Groups: ${initiativeWithRelations.groups.map((group) => group.name).join(", ")}`,
    `- Canvases: ${initiativeWithRelations.canvases.map((canvas) => canvas.title).join(", ")}`,
    `- External Links: ${initiativeWithRelations.externalLinks.map((link) => `${link.title}: ${link.href}`).join(", ")}`,
    `- Description: ${defaultPageContent ? contentToText(defaultPageContent) : "None"}`,
    "---",
    "The following is a list of the pages in the initiative:",
    nonDefaultPagesContent.filter(Boolean).join("\n"),
  ].join("\n");

  logger.info({
    event: "initiative_chat_stream_start",
    organization_id: organizationId,
    initiative_id: initiativeId,
  });
  const result = streamText({
    model: "openai/gpt-5-nano",
    system: prompt,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
};
