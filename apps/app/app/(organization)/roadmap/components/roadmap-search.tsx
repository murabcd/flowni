import { Input } from "@repo/design-system/components/precomposed/input";
import { SearchIcon } from "lucide-react";

type RoadmapSearchProperties = {
  readonly value: string;
  readonly onChange: (search: string) => void;
};

export const RoadmapSearch = ({ value, onChange }: RoadmapSearchProperties) => (
  <div className="relative max-w-[16rem] shrink-0">
    <SearchIcon
      className="absolute top-1/2 left-3 -translate-y-1/2 transform text-muted-foreground"
      size={16}
    />
    <Input
      autoComplete="off"
      className="bg-background pl-8"
      maxLength={191}
      onChangeText={onChange}
      placeholder="Search"
      value={value}
    />
  </div>
);
