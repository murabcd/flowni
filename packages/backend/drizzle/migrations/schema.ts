import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export const cannyImportJobStatus = pgEnum("canny_import_job_status", [
  "PENDING",
  "RUNNING",
  "SUCCESS",
  "FAILURE",
]);
export const cannyImportJobType = pgEnum("canny_import_job_type", [
  "STATUSES",
  "BOARDS",
  "CATEGORIES",
  "TAGS",
  "COMPANIES",
  "USERS",
  "POSTS",
  "CHANGELOGS",
  "VOTES",
  "COMMENTS",
  "STATUS_CHANGES",
]);
export const changelogStatus = pgEnum("changelog_status", [
  "DRAFT",
  "PUBLISHED",
]);
export const eveConversationMessageRole = pgEnum(
  "eve_conversation_message_role",
  ["user", "assistant", "system", "function", "data", "tool"]
);
export const eveConversationMessageType = pgEnum(
  "eve_conversation_message_type",
  [
    "answer",
    "related",
    "skip",
    "inquiry",
    "input",
    "input_related",
    "tool",
    "followup",
    "end",
  ]
);
export const featureConnectionPlatform = pgEnum("feature_connection_platform", [
  "JIRA",
  "LINEAR",
  "GITHUB",
]);
export const featureSource = pgEnum("feature_source", [
  "UI",
  "API",
  "ZAPIER",
  "SLACK",
  "INTERCOM",
  "EMAIL",
]);
export const feedbackAiSentiment = pgEnum("feedback_aiSentiment", [
  "POSITIVE",
  "NEGATIVE",
  "NEUTRAL",
  "ANGRY",
  "CONFUSED",
  "INFORMATIVE",
]);
export const feedbackOrganizationSource = pgEnum(
  "feedback_organization_source",
  ["UI", "API", "ZAPIER", "SLACK", "INTERCOM", "EMAIL"]
);
export const feedbackSource = pgEnum("feedback_source", [
  "UI",
  "API",
  "ZAPIER",
  "SLACK",
  "INTERCOM",
  "EMAIL",
]);
export const feedbackUserSource = pgEnum("feedback_user_source", [
  "UI",
  "API",
  "ZAPIER",
  "SLACK",
  "INTERCOM",
  "EMAIL",
]);
export const initiativeState = pgEnum("initiative_state", [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);
export const installationFieldMappingInternalId = pgEnum(
  "installation_field_mapping_internalId",
  ["STARTAT", "ENDAT", "OWNERID"]
);
export const installationFieldMappingInternalType = pgEnum(
  "installation_field_mapping_internalType",
  ["STRING", "DATE", "NUMBER"]
);
export const installationStatePlatform = pgEnum("installation_state_platform", [
  "LINEAR",
  "SLACK",
  "INTERCOM",
  "ATLASSIAN",
]);
export const organizationMembershipRole = pgEnum(
  "organization_membership_role",
  ["MEMBER", "EDITOR", "ADMIN"]
);
export const organizationOnboardingType = pgEnum(
  "organization_onboardingType",
  ["EXAMPLE", "IMPORT", "BLANK"]
);
export const productboardImportJobStatus = pgEnum(
  "productboard_import_job_status",
  ["PENDING", "RUNNING", "SUCCESS", "FAILURE"]
);
export const productboardImportJobType = pgEnum(
  "productboard_import_job_type",
  [
    "PRODUCTS",
    "COMPONENTS",
    "FEATURE_STATUSES",
    "FEATURES",
    "CUSTOM_FIELDS",
    "CUSTOM_FIELD_VALUES",
    "COMPANIES",
    "DOMAINS",
    "USERS",
    "TAGS",
    "NOTES",
    "NOTE_TAGS",
    "RELEASES",
    "FEATURE_RELEASE_ASSIGNMENTS",
    "JIRA_CONNECTIONS",
    "NOTE_CONNECTIONS",
  ]
);
export const releaseState = pgEnum("release_state", [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const organization = pgTable("organization", {
  id: varchar({ length: 191 }).primaryKey().notNull(),
  name: text().notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", {
    precision: 6,
    withTimezone: true,
    mode: "string",
  })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    precision: 6,
    withTimezone: true,
    mode: "string",
  }).notNull(),
  productDescription: text("product_description"),
  onboardedAt: timestamp("onboarded_at", {
    precision: 6,
    withTimezone: true,
    mode: "string",
  }),
  slug: text().notNull(),
  onboardingType: organizationOnboardingType("onboarding_type"),
});

