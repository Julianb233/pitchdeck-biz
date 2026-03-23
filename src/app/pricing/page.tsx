import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PricingPage } from "@/components/sections/pricing-page"
import { GradientBar } from "@/components/ui/gradient-bar"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Pricing — pitchdeck.biz",
  description:
    "Choose the plan that fits your fundraising journey. From first-time founders to serial entrepreneurs, we have a tier for you.",
  path: "/pricing",
})

export default function PricingRoute() {
  return (
    <>
      <Header />
      <main>
        <PricingPage />
      </main>
      <Footer />
      <GradientBar />
    </>
  )
}
