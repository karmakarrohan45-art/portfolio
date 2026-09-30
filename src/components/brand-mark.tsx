import { site } from "@/lib/content";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-9 shrink-0 place-items-center rounded-[10px] bg-linear-to-br from-brand-500 to-aqua-400 font-display text-[13px] font-extrabold tracking-tight text-white ${className}`}
    >
      {site.initials}
    </span>
  );
}
