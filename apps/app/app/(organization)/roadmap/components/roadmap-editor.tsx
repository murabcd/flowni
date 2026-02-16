"use client";

import type {
  Feature,
  FeatureStatus,
  Group,
  Initiative,
  Product,
  Release,
  RoadmapEvent,
} from "@repo/backend/types";
import {
  GanttCreateMarkerTrigger,
  type GanttFeature,
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttMarker,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
} from "@repo/design-system/components/kibo-ui/gantt";
import { Select } from "@repo/design-system/components/precomposed/select";
import { Stepper } from "@repo/design-system/components/stepper";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@repo/design-system/components/ui/context-menu";
import { useCopyToClipboard } from "@repo/design-system/hooks/use-copy-to-clipboard";
import { handleError } from "@repo/design-system/lib/handle-error";
import { toast } from "@repo/design-system/lib/toast";
import { createFuse } from "@repo/lib/fuse";
import { EyeIcon, LinkIcon, TrashIcon } from "lucide-react";
import { parseAsString, useQueryState } from "next-usequerystate";
import { useMemo, useState } from "react";
import { updateFeature } from "@/actions/feature/update";
import { deleteMarker } from "@/actions/roadmap-event/delete";
import { FeatureItemInner } from "@/components/roadmap-item";
import { StatusLegend } from "@/components/status-legend";
import { useRoadmap } from "@/hooks/use-roadmap";
import type { MemberInfo } from "@/lib/serialization";
import { RoadmapAddFeature } from "./roadmap-add-feature";
import { RoadmapMarkerDialog } from "./roadmap-marker-dialog";
import { RoadmapPeek } from "./roadmap-peek";
import { RoadmapSearch } from "./roadmap-search";

const ranges: {
  label: string;
  value: string;
}[] = [
  { label: "Daily", value: "daily" },
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
];

const groupings = [
  { label: "Feature", value: "feature" },
  { label: "Product", value: "product" },
  { label: "Group", value: "group" },
  { label: "Owner", value: "owner" },
  { label: "Release", value: "release" },
];

const filters = [
  {
    label: "Incomplete",
    value: "incomplete",
  },
  {
    label: "Complete",
    value: "complete",
  },
  {
    label: "All Features",
    value: "all",
  },
];

const filterRoadmapFeatures = (
  data: RoadmapEditorProperties["features"],
  filter: "incomplete" | "complete" | "all"
) => {
  if (filter === "incomplete") {
    return data.filter((feature) => !feature.status.complete);
  }

  if (filter === "complete") {
    return data.filter((feature) => feature.status.complete);
  }

  return data;
};

const resolveRoadmapGroupKey = (
  feature: RoadmapEditorProperties["features"][number],
  grouping: "feature" | "product" | "group" | "owner" | "release"
) => {
  if (grouping === "group") {
    return feature.group?.name ?? "Ungrouped";
  }

  if (grouping === "product") {
    return feature.product?.name ?? "No Product";
  }

  if (grouping === "release") {
    return feature.release?.title ?? "No Release";
  }

  return "All Features";
};

const buildRoadmapGroups = (
  data: RoadmapEditorProperties["features"],
  grouping: "feature" | "product" | "group" | "owner" | "release"
) => {
  const groupedData: Record<string, GanttFeature[]> = {};

  for (const feature of data) {
    const groupKey = resolveRoadmapGroupKey(feature, grouping);

    groupedData[groupKey] ??= [];
    groupedData[groupKey].push({
      id: feature.id,
      name: feature.title,
      startAt: feature.startAt,
      endAt: feature.endAt ?? new Date(),
      status: feature.status,
    });
  }

  return Object.fromEntries(
    [...Object.entries(groupedData)].sort(([nameA], [nameB]) =>
      nameA.localeCompare(nameB)
    )
  );
};

export type RoadmapEditorProperties = {
  readonly allFeatures: (Pick<Feature, "id" | "title"> & {
    readonly status: Pick<FeatureStatus, "color">;
  })[];
  readonly features: (Pick<Feature, "id" | "ownerId" | "title" | "content"> & {
    readonly startAt: Date;
    readonly endAt: Date | null;
    readonly status: Pick<
      FeatureStatus,
      "color" | "complete" | "id" | "name" | "order"
    >;
    readonly group: Pick<Group, "id" | "name"> | null;
    readonly product: Pick<Product, "id" | "name"> | null;
    readonly release: Pick<Release, "id" | "title"> | null;
    readonly initiatives: Pick<Initiative, "id" | "title">[];
  })[];
  readonly markers: (Pick<RoadmapEvent, "id" | "text"> & { date: Date })[];
  readonly editable: boolean;
  readonly members: MemberInfo[];
};

