"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
          style={{
            background:
              "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
            boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
