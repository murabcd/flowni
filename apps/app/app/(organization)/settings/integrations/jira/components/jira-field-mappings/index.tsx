import { createClient } from "@repo/atlassian";
import { database, tables } from "@repo/backend/database";
import { StackCard } from "@repo/design-system/components/stack-card";
import { eq } from "drizzle-orm";
import {
  ArrowRightIcon,
  DotIcon,
  LinkIcon,
  RocketIcon,
  TextIcon,
} from "lucide-react";
import { JiraFieldMappingTable } from "./jira-field-mapping-table";

const fixedFields = [
  {
    internal: "Release",
    external: "Fix Version",
    icon: RocketIcon,
  },
  {
    internal: "Title",
    external: "Summary",
    icon: TextIcon,
  },
  {
    internal: "Description",
    external: "Description",
    icon: TextIcon,
  },
  {
    internal: "Status",
    external: "Status",
    icon: DotIcon,
  },
];

export const JiraFieldMappings = async () => {
  const [installation, fieldMappings] = await Promise.all([
    database
      .select({
        id: tables.atlassianInstallation.id,
        accessToken: tables.atlassianInstallation.accessToken,
        email: tables.atlassianInstallation.email,
        siteUrl: tables.atlassianInstallation.siteUrl,
      })
      .from(tables.atlassianInstallation)
      .limit(1)
      .then((rows) => rows[0] ?? null),
    database
      .select({
        id: tables.installationFieldMapping.id,
        internalId: tables.installationFieldMapping.internalId,
        externalId: tables.installationFieldMapping.externalId,
      })
      .from(tables.installationFieldMapping)
      .where(eq(tables.installationFieldMapping.type, "JIRA")),
  ]);

  if (!installation) {
    return <div />;
  }

  const atlassian = createClient(installation);
  const jiraFields = await atlassian.GET("/rest/api/2/field");

  return (
    <StackCard className="px-0 py-1.5" icon={LinkIcon} title="Field Mappings">
      <div>
        {fixedFields.map((field) => (
          <div
            className="flex items-center justify-between gap-3 px-3 py-1.5"
            key={field.internal}
          >
            <div className="flex-1">
              <div className="flex h-9 w-full items-center gap-2 rounded-md border bg-secondary p-3 text-sm shadow-sm">
                <field.icon className="text-muted-foreground" size={16} />
                {field.external}
              </div>
            </div>
            <div className="flex h-9 shrink-0 items-center justify-center">
              <ArrowRightIcon className="text-muted-foreground" size={16} />
            </div>
            <div className="flex-1">
              <div className="flex h-9 w-full items-center gap-2 rounded-md border bg-secondary p-3 text-sm shadow-sm">
                <field.icon className="text-muted-foreground" size={16} />
                {field.internal}
              </div>
            </div>
          </div>
        ))}
      </div>
      <JiraFieldMappingTable
        fieldMappings={fieldMappings}
        installationId={installation.id}
        jiraFields={
          jiraFields.data
            ?.filter((field) => field.schema?.type)
            .filter((field) => field.custom)
            .map((field) => ({
              label: field.name ?? "",
              value: field.id ?? "",
              type: field.schema?.type ?? "",
            })) ?? []
        }
      />
    </StackCard>
  );
};
