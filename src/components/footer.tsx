import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-white/8 px-6 py-7 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-mist-400 sm:flex-row">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="flex items-center gap-2">
          <span>{site.role}</span>
        </p>
      </div>
    </footer>
  );
}
