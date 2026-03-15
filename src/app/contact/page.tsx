import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FinalCTA } from "@/components/sections/final-cta";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Get in touch with pitchdeck.biz. Questions about AI pitch deck generation? We are here to help.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-28">
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
