import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import { site } from "@/lib/content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: `${site.name} — Motion Design & Video Editing`,
    template: `%s — ${site.name}`,
  },
  description:
     "Portfolio of Rohan | Motion Designer — motion design, video editing and brand promo films. Selected work including the reve8 SaaS promo film.",
  keywords: [
    "video editor",
    "motion designer",
    "After Effects",
    "Premiere Pro",
    "DaVinci Resolve",
    "brand promo video",
    site.name,
  ],
  authors: [{ name: site.name }],
  openGraph: {
    title: `${site.name} — Motion Design & Video Editing`,
    description: site.intro,
    type: "website",
    images: ["/brand/reve8-logo.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Motion Design & Video Editing`,
    description: site.intro,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink-950 text-mist-100">
        <noscript>
          <style>{`.reveal{opacity:1}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
