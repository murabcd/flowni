import { database, tables } from "@repo/backend/database";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const GET = async (request: NextRequest): Promise<Response> => {
  const authorization = request.headers.get("Authorization");
  const key = authorization?.split("Bearer ")[1];

  if (!key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = await database
    .select({ organizationName: tables.organization.name })
    .from(tables.apiKey)
    .innerJoin(
      tables.organization,
      eq(tables.organization.id, tables.apiKey.organizationId)
    )
    .where(eq(tables.apiKey.key, key))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!apiKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    organization: apiKey.organizationName,
  });
};
