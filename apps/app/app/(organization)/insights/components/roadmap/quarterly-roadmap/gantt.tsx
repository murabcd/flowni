"use client";

import {
  type GanttFeature,
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
} from "@repo/design-system/components/kibo-ui/gantt";
import { useRouter } from "next/navigation";
import { FeatureItemInner } from "@/components/roadmap-item";
import type { MemberInfo } from "@/lib/serialization";

type QuarterlyRoadmapGanttProperties = {
  readonly groups: Record<string, (GanttFeature & { ownerId: string })[]>;
  readonly members: MemberInfo[];
};

export const QuarterlyRoadmapGantt = ({
  groups,
  members,
}: QuarterlyRoadmapGanttProperties) => {
  const router = useRouter();

  const handleSelectItem = (id: string) => router.push(`/features/${id}`);

  return (
    <GanttProvider range="quarterly" zoom={100}>
      <GanttSidebar>
        {Object.entries(groups).map(([group, features]) => (
          <GanttSidebarGroup key={group} name={group}>
            {features.map((feature) => (
              <GanttSidebarItem
                feature={feature}
                key={feature.id}
                onSelectItem={handleSelectItem}
              />
            ))}
          </GanttSidebarGroup>
        ))}
      </GanttSidebar>
      <GanttTimeline>
        <GanttHeader />
        <GanttFeatureList>
          {Object.entries(groups).map(([group, features]) => (
            <GanttFeatureListGroup key={group}>
              {features.map((feature) => (
                <GanttFeatureItem key={feature.id} {...feature}>
                  <FeatureItemInner
                    feature={feature}
                    owner={members.find(
                      (member) => member.id === feature.ownerId
                    )}
                  />
                </GanttFeatureItem>
              ))}
            </GanttFeatureListGroup>
          ))}
        </GanttFeatureList>
      </GanttTimeline>
    </GanttProvider>
  );
};
