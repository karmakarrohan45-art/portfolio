"use client";

import Image from "next/image";
import { useState } from "react";
import { site } from "@/lib/content";

export function BrandMark({ className = "" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-hidden="true"
        className={`grid size-9 shrink-0 place-items-center rounded-[10px] bg-linear-to-br from-brand-500 to-aqua-400 font-display text-[13px] font-extrabold tracking-tight text-white ${className}`}
      >
        {site.initials}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`relative block h-9 w-12 shrink-0 overflow-hidden rounded-[10px] border border-white/10 bg-[#2b009e] ${className}`}
    >
      <Image
        src={site.logoSrc}
        alt=""
        fill
        sizes="48px"
        className="scale-[1.85] object-cover"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
