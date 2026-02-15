import type { NextConfig } from "next/types";
import { keys, requireEnv } from "./keys";

const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

export const withBackend = (config: NextConfig) => {
  const newConfig = { ...config };

  const supabaseUrl = requireEnv(keys().SUPABASE_URL, "SUPABASE_URL");

  newConfig.images = newConfig.images ?? {};
  newConfig.images.remotePatterns = newConfig.images.remotePatterns ?? [];
  newConfig.images.remotePatterns.push({
    protocol,
    hostname: new URL(supabaseUrl).hostname,
  });

  return newConfig;
};
