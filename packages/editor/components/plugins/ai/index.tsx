import { Button } from "@repo/design-system/components/ui/button";
import { useCurrentEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { SparklesIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AISelector } from "./ai-selector";

type GenerativeMenuSwitchProperties = {
  readonly children: ReactNode;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange,
}: GenerativeMenuSwitchProperties) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      className="flex w-fit max-w-[90vw] overflow-hidden rounded border border-border/50 bg-background/90 shadow-xl backdrop-blur-lg"
      editor={editor}
      options={{
        placement: open ? "bottom-start" : "top",
        onHide: () => {
          onOpenChange(false);
        },
      }}
    >
      {open ? (
        <AISelector onOpenChange={onOpenChange} />
      ) : (
        <>
          <Button
            className="gap-1 rounded-none text-violet-500 dark:text-violet-400"
            onClick={() => onOpenChange(true)}
            variant="ghost"
          >
            <SparklesIcon className="h-5 w-5" />
            Ask AI
          </Button>
          {children}
        </>
      )}
    </BubbleMenu>
  );
};
