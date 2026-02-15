"use client";

import { useCurrentEditor } from "@tiptap/react";
import Moveable from "react-moveable";

export const ImageResizer = () => {
  const { editor } = useCurrentEditor();

  if (!editor?.isActive("image")) {
    return null;
  }

  const updateImageAttributes = () => {
    const node = document.querySelector(".ProseMirror-selectednode");

    if (!(node instanceof HTMLImageElement)) {
      return;
    }

    const width = Number(node.style.width.replace("px", ""));
    const height = Number(node.style.height.replace("px", ""));

    editor.commands.setImage({
      src: node.src,
      width: Number.isNaN(width) ? undefined : width,
      height: Number.isNaN(height) ? undefined : height,
    });

    editor.commands.setNodeSelection(editor.state.selection.from);
  };

  const target = document.querySelector<HTMLElement>(
    ".ProseMirror-selectednode"
  );

  if (!target) {
    return null;
  }

  return (
    <Moveable
      container={null}
      edge={false}
      keepRatio={true}
      onResize={({ target, width, height, delta }) => {
        if (delta[0]) {
          target.style.width = `${width}px`;
        }

        if (delta[1]) {
          target.style.height = `${height}px`;
        }
      }}
      onResizeEnd={updateImageAttributes}
      onScale={({ target, transform }) => {
        target.style.transform = transform;
      }}
      origin={false}
      renderDirections={["w", "e"]}
      resizable={true}
      scalable={true}
      target={target}
      throttleDrag={0}
      throttleResize={0}
      throttleScale={0}
    />
  );
};
