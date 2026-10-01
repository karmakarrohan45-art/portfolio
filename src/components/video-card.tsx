"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoProject } from "@/lib/content";

type VideoCardProps = {
  project: VideoProject;
  onOpen: (project: VideoProject) => void;
  index: number;
};

const HOVER_DELAY = 350;

export function VideoCard({ project, onOpen, index }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [failed, setFailed] = useState(false);

  const clearTimer = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }, []);

  const startPreview = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.currentTime = 0;
    void video.play().catch(() => {});
    setPreviewing(true);
  }, []);

  const stopPreview = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setPreviewing(false);
  }, []);

  useEffect(() => clearTimer, [clearTimer]);
  useEffect(() => startPreview(), [startPreview]);

  const canHover = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches,
    [],
  );

  const handleMediaClick = () => {
    if (!canHover() && !previewing) {
      startPreview();
      return;
    }
    onOpen(project);
  };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-card border border-white/10 bg-ink-800 transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
      onMouseEnter={() => {
        if (!canHover()) return;
        clearTimer();
        hoverTimer.current = setTimeout(startPreview, HOVER_DELAY);
      }}
      onMouseLeave={() => {
        clearTimer();
        stopPreview();
      }}
    >
      <div
        className="card-surface relative aspect-video cursor-pointer"
        onClick={handleMediaClick}
        role="button"
        tabIndex={0}
        aria-label={`Play ${project.title}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen(project);
          }
        }}
      >
        {!failed && (
          <video
            ref={videoRef}
            className={`size-full object-cover transition-opacity duration-500 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            src={project.src}
            preload="metadata"
            playsInline
            muted
            autoPlay
            loop
            onLoadedData={() => setReady(true)}
            onError={() => setFailed(true)}
          />
        )}

        {!previewing && !failed && (
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-white/95 text-ink-950 shadow-lg transition duration-300 group-hover:scale-110 sm:size-[4.25rem]">
              <svg viewBox="0 0 24 24" className="ml-1 size-6 sm:size-7" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
            </span>
          </span>
        )}

        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
          {project.duration}
        </span>

        <span className="pointer-events-none absolute top-3 left-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-mist-200 uppercase backdrop-blur-sm">
          {project.client}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-mist-50">
            {project.title}
            {project.titleNote && (
              <span className="text-mist-400"> ({project.titleNote})</span>
            )}
          </h3>
          <span className="shrink-0 text-xs text-mist-400">{project.year}</span>
        </div>

        <p className="text-sm leading-relaxed text-mist-400">{project.description}</p>

        <ul className="mt-auto flex flex-wrap gap-2 pt-1">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-mist-400"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 pt-1 text-xs text-mist-500">
          <span>{project.resolution}</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => onOpen(project)}
            className="font-semibold text-brand-400 transition-colors hover:text-aqua-300"
          >
            Watch {project.duration}
          </button>
        </div>
      </div>

      <span className="sr-only">Card {index + 1}</span>
    </article>
  );
}