export const RoadmapEditor = ({
  features,
  allFeatures,
  markers,
  editable,
  members,
}: RoadmapEditorProperties) => {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const featuresFuse = createFuse(features, ["title", "text"]);
  const searchResults = featuresFuse.search(search);
  const roadmap = useRoadmap();
  const statuses: RoadmapEditorProperties["features"][number]["status"][] = [];
  const [newFeatureDate, setNewFeatureDate] = useState<Date | undefined>(
    undefined
  );
  const [newMarkerDate, setNewMarkerDate] = useState<Date | undefined>(
    undefined
  );
  const { copyToClipboard } = useCopyToClipboard();

  const groups = useMemo(() => {
    const data = search ? searchResults.map(({ item }) => item) : features;
    const filteredData = filterRoadmapFeatures(data, roadmap.filter);
    return buildRoadmapGroups(filteredData, roadmap.grouping);
  }, [features, roadmap.filter, roadmap.grouping, search, searchResults]);

  for (const feature of features) {
    if (!statuses.some((status) => status.id === feature.status.id)) {
      statuses.push(feature.status);
    }
  }

  const handleMoveFeature = async (
    id: string,
    startAt: Date,
    endAt: Date | null
  ) => {
    try {
      const response = await updateFeature(id, {
        startAt: startAt.toISOString(),
        endAt: endAt ? endAt.toISOString() : null,
      });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    try {
      const response = await updateFeature(featureId, {
        startAt: null,
        endAt: null,
      });

      if ("error" in response) {
        throw new Error(response.error);
      }

      toast.success("Successfully removed feature from roadmap");
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemoveMarker = async (markerId: string) => {
    try {
      const response = await deleteMarker(markerId);

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Successfully removed marker from roadmap");
    } catch (error) {
      handleError(error);
    }
  };

  const handleViewFeature = (id: string) =>
    setTimeout(() => roadmap.setPeekId(id), 200);

  const handleCopyLink = (id: string) =>
    copyToClipboard(`${window.location.origin}/features/${id}`);

  const peekFeature = features.find((feature) => feature.id === roadmap.peekId);

  const getOwnerId = (featureId: string) =>
    features.find((feature) => feature.id === featureId)?.ownerId;

  const addItemHandler = editable ? setNewFeatureDate : undefined;
  const moveHandler = editable ? handleMoveFeature : undefined;
  const peekOwner = peekFeature
    ? members.find((member) => member.id === peekFeature.ownerId)
    : undefined;

  return (
    <>
      <div className="flex h-[calc(100vh-57px)] flex-col overflow-clip pb-[45px]">
        <GanttProvider
          onAddItem={addItemHandler}
          range={roadmap.range}
          zoom={roadmap.zoom}
        >
          <GanttSidebar>
            {Object.entries(groups).map(([group, groupFeatures]) => (
              <GanttSidebarGroup key={group} name={group}>
                {groupFeatures.map((feature) => (
                  <GanttSidebarItem
                    feature={feature}
                    key={feature.id}
                    onSelectItem={handleViewFeature}
                  />
                ))}
              </GanttSidebarGroup>
            ))}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {Object.entries(groups).map(([group, groupFeatures]) => (
                <GanttFeatureListGroup key={group}>
                  {groupFeatures.map((feature) => (
                    <div className="flex" key={feature.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <button
                            onClick={() => handleViewFeature(feature.id)}
                            type="button"
                          >
                            <GanttFeatureItem {...feature} onMove={moveHandler}>
                              <FeatureItemInner
                                feature={feature}
                                owner={members.find(
                                  (member) =>
                                    member.id === getOwnerId(feature.id)
                                )}
                              />
                            </GanttFeatureItem>
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleViewFeature(feature.id)}
                          >
                            <EyeIcon
                              className="text-muted-foreground"
                              size={16}
                            />
                            View feature
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleCopyLink(feature.id)}
                          >
                            <LinkIcon
                              className="text-muted-foreground"
                              size={16}
                            />
                            Copy link
                          </ContextMenuItem>
                          {editable ? (
                            <ContextMenuItem
                              className="flex items-center gap-2 text-destructive"
                              onClick={() => handleRemoveFeature(feature.id)}
                            >
                              <TrashIcon size={16} />
                              Remove from roadmap
                            </ContextMenuItem>
                          ) : null}
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                </GanttFeatureListGroup>
              ))}
            </GanttFeatureList>
            {markers.map((marker) => (
              <GanttMarker
                className="bg-success text-white"
                date={marker.date}
                id={marker.id}
                key={marker.id}
                label={marker.text}
                onRemove={handleRemoveMarker}
              />
            ))}
            <GanttToday className="bg-primary text-white" />
            <GanttCreateMarkerTrigger onCreateMarker={setNewMarkerDate} />
          </GanttTimeline>
        </GanttProvider>
        <div className="sticky bottom-0 z-50 flex items-center justify-between gap-3 border-t bg-backdrop/90 p-1 backdrop-blur-sm">
          <RoadmapSearch onChange={setSearch} value={search} />
          <div className="flex grow-1 items-center justify-items-end gap-2">
            <div>
              <Select
                data={groupings}
                onChange={(value) => roadmap.setGrouping(value as never)}
                value={roadmap.grouping}
              />
            </div>
            <div>
              <Select
                data={ranges}
                onChange={(value) => roadmap.setRange(value as never)}
                value={roadmap.range}
              />
            </div>
            <div>
              <Select
                data={filters}
                onChange={(value) => roadmap.setFilter(value as never)}
                value={roadmap.filter}
              />
            </div>
            <div className="w-36">
              <Stepper
                max={200}
                min={50}
                onChange={(value) => roadmap.setZoom(value)}
                step={10}
                suffix="%"
                value={roadmap.zoom}
              />
            </div>
            <StatusLegend statuses={statuses} />
          </div>
        </div>
      </div>
      <RoadmapPeek
        editable={editable}
        feature={peekFeature}
        onOpenChange={() => roadmap.setPeekId(null)}
        open={Boolean(peekFeature)}
        owner={peekOwner}
      />
      <RoadmapAddFeature
        defaultValue={newFeatureDate}
        features={allFeatures}
        open={Boolean(newFeatureDate)}
        setOpen={(isOpen: boolean) => {
          if (!isOpen) {
            setNewFeatureDate(undefined);
          }
        }}
      />
      <RoadmapMarkerDialog
        date={newMarkerDate}
        open={Boolean(newMarkerDate)}
        setOpen={() => setNewMarkerDate(undefined)}
      />
    </>
  );
};
