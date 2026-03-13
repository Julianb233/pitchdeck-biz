"use client"

import { Coins, Calendar } from "lucide-react"
import { MONTHLY_TOKEN_ALLOCATION } from "@/lib/tokens"

interface TokenUsageProps {
  tokensRemaining: number
  resetDate: string
}

export function TokenUsage({ tokensRemaining, resetDate }: TokenUsageProps) {
  const used = MONTHLY_TOKEN_ALLOCATION - tokensRemaining
  const percentUsed = (used / MONTHLY_TOKEN_ALLOCATION) * 100

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 flex items-center gap-6">
      {/* Balance */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#00d4ff] flex items-center justify-center">
          <Coins className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-zinc-500 font-medium">Tokens Remaining</p>
          <p className="text-xl font-bold text-white">
            {tokensRemaining}
            <span className="text-sm text-zinc-500 font-normal"> / {MONTHLY_TOKEN_ALLOCATION}</span>
          </p>
        </div>
      </div>

      {/* Usage bar */}
      <div className="flex-1 space-y-1.5">
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(percentUsed, 100)}%`,
              background:
                percentUsed > 80
                  ? "linear-gradient(90deg, #f97316, #ef4444)"
                  : "linear-gradient(90deg, #8b5cf6, #00d4ff)",
            }}
          />
        </div>
        <p className="text-xs text-zinc-600">{used} tokens used this period</p>
      </div>

      {/* Reset date */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
        <Calendar className="w-3.5 h-3.5" />
        Resets{" "}
        {new Date(resetDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </div>
    </div>
  )
}
