"use client";

import { useDebouncedCallback } from "@react-hookz/web";
import { Prose } from "@repo/design-system/components/prose";
import type {
  Extensions,
  JSONContent,
  Editor as TiptapEditor,
} from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
import { EditorProvider } from "@tiptap/react";
import deepEqual from "deep-equal";
import { type ReactNode, useRef } from "react";
import { BubbleMenu } from "./components/menus/bubble-menu";
import { TableMenu } from "./components/menus/table-menu";
import { slashCommand } from "./components/slash-command";
import { defaultExtensions } from "./lib/extensions/client";
import { handleCommandNavigation } from "./lib/tiptap-utils";

import "./styles/editor.css";

export type {
  Editor as EditorInstance,
  Extensions,
  JSONContent,
} from "@tiptap/core";
// biome-ignore lint/performance/noBarrelFile: This file provides editor public re-exports.
export { mergeAttributes, Node, nodePasteRule } from "@tiptap/core";
export {
  NodeViewWrapper,
  ReactNodeViewRenderer as reactNodeViewRenderer,
  useCurrentEditor as useEditor,
} from "@tiptap/react";
export { ImageResizer } from "./components/plugins/image-resizer";

type EditorInstance = TiptapEditor;

export type EditorProperties = {
  readonly children?: ReactNode;
  readonly defaultValue?: JSONContent;
  readonly editorProps?: TiptapEditor["options"]["editorProps"];
  readonly onUpdate?: (editor?: EditorInstance) => Promise<void> | void;
  readonly onDebouncedUpdate?: (
    editor?: EditorInstance
  ) => Promise<void> | void;
  readonly editable?: boolean;
  readonly extensions?: Extensions;
  readonly slotAfter?: ReactNode;
  readonly className?: string;
};

export const Editor = ({
  defaultValue,
  editorProps,
  onUpdate,
  onDebouncedUpdate,
  editable = true,
  extensions,
  slotAfter,
  children,
  className,
}: EditorProperties) => {
  const hasChildren = children !== null && children !== undefined;
  const showMenus = editable && !hasChildren;
  const lastSnapshot = useRef<JSONContent | null>(null);
  const handleDebouncedUpdate = useDebouncedCallback(
    ({ editor }: { editor: EditorInstance }) => {
      const newSnapshot = structuredClone(editor.getJSON());
      const isSame = deepEqual(lastSnapshot.current, newSnapshot);

      if (!isSame) {
        onDebouncedUpdate?.(editor);
        lastSnapshot.current = structuredClone(newSnapshot);
      }
    },
    [],
    500
  );

  const handleUpdate = async ({ editor }: { editor: EditorInstance }) =>
    Promise.all([onUpdate?.(editor), handleDebouncedUpdate({ editor })]);

  return (
    <div className="relative w-full">
      <Prose className={className}>
        <EditorProvider
          content={defaultValue}
          editable={editable}
          editorContainerProps={{
            className: "relative min-h-[5rem] w-full",
          }}
          editorProps={{
            ...editorProps,
            handleDOMEvents: {
              keydown: (_view: EditorView, event: KeyboardEvent) =>
                handleCommandNavigation(event),
            },
            attributes: {
              class: "focus:outline-none",
            },
          }}
          extensions={[
            ...defaultExtensions,
            slashCommand,
            ...(extensions ?? []),
          ]}
          onUpdate={handleUpdate}
          slotAfter={slotAfter}
        >
          {showMenus ? (
            <>
              <BubbleMenu />
              <TableMenu />
            </>
          ) : null}
          {children}
        </EditorProvider>
      </Prose>
    </div>
  );
};
