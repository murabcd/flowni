import type { Editor } from "@tiptap/core";

export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (
    ["ArrowUp", "ArrowDown", "Enter"].includes(event.key) &&
    document.querySelector("#slash-command")
  ) {
    return true;
  }

  return false;
};

export const getPrevText = (editor: Editor, position: number): string =>
  editor.state.doc.textBetween(0, position, "\n");
