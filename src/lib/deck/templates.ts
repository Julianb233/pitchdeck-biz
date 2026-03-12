import type { SlideType } from "@/lib/types";

export const SLIDE_TYPE_COLORS: Record<SlideType, string> = {
  title: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  problem: "bg-red-500/20 text-red-300 border-red-500/30",
  solution: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  market: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  product: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "business-model": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  traction: "bg-green-500/20 text-green-300 border-green-500/30",
  team: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  financials: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  ask: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "why-now": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  closing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};
