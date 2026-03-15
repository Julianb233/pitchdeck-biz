"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            background: "#09090b",
            color: "#fafafa",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.625rem 1.5rem",
                borderRadius: "9999px",
                border: "none",
                color: "white",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
