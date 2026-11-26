"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditingPreset } from "@/lib/content";

type PresetCardProps = {
  preset: EditingPreset;
  featured?: boolean;
};

const HOVER_DELAY = 350;

function PresetIcon({ visual = "bundle" }: { visual?: EditingPreset["visual"] }) {
  if (visual === "color") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8.5" r="3.5" />
        <circle cx="8.5" cy="14.5" r="3.5" />
        <circle cx="15.5" cy="14.5" r="3.5" />
      </svg>
    );
  }

  if (visual === "motion") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="size-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 17l5-5 4 4 7-9" />
        <circle cx="9" cy="12" r="1.5" fill="currentColor" />
        <circle cx="13" cy="16" r="1.5" fill="currentColor" />
        <circle cx="20" cy="7" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l8 4.5-8 4.5-8-4.5L12 3z" />
      <path d="M4 12l8 4.5 8-4.5" />
      <path d="M4 16.5L12 21l8-4.5" />
    </svg>
  );
}

export function PresetCard({ preset, featured = false }: PresetCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
  }, []);

  const stopPreview = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const canHover = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches,
    [],
  );

  const handleBuy = useCallback(async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId: preset.id }),
      });

      const data = (await response.json()) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.checkoutUrl) {
        setCheckoutError(data.error ?? "Unable to open Shopify checkout.");
        return;
      }

      window.location.assign(data.checkoutUrl);
    } catch {
      setCheckoutError("Network error while starting checkout. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  }, [checkingOut, preset.id]);

  return (
    <article
      className={`group overflow-hidden rounded-card border border-white/10 bg-ink-800 transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] ${
        featured ? "grid md:grid-cols-[1.1fr_1fr]" : "flex h-full flex-col"
      }`}
      onMouseEnter={() => {
        if (!preset.previewSrc || !canHover()) return;
        clearTimer();
        hoverTimer.current = setTimeout(startPreview, HOVER_DELAY);
      }}
      onMouseLeave={() => {
        if (!preset.previewSrc) return;
        clearTimer();
        stopPreview();
      }}
    >
      <button
        type="button"
        onClick={handleBuy}
        disabled={checkingOut}
        aria-label={`Buy ${preset.title} via Shopify Checkout`}
        className={`card-surface relative block w-full cursor-pointer overflow-hidden text-left disabled:cursor-wait ${
          featured ? "aspect-video md:aspect-auto md:min-h-72" : "aspect-video"
        }`}
      >
        {preset.previewSrc && !failed ? (
          <video
            ref={videoRef}
            className={`size-full object-cover transition-opacity duration-500 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
            src={preset.previewSrc}
            preload="metadata"
            playsInline
            muted
            loop
            onLoadedData={() => setReady(true)}
            onError={() => setFailed(true)}
          />
        ) : preset.imageSrc && !imageFailed ? (
          <Image
            src={preset.imageSrc}
            alt={preset.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="grid size-16 place-items-center rounded-2xl border border-white/15 bg-ink-950/60 text-brand-400 shadow-lg backdrop-blur-md transition duration-300 group-hover:scale-105 group-hover:border-aqua-400/50 group-hover:text-aqua-300">
                <PresetIcon visual={preset.visual} />
              </span>
              <span className="rounded-full border border-white/12 bg-black/45 px-3 py-1 text-xs font-medium text-mist-200 backdrop-blur-sm">
                {preset.badge}
              </span>
            </div>
          </div>
        )}

        <span className="pointer-events-none absolute top-3 left-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-mist-200 uppercase backdrop-blur-sm">
          {preset.software}
        </span>

        <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
          {preset.price ?? preset.format}
        </span>
      </button>

      <div className={`flex flex-1 flex-col gap-3 p-6 ${featured ? "sm:p-8" : ""}`}>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-mist-50">
            {preset.title}
          </h3>
          <span className="shrink-0 text-xs font-semibold text-aqua-300">
            {preset.price ?? preset.badge}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-mist-400">{preset.description}</p>

        <ul className="mt-auto flex flex-wrap gap-2 pt-1">
          {preset.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-mist-400"
            >
              {tag}
            </li>
          ))}
        </ul>

        {checkoutError ? (
          <p role="alert" className="text-xs leading-relaxed text-amber-300">
            {checkoutError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-mist-500">{preset.format}</span>
          <button
            type="button"
            onClick={handleBuy}
            disabled={checkingOut}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-linear-to-br from-brand-500 to-aqua-400 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
          >
            {checkingOut ? "Opening checkout…" : "Buy Presets"}
            <svg
              viewBox="0 0 24 24"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
