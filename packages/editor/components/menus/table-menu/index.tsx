import { DropdownMenu } from "@repo/design-system/components/precomposed/dropdown-menu";
import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { logger, serializeError } from "@repo/lib/logger";
import { parseError } from "@repo/lib/parse-error";
import { useCurrentEditor } from "@tiptap/react";
import type { Rows } from "lucide-react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ColumnsIcon,
  EllipsisIcon,
  EllipsisVerticalIcon,
  RowsIcon,
  TrashIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type TableMenuItem = {
  name: string;
  command: () => void;
  icon: typeof Rows;
  className?: string;
};

export const TableMenu = () => {
  const [tableLocation, setTableLocation] = useState(0);
  const [columnMenuPosition, setColumnMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [rowMenuPosition, setRowMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const { editor } = useCurrentEditor();

  const columnMenuItems: TableMenuItem[] = [
    {
      name: "Add column before",
      command: () => editor?.chain().focus().addColumnBefore().run(),
      icon: ArrowLeftIcon,
    },
    {
      name: "Add column after",
      command: () => editor?.chain().focus().addColumnAfter().run(),
      icon: ArrowRightIcon,
    },
    {
      name: "Delete column",
      command: () => {
        editor?.chain().focus().deleteColumn().run();
      },
      icon: TrashIcon,
      className: "text-destructive",
    },
  ];

  const rowMenuItems: TableMenuItem[] = [
    {
      name: "Add row before",
      command: () => editor?.chain().focus().addRowBefore().run(),
      icon: ArrowUpIcon,
    },
    {
      name: "Add row after",
      command: () => editor?.chain().focus().addRowAfter().run(),
      icon: ArrowDownIcon,
    },
    {
      name: "Delete row",
      command: () => editor?.chain().focus().deleteRow().run(),
      icon: TrashIcon,
      className: "text-destructive",
    },
  ];

  const globalMenuItems: TableMenuItem[] = [
    {
      name: "Toggle header column",
      command: () => editor?.chain().focus().toggleHeaderColumn().run(),
      icon: ColumnsIcon,
    },
    {
      name: "Toggle header row",
      command: () => editor?.chain().focus().toggleHeaderRow().run(),
      icon: RowsIcon,
    },
    {
      name: "Delete table",
      command: () => editor?.chain().focus().deleteTable().run(),
      icon: TrashIcon,
      className: "text-destructive",
    },
  ];

  const getStartContainerElement = useCallback((range: Range) => {
    const startNode = range.startContainer;

    if (startNode instanceof HTMLElement) {
      return startNode;
    }

    return startNode.parentElement;
  }, []);

  const getColumnMenuPosition = useCallback(
    (startContainer: HTMLElement) => {
      const tableCell = startContainer.closest("td, th");

      if (!(tableCell && editor)) {
        return null;
      }

      const cellRect = tableCell.getBoundingClientRect();
      const editorRect = editor.view.dom.getBoundingClientRect();

      return {
        top: cellRect.top - (editorRect?.top ?? 0),
        left: cellRect.left + cellRect.width / 2 - (editorRect?.left ?? 0),
      };
    },
    [editor]
  );

  const getRowMenuPosition = useCallback(
    (startContainer: HTMLElement) => {
      const tableRow = startContainer.closest("tr");

      if (!(tableRow && editor)) {
        return null;
      }

      const rowRect = tableRow.getBoundingClientRect();
      const editorRect = editor.view.dom.getBoundingClientRect();

      return {
        top: rowRect.top + rowRect.height / 2 - (editorRect?.top ?? 0),
        left: rowRect.left - (editorRect?.left ?? 0),
      };
    },
    [editor]
  );

  const handleSelectionUpdate = useCallback(() => {
    if (!editor) {
      return;
    }

    const selection = window.getSelection();

    if (!(selection && editor.isActive("table"))) {
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      const startContainer = getStartContainerElement(range);

      if (!startContainer) {
        return;
      }

      const tableNode = startContainer.closest("table");

      if (!tableNode) {
        return;
      }

      setTableLocation(tableNode.offsetTop);

      const columnPosition = getColumnMenuPosition(startContainer);

      if (columnPosition) {
        setColumnMenuPosition(columnPosition);
      }

      const rowPosition = getRowMenuPosition(startContainer);

      if (rowPosition) {
        setRowMenuPosition(rowPosition);
      }
    } catch (error) {
      const message = parseError(error);

      logger.error({
        event: "table_menu_selection_error",
        message,
        error: serializeError(error),
      });
    }
  }, [
    editor,
    getColumnMenuPosition,
    getRowMenuPosition,
    getStartContainerElement,
  ]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, handleSelectionUpdate]);

  if (!editor?.isActive("table")) {
    return null;
  }

  return (
    <>
      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
        style={{
          top: columnMenuPosition.top,
          left: columnMenuPosition.left,
        }}
      >
        <DropdownMenu
          data={columnMenuItems.map((item) => ({
            onClick: item.command,
            children: (
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-2",
                  item.className
                )}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </div>
            ),
          }))}
        >
          <Button className="flex h-5 rounded-sm" size="icon" variant="ghost">
            <EllipsisIcon className="text-muted-foreground" size={16} />
          </Button>
        </DropdownMenu>
      </div>

      <div
        className="absolute flex -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
        style={{
          top: rowMenuPosition.top,
          left: rowMenuPosition.left,
        }}
      >
        <DropdownMenu
          data={rowMenuItems.map((item) => ({
            onClick: item.command,
            children: (
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-2",
                  item.className
                )}
              >
                <item.icon size={16} />
                <span>{item.name}</span>
              </div>
            ),
          }))}
        >
          <Button
            className="flex h-9 w-5 rounded-sm"
            size="icon"
            variant="ghost"
          >
            <EllipsisVerticalIcon className="text-muted-foreground" size={16} />
          </Button>
        </DropdownMenu>
      </div>

      <div
        className="absolute left-2/4 flex translate-x-[-50%] overflow-hidden rounded-md border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
        style={{
          top: `${tableLocation - 50}px`,
        }}
      >
        {globalMenuItems.map((item) => (
          <Button
            className={cn("flex items-center gap-2", item.className)}
            key={item.name}
            onClick={item.command}
            size="sm"
            variant="ghost"
          >
            <item.icon size={16} />
            <span>{item.name}</span>
          </Button>
        ))}
      </div>
    </>
  );
};
