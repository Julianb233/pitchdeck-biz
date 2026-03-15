import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Payment Successful",
  description: "Your payment is confirmed. Access your AI-generated pitch deck from the dashboard.",
  path: "/checkout/success",
  noIndex: true,
});

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
        style={{ background: "var(--brand-gradient-primary)" }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
        style={{ background: "linear-gradient(135deg, #06b6d4, #3b82f6)" }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-xl"
              style={{ background: "var(--brand-gradient-primary)" }}
            />
            <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>

          {/* Headline with brand gradient */}
          <h1
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{
              background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your Deck is Ready!
          </h1>

          <p className="text-zinc-400 text-lg mb-2">
            Payment confirmed. Your pitch deck has been unlocked.
          </p>
          <p className="text-zinc-500 text-sm mb-8">
            Head to your dashboard to download, edit, or create more decks.
          </p>

          {sessionId && (
            <p className="text-zinc-600 text-xs mb-8 font-mono break-all">
              Order ref: {sessionId}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/overview"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-white text-sm transition-all hover:scale-105 hover:shadow-lg relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              <span className="relative z-10">Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 relative z-10" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#ff006e] via-[#8b5cf6] to-[#00d4ff]" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
