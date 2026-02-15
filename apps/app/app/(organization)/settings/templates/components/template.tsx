import {
  database,
  getJsonColumnFromTable,
  tables,
} from "@repo/backend/database";
import type { Template as TemplateClass } from "@repo/backend/types";
import { eq } from "drizzle-orm";
import { Template } from "@/app/(organization)/features/[feature]/(notes)/components/template";
import { TemplateSettings } from "./template-settings";

type TemplateComponentProperties = {
  readonly id: TemplateClass["id"];
};

export const TemplateComponent = async ({
  id,
}: TemplateComponentProperties) => {
  const template = await database
    .select({
      id: tables.template.id,
      title: tables.template.title,
      description: tables.template.description,
    })
    .from(tables.template)
    .where(eq(tables.template.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!template) {
    return null;
  }

  const content = await getJsonColumnFromTable(
    "template",
    "content",
    template.id
  );

  return (
    <Template
      active={false}
      content={content}
      description={template.description}
      id={template.id}
      title={template.title}
    >
      <TemplateSettings
        defaultDescription={template.description}
        defaultTitle={template.title}
        templateId={template.id}
      />
    </Template>
  );
};
