"use client";

import { authClient } from "@repo/backend/auth/client";
import { Input } from "@repo/design-system/components/precomposed/input";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useState } from "react";
import { toast } from "sonner";

type ProfileFormProps = {
  defaultName: string;
  defaultEmail: string;
};

export const ProfileForm = ({
  defaultName,
  defaultEmail,
}: ProfileFormProps) => {
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);
  const disabled = loading || name === defaultName;

  const updateProfile = async () => {
    try {
      if (disabled) {
        return;
      }

      setLoading(true);

      await authClient.updateUser({
        name,
      });

      toast.success("Profile updated");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={updateProfile}>
      <Input
        label="Name"
        name="name"
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        value={name}
      />
      <Input
        disabled
        label="Email"
        name="email"
        placeholder="Email"
        value={defaultEmail}
      />
      <Button disabled={disabled} type="submit">
        Update
      </Button>
    </form>
  );
};
