import { aboutCopy, skills } from "@/lib/content";
import { Reveal } from "./reveal";

export function About() {
  return (
    <section id="about" className="border-t border-white/8 px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">About</h2>
        </Reveal>

        <div className="grid items-start gap-10 md:grid-cols-[1.3fr_1fr] md:gap-14">
          <Reveal className="space-y-4">
            {aboutCopy.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-mist-400">
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal as="ul" delay={120} className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
            {skills.map((skill) => (
              <li
                key={skill.label}
                className="flex items-baseline justify-between gap-4 bg-ink-800 px-5 py-4 text-sm"
              >
                <span className="font-semibold text-mist-50">{skill.label}</span>
                <span className="text-right text-mist-400">{skill.detail}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
