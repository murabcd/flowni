import type { User } from "@repo/backend/auth";
import { getUserName } from "@repo/backend/auth/format";
import { Select } from "@repo/design-system/components/precomposed/select";
import Image from "next/image";

type FeatureAssigneePickerProperties = {
  readonly data: User[];
  readonly value: string;
  readonly onChange: (value: string) => void;
};

export const FeatureAssigneePicker = ({
  data,
  value,
  onChange,
}: FeatureAssigneePickerProperties) => (
  <Select
    data={data.map((user) => ({
      value: user.id,
      label: getUserName(user) ?? "",
    }))}
    onChange={onChange}
    renderItem={(item) => {
      const member = data.find((person) => person.id === item.value);

      if (!member) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          {member.image ? (
            <Image
              alt=""
              className="rounded-full"
              height={16}
              src={member.image}
              width={16}
            />
          ) : (
            <div className="h-4 w-4 rounded-full bg-muted-foreground" />
          )}
          <span>{item.label}</span>
        </div>
      );
    }}
    type="user"
    value={value}
  />
);
