import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
import { RemoveFormattingIcon } from "lucide-react";
import type { SelectorItem } from "./node-selector";

export const TextButtons = () => {
  const currentEditor = useCurrentEditor();

  if (!currentEditor.editor) {
    return null;
  }

  const items: SelectorItem[] = [
    {
      name: "clear-formatting",
      isActive: () => false,
      command: (editor) =>
        editor?.chain().focus().clearNodes().unsetAllMarks().run(),
      icon: RemoveFormattingIcon,
    },
  ];

  return (
    <div className="flex">
      {items.map((item) => (
        <Button
          className="rounded-none"
          key={item.name}
          onClick={() => {
            if (currentEditor.editor) {
              item.command(currentEditor.editor);
            }
          }}
          size="icon"
          variant="ghost"
        >
          <item.icon
            className={cn("h-4 w-4", {
              "text-violet-500 dark:text-violet-400": currentEditor.editor
                ? item.isActive(currentEditor.editor)
                : false,
            })}
          />
        </Button>
      ))}
    </div>
  );
};
