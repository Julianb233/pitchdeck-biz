"use client"

import { TrendingUp, Clock, Eye, FileText, X, Check, BadgeDollarSign } from "lucide-react"
import { SectionTitle } from "@/components/ui/section-title"

const stats = [
  {
    value: "2.5x",
    label: "More likely to secure funding with a professional pitch deck",
    icon: TrendingUp,
    gradient: "from-[#ff006e] to-[#8b5cf6]",
    glowColor: "rgba(255, 0, 110, 0.15)",
    borderColor: "rgba(255, 0, 110, 0.2)",
  },
  {
    value: "3:44",
    label: "Average time investors spend reviewing a pitch deck",
    icon: Clock,
    gradient: "from-[#8b5cf6] to-[#203eec]",
    glowColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    value: "73%",
    label: "Of investors say design quality affects their perception of a startup",
    icon: Eye,
    gradient: "from-[#203eec] to-[#00d4ff]",
    glowColor: "rgba(32, 62, 236, 0.15)",
    borderColor: "rgba(32, 62, 236, 0.2)",
  },
  {
    value: "15-20",
    label: "Slides in the average successful Series A pitch deck",
    icon: FileText,
    gradient: "from-[#00d4ff] to-[#ff006e]",
    glowColor: "rgba(0, 212, 255, 0.15)",
    borderColor: "rgba(0, 212, 255, 0.2)",
  },
]

const comparisons = [
  {
    oldWay: "$5,000 - $15,000 for a designer",
    newWay: "Starting at $497 per deck",
  },
  {
    oldWay: "2-4 weeks turnaround",
    newWay: "Ready in minutes",
  },
  {
    oldWay: "Endless back-and-forth revisions",
    newWay: "AI gets it right the first time",
  },
  {
    oldWay: "Generic templates that don't tell YOUR story",
    newWay: "Custom-built from YOUR business data",
  },
  {
    oldWay: "Designer doesn't understand your business",
    newWay: "AI analyzes your entire business model",
  },
]

export function Benefits() {
  return (
    <section id="benefits" className="py-20 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <SectionTitle className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            Why Every Business Needs a Winning Pitch Deck
          </SectionTitle>
          <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
            The data is clear — a professional pitch deck is the difference between getting funded and getting ignored.
          </p>
        </div>

        {/* Part A: Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 md:mb-28">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.value}
                className="relative rounded-2xl md:rounded-3xl p-8 border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center group"
                style={{
                  borderColor: stat.borderColor,
                  boxShadow: `0 0 0 0 ${stat.glowColor}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 40px ${stat.glowColor}, 0 0 60px ${stat.glowColor}`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 0 ${stat.glowColor}`
                }}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg mx-auto mb-5`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Stat Value */}
                <div
                  className={`text-4xl md:text-5xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-3`}
                >
                  {stat.value}
                </div>

                {/* Label */}
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>

        {/* Part B: Old Way vs pitchdeck.biz */}
        <div className="relative">
          {/* Sub-header */}
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
              The Old Way vs.{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 33%, #203eec 66%, #00d4ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                pitchdeck.biz
              </span>
            </h3>
          </div>

          {/* Savings Badge */}
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-semibold"
              style={{
                borderColor: "rgba(255, 0, 110, 0.3)",
                background: "linear-gradient(135deg, rgba(255, 0, 110, 0.08), rgba(139, 92, 246, 0.08))",
                color: "#ff006e",
              }}
            >
              <BadgeDollarSign className="w-4 h-4" />
              Save $10,000+ on Your Pitch Deck
            </div>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto">
            {/* Header Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  The Old Way
                </span>
              </div>
              <div className="text-center">
                <span
                  className="text-sm font-semibold uppercase tracking-wider bg-clip-text text-transparent"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  pitchdeck.biz
                </span>
              </div>
            </div>

            {/* Comparison Rows */}
            <div className="space-y-3">
              {comparisons.map((row, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  {/* Old Way */}
                  <div
                    className="relative rounded-xl md:rounded-2xl p-4 md:p-5 border border-zinc-800/50 bg-zinc-900/30 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <p className="text-sm md:text-base text-zinc-500 leading-relaxed">
                        {row.oldWay}
                      </p>
                    </div>
                  </div>

                  {/* New Way */}
                  <div
                    className="relative rounded-xl md:rounded-2xl p-4 md:p-5 border transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      borderColor: "rgba(124, 58, 237, 0.25)",
                      background: "linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(236, 72, 153, 0.06))",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(124, 58, 237, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                        }}
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="text-sm md:text-base text-foreground leading-relaxed font-medium">
                        {row.newWay}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
