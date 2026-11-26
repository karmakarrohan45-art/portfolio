import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Presets } from "@/components/presets";
import { Topbar } from "@/components/topbar";
import { Work } from "@/components/work";

export default function Home() {
  return (
    <>
      <Topbar />
      <main id="top" className="flex-1">
        <Hero />
        <Presets />
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
