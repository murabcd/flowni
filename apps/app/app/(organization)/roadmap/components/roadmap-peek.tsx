import { getUserName } from "@repo/backend/auth/format";
import type {
  Feature,
  FeatureStatus,
  Group,
  Initiative,
  Product,
} from "@repo/backend/types";
import { Avatar } from "@repo/design-system/components/precomposed/avatar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@repo/design-system/components/ui/sheet";
import type { JSONContent } from "@repo/editor";
import { formatDate } from "@repo/lib/format";
import { ClockIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { FeatureEditor } from "../../features/[feature]/(notes)/components/feature-editor";

type RoadmapPeekProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editable: boolean;
  feature:
    | (Pick<Feature, "id" | "ownerId" | "title" | "content"> & {
        readonly startAt: Date;
        readonly endAt: Date | null;
        readonly status: Pick<
          FeatureStatus,
          "color" | "complete" | "id" | "name" | "order"
        >;
        readonly group: Pick<Group, "id" | "name"> | null;
        readonly product: Pick<Product, "id" | "name"> | null;
        readonly initiatives: Pick<Initiative, "id" | "title">[];
      })
    | undefined;
  readonly owner?: {
    readonly id: string;
    readonly email?: string | null;
    readonly name?: string | null;
    readonly image?: string | null;
  };
};

export const RoadmapPeek = ({
  open,
  onOpenChange,
  feature,
  owner,
  editable,
}: RoadmapPeekProps) => {
  const name = owner ? getUserName(owner) : undefined;

  return (
    <Sheet modal={false} onOpenChange={onOpenChange} open={open}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-2xl">{feature?.title}</SheetTitle>
          <SheetDescription className="sr-only">A feature.</SheetDescription>
        </SheetHeader>
        <Button
          asChild
          className="absolute top-1.5 right-8"
          size="icon"
          variant="link"
        >
          <Link href={`/features/${feature?.id}`} target="_blank">
            <ExternalLinkIcon className="text-muted-foreground" size={14} />
          </Link>
        </Button>
        <div className="my-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-2.5 py-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: feature?.status.color,
              }}
            />
            <p className="text-xs">{feature?.status.name}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-2.5 py-1.5">
            <ClockIcon className="text-muted-foreground" size={16} />
            <div className="flex items-center gap-1 text-xs">
              {feature ? formatDate(feature.startAt) : ""}
              {feature?.endAt ? ` - ${formatDate(feature.endAt)}` : ""}
            </div>
          </div>
          {owner ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-2.5 py-1.5">
              <Avatar
                fallback={name?.slice(0, 2)}
                size={16}
                src={owner.image ?? undefined}
              />
              <p className="text-xs">{name}</p>
            </div>
          ) : null}
        </div>

        {feature?.content ? (
          <FeatureEditor
            className="prose-sm"
            defaultValue={feature.content as JSONContent}
            editable={editable}
            featureId={feature.id}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
};
