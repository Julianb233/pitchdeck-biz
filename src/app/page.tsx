import { getHomepageJsonLd } from "@/lib/metadata"
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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getHomepageJsonLd()) }}
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