export const feedbackAnalysis = pgTable(
  "feedback_analysis",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    feedbackId: varchar("feedback_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    outcomes: text(),
    painPoints: text("pain_points"),
    recommendations: text(),
    summary: text(),
  },
  (table) => [
    uniqueIndex("idx_33098_feedback_analysis_feedbackId_key").using(
      "btree",
      table.feedbackId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33098_feedback_analysis_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const feedbackUser = pgTable(
  "feedback_user",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    email: varchar({ length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    imageUrl: varchar("image_url", { length: 191 }).notNull(),
    role: varchar({ length: 191 }),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    feedbackOrganizationId: varchar("feedback_organization_id", {
      length: 191,
    }),
    productboardId: varchar("productboard_id", { length: 191 }),
    source: feedbackUserSource().default("UI").notNull(),
    apiKeyId: varchar("api_key_id", { length: 191 }),
    cannyId: varchar("canny_id", { length: 191 }),
  },
  (table) => [
    index("idx_33118_feedback_user_apiKeyId_idx").using(
      "btree",
      table.apiKeyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33118_feedback_user_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33118_feedback_user_email_organizationId_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33118_feedback_user_feedbackOrganizationId_idx").using(
      "btree",
      table.feedbackOrganizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33118_feedback_user_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33118_feedback_user_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const feedbackOrganization = pgTable(
  "feedback_organization",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    domain: varchar({ length: 191 }),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    productboardId: varchar("productboard_id", { length: 191 }),
    source: feedbackOrganizationSource().default("UI").notNull(),
    apiKeyId: varchar("api_key_id", { length: 191 }),
    cannyId: varchar("canny_id", { length: 191 }),
  },
  (table) => [
    index("idx_33110_feedback_organization_apiKeyId_idx").using(
      "btree",
      table.apiKeyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33110_feedback_organization_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex(
      "idx_33110_feedback_organization_domain_organizationId_key"
    ).using(
      "btree",
      table.domain.asc().nullsLast().op("text_ops"),
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33110_feedback_organization_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33110_feedback_organization_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const feedbackFeatureLink = pgTable(
  "feedback_feature_link",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    feedbackId: varchar("feedback_id", { length: 191 }).notNull(),
    featureId: varchar("feature_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }),
  },
  (table) => [
    index("idx_33104_feedback_feature_link_featureId_idx").using(
      "btree",
      table.featureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33104_feedback_feature_link_feedbackId_idx").using(
      "btree",
      table.feedbackId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33104_feedback_feature_link_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const initiative = pgTable(
  "initiative",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    title: varchar({ length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    ownerId: varchar("owner_id", { length: 191 }).notNull(),
    emoji: varchar({ length: 191 }).default("rocket").notNull(),
    state: initiativeState().default("ACTIVE").notNull(),
  },
  (table) => [
    index("idx_33139_initiative_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const initiativeExternalLink = pgTable(
  "initiative_external_link",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    title: varchar({ length: 191 }).notNull(),
    href: varchar({ length: 191 }).notNull(),
    initiativeId: varchar("initiative_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
  },
  (table) => [
    index("idx_33155_initiative_external_link_initiativeId_idx").using(
      "btree",
      table.initiativeId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33155_initiative_external_link_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const initiativeMember = pgTable(
  "initiative_member",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    initiativeId: varchar("initiative_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
  },
  (table) => [
    index("idx_33167_initiative_member_initiativeId_idx").using(
      "btree",
      table.initiativeId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33167_initiative_member_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33167_initiative_member_userId_initiativeId_key").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.initiativeId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const initiativePage = pgTable(
  "initiative_page",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    title: varchar({ length: 191 }).notNull(),
    initiativeId: varchar("initiative_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }),
    default: boolean().default(false).notNull(),
    content: jsonb().$type<JsonValue>(),
  },
  (table) => [
    index("idx_33173_initiative_page_initiativeId_idx").using(
      "btree",
      table.initiativeId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33173_initiative_page_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const initiativeCanvas = pgTable(
  "initiative_canvas",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    title: varchar({ length: 191 }).notNull(),
    content: jsonb().$type<JsonValue>().notNull(),
    initiativeId: varchar("initiative_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }),
  },
  (table) => [
    index("idx_33148_initiative_canvas_initiativeId_idx").using(
      "btree",
      table.initiativeId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33148_initiative_canvas_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const initiativeUpdate = pgTable(
  "initiative_update",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    title: varchar({ length: 191 }).notNull(),
    content: jsonb().$type<JsonValue>().notNull(),
    initiativeId: varchar("initiative_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    sendEmail: boolean("send_email").default(true).notNull(),
    sendSlack: boolean("send_slack").default(false).notNull(),
    emailSentAt: timestamp("email_sent_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    slackSentAt: timestamp("slack_sent_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    index("idx_33181_initiative_update_initiativeId_idx").using(
      "btree",
      table.initiativeId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33181_initiative_update_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const product = pgTable(
  "product",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    ownerId: varchar("owner_id", { length: 191 }),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    emoji: varchar({ length: 191 }).default("package").notNull(),
    productboardId: varchar("productboard_id", { length: 191 }),
    cannyId: varchar("canny_id", { length: 191 }),
  },
  (table) => [
    uniqueIndex("idx_33265_product_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33265_product_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33265_product_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureConnection = pgTable(
  "feature_connection",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    featureId: varchar("feature_id", { length: 191 }).notNull(),
    externalId: varchar("external_id", { length: 191 }).notNull(),
    href: varchar({ length: 191 }).notNull(),
    type: featureConnectionPlatform().notNull(),
  },
  (table) => [
    index("idx_33050_feature_connection_externalId_idx").using(
      "btree",
      table.externalId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33050_feature_connection_featureId_key").using(
      "btree",
      table.featureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33050_feature_connection_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const group = pgTable(
  "group",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    ownerId: varchar("owner_id", { length: 191 }),
    name: varchar({ length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    productId: varchar("product_id", { length: 191 }),
    parentGroupId: varchar("parent_group_id", { length: 191 }),
    productboardId: varchar("productboard_id", { length: 191 }),
    emoji: varchar({ length: 191 }).default("package").notNull(),
    cannyId: varchar("canny_id", { length: 191 }),
  },
  (table) => [
    uniqueIndex("idx_33132_group_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33132_group_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33132_group_parentGroupId_idx").using(
      "btree",
      table.parentGroupId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33132_group_productId_idx").using(
      "btree",
      table.productId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33132_group_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const feature = pgTable(
  "feature",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    ownerId: varchar("owner_id", { length: 191 }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    title: text().notNull(),
    riceId: varchar("rice_id", { length: 191 }),
    aiRiceId: varchar("ai_rice_id", { length: 191 }),
    connectionId: varchar("connection_id", { length: 191 }),
    startAt: timestamp("start_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    endAt: timestamp("end_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    productboardId: varchar("productboard_id", { length: 191 }),
    productId: varchar("product_id", { length: 191 }),
    groupId: varchar("group_id", { length: 191 }),
    parentFeatureId: varchar("parent_feature_id", { length: 191 }),
    statusId: varchar("status_id", { length: 191 }).notNull(),
    source: featureSource().default("UI").notNull(),
    apiKeyId: varchar("api_key_id", { length: 191 }),
    cannyId: varchar("canny_id", { length: 191 }),
    templateId: varchar("template_id", { length: 191 }),
    canvas: jsonb().$type<JsonValue>(),
    releaseId: varchar("release_id", { length: 191 }),
    content: jsonb().$type<JsonValue>(),
    vector: vector({ dimensions: 1536 }),
  },
  (table) => [
    uniqueIndex("idx_33030_feature_aiRiceId_key").using(
      "btree",
      table.aiRiceId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_apiKeyId_idx").using(
      "btree",
      table.apiKeyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33030_feature_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33030_feature_connectionId_key").using(
      "btree",
      table.connectionId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_groupId_idx").using(
      "btree",
      table.groupId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_parentFeatureId_idx").using(
      "btree",
      table.parentFeatureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_productId_idx").using(
      "btree",
      table.productId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33030_feature_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_releaseId_idx").using(
      "btree",
      table.releaseId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33030_feature_riceId_key").using(
      "btree",
      table.riceId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_statusId_idx").using(
      "btree",
      table.statusId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33030_feature_templateId_idx").using(
      "btree",
      table.templateId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const aiFeatureRice = pgTable(
  "ai_feature_rice",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    featureId: varchar("feature_id", { length: 191 }).notNull(),
    reach: integer().notNull(),
    impact: integer().notNull(),
    confidence: integer().notNull(),
    effort: integer().notNull(),
    reachReason: text("reach_reason").notNull(),
    impactReason: text("impact_reason").notNull(),
    confidenceReason: text("confidence_reason").notNull(),
    effortReason: text("effort_reason").notNull(),
  },
  (table) => [
    uniqueIndex("idx_32949_ai_feature_rice_featureId_key").using(
      "btree",
      table.featureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_32949_ai_feature_rice_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const tag = pgTable(
  "tag",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    slug: varchar({ length: 191 }).notNull(),
    description: varchar({ length: 191 }),
    cannyId: varchar("canny_id", { length: 191 }),
  },
  (table) => [
    uniqueIndex("idx_33307_tag_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33307_tag_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33307_tag_slug_organizationId_key").using(
      "btree",
      table.slug.asc().nullsLast().op("text_ops"),
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureAssignment = pgTable(
  "feature_assignment",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    featureId: varchar("feature_id", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 191 }).notNull(),
    roleId: varchar("role_id", { length: 191 }).notNull(),
  },
  (table) => [
    index("idx_33038_feature_assignment_featureId_idx").using(
      "btree",
      table.featureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33038_feature_assignment_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33038_feature_assignment_roleId_idx").using(
      "btree",
      table.roleId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const driver = pgTable(
  "driver",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    description: varchar({ length: 191 }).notNull(),
    color: varchar({ length: 191 }).notNull(),
  },
  (table) => [
    index("idx_33024_driver_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const apiKey = pgTable(
  "api_key",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    key: varchar({ length: 191 }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_32955_api_key_key_key").using(
      "btree",
      table.key.asc().nullsLast().op("text_ops")
    ),
    index("idx_32955_api_key_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const digest = pgTable(
  "digest",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    text: text().notNull(),
    summary: text().notNull(),
  },
  (table) => [
    index("idx_33018_digest_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureAssignmentRole = pgTable(
  "feature_assignment_role",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    description: varchar({ length: 191 }).notNull(),
  },
  (table) => [
    index("idx_33044_feature_assignment_role_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const installationFieldMapping = pgTable(
  "installation_field_mapping",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    externalId: varchar("external_id", { length: 191 }).notNull(),
    internalId: installationFieldMappingInternalId("internal_id").notNull(),
    externalType: varchar("external_type", { length: 191 }).notNull(),
    internalType:
      installationFieldMappingInternalType("internal_type").notNull(),
    type: featureConnectionPlatform().notNull(),
  },
  (table) => [
    uniqueIndex(
      "idx_33189_installation_field_mapping_organizationId_externalId_"
    ).using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops"),
      table.externalId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const installationState = pgTable(
  "installation_state",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    platform: installationStatePlatform().notNull(),
  },
  (table) => [
    index("idx_33195_installation_state_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const installationStatusMapping = pgTable(
  "installation_status_mapping",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    featureStatusId: varchar("feature_status_id", { length: 191 }).notNull(),
    eventType: varchar("event_type", { length: 191 }).notNull(),
    eventId: varchar("event_id", { length: 191 }),
    type: featureConnectionPlatform().notNull(),
  },
  (table) => [
    index("idx_33201_installation_status_mapping_featureStatusId_idx").using(
      "btree",
      table.featureStatusId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex(
      "idx_33201_installation_status_mapping_organizationId_featureSta"
    ).using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops"),
      table.featureStatusId.asc().nullsLast().op("text_ops"),
      table.eventType.asc().nullsLast().op("text_ops"),
      table.eventId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const atlassianInstallation = pgTable(
  "atlassian_installation",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    accessToken: text("access_token").notNull(),
    email: text().notNull(),
    siteUrl: text("site_url").notNull(),
  },
  (table) => [
    index("idx_32961_atlassian_installation_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const changelogContributor = pgTable(
  "changelog_contributor",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    changelogId: varchar("changelog_id", { length: 191 }).notNull(),
    userId: varchar("user_id", { length: 191 }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_33004_changelog_contributor_changelogId_userId_key").using(
      "btree",
      table.changelogId.asc().nullsLast().op("text_ops"),
      table.userId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33004_changelog_contributor_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const changelogTag = pgTable(
  "changelog_tag",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    fromCanny: boolean("from_canny").default(false),
    fromMarkdown: boolean("from_markdown").default(false),
  },
  (table) => [
    uniqueIndex("idx_33010_changelog_tag_name_organizationId_key").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops"),
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33010_changelog_tag_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const roadmapEvent = pgTable(
  "roadmap_event",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    text: varchar({ length: 191 }).notNull(),
    date: timestamp({
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_33295_roadmap_event_organizationId_date_text_key").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops"),
      table.date.asc().nullsLast().op("text_ops"),
      table.text.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const release = pgTable(
  "release",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }),
    title: text().notNull(),
    description: text(),
    productboardId: varchar("productboard_id", { length: 191 }),
    endAt: timestamp("end_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    startAt: timestamp("start_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    state: releaseState().default("PLANNED").notNull(),
    jiraId: varchar("jira_id", { length: 191 }),
    vector: vector({ dimensions: 1536 }),
  },
  (table) => [
    uniqueIndex("idx_33287_release_jiraId_key").using(
      "btree",
      table.jiraId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33287_release_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33287_release_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const template = pgTable(
  "template",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    title: varchar({ length: 191 }).notNull(),
    description: varchar({ length: 191 }),
    content: jsonb().$type<JsonValue>(),
  },
  (table) => [
    index("idx_33313_template_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureRice = pgTable(
  "feature_rice",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    featureId: varchar("feature_id", { length: 191 }).notNull(),
    reach: integer().notNull(),
    impact: integer().notNull(),
    confidence: integer().notNull(),
    effort: integer().notNull(),
  },
  (table) => [
    uniqueIndex("idx_33074_feature_rice_featureId_key").using(
      "btree",
      table.featureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33074_feature_rice_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureStatus = pgTable(
  "feature_status",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    color: varchar({ length: 191 }).default("#8b5cf6").notNull(),
    order: integer().notNull(),
    complete: boolean().default(false).notNull(),
    productboardId: varchar("productboard_id", { length: 191 }),
    fromCanny: boolean("from_canny").default(false),
  },
  (table) => [
    uniqueIndex("idx_33080_feature_status_organizationId_name_key").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops"),
      table.name.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33080_feature_status_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const initiativeFile = pgTable(
  "initiative_file",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    name: varchar({ length: 191 }).notNull(),
    url: varchar({ length: 191 }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    initiativeId: varchar("initiative_id", { length: 191 }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
  },
  (table) => [
    index("idx_33161_initiative_file_initiativeId_idx").using(
      "btree",
      table.initiativeId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33161_initiative_file_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureCustomField = pgTable(
  "feature_custom_field",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    productboardId: varchar("productboard_id", { length: 191 }),
    description: varchar({ length: 191 }),
    name: varchar({ length: 191 }).notNull(),
  },
  (table) => [
    uniqueIndex("idx_33056_feature_custom_field_name_organizationId_key").using(
      "btree",
      table.name.asc().nullsLast().op("text_ops"),
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33056_feature_custom_field_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33056_feature_custom_field_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureCustomFieldValue = pgTable(
  "feature_custom_field_value",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    value: text().notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    featureId: varchar("feature_id", { length: 191 }).notNull(),
    customFieldId: varchar("custom_field_id", { length: 191 }).notNull(),
  },
  (table) => [
    index("idx_33062_feature_custom_field_value_customFieldId_idx").using(
      "btree",
      table.customFieldId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33062_feature_custom_field_value_featureId_idx").using(
      "btree",
      table.featureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33062_feature_custom_field_value_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const featureDriver = pgTable(
  "feature_driver",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    featureId: varchar("feature_id", { length: 191 }).notNull(),
    driverId: varchar("driver_id", { length: 191 }).notNull(),
    value: integer().notNull(),
  },
  (table) => [
    index("idx_33068_feature_driver_driverId_idx").using(
      "btree",
      table.driverId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33068_feature_driver_featureId_idx").using(
      "btree",
      table.featureId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33068_feature_driver_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const changelog = pgTable(
  "changelog",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    publishAt: timestamp("publish_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    title: varchar({ length: 191 }).notNull(),
    creatorId: varchar("creator_id", { length: 191 }).notNull(),
    status: changelogStatus().default("DRAFT").notNull(),
    cannyId: varchar("canny_id", { length: 191 }),
    slug: varchar({ length: 191 }),
    fromMarkdown: boolean("from_markdown").default(false),
    content: jsonb().$type<JsonValue>(),
    vector: vector({ dimensions: 1536 }),
  },
  (table) => [
    uniqueIndex("idx_32994_changelog_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_32994_changelog_organizationId_slug_key").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops"),
      table.slug.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const user = pgTable("user", {
  id: varchar({ length: 191 }).primaryKey().notNull(),
  name: text(),
  email: text(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text(),
  organizationId: varchar("organization_id", { length: 191 }),
  organizationRole: varchar("organization_role", { length: 32 }),
  createdAt: timestamp("created_at", {
    precision: 6,
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    precision: 6,
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

export const feedback = pgTable(
  "feedback",
  {
    id: varchar({ length: 191 }).primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }).notNull(),
    title: text().notNull(),
    content: jsonb().$type<JsonValue>().notNull(),
    organizationId: varchar("organization_id", { length: 191 }).notNull(),
    feedbackUserId: varchar("feedback_user_id", { length: 191 }),
    aiSentiment: feedbackAiSentiment("ai_sentiment"),
    aiSentimentReason: text("ai_sentiment_reason"),
    productboardId: varchar("productboard_id", { length: 191 }),
    source: feedbackSource().default("UI").notNull(),
    apiKeyId: varchar("api_key_id", { length: 191 }),
    processed: boolean().default(false).notNull(),
    cannyId: varchar("canny_id", { length: 191 }),
    slackMessagePublishedAt: timestamp("slack_message_published_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    videoUrl: varchar("video_url", { length: 191 }),
    audioUrl: varchar("audio_url", { length: 191 }),
    transcript: jsonb().$type<JsonValue>(),
    transcribedAt: timestamp("transcribed_at", {
      precision: 6,
      withTimezone: true,
      mode: "string",
    }),
    vector: vector({ dimensions: 1536 }),
  },
  (table) => [
    index("idx_33089_feedback_apiKeyId_idx").using(
      "btree",
      table.apiKeyId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33089_feedback_cannyId_key").using(
      "btree",
      table.cannyId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33089_feedback_feedbackUserId_idx").using(
      "btree",
      table.feedbackUserId.asc().nullsLast().op("text_ops")
    ),
    index("idx_33089_feedback_organizationId_idx").using(
      "btree",
      table.organizationId.asc().nullsLast().op("text_ops")
    ),
    uniqueIndex("idx_33089_feedback_productboardId_key").using(
      "btree",
      table.productboardId.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("verification_identifier_idx").using(
      "btree",
      table.identifier.asc().nullsLast().op("text_ops")
    ),
  ]
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  (table) => [
    index("session_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("session_token_unique").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "date",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "date",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (table) => [
    index("account_userId_idx").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ]
);

export const feedbackToTag = pgTable(
  "_feedback_to_tag",
  {
    a: varchar("_a", { length: 191 }).notNull(),
    b: varchar("_b", { length: 191 }).notNull(),
  },
  (table) => [
    index("_FeedbackToTag_B_index").using(
      "btree",
      table.b.asc().nullsLast().op("text_ops")
    ),
    primaryKey({ columns: [table.a, table.b], name: "_FeedbackToTag_AB_pkey" }),
  ]
);

export const initiativeToProduct = pgTable(
  "_initiative_to_product",
  {
    a: varchar("_a", { length: 191 }).notNull(),
    b: varchar("_b", { length: 191 }).notNull(),
  },
  (table) => [
    index("_InitiativeToProduct_B_index").using(
      "btree",
      table.b.asc().nullsLast().op("text_ops")
    ),
    primaryKey({
      columns: [table.a, table.b],
      name: "_InitiativeToProduct_AB_pkey",
    }),
  ]
);

export const featureToInitiative = pgTable(
  "_feature_to_initiative",
  {
    a: varchar("_a", { length: 191 }).notNull(),
    b: varchar("_b", { length: 191 }).notNull(),
  },
  (table) => [
    index("_FeatureToInitiative_B_index").using(
      "btree",
      table.b.asc().nullsLast().op("text_ops")
    ),
    primaryKey({
      columns: [table.a, table.b],
      name: "_FeatureToInitiative_AB_pkey",
    }),
  ]
);

export const groupToInitiative = pgTable(
  "_group_to_initiative",
  {
    a: varchar("_a", { length: 191 }).notNull(),
    b: varchar("_b", { length: 191 }).notNull(),
  },
  (table) => [
    index("_GroupToInitiative_B_index").using(
      "btree",
      table.b.asc().nullsLast().op("text_ops")
    ),
    primaryKey({
      columns: [table.a, table.b],
      name: "_GroupToInitiative_AB_pkey",
    }),
  ]
);

export const changelogToChangelogTag = pgTable(
  "_changelog_to_changelog_tag",
  {
    a: varchar("_a", { length: 191 }).notNull(),
    b: varchar("_b", { length: 191 }).notNull(),
  },
  (table) => [
    index("_ChangelogToChangelogTag_B_index").using(
      "btree",
      table.b.asc().nullsLast().op("text_ops")
    ),
    primaryKey({
      columns: [table.a, table.b],
      name: "_ChangelogToChangelogTag_AB_pkey",
    }),
  ]
);

export const featureToTag = pgTable(
  "_feature_to_tag",
  {
    a: varchar("_a", { length: 191 }).notNull(),
    b: varchar("_b", { length: 191 }).notNull(),
  },
  (table) => [
    index("_FeatureToTag_B_index").using(
      "btree",
      table.b.asc().nullsLast().op("text_ops")
    ),
    primaryKey({ columns: [table.a, table.b], name: "_FeatureToTag_AB_pkey" }),
  ]
);
