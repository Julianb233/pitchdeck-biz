import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FinalCTA } from "@/components/sections/final-cta";

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
