"use client";

import type { tables } from "@repo/backend/database";
import { Dialog } from "@repo/design-system/components/precomposed/dialog";
import { cn } from "@repo/design-system/lib/utils";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useState } from "react";
import JiraImage from "../../public/jira.svg";
import { JiraSelector } from "./jira";
import { useConnectForm } from "./use-connect-form";

type ConnectFormProperties = {
  readonly jiraAccessToken:
    | (typeof tables.atlassianInstallation.$inferSelect)["accessToken"]
    | undefined;
};

const platformOptions: {
  label: string;
  value: string;
  image: StaticImageData;
}[] = [{ label: "Jira", value: "JIRA", image: JiraImage as StaticImageData }];

export const ConnectForm = ({ jiraAccessToken }: ConnectFormProperties) => {
  const { isOpen, toggle } = useConnectForm();
  const [platform, setPlatform] = useState<string | undefined>();

  return (
    <Dialog
      description="Link this feature to a delivery app to track progress."
      modal={false}
      onOpenChange={toggle}
      open={isOpen}
      title="Connect feature"
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="grid w-full grid-cols-3 gap-4">
          {platformOptions.map((option) => (
            <button
              className={cn(
                "space-y-2 rounded border bg-card p-4",
                platform === option.value ? "bg-secondary" : "bg-background"
              )}
              key={option.value}
              onClick={() => setPlatform(option.value)}
              type="button"
            >
              <Image
                alt={option.label}
                className="mx-auto"
                height={32}
                src={option.image}
                width={32}
              />
              <span className="pointer-events-none mt-2 block select-none font-medium text-sm">
                {option.label}
              </span>
            </button>
          ))}
        </div>
        {platform === "JIRA" ? (
          <JiraSelector jiraAccessToken={jiraAccessToken} />
        ) : null}
      </div>
    </Dialog>
  );
};
