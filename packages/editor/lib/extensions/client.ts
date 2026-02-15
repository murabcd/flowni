import { cn } from "@repo/design-system/lib/utils";
import type { Editor, Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { Underline } from "@tiptap/extension-underline";
// Not used, but required for older content / migrations
import Youtube from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";
import { Figma } from "tiptap-extension-figma";
import { Iframely } from "tiptap-extension-iframely";
import { Jira } from "tiptap-extension-jira";
import { codeBlock } from "../../components/plugins/code-block";
import { colorHighlighter } from "../../components/plugins/color-highlighter";
import { emojiSuggestion } from "../../components/plugins/emoji";
import { feedbackFeatureMark } from "../../components/plugins/feedback-feature-mark";
import { fileNode } from "../../components/plugins/file";
import { startImageUpload, uploadImagesPlugin } from "../../lib/upload-file";
import {
  Details,
  DetailsContent,
  DetailsSummary,
  Emoji,
  FileHandler,
  UniqueId,
} from "./pro-fallback";

const placeholder = Placeholder.configure({
  placeholder: ({ node }) =>
    node.type.name === "heading"
      ? `Heading ${node.attrs.level}`
      : "Press '/' for commands",
  includeChildren: true,
});

const tiptapLink = Link.configure({
  HTMLAttributes: {
    class: cn(
      "cursor-pointer text-muted-foreground underline underline-offset-[3px] transition-colors",
      "hover:text-violet-500",
      "dark:hover:text-violet-400"
    ),
  },
});

const tiptapImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },
  addProseMirrorPlugins() {
    return [uploadImagesPlugin()];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: "rounded-lg border",
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: "not-prose pl-2",
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: "flex items-start my-2",
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: "mt-4 mb-6 border-t",
  },
});

const table = Table.configure({
  HTMLAttributes: {
    class:
      "table-fixed m-0 overflow-hidden mx-auto my-3 border-collapse rounded-none",
  },
  allowTableNodeSelection: true,
});

const tableRow = TableRow.configure({
  HTMLAttributes: {
    class:
      "border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
  },
});

const tableCell = TableCell.configure({
  HTMLAttributes: {
    class:
      "border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
  },
});

const tableHeader = TableHeader.configure({
  HTMLAttributes: {
    class:
      "bg-background font-semibold border box-border min-w-[1em] py-2 px-1 relative align-top text-start !py-1",
  },
});

const youtube = Youtube.configure({
  inline: false,
});

const uniqueId = UniqueId.configure({
  attributeName: "uid",
});

const emoji = Emoji.configure({
  suggestion: emojiSuggestion,
});

const superscript = Superscript.configure();
const subscript = Subscript.configure();
const details = Details.configure();
const detailsContent = DetailsContent.configure();
const detailsSummary = DetailsSummary.configure();
const color = Color.configure();
const underline = Underline.configure();
const highlight = Highlight.configure({ multicolor: true });

const fileHandler = FileHandler.configure({
  onPaste: async (editor: Editor, files: File[], htmlContent?: string) => {
    if (htmlContent) {
      return;
    }

    const promises = files.map(async (file) =>
      startImageUpload(file, editor.view, editor.view.state.selection.from)
    );

    await Promise.all(promises);
  },
  onDrop: async (editor: Editor, files: File[], pos: number) => {
    const promises = files.map(async (file) =>
      startImageUpload(file, editor.view, pos)
    );

    await Promise.all(promises);
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: "list-disc list-outside leading-3",
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: "list-decimal list-outside leading-3",
    },
  },
  listItem: {
    HTMLAttributes: {
      class: "leading-normal -mb-2",
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: "border-l-4 border-primary",
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      class: "rounded-md px-1.5 py-1 font-mono font-medium bg-background",
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  undoRedo: false,
});

const jira = Jira;

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  taskList,
  taskItem,
  horizontalRule,
  colorHighlighter,
  fileNode,
  table,
  tableRow,
  tableCell,
  tableHeader,
  codeBlock,
  youtube,
  uniqueId,
  emoji,
  fileHandler,
  superscript,
  subscript,
  color,
  details,
  detailsContent,
  detailsSummary,
  feedbackFeatureMark,
  underline,
  highlight,
  Figma,
  Iframely,
  ...Object.values(jira),
] as Extension[];
