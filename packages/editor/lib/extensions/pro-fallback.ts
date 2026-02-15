import { Extension, Node } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export const Details = Node.create({
  name: "details",
  group: "block",
  content: "detailsSummary detailsContent",
  isolating: true,
  parseHTML() {
    return [{ tag: "details" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return ["details", HTMLAttributes, 0];
  },
});

export const DetailsSummary = Node.create({
  name: "detailsSummary",
  group: "block",
  content: "inline*",
  defining: true,
  parseHTML() {
    return [{ tag: "summary" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return ["summary", HTMLAttributes, 0];
  },
});

export const DetailsContent = Node.create({
  name: "detailsContent",
  group: "block",
  content: "block*",
  parseHTML() {
    return [
      { tag: 'div[data-type="details-content"]' },
      { tag: "div.details-content" },
    ];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return ["div", { ...HTMLAttributes, "data-type": "details-content" }, 0];
  },
});

export const Emoji = Node.create({
  name: "emoji",
  inline: true,
  group: "inline",
  atom: true,
  selectable: false,
  addAttributes() {
    return {
      name: {
        default: null,
      },
      emoji: {
        default: null,
      },
    };
  },
  parseHTML() {
    return [{ tag: "span[data-emoji]" }, { tag: "span.emoji" }];
  },
  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: ProseMirrorNode;
    HTMLAttributes: Record<string, string>;
  }) {
    const emoji = node.attrs.emoji ?? node.attrs.name ?? "🙂";
    return ["span", { ...HTMLAttributes, "data-emoji": emoji }, emoji];
  },
});

export const UniqueId = Extension.create({
  name: "uniqueId",
});

export const FileHandler = Extension.create({
  name: "fileHandler",
});
