CREATE TYPE "public"."canny_import_job_status" AS ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILURE');--> statement-breakpoint
CREATE TYPE "public"."canny_import_job_type" AS ENUM('STATUSES', 'BOARDS', 'CATEGORIES', 'TAGS', 'COMPANIES', 'USERS', 'POSTS', 'CHANGELOGS', 'VOTES', 'COMMENTS', 'STATUS_CHANGES');--> statement-breakpoint
CREATE TYPE "public"."changelog_status" AS ENUM('DRAFT', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."eve_conversation_message_role" AS ENUM('user', 'assistant', 'system', 'function', 'data', 'tool');--> statement-breakpoint
CREATE TYPE "public"."eve_conversation_message_type" AS ENUM('answer', 'related', 'skip', 'inquiry', 'input', 'input_related', 'tool', 'followup', 'end');--> statement-breakpoint
CREATE TYPE "public"."feature_connection_platform" AS ENUM('JIRA', 'LINEAR', 'GITHUB');--> statement-breakpoint
CREATE TYPE "public"."feature_source" AS ENUM('UI', 'API', 'ZAPIER', 'SLACK', 'INTERCOM', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."feedback_aiSentiment" AS ENUM('POSITIVE', 'NEGATIVE', 'NEUTRAL', 'ANGRY', 'CONFUSED', 'INFORMATIVE');--> statement-breakpoint
CREATE TYPE "public"."feedback_organization_source" AS ENUM('UI', 'API', 'ZAPIER', 'SLACK', 'INTERCOM', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."feedback_source" AS ENUM('UI', 'API', 'ZAPIER', 'SLACK', 'INTERCOM', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."feedback_user_source" AS ENUM('UI', 'API', 'ZAPIER', 'SLACK', 'INTERCOM', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."initiative_state" AS ENUM('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."installation_field_mapping_internalId" AS ENUM('STARTAT', 'ENDAT', 'OWNERID');--> statement-breakpoint
CREATE TYPE "public"."installation_field_mapping_internalType" AS ENUM('STRING', 'DATE', 'NUMBER');--> statement-breakpoint
CREATE TYPE "public"."installation_state_platform" AS ENUM('LINEAR', 'SLACK', 'INTERCOM', 'ATLASSIAN');--> statement-breakpoint
CREATE TYPE "public"."organization_membership_role" AS ENUM('MEMBER', 'EDITOR', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."organization_onboardingType" AS ENUM('EXAMPLE', 'IMPORT', 'BLANK');--> statement-breakpoint
CREATE TYPE "public"."productboard_import_job_status" AS ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILURE');--> statement-breakpoint
CREATE TYPE "public"."productboard_import_job_type" AS ENUM('PRODUCTS', 'COMPONENTS', 'FEATURE_STATUSES', 'FEATURES', 'CUSTOM_FIELDS', 'CUSTOM_FIELD_VALUES', 'COMPANIES', 'DOMAINS', 'USERS', 'TAGS', 'NOTES', 'NOTE_TAGS', 'RELEASES', 'FEATURE_RELEASE_ASSIGNMENTS', 'JIRA_CONNECTIONS', 'NOTE_CONNECTIONS');--> statement-breakpoint
CREATE TYPE "public"."release_state" AS ENUM('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "ai_feature_rice" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"reach" integer NOT NULL,
	"impact" integer NOT NULL,
	"confidence" integer NOT NULL,
	"effort" integer NOT NULL,
	"reachReason" text NOT NULL,
	"impactReason" text NOT NULL,
	"confidenceReason" text NOT NULL,
	"effortReason" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_key" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"key" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "atlassian_installation" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"accessToken" text NOT NULL,
	"email" text NOT NULL,
	"siteUrl" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canny_import" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"token" text NOT NULL,
	"creatorId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canny_import_job" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"importId" varchar(191) NOT NULL,
	"order" integer NOT NULL,
	"type" "canny_import_job_type" NOT NULL,
	"status" "canny_import_job_status" DEFAULT 'PENDING' NOT NULL,
	"finishedAt" timestamp (6) with time zone,
	"error" varchar(191),
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelog" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"publishAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"status" "changelog_status" DEFAULT 'DRAFT' NOT NULL,
	"example" boolean DEFAULT false NOT NULL,
	"cannyId" varchar(191),
	"slug" varchar(191),
	"fromMarkdown" boolean DEFAULT false,
	"content" json,
	"vector" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "changelog_contributor" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"changelogId" varchar(191) NOT NULL,
	"userId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changelog_tag" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"fromCanny" boolean DEFAULT false,
	"fromMarkdown" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "_ChangelogToChangelogTag" (
	"A" varchar(191) NOT NULL,
	"B" varchar(191) NOT NULL,
	CONSTRAINT "_ChangelogToChangelogTag_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "digest" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"text" text NOT NULL,
	"summary" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "driver" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"description" varchar(191) NOT NULL,
	"color" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"ownerId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"title" text NOT NULL,
	"riceId" varchar(191),
	"aiRiceId" varchar(191),
	"connectionId" varchar(191),
	"startAt" timestamp (6) with time zone,
	"endAt" timestamp (6) with time zone,
	"productboardId" varchar(191),
	"productId" varchar(191),
	"groupId" varchar(191),
	"parentFeatureId" varchar(191),
	"statusId" varchar(191) NOT NULL,
	"source" "feature_source" DEFAULT 'UI' NOT NULL,
	"apiKeyId" varchar(191),
	"example" boolean DEFAULT false NOT NULL,
	"cannyId" varchar(191),
	"templateId" varchar(191),
	"canvas" json,
	"releaseId" varchar(191),
	"content" json,
	"vector" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "feature_assignment" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"userId" varchar(191) NOT NULL,
	"roleId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_assignment_role" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"description" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_connection" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"externalId" varchar(191) NOT NULL,
	"href" varchar(191) NOT NULL,
	"type" "feature_connection_platform" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_custom_field" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"productboardId" varchar(191),
	"description" varchar(191),
	"name" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_custom_field_value" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"value" text NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"customFieldId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_driver" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"driverId" varchar(191) NOT NULL,
	"value" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_rice" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"reach" integer NOT NULL,
	"impact" integer NOT NULL,
	"confidence" integer NOT NULL,
	"effort" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_status" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"color" varchar(191) DEFAULT '#8b5cf6' NOT NULL,
	"order" integer NOT NULL,
	"complete" boolean DEFAULT false NOT NULL,
	"productboardId" varchar(191),
	"fromCanny" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "_FeatureToInitiative" (
	"A" varchar(191) NOT NULL,
	"B" varchar(191) NOT NULL,
	CONSTRAINT "_FeatureToInitiative_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "_FeatureToTag" (
	"A" varchar(191) NOT NULL,
	"B" varchar(191) NOT NULL,
	CONSTRAINT "_FeatureToTag_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"title" text NOT NULL,
	"content" json NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"feedbackUserId" varchar(191),
	"aiSentiment" "feedback_aiSentiment",
	"aiSentimentReason" text,
	"productboardId" varchar(191),
	"source" "feedback_source" DEFAULT 'UI' NOT NULL,
	"apiKeyId" varchar(191),
	"processed" boolean DEFAULT false NOT NULL,
	"example" boolean DEFAULT false NOT NULL,
	"cannyId" varchar(191),
	"slackMessagePublishedAt" timestamp (6) with time zone,
	"videoUrl" varchar(191),
	"audioUrl" varchar(191),
	"transcript" json,
	"transcribedAt" timestamp (6) with time zone,
	"vector" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "feedback_analysis" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"feedbackId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"outcomes" text,
	"painPoints" text,
	"recommendations" text,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "feedback_feature_link" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"feedbackId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "feedback_organization" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"name" varchar(191) NOT NULL,
	"domain" varchar(191),
	"organizationId" varchar(191) NOT NULL,
	"productboardId" varchar(191),
	"source" "feedback_organization_source" DEFAULT 'UI' NOT NULL,
	"apiKeyId" varchar(191),
	"example" boolean DEFAULT false NOT NULL,
	"cannyId" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "_FeedbackToTag" (
	"A" varchar(191) NOT NULL,
	"B" varchar(191) NOT NULL,
	CONSTRAINT "_FeedbackToTag_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "feedback_user" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"email" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"imageUrl" varchar(191) NOT NULL,
	"role" varchar(191),
	"organizationId" varchar(191) NOT NULL,
	"feedbackOrganizationId" varchar(191),
	"productboardId" varchar(191),
	"source" "feedback_user_source" DEFAULT 'UI' NOT NULL,
	"apiKeyId" varchar(191),
	"example" boolean DEFAULT false NOT NULL,
	"cannyId" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "github_installation" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"installationId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"ownerId" varchar(191),
	"name" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"productId" varchar(191),
	"parentGroupId" varchar(191),
	"productboardId" varchar(191),
	"emoji" varchar(191) DEFAULT 'package' NOT NULL,
	"cannyId" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "_GroupToInitiative" (
	"A" varchar(191) NOT NULL,
	"B" varchar(191) NOT NULL,
	CONSTRAINT "_GroupToInitiative_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "initiative" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"ownerId" varchar(191) NOT NULL,
	"emoji" varchar(191) DEFAULT 'rocket' NOT NULL,
	"state" "initiative_state" DEFAULT 'ACTIVE' NOT NULL,
	"example" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_canvas" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"content" json NOT NULL,
	"initiativeId" varchar(191) NOT NULL,
	"organizationId" varchar(191),
	"example" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_external_link" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"href" varchar(191) NOT NULL,
	"initiativeId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_file" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"name" varchar(191) NOT NULL,
	"url" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"initiativeId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_member" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"userId" varchar(191) NOT NULL,
	"initiativeId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initiative_page" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"initiativeId" varchar(191) NOT NULL,
	"organizationId" varchar(191),
	"default" boolean DEFAULT false NOT NULL,
	"example" boolean DEFAULT false NOT NULL,
	"content" json
);
--> statement-breakpoint
CREATE TABLE "_InitiativeToProduct" (
	"A" varchar(191) NOT NULL,
	"B" varchar(191) NOT NULL,
	CONSTRAINT "_InitiativeToProduct_AB_pkey" PRIMARY KEY("A","B")
);
--> statement-breakpoint
CREATE TABLE "initiative_update" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"content" json NOT NULL,
	"initiativeId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"sendEmail" boolean DEFAULT true NOT NULL,
	"sendSlack" boolean DEFAULT false NOT NULL,
	"emailSentAt" timestamp (6) with time zone,
	"slackSentAt" timestamp (6) with time zone
);
--> statement-breakpoint
CREATE TABLE "installation_field_mapping" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"externalId" varchar(191) NOT NULL,
	"internalId" "installation_field_mapping_internalId" NOT NULL,
	"externalType" varchar(191) NOT NULL,
	"internalType" "installation_field_mapping_internalType" NOT NULL,
	"type" "feature_connection_platform" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installation_state" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"platform" "installation_state_platform" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installation_status_mapping" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureStatusId" varchar(191) NOT NULL,
	"eventType" varchar(191) NOT NULL,
	"eventId" varchar(191),
	"type" "feature_connection_platform" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intercom_installation" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"appId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linear_installation" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"apiKey" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logoUrl" text,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"productDescription" text,
	"onboardedAt" timestamp (6) with time zone,
	"slug" text NOT NULL,
	"onboardingType" "organization_onboardingType"
);
--> statement-breakpoint
CREATE TABLE "portal" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"slug" varchar(191) NOT NULL,
	"enableRoadmap" boolean DEFAULT true NOT NULL,
	"enableChangelog" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_feature" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"title" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"featureId" varchar(191) NOT NULL,
	"portalId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"cannyId" varchar(191),
	"content" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_feature_status_change" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"userId" varchar(191),
	"comment" varchar(191),
	"cannyId" varchar(191),
	"organizationId" varchar(191) NOT NULL,
	"portalFeatureId" varchar(191) NOT NULL,
	"portalStatusId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_feature_vote" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"portalFeatureId" varchar(191) NOT NULL,
	"portalId" varchar(191) NOT NULL,
	"feedbackUserId" varchar(191) NOT NULL,
	"cannyId" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "portal_status" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"color" varchar(191) DEFAULT '#8b5cf6' NOT NULL,
	"order" integer NOT NULL,
	"portalId" varchar(191) NOT NULL,
	"fromCanny" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "portal_status_mapping" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"portalId" varchar(191) NOT NULL,
	"featureStatusId" varchar(191) NOT NULL,
	"portalStatusId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"ownerId" varchar(191),
	"organizationId" varchar(191) NOT NULL,
	"emoji" varchar(191) DEFAULT 'package' NOT NULL,
	"productboardId" varchar(191),
	"example" boolean DEFAULT false NOT NULL,
	"cannyId" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "productboard_import" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"token" text NOT NULL,
	"creatorId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productboard_import_job" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"importId" varchar(191) NOT NULL,
	"order" integer NOT NULL,
	"type" "productboard_import_job_type" NOT NULL,
	"status" "productboard_import_job_status" DEFAULT 'PENDING' NOT NULL,
	"finishedAt" timestamp (6) with time zone,
	"error" text,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "release" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191),
	"title" text NOT NULL,
	"description" text,
	"productboardId" varchar(191),
	"endAt" timestamp (6) with time zone,
	"startAt" timestamp (6) with time zone,
	"state" "release_state" DEFAULT 'PLANNED' NOT NULL,
	"jiraId" varchar(191),
	"example" boolean DEFAULT false NOT NULL,
	"vector" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "roadmap_event" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"text" varchar(191) NOT NULL,
	"date" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slack_installation" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"webhookUrl" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"slug" varchar(191) NOT NULL,
	"description" varchar(191),
	"cannyId" varchar(191)
);
--> statement-breakpoint
CREATE TABLE "template" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"title" varchar(191) NOT NULL,
	"description" varchar(191),
	"content" json
);
--> statement-breakpoint
CREATE TABLE "widget" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL,
	"enableChangelog" boolean DEFAULT true NOT NULL,
	"enableFeedback" boolean DEFAULT true NOT NULL,
	"enablePortal" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widget_item" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"createdAt" timestamp (6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (6) with time zone NOT NULL,
	"widgetId" varchar(191) NOT NULL,
	"organizationId" varchar(191) NOT NULL,
	"name" varchar(191) NOT NULL,
	"link" varchar(191) NOT NULL,
	"icon" varchar(191) NOT NULL,
	"creatorId" varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"organizationId" varchar(191),
	"organizationRole" varchar(32),
	"createdAt" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_32949_ai_feature_rice_featureId_key" ON "ai_feature_rice" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_32949_ai_feature_rice_organizationId_idx" ON "ai_feature_rice" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_32955_api_key_key_key" ON "api_key" USING btree ("key" text_ops);--> statement-breakpoint
CREATE INDEX "idx_32955_api_key_organizationId_idx" ON "api_key" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_32961_atlassian_installation_organizationId_idx" ON "atlassian_installation" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_32980_canny_import_organizationId_idx" ON "canny_import" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_32986_canny_import_job_importId_idx" ON "canny_import_job" USING btree ("importId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_32986_canny_import_job_organizationId_idx" ON "canny_import_job" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_32994_changelog_cannyId_key" ON "changelog" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_32994_changelog_organizationId_slug_key" ON "changelog" USING btree ("organizationId" text_ops,"slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33004_changelog_contributor_changelogId_userId_key" ON "changelog_contributor" USING btree ("changelogId" text_ops,"userId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33004_changelog_contributor_organizationId_idx" ON "changelog_contributor" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33010_changelog_tag_name_organizationId_key" ON "changelog_tag" USING btree ("name" text_ops,"organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33010_changelog_tag_organizationId_idx" ON "changelog_tag" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "_ChangelogToChangelogTag_B_index" ON "_ChangelogToChangelogTag" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33018_digest_organizationId_idx" ON "digest" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33024_driver_organizationId_idx" ON "driver" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33030_feature_aiRiceId_key" ON "feature" USING btree ("aiRiceId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_apiKeyId_idx" ON "feature" USING btree ("apiKeyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33030_feature_cannyId_key" ON "feature" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33030_feature_connectionId_key" ON "feature" USING btree ("connectionId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_groupId_idx" ON "feature" USING btree ("groupId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_organizationId_idx" ON "feature" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_parentFeatureId_idx" ON "feature" USING btree ("parentFeatureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_productId_idx" ON "feature" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33030_feature_productboardId_key" ON "feature" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_releaseId_idx" ON "feature" USING btree ("releaseId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33030_feature_riceId_key" ON "feature" USING btree ("riceId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_statusId_idx" ON "feature" USING btree ("statusId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33030_feature_templateId_idx" ON "feature" USING btree ("templateId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33038_feature_assignment_featureId_idx" ON "feature_assignment" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33038_feature_assignment_organizationId_idx" ON "feature_assignment" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33038_feature_assignment_roleId_idx" ON "feature_assignment" USING btree ("roleId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33044_feature_assignment_role_organizationId_idx" ON "feature_assignment_role" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33050_feature_connection_externalId_idx" ON "feature_connection" USING btree ("externalId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33050_feature_connection_featureId_key" ON "feature_connection" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33050_feature_connection_organizationId_idx" ON "feature_connection" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33056_feature_custom_field_name_organizationId_key" ON "feature_custom_field" USING btree ("name" text_ops,"organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33056_feature_custom_field_organizationId_idx" ON "feature_custom_field" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33056_feature_custom_field_productboardId_key" ON "feature_custom_field" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33062_feature_custom_field_value_customFieldId_idx" ON "feature_custom_field_value" USING btree ("customFieldId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33062_feature_custom_field_value_featureId_idx" ON "feature_custom_field_value" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33062_feature_custom_field_value_organizationId_idx" ON "feature_custom_field_value" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33068_feature_driver_driverId_idx" ON "feature_driver" USING btree ("driverId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33068_feature_driver_featureId_idx" ON "feature_driver" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33068_feature_driver_organizationId_idx" ON "feature_driver" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33074_feature_rice_featureId_key" ON "feature_rice" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33074_feature_rice_organizationId_idx" ON "feature_rice" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33080_feature_status_organizationId_name_key" ON "feature_status" USING btree ("organizationId" text_ops,"name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33080_feature_status_productboardId_key" ON "feature_status" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE INDEX "_FeatureToInitiative_B_index" ON "_FeatureToInitiative" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "_FeatureToTag_B_index" ON "_FeatureToTag" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33089_feedback_apiKeyId_idx" ON "feedback" USING btree ("apiKeyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33089_feedback_cannyId_key" ON "feedback" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33089_feedback_feedbackUserId_idx" ON "feedback" USING btree ("feedbackUserId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33089_feedback_organizationId_idx" ON "feedback" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33089_feedback_productboardId_key" ON "feedback" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33098_feedback_analysis_feedbackId_key" ON "feedback_analysis" USING btree ("feedbackId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33098_feedback_analysis_organizationId_idx" ON "feedback_analysis" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33104_feedback_feature_link_featureId_idx" ON "feedback_feature_link" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33104_feedback_feature_link_feedbackId_idx" ON "feedback_feature_link" USING btree ("feedbackId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33104_feedback_feature_link_organizationId_idx" ON "feedback_feature_link" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33110_feedback_organization_apiKeyId_idx" ON "feedback_organization" USING btree ("apiKeyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33110_feedback_organization_cannyId_key" ON "feedback_organization" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33110_feedback_organization_domain_organizationId_key" ON "feedback_organization" USING btree ("domain" text_ops,"organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33110_feedback_organization_organizationId_idx" ON "feedback_organization" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33110_feedback_organization_productboardId_key" ON "feedback_organization" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE INDEX "_FeedbackToTag_B_index" ON "_FeedbackToTag" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33118_feedback_user_apiKeyId_idx" ON "feedback_user" USING btree ("apiKeyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33118_feedback_user_cannyId_key" ON "feedback_user" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33118_feedback_user_email_organizationId_key" ON "feedback_user" USING btree ("email" text_ops,"organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33118_feedback_user_feedbackOrganizationId_idx" ON "feedback_user" USING btree ("feedbackOrganizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33118_feedback_user_organizationId_idx" ON "feedback_user" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33118_feedback_user_productboardId_key" ON "feedback_user" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33126_github_installation_installationId_key" ON "github_installation" USING btree ("installationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33126_github_installation_organizationId_idx" ON "github_installation" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33132_group_cannyId_key" ON "group" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33132_group_organizationId_idx" ON "group" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33132_group_parentGroupId_idx" ON "group" USING btree ("parentGroupId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33132_group_productId_idx" ON "group" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33132_group_productboardId_key" ON "group" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE INDEX "_GroupToInitiative_B_index" ON "_GroupToInitiative" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33139_initiative_organizationId_idx" ON "initiative" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33148_initiative_canvas_initiativeId_idx" ON "initiative_canvas" USING btree ("initiativeId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33148_initiative_canvas_organizationId_idx" ON "initiative_canvas" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33155_initiative_external_link_initiativeId_idx" ON "initiative_external_link" USING btree ("initiativeId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33155_initiative_external_link_organizationId_idx" ON "initiative_external_link" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33161_initiative_file_initiativeId_idx" ON "initiative_file" USING btree ("initiativeId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33161_initiative_file_organizationId_idx" ON "initiative_file" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33167_initiative_member_initiativeId_idx" ON "initiative_member" USING btree ("initiativeId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33167_initiative_member_organizationId_idx" ON "initiative_member" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33167_initiative_member_userId_initiativeId_key" ON "initiative_member" USING btree ("userId" text_ops,"initiativeId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33173_initiative_page_initiativeId_idx" ON "initiative_page" USING btree ("initiativeId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33173_initiative_page_organizationId_idx" ON "initiative_page" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "_InitiativeToProduct_B_index" ON "_InitiativeToProduct" USING btree ("B" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33181_initiative_update_initiativeId_idx" ON "initiative_update" USING btree ("initiativeId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33181_initiative_update_organizationId_idx" ON "initiative_update" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33189_installation_field_mapping_organizationId_externalId_" ON "installation_field_mapping" USING btree ("organizationId" text_ops,"externalId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33195_installation_state_organizationId_idx" ON "installation_state" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33201_installation_status_mapping_featureStatusId_idx" ON "installation_status_mapping" USING btree ("featureStatusId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33201_installation_status_mapping_organizationId_featureSta" ON "installation_status_mapping" USING btree ("organizationId" text_ops,"featureStatusId" text_ops,"eventType" text_ops,"eventId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33207_intercom_installation_organizationId_idx" ON "intercom_installation" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33213_linear_installation_organizationId_idx" ON "linear_installation" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33225_portal_organizationId_idx" ON "portal" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33225_portal_slug_key" ON "portal" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33233_portal_feature_cannyId_key" ON "portal_feature" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33233_portal_feature_featureId_key" ON "portal_feature" USING btree ("featureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33233_portal_feature_organizationId_idx" ON "portal_feature" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33233_portal_feature_portalId_idx" ON "portal_feature" USING btree ("portalId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33239_portal_feature_status_change_cannyId_key" ON "portal_feature_status_change" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33239_portal_feature_status_change_organizationId_idx" ON "portal_feature_status_change" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33239_portal_feature_status_change_portalFeatureId_idx" ON "portal_feature_status_change" USING btree ("portalFeatureId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33239_portal_feature_status_change_portalStatusId_idx" ON "portal_feature_status_change" USING btree ("portalStatusId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33245_portal_feature_vote_cannyId_key" ON "portal_feature_vote" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33245_portal_feature_vote_feedbackUserId_idx" ON "portal_feature_vote" USING btree ("feedbackUserId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33245_portal_feature_vote_organizationId_idx" ON "portal_feature_vote" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33245_portal_feature_vote_portalFeatureId_feedbackUserId_ke" ON "portal_feature_vote" USING btree ("portalFeatureId" text_ops,"feedbackUserId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33245_portal_feature_vote_portalId_idx" ON "portal_feature_vote" USING btree ("portalId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33251_portal_status_organizationId_name_key" ON "portal_status" USING btree ("organizationId" text_ops,"name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33251_portal_status_portalId_idx" ON "portal_status" USING btree ("portalId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33259_portal_status_mapping_featureStatusId_idx" ON "portal_status_mapping" USING btree ("featureStatusId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33259_portal_status_mapping_organizationId_idx" ON "portal_status_mapping" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33259_portal_status_mapping_portalId_featureStatusId_key" ON "portal_status_mapping" USING btree ("portalId" text_ops,"featureStatusId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33259_portal_status_mapping_portalStatusId_idx" ON "portal_status_mapping" USING btree ("portalStatusId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33265_product_cannyId_key" ON "product" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33265_product_organizationId_idx" ON "product" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33265_product_productboardId_key" ON "product" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33273_productboard_import_organizationId_idx" ON "productboard_import" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33279_productboard_import_job_importId_idx" ON "productboard_import_job" USING btree ("importId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33279_productboard_import_job_organizationId_idx" ON "productboard_import_job" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33287_release_jiraId_key" ON "release" USING btree ("jiraId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33287_release_organizationId_idx" ON "release" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33287_release_productboardId_key" ON "release" USING btree ("productboardId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33295_roadmap_event_organizationId_date_text_key" ON "roadmap_event" USING btree ("organizationId" text_ops,"date" text_ops,"text" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33301_slack_installation_organizationId_idx" ON "slack_installation" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33307_tag_cannyId_key" ON "tag" USING btree ("cannyId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33307_tag_organizationId_idx" ON "tag" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "idx_33307_tag_slug_organizationId_key" ON "tag" USING btree ("slug" text_ops,"organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33313_template_organizationId_idx" ON "template" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33319_widget_organizationId_idx" ON "widget" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33328_widget_item_organizationId_idx" ON "widget_item" USING btree ("organizationId" text_ops);--> statement-breakpoint
CREATE INDEX "idx_33328_widget_item_widgetId_idx" ON "widget_item" USING btree ("widgetId" text_ops);