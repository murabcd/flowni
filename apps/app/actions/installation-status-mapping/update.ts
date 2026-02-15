"use server";

import { tables } from "@repo/backend/database";
import { parseError } from "@repo/lib/parse-error";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { database } from "@/lib/database";

export const updateInstallationStatusMapping = async (
  connectionId: (typeof tables.installationStatusMapping.$inferSelect)["id"],
  data: Partial<typeof tables.installationStatusMapping.$inferSelect>
): Promise<{
  error?: string;
}> => {
  try {
    await database
      .update(tables.installationStatusMapping)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tables.installationStatusMapping.id, connectionId));

    revalidatePath("/settings/integrations/jira");

    return {};
  } catch (error) {
    const message = parseError(error);

    return { error: message };
  }
};
