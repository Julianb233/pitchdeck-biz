import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata = {
  title: "Privacy Policy | pitchdeck.biz",
  description: "Privacy policy for pitchdeck.biz AI pitch deck generator.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-28 pb-20">
        <div className="max-w-[720px] mx-auto px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-8">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Last updated: March 15, 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">1. Information We Collect</h2>
              <p>
                When you use pitchdeck.biz, we collect information you provide directly, including your name,
                email address, and business information you upload or input to generate pitch decks. We also
                collect usage data such as pages visited, features used, and device information through standard
                web analytics.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">2. How We Use Your Information</h2>
              <p>
                We use your information to provide and improve our AI pitch deck generation service, process
                your account and transactions, communicate with you about your account or our services, and
                ensure the security of our platform. Your uploaded business content is processed by AI models
                solely to generate your requested deliverables.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">3. Data Storage and Security</h2>
              <p>
                Your data is stored securely using industry-standard encryption. We retain your generated
                pitch decks and uploaded content for as long as your account is active. You may request
                deletion of your data at any time by contacting us at hello@pitchdeck.biz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">4. Third-Party Services</h2>
              <p>
                We use third-party AI services to power our deck generation. Your business content may be
                processed by these services strictly for the purpose of generating your deliverables. We do
                not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">5. Cookies</h2>
              <p>
                We use essential cookies to maintain your session and preferences. We may also use analytics
                cookies to understand how our service is used. You can control cookie settings through your
                browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">6. Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal data. You may also request a
                copy of your data in a portable format. To exercise these rights, contact us at
                hello@pitchdeck.biz.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">7. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any material
                changes by posting the updated policy on this page with a revised date.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">8. Contact Us</h2>
              <p>
                If you have questions about this privacy policy, please contact us at{" "}
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
