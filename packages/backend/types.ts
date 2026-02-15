import type { tables } from "./database";

export type ApiKey = typeof tables.apiKey.$inferSelect;
export type AiFeatureRice = typeof tables.aiFeatureRice.$inferSelect;
export type AtlassianInstallation =
  typeof tables.atlassianInstallation.$inferSelect;
export type Changelog = typeof tables.changelog.$inferSelect;
export type ChangelogTag = typeof tables.changelogTag.$inferSelect;
export type Feature = typeof tables.feature.$inferSelect;
export type FeatureConnection = typeof tables.featureConnection.$inferSelect;
export type FeatureRice = typeof tables.featureRice.$inferSelect;
export type FeatureStatus = typeof tables.featureStatus.$inferSelect;
export type Feedback = typeof tables.feedback.$inferSelect;
export type FeedbackFeatureLink =
  typeof tables.feedbackFeatureLink.$inferSelect;
export type FeedbackOrganization =
  typeof tables.feedbackOrganization.$inferSelect;
export type FeedbackUser = typeof tables.feedbackUser.$inferSelect;
export type Group = typeof tables.group.$inferSelect;
export type Initiative = typeof tables.initiative.$inferSelect;
export type InitiativeCanvas = typeof tables.initiativeCanvas.$inferSelect;
export type InitiativeExternalLink =
  typeof tables.initiativeExternalLink.$inferSelect;
export type InitiativeFile = typeof tables.initiativeFile.$inferSelect;
export type InitiativeMember = typeof tables.initiativeMember.$inferSelect;
export type InitiativePage = typeof tables.initiativePage.$inferSelect;
export type InitiativeUpdate = typeof tables.initiativeUpdate.$inferSelect;
export type InstallationFieldMapping =
  typeof tables.installationFieldMapping.$inferSelect;
export type InstallationStatusMapping =
  typeof tables.installationStatusMapping.$inferSelect;
export type Organization = typeof tables.organization.$inferSelect;
export type Product = typeof tables.product.$inferSelect;
export type Release = typeof tables.release.$inferSelect;
export type RoadmapEvent = typeof tables.roadmapEvent.$inferSelect;
export type Template = typeof tables.template.$inferSelect;

export type feature_source = (typeof tables.feature.$inferSelect)["source"];
export type feedback_source = (typeof tables.feedback.$inferSelect)["source"];
export type release_state = (typeof tables.release.$inferSelect)["state"];
export type initiative_state = (typeof tables.initiative.$inferSelect)["state"];
