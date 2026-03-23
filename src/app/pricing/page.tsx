import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GradientBar } from "@/components/ui/gradient-bar"
import { PricingPage } from "@/components/sections/pricing-page"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Pricing — pitchdeck.biz",
  description:
    "Choose the right plan for your pitch deck needs. 3 tiers from Starter to Founder Suite with monthly and annual billing options.",
  path: "/pricing",
})

export default function PricingRoute() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <PricingPage />
      </main>
      <Footer />
      <GradientBar />
    </>
  )
}
