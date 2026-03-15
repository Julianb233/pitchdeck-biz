export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = (...args: unknown[]) => {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  import("@sentry/nextjs").then((Sentry) => {
    if (typeof Sentry.captureRequestError === "function") {
      Sentry.captureRequestError(
        ...(args as Parameters<typeof Sentry.captureRequestError>),
      );
    }
  });
};
