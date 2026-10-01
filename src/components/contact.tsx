import { site } from "@/lib/content";
import { Reveal } from "./reveal";

export function Contact() {
  return (
    <section
      id="contact"
      className="border-t border-white/8 px-6 py-20 text-center sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-2xl">
        <Reveal>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Let&apos;s work <span className="text-gradient">together</span>
          </h2>
          <p className="mt-4 text-mist-400">
            Got a project, a deadline, or just an idea? Send it over.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${site.whatsapp.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-brand-500 to-aqua-400 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              {site.whatsapp}
            </a>
            <a
              href="#work"
              className="inline-flex items-center rounded-full border border-white/12 px-6 py-3 text-sm font-semibold transition hover:border-brand-400 hover:bg-white/5"
            >
              Back to work
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
