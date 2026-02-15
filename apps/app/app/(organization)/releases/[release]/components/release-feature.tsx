import type { User } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import {
  database,
  getJsonColumnFromTable,
  tables,
} from "@repo/backend/database";
import type { Feature } from "@repo/backend/types";
import { contentToText } from "@repo/editor/lib/tiptap";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { FeatureItem } from "@/app/(organization)/features/components/feature-item";

type ReleaseFeatureProps = {
  id: Feature["id"];
  owner: User | undefined;
};

export const ReleaseFeature = async ({ id, owner }: ReleaseFeatureProps) => {
  const feature = await database
    .select({
      endAt: tables.feature.endAt,
      id: tables.feature.id,
      ownerId: tables.feature.ownerId,
      startAt: tables.feature.startAt,
      title: tables.feature.title,
    })
    .from(tables.feature)
    .where(eq(tables.feature.id, id))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!feature) {
    return null;
  }

  const content = await getJsonColumnFromTable(
    "feature",
    "content",
    feature.id
  );
  const text = content ? contentToText(content) : "No description yet.";

  return (
    <Suspense fallback={null}>
      <FeatureItem
        feature={{
          endAt: feature.endAt,
          id: feature.id,
          owner: owner
            ? {
                email: owner.email ?? "",
                imageUrl: owner.image ?? "",
                name: getUserName(owner),
              }
            : null,
          ownerId: feature.ownerId,
          startAt: feature.startAt,
          title: feature.title,
          text,
        }}
        key={feature.id}
      />
    </Suspense>
  );
};
