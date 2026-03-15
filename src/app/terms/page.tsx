import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Terms of Service | pitchdeck.biz",
  description: "Terms of service for pitchdeck.biz AI pitch deck generator.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-28 pb-20">
        <div className="max-w-[720px] mx-auto px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: March 15, 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using pitchdeck.biz, you agree to be bound by these Terms of Service. If you
                do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">2. Description of Service</h2>
              <p>
                pitchdeck.biz is an AI-powered platform that generates professional pitch decks, sell sheets,
                one-pagers, and branding kits from your business information. The service processes your
                uploaded content using artificial intelligence to create investor-ready deliverables.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for
                all activities that occur under your account. You must provide accurate and complete information
                when creating an account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">4. Intellectual Property</h2>
              <p>
                You retain ownership of all content you upload to pitchdeck.biz. The generated pitch decks
                and deliverables are yours to use for any lawful purpose. The pitchdeck.biz platform, including
                its design, code, and AI models, remains our intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">5. Acceptable Use</h2>
              <p>
                You agree not to use the service to generate content that is illegal, fraudulent, misleading,
                or that infringes on the rights of others. You are solely responsible for the accuracy of the
                business information you provide and the use of generated materials.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">6. Payment and Refunds</h2>
              <p>
                Paid features are billed according to the pricing plan you select. Payments are non-refundable
                except where required by applicable law. We reserve the right to modify pricing with reasonable
                notice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">7. Disclaimers</h2>
              <p>
                The service is provided &quot;as is&quot; without warranties of any kind. AI-generated content
                may contain errors or inaccuracies. You should review all generated materials before presenting
                them to investors or other parties. We do not guarantee that use of our service will result in
                funding or business success.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">8. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, pitchdeck.biz shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">9. Termination</h2>
              <p>
                We may suspend or terminate your access to the service at any time for violation of these terms.
                You may delete your account at any time by contacting us at hello@pitchdeck.biz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">10. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the service after changes
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">11. Contact Us</h2>
              <p>
                If you have questions about these terms, please contact us at{" "}
                <a href="mailto:hello@pitchdeck.biz" className="underline" style={{ color: "#203eec" }}>
                  hello@pitchdeck.biz
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
