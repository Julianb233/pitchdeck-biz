import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function CheckoutCancelPage() {

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div
        className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
        style={{ background: "var(--brand-gradient-primary)" }}
      />
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.04] blur-[80px]"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #00d4ff)" }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center">
            <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Changed your mind?
          </h1>

          <p className="text-zinc-400 text-lg mb-2">
            No worries — you haven&apos;t been charged.
          </p>
          <p className="text-zinc-500 text-sm mb-10">
            Your pitch deck idea is saved. Come back anytime to get your
            investor-ready deck in under 5 minutes.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold text-white text-sm transition-all hover:scale-105 hover:shadow-lg relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
              }}
            >
              <ArrowLeft className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Back to Pricing</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#ff006e] via-[#8b5cf6] to-[#00d4ff]" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
