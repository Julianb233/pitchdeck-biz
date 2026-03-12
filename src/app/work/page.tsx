import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SelectedWorks } from "@/components/sections/selected-works";

export default function WorkPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-28">
        <SelectedWorks />
      </main>
      <Footer />
    </div>
  );
}
