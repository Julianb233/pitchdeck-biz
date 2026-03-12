import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-zinc-400 mb-8">
          Your deck is ready. Head to the dashboard to download it or create more.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/overview"
            className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
            }}
          >
            Go to Dashboard
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
