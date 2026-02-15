import { createClient } from "@repo/atlassian";
import { database, tables } from "@repo/backend/database";
import { StackCard } from "@repo/design-system/components/stack-card";
import { asc, eq } from "drizzle-orm";
import { LinkIcon } from "lucide-react";
import { JiraStatusMappingTable } from "./jira-status-mapping-table";

export const JiraStatusMappings = async () => {
  const [featureStatuses, installation, statusMappings] = await Promise.all([
    database
      .select({
        id: tables.featureStatus.id,
        name: tables.featureStatus.name,
        color: tables.featureStatus.color,
      })
      .from(tables.featureStatus)
      .orderBy(asc(tables.featureStatus.order)),
    database
      .select({
        id: tables.atlassianInstallation.id,
        accessToken: tables.atlassianInstallation.accessToken,
        siteUrl: tables.atlassianInstallation.siteUrl,
        email: tables.atlassianInstallation.email,
      })
      .from(tables.atlassianInstallation)
      .limit(1)
      .then((rows) => rows[0] ?? null),
    database
      .select({
        id: tables.installationStatusMapping.id,
        eventType: tables.installationStatusMapping.eventType,
        eventId: tables.installationStatusMapping.eventId,
        featureStatusId: tables.installationStatusMapping.featureStatusId,
      })
      .from(tables.installationStatusMapping)
      .where(eq(tables.installationStatusMapping.type, "JIRA"))
      .orderBy(asc(tables.installationStatusMapping.eventType)),
  ]);

  if (!installation) {
    return <div />;
  }

  const atlassian = createClient(installation);
  const jiraStatuses = await atlassian.GET("/rest/api/2/status");

  return (
    <StackCard className="px-0 py-1.5" icon={LinkIcon} title="Status Mappings">
      <JiraStatusMappingTable
        featureStatuses={featureStatuses}
        installationId={installation.id}
        jiraStatuses={
          jiraStatuses.data?.map((jiraStatus) => ({
            label: jiraStatus.name ?? "",
            value: jiraStatus.id ?? "",
            state: jiraStatus.statusCategory?.key,
          })) ?? []
        }
        statusMappings={statusMappings}
      />
    </StackCard>
  );
};
