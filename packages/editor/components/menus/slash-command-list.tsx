import type { Editor } from "@tiptap/core";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import type { ReactNode, Ref } from "react";
import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { SuggestionList } from "../plugins/suggestion-list";

export type SlashCommandItem = {
  readonly title: string;
  readonly description: string;
  readonly icon: ReactNode;
  readonly searchTerms?: string[];
  readonly command?: (props: {
    editor: Editor;
    range: { from: number; to: number };
  }) => void;
};

type SlashCommandListProperties = {
  readonly items: SlashCommandItem[];
  readonly command: (item: SlashCommandItem) => void;
  readonly ref?: Ref<unknown>;
};

export const SlashCommandList = ({
  ref,
  ...props
}: SlashCommandListProperties) => {
  const { items, command } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];

      if (item) {
        command(item);
      }
    },
    [items, command]
  );

  const upHandler = useCallback(() => {
    if (items.length === 0) {
      return;
    }
    setSelectedIndex((current) => (current + items.length - 1) % items.length);
  }, [items.length]);

  const downHandler = useCallback(() => {
    if (items.length === 0) {
      return;
    }
    setSelectedIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useEffect(() => setSelectedIndex(0), []);

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (props.event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (props.event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }),
    [upHandler, downHandler, enterHandler]
  );

  return (
    <div id="slash-command">
      <SuggestionList
        items={items}
        onSelect={selectItem}
        render={(item) => (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background">
              {item.icon}
            </div>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-muted-foreground text-xs">
                {item.description}
              </p>
            </div>
          </div>
        )}
        selected={selectedIndex}
      />
    </div>
  );
};

SlashCommandList.displayName = "SlashCommandList";
