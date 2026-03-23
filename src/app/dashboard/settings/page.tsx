"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { PLANS, PLAN_LIST, type PlanId, type BillingPeriod } from "@/lib/pricing"
import { Check, ArrowUp, ArrowDown, AlertCircle } from "lucide-react"

interface SubscriptionData {
  status: string
  plan: string
  tier: string
  billing_period: string
  stripe_subscription_id?: string
  token_balance: number
  tokens_allocated: number
  image_credits_used: number
  image_credits_limit: number
  deck_count_this_period: number
  decks_per_month: number
  revision_cycles: number
  current_period_start: string | null
  current_period_end: string | null
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const [sub, setSub] = useState<SubscriptionData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [showConfirm, setShowConfirm] = useState<{
    type: "upgrade" | "downgrade" | "cancel"
    planId?: PlanId
  } | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription")
      if (res.ok) {
        const data = await res.json()
        setSub(data)
        if (data.billing_period) {
          setBillingPeriod(data.billing_period)
        }
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchSubscription()
  }, [user, fetchSubscription])

  async function handleChangePlan(planId: PlanId) {
    setActionLoading(planId)
    setMessage(null)
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingPeriod }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || `Switched to ${PLANS[planId].name} (${billingPeriod})`,
        })
        // Refresh subscription data
        await fetchSubscription()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update plan" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setActionLoading(null)
      setShowConfirm(null)
    }
  }

  async function handleCancelSubscription() {
    setActionLoading("cancel")
    setMessage(null)
    try {
      const res = await fetch("/api/subscription", { method: "DELETE" })
      const data = await res.json()
      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || "Subscription will cancel at period end.",
        })
        await fetchSubscription()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to cancel" })
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." })
    } finally {
      setActionLoading(null)
      setShowConfirm(null)
    }
  }

  async function handleNewSubscription(planId: PlanId) {
    setActionLoading(planId)
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", planId, billingPeriod }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: "error", text: "Failed to start checkout" })
      }
    } catch {
      setMessage({ type: "error", text: "Network error" })
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const currentTier = (sub?.tier as PlanId) || null
  const isActive = sub?.status === "active" || sub?.status === "canceling"
  const isCanceling = sub?.status === "canceling"

  const TIER_RANK: Record<PlanId, number> = {
    starter: 0,
    pro: 1,
    founder_suite: 2,
  }

  function getPlanAction(
    planId: PlanId
  ): "current" | "upgrade" | "downgrade" | "subscribe" {
    if (!isActive || !currentTier) return "subscribe"
    if (planId === currentTier) return "current"
    return TIER_RANK[planId] > TIER_RANK[currentTier] ? "upgrade" : "downgrade"
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "N/A"
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage your plan, billing, and usage
        </p>
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`rounded-xl p-4 border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-red-500/10 border-red-500/20 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Current Plan Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Current Plan</h2>
        {isActive && currentTier ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#203eec] to-[#00d4ff] text-white">
                {PLANS[currentTier].name}
              </span>
              <span className="text-sm text-zinc-400 capitalize">
                {sub?.billing_period || "monthly"} billing
              </span>
              {isCanceling && (
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">
                  Cancels at period end
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Decks this period
                </p>
                <p className="text-lg font-semibold text-white mt-1">
                  {sub?.deck_count_this_period ?? 0}
                  {(sub?.decks_per_month ?? 0) > 0 && (
                    <span className="text-zinc-500 text-sm">
                      {" "}
                      / {sub?.decks_per_month}
                    </span>
                  )}
                  {(sub?.decks_per_month ?? 0) === -1 && (
                    <span className="text-zinc-500 text-sm"> / unlimited</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Image credits used
                </p>
                <p className="text-lg font-semibold text-white mt-1">
                  {sub?.image_credits_used ?? 0}
                  {(sub?.image_credits_limit ?? 0) > 0 && (
                    <span className="text-zinc-500 text-sm">
                      {" "}
                      / {sub?.image_credits_limit}
                    </span>
                  )}
                  {(sub?.image_credits_limit ?? 0) === -1 && (
                    <span className="text-zinc-500 text-sm"> / unlimited</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Token balance
                </p>
                <p className="text-lg font-semibold text-white mt-1">
                  {sub?.token_balance ?? 0}
                  <span className="text-zinc-500 text-sm">
                    {" "}
                    / {sub?.tokens_allocated ?? 0}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Period ends
                </p>
                <p className="text-sm font-medium text-white mt-1.5">
                  {formatDate(sub?.current_period_end ?? null)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-zinc-400">
            <p>No active subscription. Choose a plan below to get started.</p>
          </div>
        )}
      </div>

      {/* Billing Period Toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-400">Billing:</span>
        <button
          onClick={() => setBillingPeriod("monthly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            billingPeriod === "monthly"
              ? "bg-[#203eec] text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod("annual")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            billingPeriod === "annual"
              ? "bg-[#203eec] text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Annual (save up to 25%)
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_LIST.map((plan) => {
          const action = getPlanAction(plan.id)
          const price =
            billingPeriod === "annual" ? plan.annualPrice : plan.monthlyPrice
          const isRecommended = plan.recommended === true

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 transition-all ${
                action === "current"
                  ? "border-2 border-[#203eec] bg-[#203eec]/5"
                  : "border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{plan.name}</h3>
                {action === "current" && (
                  <span className="text-xs bg-[#203eec]/20 text-[#203eec] px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
                {isRecommended && action !== "current" && (
                  <span className="text-xs bg-[#203eec] text-white px-2 py-0.5 rounded-full font-medium">
                    Popular
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">
                  ${Math.floor(price)}
                </span>
                <span className="text-zinc-500">/mo</span>
              </div>

              {billingPeriod === "annual" && (
                <p className="text-xs text-zinc-500 mb-4">
                  ${plan.annualTotal}/yr total
                </p>
              )}

              {action === "current" ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-500 cursor-not-allowed"
                >
                  <Check className="w-4 h-4 inline mr-1" />
                  Current Plan
                </button>
              ) : action === "subscribe" ? (
                <button
                  onClick={() => handleNewSubscription(plan.id)}
                  disabled={actionLoading !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                  }}
                >
                  {actionLoading === plan.id ? "Redirecting..." : "Subscribe"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    setShowConfirm({ type: action, planId: plan.id })
                  }
                  disabled={actionLoading !== null}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 ${
                    action === "upgrade"
                      ? "bg-[#203eec] text-white hover:bg-[#1a35d1]"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {action === "upgrade" ? (
                    <>
                      <ArrowUp className="w-4 h-4 inline mr-1" />
                      Upgrade
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4 inline mr-1" />
                      Downgrade
                    </>
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Cancel subscription */}
      {isActive && !isCanceling && (
        <div className="border border-zinc-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">
            Cancel Subscription
          </h3>
          <p className="text-xs text-zinc-500 mb-4">
            Your subscription will remain active until the end of the current
            billing period. You will not be charged again.
          </p>
          <button
            onClick={() => setShowConfirm({ type: "cancel" })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all"
          >
            Cancel subscription
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              <h3 className="font-semibold text-white text-lg">
                {showConfirm.type === "cancel"
                  ? "Cancel Subscription?"
                  : showConfirm.type === "upgrade"
                  ? "Upgrade Plan?"
                  : "Downgrade Plan?"}
              </h3>
            </div>

            {showConfirm.type === "cancel" ? (
              <p className="text-sm text-zinc-400 mb-6">
                Your plan will remain active until the end of the current billing
                period. After that you will lose access to paid features.
              </p>
            ) : showConfirm.type === "upgrade" ? (
              <p className="text-sm text-zinc-400 mb-6">
                You will be upgraded to{" "}
                <strong className="text-white">
                  {showConfirm.planId
                    ? PLANS[showConfirm.planId].name
                    : ""}
                </strong>{" "}
                immediately. A prorated charge will be applied for the remainder
                of your current billing period.
              </p>
            ) : (
              <p className="text-sm text-zinc-400 mb-6">
                You will be downgraded to{" "}
                <strong className="text-white">
                  {showConfirm.planId
                    ? PLANS[showConfirm.planId].name
                    : ""}
                </strong>
                . A prorated credit will be applied. Some features may become
                unavailable.
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                Never mind
              </button>
              <button
                onClick={() => {
                  if (showConfirm.type === "cancel") {
                    handleCancelSubscription()
                  } else if (showConfirm.planId) {
                    handleChangePlan(showConfirm.planId)
                  }
                }}
                disabled={actionLoading !== null}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 ${
                  showConfirm.type === "cancel"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[#203eec] text-white hover:bg-[#1a35d1]"
                }`}
              >
                {actionLoading
                  ? "Processing..."
                  : showConfirm.type === "cancel"
                  ? "Yes, cancel"
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
