type LogLevel = "info" | "error";

type ErrorPayload = {
  name?: string;
  message?: string;
  stack?: string;
};

type WideEvent = Record<string, unknown>;

const getEnvironmentContext = () => ({
  env: process.env.NODE_ENV,
  vercel_env: process.env.VERCEL_ENV,
  vercel_region: process.env.VERCEL_REGION,
  vercel_url: process.env.VERCEL_URL,
  commit_sha:
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA,
});

const serializeError = (error: unknown): ErrorPayload => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === "string" ? error : undefined,
  };
};

const emitLog = (level: LogLevel, event: WideEvent) => {
  const payload = {
    level,
    timestamp: new Date().toISOString(),
    ...getEnvironmentContext(),
    ...event,
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
};

export const logger = {
  info: (event: WideEvent) => emitLog("info", event),
  error: (event: WideEvent) => emitLog("error", event),
};

export { serializeError };
