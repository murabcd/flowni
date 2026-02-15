"use client";

import { signOut } from "@repo/backend/auth/client";
import { Button } from "@repo/design-system/components/ui/button";
import { handleError } from "@repo/design-system/lib/handle-error";
import { useRouter } from "next/navigation";

export const SignOutButton = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Button onClick={handleSignOut} type="button" variant="outline">
      Sign Out
    </Button>
  );
};
