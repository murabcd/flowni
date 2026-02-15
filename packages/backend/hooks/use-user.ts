import { logger, serializeError } from "@repo/lib/logger";
import { useEffect, useState } from "react";
import type { User } from "../auth";
import { authClient } from "../auth/client";

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await authClient.getSession();

      if (error) {
        logger.error({
          event: "auth_get_session_failed",
          error: serializeError(error),
        });
      }

      setUser(data?.user ?? null);
    };
    fetchUser();
  }, []);

  return user;
};
