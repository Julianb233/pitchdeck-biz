"use client"

import { useState } from "react"
import { Check, X, Sparkles, Crown, Zap, Gift, Video, Palette } from "lucide-react"
import { PLAN_LIST, ADDON_LIST, type PlanId, type BillingPeriod } from "@/lib/pricing"

// ---------------------------------------------------------------------------
// Feature comparison matrix data
// ---------------------------------------------------------------------------

interface ComparisonFeature {
  name: string
  starter: string | boolean
  pro: string | boolean
  founder_suite: string | boolean
}

interface ComparisonCategory {
  category: string
  features: ComparisonFeature[]
}

const COMPARISON_DATA: ComparisonCategory[] = [
  {
    category: "Deck Creation",
    features: [
      { name: "Decks per month", starter: "1", pro: "Unlimited", founder_suite: "Unlimited" },
      { name: "Slides per deck", starter: "10-15", pro: "10-15", founder_suite: "10-15" },
      { name: "PPTX + PDF export", starter: true, pro: true, founder_suite: true },
      { name: "Google Slides export", starter: false, pro: true, founder_suite: true },
      { name: "Revision cycles per deck", starter: false, pro: "2", founder_suite: "Unlimited" },
      { name: "Priority generation queue", starter: false, pro: false, founder_suite: true },
    ],
  },
  {
    category: "Deliverables",
    features: [
      { name: "Sell sheet", starter: true, pro: true, founder_suite: true },
      { name: "One-pager", starter: true, pro: true, founder_suite: true },
      { name: "Brand kit", starter: true, pro: true, founder_suite: true },
      { name: "Social kit + email templates", starter: false, pro: true, founder_suite: true },
      { name: "Ad creatives + press kit", starter: false, pro: true, founder_suite: true },
      { name: "Executive summary", starter: false, pro: true, founder_suite: true },
      { name: "Investor update template", starter: false, pro: true, founder_suite: true },
      { name: "Board deck template", starter: false, pro: true, founder_suite: true },
    ],
  },
  {
    category: "AI & Visuals",
    features: [
      { name: "AI image credits/month", starter: "3", pro: "50", founder_suite: "Unlimited" },
      { name: "Nano Banana Pro branded visuals", starter: false, pro: true, founder_suite: true },
      { name: "Imagen 4 hero/stock imagery", starter: false, pro: true, founder_suite: true },
    ],
  },
  {
    category: "Fundraising Tools",
    features: [
      { name: "Full business plan (20-30 pages)", starter: false, pro: false, founder_suite: true },
      { name: "Financial model template", starter: false, pro: false, founder_suite: true },
      { name: "Cap table template", starter: false, pro: false, founder_suite: true },
      { name: "Term sheet guide + negotiation framework", starter: false, pro: false, founder_suite: true },
      { name: "Due diligence checklist", starter: false, pro: false, founder_suite: true },
      { name: "Investor outreach email sequences", starter: false, pro: false, founder_suite: true },
      { name: "Data room setup guide", starter: false, pro: false, founder_suite: true },
      { name: "AI pitch coaching (1 session/month)", starter: false, pro: false, founder_suite: true },
    ],
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")

  async function handleCheckout(planId: PlanId) {
    setLoading(planId)
    try {
      const meRes = await fetch("/api/auth/me")
      if (!meRes.ok) {
        window.location.href = "/signup"
        return
      }
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", planId, billingPeriod }),
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

  async function handleAddonCheckout(addonId: string) {
    setLoading(addonId)
    try {
      const meRes = await fetch("/api/auth/me")
      if (!meRes.ok) {
        window.location.href = "/signup"
        return
      }
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "addon", addonId }),
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

  const badgeConfig: Record<string, { icon: typeof Sparkles; label: string }> = {
    starter: { icon: Zap, label: "Get Started" },
    pro: { icon: Crown, label: "Most Popular" },
    founder_suite: { icon: Sparkles, label: "Complete Toolkit" },
  }

  const ctaLabels: Record<string, string> = {
    starter: "Start with Starter",
    pro: "Go Pro",
    founder_suite: "Get Founder Suite",
  }

  const addonIcons: Record<string, typeof Gift> = {
    pitch_coach: Gift,
    video_deck: Video,
    monthly_branding: Palette,
  }

  return (
    <section className="py-20 md:py-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
            Pricing
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
            Investor-ready pitch decks at a fraction of the cost
          </h1>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            Agency-quality pitch decks start at $5,000. We deliver the same
            results in minutes, not weeks.
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Billing Toggle                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center justify-center gap-4 mb-12 md:mb-16">
          <span
            className={`text-sm font-medium transition-colors ${
              billingPeriod === "monthly"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingPeriod(
                billingPeriod === "monthly" ? "annual" : "monthly",
              )
            }
            className="relative w-14 h-7 rounded-full transition-colors duration-300"
            style={{
              background:
                billingPeriod === "annual"
                  ? "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)"
                  : "#d4d4d8",
            }}
            aria-label={`Switch to ${billingPeriod === "monthly" ? "annual" : "monthly"} billing`}
          >
            <div
              className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300"
              style={{
                left: "2px",
                transform:
                  billingPeriod === "annual"
                    ? "translateX(30px)"
                    : "translateX(0)",
              }}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors ${
              billingPeriod === "annual"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Annual
          </span>
          {billingPeriod === "annual" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              Save up to 34%
            </span>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Pricing Cards — 3 Tier Grid                                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {PLAN_LIST.map((plan) => {
            const isRecommended = plan.recommended === true
            const badge = badgeConfig[plan.id]
            const price =
              billingPeriod === "annual" ? plan.annualPrice : plan.monthlyPrice
            const BadgeIcon = badge?.icon ?? Zap

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 md:p-10 transition-all duration-300 flex flex-col ${
                  isRecommended
                    ? "border-2 border-[#203eec] shadow-2xl md:scale-105 z-10"
                    : "border border-border hover:border-muted-foreground/30 hover:shadow-lg"
                }`}
                style={
                  isRecommended
                    ? {
                        boxShadow:
                          "0 20px 60px rgba(32, 62, 236, 0.15), 0 8px 24px rgba(0, 212, 255, 0.1)",
                      }
                    : undefined
                }
              >
                {/* Background gradient for recommended */}
                {isRecommended && (
                  <div
                    className="absolute inset-0 rounded-3xl opacity-[0.03]"
                    style={{
                      background:
                        "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                    }}
                  />
                )}

                {/* Badge */}
                <div className="flex items-center gap-2 mb-6">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isRecommended
                        ? "bg-gradient-to-r from-[#203eec] to-[#00d4ff] text-white"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    {badge?.label}
                  </span>
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-semibold mb-2 relative z-10">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-2 relative z-10">
                  <span
                    className={`text-5xl font-bold tracking-tight ${
                      isRecommended
                        ? "bg-gradient-to-r from-[#203eec] to-[#00d4ff] bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    ${price}
                  </span>
                  <span className="text-muted-foreground text-lg">/mo</span>
                </div>

                {/* Billing note */}
                <p className="text-xs text-muted-foreground mb-8 relative z-10">
                  {billingPeriod === "annual" ? (
                    <>
                      Billed annually at ${plan.annualTotal}/yr{" "}
                      <span className="text-green-600 font-medium">
                        (save $
                        {(plan.monthlyPrice - plan.annualPrice) * 12}
                        /yr)
                      </span>
                    </>
                  ) : (
                    "Billed monthly, cancel anytime"
                  )}
                </p>

                {/* CTA Button */}
                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading !== null}
                  className={`w-full flex items-center justify-center px-8 py-4 rounded-full text-base font-medium transition-all relative overflow-hidden group mb-8 disabled:opacity-70 disabled:cursor-not-allowed ${
                    isRecommended
                      ? "text-white hover:shadow-2xl"
                      : "hover:bg-secondary"
                  }`}
                  style={
                    isRecommended
                      ? {
                          background:
                            "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                          boxShadow: "0 8px 32px rgba(32, 62, 236, 0.4)",
                        }
                      : { border: "1px solid #203eec", color: "#203eec" }
                  }
                >
                  <span className="relative z-10">
                    {loading === plan.id
                      ? "Redirecting..."
                      : ctaLabels[plan.id]}
                  </span>
                  {isRecommended && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl bg-gradient-to-r from-[#203eec] to-[#00d4ff]" />
                  )}
                </button>

                {/* Features */}
                <ul className="space-y-3 relative z-10 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isRecommended
                            ? "bg-[#203eec]/10"
                            : "bg-zinc-100 dark:bg-zinc-800"
                        }`}
                      >
                        <Check
                          className="w-3 h-3"
                          style={{
                            color: isRecommended ? "#203eec" : "#71717a",
                          }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Feature Comparison Matrix                                         */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-20 md:mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Compare Plans
            </h2>
            <p className="mt-3 text-muted-foreground">
              See exactly what&apos;s included in each tier
            </p>
          </div>

          {/* Desktop comparison table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Sticky plan header */}
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 w-[40%]" />
                  {PLAN_LIST.map((plan) => {
                    const isRecommended = plan.recommended === true
                    return (
                      <th
                        key={plan.id}
                        className="py-4 px-4 text-center w-[20%]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-base font-semibold ${
                              isRecommended ? "text-[#203eec]" : ""
                            }`}
                          >
                            {plan.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            $
                            {billingPeriod === "annual"
                              ? plan.annualPrice
                              : plan.monthlyPrice}
                            /mo
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((section) => (
                  <>
                    {/* Category header */}
                    <tr key={section.category}>
                      <td
                        colSpan={4}
                        className="pt-8 pb-3 px-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {section.category}
                      </td>
                    </tr>
                    {/* Feature rows */}
                    {section.features.map((feature) => (
                      <tr
                        key={feature.name}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 text-sm">
                          {feature.name}
                        </td>
                        {(["starter", "pro", "founder_suite"] as const).map(
                          (tier) => {
                            const val = feature[tier]
                            return (
                              <td
                                key={tier}
                                className="py-3.5 px-4 text-center"
                              >
                                {typeof val === "boolean" ? (
                                  val ? (
                                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                                  ) : (
                                    <X className="w-5 h-5 text-zinc-300 dark:text-zinc-600 mx-auto" />
                                  )
                                ) : (
                                  <span
                                    className={`text-sm font-medium ${
                                      val === "Unlimited"
                                        ? "text-[#203eec]"
                                        : ""
                                    }`}
                                  >
                                    {val}
                                  </span>
                                )}
                              </td>
                            )
                          },
                        )}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
              {/* CTA row at the bottom of the table */}
              <tfoot>
                <tr>
                  <td className="pt-8 px-4" />
                  {PLAN_LIST.map((plan) => {
                    const isRecommended = plan.recommended === true
                    return (
                      <td key={plan.id} className="pt-8 px-4 text-center">
                        <button
                          onClick={() => handleCheckout(plan.id)}
                          disabled={loading !== null}
                          className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                            isRecommended
                              ? "text-white hover:shadow-xl"
                              : "hover:bg-secondary"
                          }`}
                          style={
                            isRecommended
                              ? {
                                  background:
                                    "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                                  boxShadow:
                                    "0 4px 16px rgba(32, 62, 236, 0.3)",
                                }
                              : {
                                  border: "1px solid #203eec",
                                  color: "#203eec",
                                }
                          }
                        >
                          {loading === plan.id
                            ? "Redirecting..."
                            : ctaLabels[plan.id]}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile comparison — accordion-style per plan */}
          <div className="md:hidden space-y-6">
            {PLAN_LIST.map((plan) => {
              const isRecommended = plan.recommended === true
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 ${
                    isRecommended
                      ? "border-[#203eec]"
                      : "border-border"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isRecommended ? "text-[#203eec]" : ""
                    }`}
                  >
                    {plan.name} — $
                    {billingPeriod === "annual"
                      ? plan.annualPrice
                      : plan.monthlyPrice}
                    /mo
                  </h3>
                  {COMPARISON_DATA.map((section) => (
                    <div key={section.category} className="mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {section.category}
                      </p>
                      <ul className="space-y-2">
                        {section.features.map((feature) => {
                          const val = feature[plan.id]
                          if (val === false) return null
                          return (
                            <li
                              key={feature.name}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span>
                                {feature.name}
                                {typeof val === "string" &&
                                  val !== "Unlimited" && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({val})
                                    </span>
                                  )}
                                {val === "Unlimited" && (
                                  <span className="text-[#203eec] font-medium">
                                    {" "}
                                    (Unlimited)
                                  </span>
                                )}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loading !== null}
                    className={`w-full mt-4 flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                      isRecommended
                        ? "text-white"
                        : "hover:bg-secondary"
                    }`}
                    style={
                      isRecommended
                        ? {
                            background:
                              "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                            boxShadow:
                              "0 4px 16px rgba(32, 62, 236, 0.3)",
                          }
                        : {
                            border: "1px solid #203eec",
                            color: "#203eec",
                          }
                    }
                  >
                    {loading === plan.id
                      ? "Redirecting..."
                      : ctaLabels[plan.id]}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Add-ons Section                                                  */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-16 md:mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Premium Add-ons
            </h3>
            <p className="mt-3 text-muted-foreground">
              Enhance any plan with these premium extras
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ADDON_LIST.map((addon) => {
              const AddonIcon = addonIcons[addon.id] ?? Gift
              return (
                <div
                  key={addon.id}
                  className="relative rounded-2xl border border-border p-6 hover:border-muted-foreground/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#203eec]/10 flex items-center justify-center">
                      <AddonIcon className="w-5 h-5 text-[#203eec]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{addon.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {addon.type === "recurring" ? "per month" : "one-time"}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {addon.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${addon.price}</span>
                    <button
                      onClick={() => handleAddonCheckout(addon.id)}
                      disabled={loading !== null}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        border: "1px solid #203eec",
                        color: "#203eec",
                      }}
                    >
                      {loading === addon.id ? "..." : "Add"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ-style note                                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime. Need a custom
            plan?{" "}
            <a href="/contact" className="text-[#203eec] hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
