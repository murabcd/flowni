import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

export const keys = () =>
  createEnv({
    server: {
      BETTER_AUTH_SECRET: z.string().min(32).optional(),
      BETTER_AUTH_URL: z.string().url().min(1).optional(),
      GITHUB_CLIENT_ID: z.string().min(1).optional(),
      GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
      SUPABASE_URL: z.string().url().min(1).optional(),
      SUPABASE_ANON_KEY: z.string().min(1).optional(),
      POSTGRES_URL_NON_POOLING: z.string().url().min(1),
      POSTGRES_PRISMA_URL: z.string().url().min(1),
    },
    client: {
      NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1).optional(),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
    },
    runtimeEnv: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      POSTGRES_URL_NON_POOLING:
        process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL,
      POSTGRES_PRISMA_URL:
        process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  });

export const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};
