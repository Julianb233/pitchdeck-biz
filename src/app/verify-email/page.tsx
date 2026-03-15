"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          Verifying...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "pending">(
    token ? "loading" : "pending"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight inline-block"
          style={{
            background:
              "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          pitchdeck.biz
        </Link>

        {status === "pending" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              We sent a verification link to your email address.
              Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-xs text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Link href="/signup" className="text-primary hover:underline">
                try signing up again
              </Link>.
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Email Verified</h1>
            <p className="text-muted-foreground">{message}</p>
            <Link
              href="/login"
              className="inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
              }}
            >
              Sign in
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Verification Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <Link
              href="/signup"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Back to sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
