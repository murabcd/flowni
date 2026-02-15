// @ts-nocheck

"use client";

import type { Ref } from "react";
import { useEffect, useImperativeHandle, useState } from "react";
import { SuggestionList } from "../suggestion-list";

type MentionListProps = {
  readonly items: string[];
  readonly command: (item: { id: string }) => void;
  readonly ref?: Ref<{
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
  }>;
};

export const MentionList = (props: MentionListProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    );
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), []);

  useImperativeHandle(props.ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <SuggestionList
      items={props.items}
      onSelect={selectItem}
      selected={selectedIndex}
    />
  );
};
