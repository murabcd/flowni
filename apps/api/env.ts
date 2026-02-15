import { keys as core } from "@repo/next-config/keys";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

export const env = createEnv({
  extends: [core()],
  server: {
    OPENAI_API_KEY: z.string(),
  },
  client: {},
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
});
