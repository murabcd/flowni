import type { Editor, Range } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import type { SuggestionOptions } from "@tiptap/suggestion";
import Suggestion from "@tiptap/suggestion";
import {
  AppWindowIcon,
  CheckSquare,
  Code,
  FileIcon,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  TableIcon,
  Text,
  TextQuote,
} from "lucide-react";
import tippy, { type Instance, type Props } from "tippy.js";
import { startImageUpload } from "../lib/upload-file";
import {
  type SlashCommandItem,
  SlashCommandList,
} from "./menus/slash-command-list";

const requestEmbedUrl = async (): Promise<string | null> =>
  new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className =
      "rounded-md border border-border bg-background p-4 shadow-lg";

    const form = document.createElement("form");
    form.method = "dialog";
    form.className = "flex flex-col gap-3";

    const label = document.createElement("label");
    label.textContent = "Enter URL to embed";
    label.className = "text-sm font-medium text-foreground";

    const input = document.createElement("input");
    input.type = "url";
    input.placeholder = "https://";
    input.className =
      "rounded-md border border-border bg-background px-3 py-2 text-sm";

    const actions = document.createElement("div");
    actions.className = "flex items-center justify-end gap-2";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className =
      "rounded-md border border-border px-3 py-1.5 text-sm";
    cancelButton.textContent = "Cancel";

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className =
      "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground";
    submitButton.textContent = "Embed";

    cancelButton.addEventListener("click", () => {
      dialog.close();
      resolve(null);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = input.value.trim();
      dialog.close();
      resolve(value.length ? value : null);
    });

    actions.append(cancelButton, submitButton);
    form.append(label, input, actions);
    dialog.append(form);
    document.body.append(dialog);
    dialog.addEventListener("close", () => {
      dialog.remove();
    });

    dialog.showModal();
    input.focus();
  });

export const suggestionItems: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "To-do List",
    description: "Track tasks with a to-do list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.addEventListener("change", async () => {
        if (!input.files?.length) {
          return;
        }

        const [file] = [...input.files];
        const pos = editor.view.state.selection.from;

        await startImageUpload(file, editor.view, pos);
      });
      input.click();
    },
  },
  {
    title: "File",
    description: "Upload a file from your computer.",
    searchTerms: ["file", "attachment"],
    icon: <FileIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const input = document.createElement("input");
      input.type = "file";
      input.addEventListener("change", async () => {
        if (!input.files?.length) {
          return;
        }

        const [file] = [...input.files];
        const pos = editor.view.state.selection.from;

        await startImageUpload(file, editor.view, pos);
      });
      input.click();
    },
  },
  {
    title: "Table",
    description: "Add a table view to organize data.",
    searchTerms: ["table"],
    icon: <TableIcon size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Embed Content",
    description: "Embed content from 1900+ sites.",
    searchTerms: ["iframely", "embed"],
    icon: <AppWindowIcon size={18} />,
    command: async ({ editor, range }) => {
      const url = await requestEmbedUrl();

      if (!url) {
        return;
      }

      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setIframelyEmbed({ src: url })
        .run();
    },
  },
];

const filterItems = (query: string): SlashCommandItem[] => {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return suggestionItems;
  }

  return suggestionItems.filter((item) => {
    const searchable = [item.title, ...(item.searchTerms ?? [])];
    return searchable.some((term) =>
      term.toLowerCase().includes(normalizedQuery)
    );
  });
};

const suggestion: Partial<SuggestionOptions> = {
  items: ({ query }) => filterItems(query ?? ""),
  render: () => {
    let component: ReactRenderer | null = null;
    let popup: Instance<Props> | null = null;

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashCommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        const getReferenceClientRect = () =>
          props.clientRect?.() ?? new DOMRect();

        const popupInstance = tippy(document.body, {
          getReferenceClientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
        popup = Array.isArray(popupInstance) ? popupInstance[0] : popupInstance;
      },

      onUpdate(props) {
        if (!component) {
          return;
        }

        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        const getReferenceClientRect = () =>
          props.clientRect?.() ?? new DOMRect();

        popup?.setProps({ getReferenceClientRect });
      },

      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup?.hide();
          component?.destroy();

          return true;
        }

        return (
          (
            component?.ref as { onKeyDown?: (event: typeof props) => boolean }
          )?.onKeyDown?.(props) ?? false
        );
      },

      onExit() {
        popup?.destroy();
        component?.destroy();
      },
    };
  },
};

export const slashCommand = Extension.create({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SlashCommandItem;
        }) => {
          props.command?.({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        ...suggestion,
      }),
    ];
  },
});
