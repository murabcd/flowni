import type { Release } from "@repo/backend/types";
import { Link } from "@repo/design-system/components/link";
import { formatDate } from "@repo/lib/format";
import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { ReleaseStateDot } from "./release-state-dot";

type ReleaseItemProps = {
  release: Pick<
    Release,
    "id" | "title" | "startAt" | "endAt" | "state" | "jiraId"
  >;
};

export const ReleaseItem = ({ release }: ReleaseItemProps) =>
  (() => {
    const hasStart = Boolean(release.startAt);
    const hasEnd = Boolean(release.endAt);
    const showStartLabel = hasStart && !hasEnd;
    const showEndLabel = hasEnd && !hasStart;
    const showRangeLabel = hasStart && hasEnd;

    return (
      <Link
        className="flex items-center gap-3 py-4"
        href={`/releases/${release.id}`}
        key={release.id}
      >
        <ReleaseStateDot state={release.state} />
        <h2 className="m-0 flex-1 truncate font-semibold">{release.title}</h2>
        <div className="flex shrink-0 items-center gap-1 text-muted-foreground text-sm">
          {showStartLabel ? <span>Starts</span> : null}
          {hasStart && release.startAt ? (
            <span>{formatDate(new Date(release.startAt))}</span>
          ) : null}
          {showRangeLabel ? <span>to</span> : null}
          {showEndLabel ? <span>Ends</span> : null}
          {hasEnd && release.endAt ? (
            <span>{formatDate(new Date(release.endAt))}</span>
          ) : null}
        </div>
        {release.jiraId ? (
          <Image alt="" height={16} src="/jira.svg" width={16} />
        ) : null}
        <ArrowRightIcon className="shrink-0 text-muted-foreground" size={16} />
      </Link>
    );
  })();
