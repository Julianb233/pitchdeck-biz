"use client"

import { useState } from "react"
import { Check, Sparkles, Crown } from "lucide-react"

const plans = [
  {
    name: "Pay Per Deck",
    badge: "Most Popular",
    badgeIcon: Sparkles,
    price: "$99",
    period: "per deck",
    description: "Everything you need to pitch your business professionally",
    featured: false,
    cta: "Create Your Deck",
    priceType: "one-time" as const,
    features: [
      "Investor Pitch Deck (10-15 slides)",
      "Business Sell Sheet",
      "One-Pager Executive Summary",
      "Complete Branding Kit",
      "PowerPoint & PDF exports",
      "Fully editable files",
      "Ready in under 5 minutes",
    ],
  },
  {
    name: "Monthly Subscription",
    badge: "Best Value",
    badgeIcon: Crown,
    price: "$49",
    period: "/month",
    description: "Unlimited branding power for growing businesses",
    featured: true,
    cta: "Start Subscription",
    priceType: "subscription" as const,
    features: [
      "Everything in Pay Per Deck",
      "500 branding asset tokens/month",
      "Social media graphics on demand",
      "Product mockups & lifestyle shots",
      "Marketing collateral generation",
      "Brand identity variations",
      "Priority support",
      "Rollover unused tokens",
    ],
  },
]

export function Pricing() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleCheckout(priceType: "one-time" | "subscription") {
    setLoading(priceType)
    try {
      // Check if user is logged in first
      const meRes = await fetch("/api/auth/me")
      if (!meRes.ok) {
        window.location.href = "/signup"
        return
      }

      const type = priceType === "one-time" ? "deck" : "subscription"
      const body: Record<string, string> = { type }
      // For one-time deck purchases, use a placeholder deckId
      // (in production, user would create a deck first)
      if (type === "deck") {
        body.deckId = `deck_${Date.now()}`
      }

      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("No checkout URL returned", data)
        setLoading(null)
      }
    } catch (err) {
      console.error("Checkout failed", err)
      setLoading(null)
    }
  }

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Pricing</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            No hidden fees. No long contracts. Just professional results.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 md:p-10 transition-all duration-300 ${
                plan.featured
                  ? "border-2 border-[#203eec] shadow-2xl scale-[1.02] md:scale-105"
                  : "border border-border hover:border-muted-foreground/30 hover:shadow-lg"
              }`}
              style={
                plan.featured
                  ? { boxShadow: "0 20px 60px rgba(32, 62, 236, 0.15), 0 8px 24px rgba(0, 212, 255, 0.1)" }
                  : undefined
              }
            >
              {/* Background gradient for featured */}
              {plan.featured && (
                <div
                  className="absolute inset-0 rounded-3xl opacity-[0.03]"
                  style={{
                    background: "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                  }}
                />
              )}

              {/* Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    plan.featured
                      ? "bg-gradient-to-r from-[#203eec] to-[#00d4ff] text-white"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <plan.badgeIcon className="w-3 h-3" />
                  {plan.badge}
                </span>
              </div>

              {/* Plan Name */}
              <h3 className="text-xl font-semibold mb-2 relative z-10">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">{plan.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8 relative z-10">
                <span
                  className={`text-5xl font-bold tracking-tight ${
                    plan.featured
                      ? "bg-gradient-to-r from-[#203eec] to-[#00d4ff] bg-clip-text text-transparent"
                      : ""
                  }`}
                >
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-lg">{plan.period}</span>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleCheckout(plan.priceType)}
                disabled={loading !== null}
                className={`w-full flex items-center justify-center px-8 py-4 rounded-full text-base font-medium transition-all relative overflow-hidden group mb-8 disabled:opacity-70 disabled:cursor-not-allowed ${
                  plan.featured ? "text-white hover:shadow-2xl" : "hover:bg-secondary"
                }`}
                style={
                  plan.featured
                    ? {
                        background: "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                        boxShadow: "0 8px 32px rgba(32, 62, 236, 0.4)",
                      }
                    : { border: "1px solid #203eec", color: "#203eec" }
                }
              >
                <span className="relative z-10">
                  {loading === plan.priceType ? "Redirecting..." : plan.cta}
                </span>
                {plan.featured && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl bg-gradient-to-r from-[#203eec] to-[#00d4ff]" />
                )}
              </button>

              {/* Features */}
              <ul className="space-y-3 relative z-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.featured ? "bg-[#203eec]/10" : "bg-zinc-100"
                      }`}
                    >
                      <Check
                        className="w-3 h-3"
                        style={{ color: plan.featured ? "#203eec" : "#71717a" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
