import "@tiptap/core";

declare module "@tiptap/core" {
  type Commands<ReturnType> = {
    heading: {
      setHeading: (attributes: { level: 1 | 2 | 3 | 4 | 5 | 6 }) => ReturnType;
      toggleHeading: (attributes: {
        level: 1 | 2 | 3 | 4 | 5 | 6;
      }) => ReturnType;
    };
    bold: {
      toggleBold: () => ReturnType;
    };
    italic: {
      toggleItalic: () => ReturnType;
    };
    strike: {
      toggleStrike: () => ReturnType;
    };
    code: {
      toggleCode: () => ReturnType;
    };
    superscript: {
      toggleSuperscript: () => ReturnType;
    };
    subscript: {
      toggleSubscript: () => ReturnType;
    };
    bulletList: {
      toggleBulletList: () => ReturnType;
    };
    orderedList: {
      toggleOrderedList: () => ReturnType;
    };
    blockquote: {
      toggleBlockquote: () => ReturnType;
    };
    table: {
      insertTable: (options?: {
        rows?: number;
        cols?: number;
        withHeaderRow?: boolean;
      }) => ReturnType;
      addColumnBefore: () => ReturnType;
      addColumnAfter: () => ReturnType;
      deleteColumn: () => ReturnType;
      addRowBefore: () => ReturnType;
      addRowAfter: () => ReturnType;
      deleteRow: () => ReturnType;
      toggleHeaderColumn: () => ReturnType;
      toggleHeaderRow: () => ReturnType;
      deleteTable: () => ReturnType;
    };
    iframelyEmbed: {
      setIframelyEmbed: (options: { src: string }) => ReturnType;
    };
  };
}
