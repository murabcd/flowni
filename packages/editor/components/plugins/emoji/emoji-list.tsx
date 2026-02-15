// @ts-nocheck

import Image from "next/image";
import type { Ref } from "react";
import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { SuggestionList } from "../suggestion-list";

export const EmojiList = ({ ref, ...props }: { ref?: Ref<unknown> }) => {
  const { items, command } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index) => {
      const item = items[index];

      if (item) {
        command({ name: item.name });
      }
    },
    [items, command]
  );

  const upHandler = useCallback(() => {
    setSelectedIndex((current) => (current + items.length - 1) % items.length);
  }, [items.length]);

  const downHandler = useCallback(() => {
    setSelectedIndex((current) => (current + 1) % items.length);
  }, [items.length]);

  const enterHandler = useCallback(() => {
    selectItem(selectedIndex);
  }, [selectItem, selectedIndex]);

  useEffect(() => setSelectedIndex(0), []);

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: (x) => {
        if (x.event.key === "ArrowUp") {
          upHandler();
          return true;
        }

        if (x.event.key === "ArrowDown") {
          downHandler();
          return true;
        }

        if (x.event.key === "Enter") {
          enterHandler();
          return true;
        }

        return false;
      },
    }),
    [upHandler, downHandler, enterHandler]
  );

  return (
    <SuggestionList
      items={items}
      onSelect={selectItem}
      render={(item) => (
        <div className="flex items-center gap-1">
          {item.fallbackImage ? (
            <Image
              alt={item.name}
              className="h-4 w-4"
              height={16}
              src={item.fallbackImage}
              width={16}
            />
          ) : (
            item.emoji
          )}
          :{item.name}:
        </div>
      )}
      selected={selectedIndex}
    />
  );
};

EmojiList.displayName = "EmojiList";
