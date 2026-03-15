import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Hero } from "@/components/sections/hero"
import { HowItWorks } from "@/components/sections/how-it-works"
import { Deliverables } from "@/components/sections/deliverables"
import { Benefits } from "@/components/sections/benefits"
import { SubscriptionUpsell } from "@/components/sections/subscription-upsell"
import { Testimonials } from "@/components/sections/testimonials"
import { Pricing } from "@/components/sections/pricing"
import { FAQ } from "@/components/sections/faq"
import { FinalCTA } from "@/components/sections/final-cta"
import { GradientBar } from "@/components/ui/gradient-bar"
import { createPageMetadata, getHomepageJsonLd } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "pitchdeck.biz — AI-Powered Pitch Deck Generator",
  description:
    "Create a professional investor pitch deck in minutes with AI. Upload your business docs, get a complete pitch deck, sell sheet, one-pager, and branding kit.",
  path: "/",
})

export default function HomePage() {
  const jsonLd = getHomepageJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Deliverables />
        <Benefits />
        <SubscriptionUpsell />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <GradientBar />
    </>
  )
}
