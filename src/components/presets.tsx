"use client";

import { useState } from "react";
import type { EditingPreset, VideoProject } from "@/lib/content";
import { presets } from "@/lib/content";
import { Lightbox } from "./lightbox";
import { PresetCard } from "./preset-card";
import { Reveal } from "./reveal";

function toVideoProject(preset: EditingPreset, duration?: string): VideoProject {
  return {
    id: preset.id,
    title: preset.title,
    client: preset.software,
    year: "2026",
    duration: duration ?? "Preview",
    resolution: preset.resolution ?? "1920×1080",
    src: preset.previewSrc ?? "",
    description: preset.description,
    tags: preset.tags,
  };
}

export function Presets() {
  const [active, setActive] = useState<VideoProject | null>(null);
  const singlePack = presets.length === 1;

  const handleWatch = (preset: EditingPreset, duration?: string) => {
    if (!preset.previewSrc) return;
    setActive(toVideoProject(preset, duration));
  };

  return (
    <section id="presets" className="px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Editing Presets</h2>
          <p className="mt-2 text-sm text-mist-400">
            Ready-to-use presets &amp; templates · instant checkout via Razorpay
          </p>
        </Reveal>

        {singlePack ? (
          <Reveal className="h-full">
            <PresetCard preset={presets[0]} featured onWatch={handleWatch} />
          </Reveal>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2">
            {presets.map((preset, i) => (
              <Reveal key={preset.id} delay={i * 90} className="h-full">
                <PresetCard preset={preset} onWatch={handleWatch} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <Lightbox project={active} onClose={() => setActive(null)} />
    </section>
  );
}
