import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import type { Transaction } from "@tiptap/pm/state";
import { common, createLowlight } from "lowlight";

import "highlight.js/styles/nord.css";

const lowlight = createLowlight(common);

export const codeBlock = CodeBlockLowlight.extend({
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive("codeBlock")) {
          this.editor
            .chain()
            .command(({ tr }: { tr: Transaction }) => {
              tr.insertText("\t");
              return true;
            })
            .run();

          return true;
        }

        return false;
      },
    };
  },
}).configure({
  lowlight,
});
