import {
  currentMembers,
  currentOrganizationId,
} from "@repo/backend/auth/utils";
import { database, tables } from "@repo/backend/database";
import { StackCard } from "@repo/design-system/components/stack-card";
import { desc, eq } from "drizzle-orm";
import { FrameIcon, NotebookIcon, PaperclipIcon } from "lucide-react";
import { InitiativePageCard } from "./initiative-page-card";

export const NewInitiativePages = async () => {
  const organizationId = await currentOrganizationId();

  if (!organizationId) {
    return <div />;
  }

  const [pages, canvases, members] = await Promise.all([
    database
      .select({
        id: tables.initiativePage.id,
        title: tables.initiativePage.title,
        createdAt: tables.initiativePage.createdAt,
        creatorId: tables.initiativePage.creatorId,
        initiativeId: tables.initiativePage.initiativeId,
      })
      .from(tables.initiativePage)
      .where(eq(tables.initiativePage.organizationId, organizationId))
      .orderBy(desc(tables.initiativePage.createdAt))
      .limit(5),
    database
      .select({
        id: tables.initiativeCanvas.id,
        title: tables.initiativeCanvas.title,
        createdAt: tables.initiativeCanvas.createdAt,
        creatorId: tables.initiativeCanvas.creatorId,
        initiativeId: tables.initiativeCanvas.initiativeId,
      })
      .from(tables.initiativeCanvas)
      .where(eq(tables.initiativeCanvas.organizationId, organizationId))
      .orderBy(desc(tables.initiativeCanvas.createdAt))
      .limit(5),
    currentMembers(),
  ]);

  const getOwner = (userId: string) =>
    members.find((member) => member.id === userId);

  const pagesData = pages.map((page) => ({
    id: `${page.initiativeId}/${page.id}`,
    title: page.title,
    date: new Date(page.createdAt),
    icon: () => <NotebookIcon className="text-muted-foreground" size={16} />,
    owner: getOwner(page.creatorId),
  }));

  const canvasesData = canvases.map((canvas) => ({
    id: `${canvas.initiativeId}/${canvas.id}`,
    title: canvas.title,
    date: new Date(canvas.createdAt),
    icon: () => <FrameIcon className="text-muted-foreground" size={16} />,
    owner: getOwner(canvas.creatorId),
  }));

  const data = [...pagesData, ...canvasesData].sort(
    (itemA, itemB) =>
      new Date(itemB.date).getTime() - new Date(itemA.date).getTime()
  );

  return (
    <StackCard
      className="p-0"
      icon={PaperclipIcon}
      title="New Initiative Pages"
    >
      <div className="flex flex-col gap-px p-1">
        {data.map((item) => (
          <InitiativePageCard key={item.id} {...item} />
        ))}
      </div>
    </StackCard>
  );
};
