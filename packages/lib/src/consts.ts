export const FEEDBACK_PAGE_SIZE = 20;
export const CRON_PAGE_SIZE = 20;

const productionHost =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?? "localhost:3000";
const protocol =
  process.env.NODE_ENV === "production" || productionHost.endsWith(".local")
    ? "https"
    : "http";
export const baseUrl = new URL(`${protocol}://${productionHost}`).toString();

export const BLOG_POST_PAGE_SIZE = 12;
