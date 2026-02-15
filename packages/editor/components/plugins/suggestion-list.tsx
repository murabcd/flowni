import { cn } from "@repo/design-system/lib/utils";
import type { ReactNode } from "react";

type SuggestionListProperties<T> = {
  readonly items: T[];
  readonly selected: number;
  readonly onSelect: (index: number) => void;
  readonly render?: (item: T) => ReactNode;
};

const itemClassName = cn(
  "flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm",
  "text-foreground"
);

export const SuggestionList = <T,>({
  selected,
  onSelect,
  items,
  render,
}: SuggestionListProperties<T>) => (
  <div className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border bg-backdrop/90 p-1 shadow-md backdrop-blur-sm transition-all">
    {items.length > 0 ? (
      items.map((item, index) => {
        const label = render ? render(item) : String(item);
        const key =
          typeof item === "object" && item !== null && "id" in item
            ? String((item as { id: unknown }).id)
            : String(item);

        return (
          <button
            className={cn(
              itemClassName,
              index === selected ? "bg-card text-foreground" : "",
              "hover:bg-card"
            )}
            key={key}
            onClick={() => onSelect(index)}
            type="button"
          >
            {label}
          </button>
        );
      })
    ) : (
      <div className={itemClassName}>No results found</div>
    )}
  </div>
);
