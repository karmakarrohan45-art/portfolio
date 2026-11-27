"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { site, type EditingPreset } from "@/lib/content";

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailedResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
  modal?: { ondismiss?: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: string, callback: (response: RazorpayFailedResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let razorpayScriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      razorpayScriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

type PresetCardProps = {
  preset: EditingPreset;
  featured?: boolean;
  onWatch?: (preset: EditingPreset, duration?: string) => void;
};

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

export function PresetCard({ preset, featured = false, onWatch }: PresetCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [durationLabel, setDurationLabel] = useState<string | undefined>(undefined);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [purchasedUrl, setPurchasedUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const startPreview = useCallback(() => {
    setHovered(true);
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, []);

  const stopPreview = useCallback(() => {
    setHovered(false);
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  }, []);

  const canHover = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches,
    [],
  );

  const handleBuy = useCallback(async () => {
    if (checkingOut) return;
    setCheckingOut(true);
    setCheckoutError(null);

    try {
      const [orderResponse, sdkLoaded] = await Promise.all([
        fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ presetId: preset.id }),
        }),
        loadRazorpayScript(),
      ]);

      const orderData = (await orderResponse.json()) as {
        orderId?: string;
        amount?: number;
        currency?: string;
        keyId?: string;
        presetTitle?: string;
        error?: string;
      };

      if (
        !orderResponse.ok ||
        !orderData.orderId ||
        !orderData.amount ||
        !orderData.currency ||
        !orderData.keyId
      ) {
        setCheckoutError(orderData.error ?? "Unable to start Razorpay checkout.");
        setCheckingOut(false);
        return;
      }

      if (!sdkLoaded || !window.Razorpay) {
        setCheckoutError("Failed to load Razorpay Checkout. Please check your connection.");
        setCheckingOut(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: site.name,
        description: orderData.presetTitle ?? preset.title,
        order_id: orderData.orderId,
        theme: { color: "#6d5cff" },
        handler: async (payment) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                presetId: preset.id,
                ...payment,
              }),
            });

            const verifyData = (await verifyResponse.json()) as {
              verified?: boolean;
              paymentId?: string;
              downloadUrl?: string;
              error?: string;
            };

            if (!verifyResponse.ok || !verifyData.verified || !verifyData.downloadUrl) {
              setCheckoutError(
                verifyData.error ?? "Payment received, but verification failed.",
              );
              return;
            }

            setPaymentId(verifyData.paymentId ?? payment.razorpay_payment_id);
            setPurchasedUrl(verifyData.downloadUrl);
          } catch {
            setCheckoutError("Network error while verifying payment.");
          } finally {
            setCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => setCheckingOut(false),
        },
      });

      razorpay.on("payment.failed", (failure) => {
        setCheckoutError(
          failure.error?.description ?? "Payment failed or was cancelled.",
        );
        setCheckingOut(false);
      });

      razorpay.open();
    } catch {
      setCheckoutError("Network error while starting checkout. Please try again.");
      setCheckingOut(false);
    }
  }, [checkingOut, preset.id, preset.title]);

  const handleWatch = useCallback(() => {
    if (!preset.previewSrc || !onWatch) return;
    stopPreview();
    onWatch(preset, durationLabel);
  }, [durationLabel, onWatch, preset, stopPreview]);

  const showVideo = hovered && ready && !failed;
  const canWatchVideo = Boolean(preset.previewSrc && onWatch && !failed);

  return (
    <article
      className={`group overflow-hidden rounded-card border border-white/10 bg-ink-800 transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/60 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)] ${
        featured ? "grid md:grid-cols-[1.1fr_1fr]" : "flex h-full flex-col"
      }`}
    >
      <button
        type="button"
        onClick={canWatchVideo ? handleWatch : handleBuy}
        disabled={!canWatchVideo && checkingOut}
        onMouseEnter={() => {
          if (!preset.previewSrc || !canHover()) return;
          startPreview();
        }}
        onMouseLeave={() => {
          if (!preset.previewSrc) return;
          stopPreview();
        }}
        aria-label={
          canWatchVideo
            ? `Watch ${preset.title}`
            : `Buy ${preset.title} via Razorpay Checkout`
        }
        className={`card-surface relative block w-full cursor-pointer overflow-hidden text-left disabled:cursor-wait ${
          featured ? "aspect-video md:aspect-auto md:min-h-72" : "aspect-video"
        }`}
      >
        {preset.previewSrc && !failed ? (
          <video
            ref={videoRef}
            className={`relative z-[1] size-full object-cover transition-opacity duration-500 ${
              showVideo ? "opacity-100" : "opacity-0"
            }`}
            src={preset.previewSrc}
            poster={preset.imageSrc}
            preload="auto"
            playsInline
            muted
            loop
            onLoadedMetadata={(e) => {
              const secs = e.currentTarget.duration;
              if (Number.isFinite(secs) && secs > 0) {
                const total = Math.round(secs);
                const mins = Math.floor(total / 60);
                const rem = total % 60;
                setDurationLabel(`${mins}:${String(rem).padStart(2, "0")}`);
              }
            }}
            onLoadedData={() => setReady(true)}
            onCanPlay={() => setReady(true)}
            onError={() => setFailed(true)}
          />
        ) : null}

        {preset.imageSrc && !imageFailed ? (
          <Image
            src={preset.imageSrc}
            alt={preset.title}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className={`pointer-events-none z-[2] object-cover transition-all duration-500 group-hover:scale-105 ${
              showVideo ? "opacity-0" : "opacity-100"
            }`}
            onError={() => setImageFailed(true)}
          />
        ) : !preset.previewSrc || failed ? (
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
        ) : null}

        <span className="pointer-events-none absolute top-3 left-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-medium tracking-wide text-mist-200 uppercase backdrop-blur-sm">
          {preset.software}
        </span>

        {!preset.imageSrc && !preset.previewSrc ? (
          <span className="pointer-events-none absolute right-3 bottom-3 z-10 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
            {preset.price ?? preset.format}
          </span>
        ) : null}
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

        {canWatchVideo ? (
          <div className="flex items-center gap-3 pt-1 text-xs text-mist-500">
            <span>{preset.resolution ?? "1920×1080"}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleWatch}
              className="cursor-pointer font-semibold text-brand-400 transition-colors hover:text-aqua-300"
            >
              {durationLabel ? `Watch ${durationLabel}` : "Watch"}
            </button>
          </div>
        ) : null}

        {purchasedUrl ? (
          <p role="status" className="text-xs leading-relaxed text-emerald-300">
            Payment verified{paymentId ? ` (${paymentId})` : ""}. Your download is ready.
          </p>
        ) : null}

        {checkoutError ? (
          <p role="alert" className="text-xs leading-relaxed text-amber-300">
            {checkoutError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-mist-500">{preset.format}</span>
          {purchasedUrl ? (
            <a
              href={purchasedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-br from-brand-500 to-aqua-400 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110"
            >
              Download Presets
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
            </a>
          ) : (
            <button
              type="button"
              onClick={handleBuy}
              disabled={checkingOut}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-linear-to-br from-brand-500 to-aqua-400 px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
            >
              {checkingOut ? "Opening payment…" : "Buy Presets"}
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
          )}
        </div>
      </div>
    </article>
  );
}
