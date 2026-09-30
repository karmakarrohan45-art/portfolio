import { site } from "@/lib/content";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section className="px-6 pt-24 pb-10 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-5 text-xs font-medium tracking-[0.18em] text-mist-400 uppercase">
            {site.role}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="max-w-4xl text-4xl font-extrabold sm:text-6xl lg:text-7xl">
            I make videos that{" "}
            <span className="text-gradient">move people</span>.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-mist-400 sm:text-lg">
            {site.intro}
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-brand-500 to-aqua-400 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              View my work
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center rounded-full border border-white/12 px-6 py-3 text-sm font-semibold transition hover:border-brand-400 hover:bg-white/5"
            >
              Get in touch
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
