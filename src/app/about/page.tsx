import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { About } from "@/components/sections/about";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-28">
        <About />
      </main>
      <Footer />
    </div>
  );
}
