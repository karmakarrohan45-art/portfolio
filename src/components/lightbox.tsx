"use client";

import { useCallback, useEffect, useRef } from "react";
import type { VideoProject } from "@/lib/content";

type LightboxProps = {
  project: VideoProject | null;
  onClose: () => void;
};

export function Lightbox({ project, onClose }: LightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!project) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      restoreFocus.current?.focus?.();
    };
  }, [project, handleKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!project || !video) return;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [project]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-50 grid place-items-center bg-black/92 p-4 backdrop-blur-md sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-6xl">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
          <video
            ref={videoRef}
            key={project.id}
            className="max-h-[76vh] w-full bg-black"
            src={project.src}
            controls
            controlsList="nodownload"
            autoPlay
            playsInline
            preload="auto"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-mist-50">
              {project.title}
              {project.titleNote && (
                <span className="text-mist-400"> ({project.titleNote})</span>
              )}
            </h3>
            <p className="text-xs text-mist-400">
              {project.client} · {project.year} · {project.resolution} ·{" "}
              {project.duration}
            </p>
          </div>
        </div>
      </div>

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="fixed top-4 right-4 grid size-11 place-items-center rounded-full border border-white/12 bg-white/8 text-2xl leading-none text-white transition hover:bg-white/18 sm:top-6 sm:right-6"
      >
        &times;
      </button>
    </div>
  );
}
