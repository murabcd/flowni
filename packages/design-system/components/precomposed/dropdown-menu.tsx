import type { ComponentProps, Key, ReactNode } from "react";

// biome-ignore lint/performance/noNamespaceImport: we're using the primitive component
import * as DropdownMenuComponent from "../ui/dropdown-menu";

export type DropdownMenuProperties = ComponentProps<
  typeof DropdownMenuComponent.DropdownMenu
> & {
  readonly data: (ComponentProps<
    typeof DropdownMenuComponent.DropdownMenuItem
  > & {
    readonly key?: Key;
  })[];
  readonly children: ReactNode;
  readonly label?: string;
};

const resolveItemKey = (item: DropdownMenuProperties["data"][number]) => {
  if (item.key !== undefined) {
    return item.key;
  }

  if (typeof item.children === "string") {
    return item.children;
  }

  if (typeof item.textValue === "string") {
    return item.textValue;
  }

  return String(item.onSelect ?? item.onClick ?? "menu-item");
};

export const DropdownMenu = ({
  data,
  children,
  label,
  ...properties
}: DropdownMenuProperties) => (
  <DropdownMenuComponent.DropdownMenu {...properties}>
    <DropdownMenuComponent.DropdownMenuTrigger asChild>
      <div>{children}</div>
    </DropdownMenuComponent.DropdownMenuTrigger>
    <DropdownMenuComponent.DropdownMenuContent>
      {label ? (
        <>
          <DropdownMenuComponent.DropdownMenuLabel>
            {label}
          </DropdownMenuComponent.DropdownMenuLabel>
          <DropdownMenuComponent.DropdownMenuSeparator />
        </>
      ) : null}
      {data.map((item) => (
        <DropdownMenuComponent.DropdownMenuItem
          {...item}
          key={resolveItemKey(item)}
        />
      ))}
    </DropdownMenuComponent.DropdownMenuContent>
  </DropdownMenuComponent.DropdownMenu>
);
