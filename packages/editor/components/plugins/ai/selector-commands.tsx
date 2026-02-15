import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@repo/design-system/components/ui/command";
import { useCurrentEditor } from "@tiptap/react";
import {
  ArrowDownWideNarrow,
  CheckCheck,
  RefreshCcwDot,
  StepForward,
  WrapText,
} from "lucide-react";
import { getPrevText } from "../../../lib/tiptap-utils";

const options = [
  {
    value: "improve",
    label: "Improve writing",
    icon: RefreshCcwDot,
  },
  {
    value: "fix",
    label: "Fix grammar",
    icon: CheckCheck,
  },
  {
    value: "shorter",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "longer",
    label: "Make longer",
    icon: WrapText,
  },
];

type AiSelectorCommandsProperties = {
  readonly onSelect: (value: string, option: string) => void;
};

export const AISelectorCommands = ({
  onSelect,
}: AiSelectorCommandsProperties) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const handleSelect = (value: string) => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, "\n");

    onSelect(text, value);
  };

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        {options.map((option) => (
          <CommandItem
            className="flex gap-2 px-4"
            key={option.value}
            onSelect={handleSelect}
            value={option.value}
          >
            <option.icon className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            {option.label}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to do more">
        <CommandItem
          className="gap-2 px-4"
          onSelect={() => {
            const pos = editor.state.selection.from;
            const context = getPrevText(editor, pos);
            onSelect(context, "continue");
          }}
          value="continue"
        >
          <StepForward className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          Continue writing
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
