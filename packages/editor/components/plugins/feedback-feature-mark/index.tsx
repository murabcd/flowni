import { type Editor, Mark, mergeAttributes } from "@tiptap/core";
import "./feedback-feature-mark.css";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

const markId = "feedback-feature";

export const feedbackFeatureMark = Mark.create({
  name: markId,

  addAttributes() {
    return {
      "data-type": {
        default: markId,
      },
      "data-feature": {
        default: null,
      },
    };
  },

  onSelectionUpdate({ editor }: { editor: Editor }) {
    const { from, to } = editor.state.selection;

    // Find the range of the [markId] mark
    let markRange: { from: number; to: number } | null = null;

    editor.state.doc.nodesBetween(from, to, (node: ProseMirrorNode, pos) => {
      if (node.marks.some((mark) => mark.type.name === markId)) {
        markRange = { from: pos, to: pos + node.nodeSize };
        return false;
      }

      return true;
    });

    // If the mark range is found, set the text selection to that range
    if (markRange) {
      editor.commands.setTextSelection(markRange);
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="feedback-feature"]',
        getAttrs: (node: HTMLElement | string) => ({
          "data-feature":
            typeof node === "string" ? null : node.dataset.feature,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return [
      "span",
      mergeAttributes(
        {
          "data-type": markId,
          "data-feature": HTMLAttributes.feature as string,
        },
        HTMLAttributes
      ),
      0,
    ];
  },
});
