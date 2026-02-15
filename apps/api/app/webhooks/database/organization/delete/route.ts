import type { tables } from "@repo/backend/database";
import { logger } from "@repo/lib/logger";

export const maxDuration = 300;
export const revalidate = 0;
export const dynamic = "force-dynamic";

type DeletePayload = {
  type: "DELETE";
  table: string;
  schema: string;
  record: null;
  old_record: typeof tables.organization.$inferSelect;
};

export const POST = async (request: Request): Promise<Response> => {
  const body = (await request.json()) as DeletePayload;

  logger.info({
    event: "database_organization_deleted",
    organization_id: body.old_record.id,
  });

  return new Response("Organization deleted", { status: 201 });
};
