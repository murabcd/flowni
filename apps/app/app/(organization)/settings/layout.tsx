import { FlowniRole } from "@repo/backend/auth";
import { currentOrganizationId, currentUser } from "@repo/backend/auth/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@repo/design-system/components/ui/resizable";
import { notFound } from "next/navigation";
import { type ReactNode, Suspense } from "react";
import { SettingsNavigation } from "./components/settings-navigation";

type SettingsLayoutProperties = {
  readonly children: ReactNode;
};

const SettingsLayout = async ({ children }: SettingsLayoutProperties) => {
  const [user, organizationId] = await Promise.all([
    currentUser(),
    currentOrganizationId(),
  ]);

  if (!(user && organizationId) || user.organizationRole !== FlowniRole.Admin) {
    notFound();
  }

  return (
    <ResizablePanelGroup
      className="flex-1"
      direction="horizontal"
      style={{ overflow: "unset" }}
    >
      <ResizablePanel
        className="sticky top-0 h-screen"
        defaultSize={20}
        maxSize={25}
        minSize={15}
        style={{ overflow: "auto" }}
      >
        <Suspense fallback={null}>
          <SettingsNavigation />
        </Suspense>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        className="flex min-h-screen flex-col"
        defaultSize={80}
        style={{ overflow: "unset" }}
      >
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default SettingsLayout;
