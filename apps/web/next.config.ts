import { withBackend } from "@repo/backend/next-config";
import { config, withAnalyzer } from "@repo/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

let nextConfig: NextConfig = withBackend({
  ...config,

  images: {
    ...config.images,
    dangerouslyAllowSVG: true,
  },

  async redirects() {
    return [
      {
        source: "/legal",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/acceptable-use",
        destination: "/legal/acceptable-use",
        permanent: true,
      },
      {
        source: "/data-security",
        destination: "/legal/data-security",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/legal/terms",
        permanent: true,
      },
    ];
  },
});

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
