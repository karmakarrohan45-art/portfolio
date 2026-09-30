import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Topbar } from "@/components/topbar";
import { Work } from "@/components/work";

export default function Home() {
  return (
    <>
      <Topbar />
      <main id="top" className="flex-1">
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
