import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-zinc-400 mb-8">
          No worries — you haven&apos;t been charged. Come back anytime to create your pitch deck.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/#pricing"
            className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
            }}
          >
            View Pricing
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
