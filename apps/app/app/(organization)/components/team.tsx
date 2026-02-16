"use client";

import { getUserName } from "@repo/backend/auth/format";
import { createSupabaseBrowserClient } from "@repo/backend/supabase/client";
import { Avatar } from "@repo/design-system/components/precomposed/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { handleError } from "@repo/design-system/lib/handle-error";
import { cn } from "@repo/design-system/lib/utils";
import { useEffect, useState } from "react";
import type { MemberInfo } from "@/lib/serialization";

const ActivityAvatar = ({
  user,
  online,
}: {
  user: MemberInfo;
  online: boolean;
}) => (
  <div className="relative">
    <Avatar fallback={getUserName(user).slice(0, 2)} src={user.image ?? ""} />
    <div
      className={cn(
        "absolute right-0 bottom-0 h-2 w-2 rounded-full ring-2 ring-background",
        online ? "bg-success" : "bg-muted-foreground"
      )}
    />
  </div>
);

export const Team = ({
  user,
  organizationId,
  members,
}: {
  user: MemberInfo;
  organizationId: string;
  members: MemberInfo[];
}) => {
  const [onlineIds, setOnlineIds] = useState<string[]>([]);

  useEffect(() => {
    const initialize = () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const room = supabase.channel(organizationId, {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        room
          .on("presence", { event: "sync" }, () => {
            const newState = room.presenceState();
            const online = Object.keys(newState);

            setOnlineIds(online);
          })
          .subscribe();

        room.track({
          user: user.id,
          online_at: new Date().toISOString(),
        });
      } catch (error) {
        handleError(error);
      }
    };

    initialize();
  }, [organizationId, user.id]);

  const onlineMembers = onlineIds
    .map((id) => members.find((member) => member.id === id))
    .filter(Boolean) as MemberInfo[];
  const offlineMembers = members.filter(
    (member) => !onlineMembers.includes(member)
  );

  const onlineMembersToShow = onlineMembers.slice(0, 4);
  const offlineMembersToShow =
    onlineMembersToShow.length === 4
      ? []
      : offlineMembers.slice(0, 4 - onlineMembersToShow.length);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex cursor-pointer items-center justify-end -space-x-1">
          {onlineMembersToShow.map((onlineUser) => (
            <ActivityAvatar key={onlineUser.id} online user={onlineUser} />
          ))}
          {offlineMembersToShow.map((member) => (
            <ActivityAvatar key={member.id} online={false} user={member} />
          ))}
          {members.length > 5 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-background font-medium text-[10px] text-muted-foreground">
              +{members.length - 5}
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="flex max-h-[220px] flex-col gap-1.5 overflow-y-auto"
        collisionPadding={8}
        sideOffset={8}
      >
        <p className="font-medium text-muted-foreground text-sm">Online</p>
        {onlineMembers.map((member) => (
          <div className="flex items-center gap-2" key={member.id}>
            <ActivityAvatar online user={member} />
            <p className="text-sm">{getUserName(member)}</p>
          </div>
        ))}
        {offlineMembers.length ? (
          <>
            <p className="mt-4 font-medium text-muted-foreground text-sm">
              Offline
            </p>
            {offlineMembers.map((member) => (
              <div className="flex items-center gap-2" key={member.id}>
                <ActivityAvatar online={false} user={member} />
                <p className="text-sm">{getUserName(member)}</p>
              </div>
            ))}
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};
