import { presets } from "@/lib/content";
import { PresetCard } from "./preset-card";
import { Reveal } from "./reveal";

export function Presets() {
  const singlePack = presets.length === 1;

  return (
    <section id="presets" className="px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Editing Presets</h2>
          <p className="mt-2 text-sm text-mist-400">
            Ready-to-use presets &amp; templates · secure checkout via Shopify
          </p>
        </Reveal>

        {singlePack ? (
          <Reveal className="h-full">
            <PresetCard preset={presets[0]} featured />
          </Reveal>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2">
            {presets.map((preset, i) => (
              <Reveal key={preset.id} delay={i * 90} className="h-full">
                <PresetCard preset={preset} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
