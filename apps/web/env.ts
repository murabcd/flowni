import { keys as core } from "@repo/next-config/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

export const env = createEnv({
  extends: [core()],
  server: {
    FLOWNI_ADMIN_WIDGET_ID: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    FLOWNI_ADMIN_WIDGET_ID: process.env.FLOWNI_ADMIN_WIDGET_ID,
  },
});
