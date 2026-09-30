"use client";

import { useState } from "react";
import type { VideoProject } from "@/lib/content";
import { videos } from "@/lib/content";
import { Lightbox } from "./lightbox";
import { Reveal } from "./reveal";
import { VideoCard } from "./video-card";

export function Work() {
  const [active, setActive] = useState<VideoProject | null>(null);

  return (
    <section id="work" className="px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Selected Work</h2>
          <p className="mt-2 text-sm text-mist-400">
            Hover a card to preview · click to watch fullscreen
          </p>
        </Reveal>

        <div className="grid gap-7 sm:grid-cols-2">
          {videos.map((project, i) => (
            <Reveal key={project.id} delay={i * 90} className="h-full">
              <VideoCard project={project} index={i} onOpen={setActive} />
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox project={active} onClose={() => setActive(null)} />
    </section>
  );
}
