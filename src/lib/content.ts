export type VideoProject = {
  id: string;
  title: string;
  titleNote?: string;
  client: string;
  year: string;
  duration: string;
  resolution: string;
  src: string;
  description: string;
  tags: string[];
};

export type EditingPreset = {
  id: string;
  title: string;
  badge: string;
  software: string;
  format: string;
  price?: string;
  visual?: "motion" | "color" | "bundle";
  buyUrl: string;
  shopifyHandle?: string;
  shopifyHandles?: string[];
  shopifyVariantId?: string;
  imageSrc?: string;
  previewSrc?: string;
  resolution?: string;
  description: string;
  tags: string[];
};

export type Skill = {
  label: string;
  detail: string;
};

export const site = {
  name: "Rohan | Motion Designer",
  initials: "RK",
  role: "Motion Design · Video Editing · Brand Films",
  tagline: "I make videos that move people.",
  intro:
    "Video editor and motion designer working with After Effects, Premiere Pro and DaVinci Resolve. Brand promos, product films and social content.",
  whatsapp: "+916289821372",
} as const;

export const presetsDriveUrl =
  "https://drive.google.com/drive/folders/1nF7XVFI4-Gr9PnpRqRDMPE66p-jw_qD0";

export const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export const presets: EditingPreset[] = [
  {
    id: "motion-graphics-presets",
    title: "Flashy Pixel grid effect transition",
    badge: "Shopify Checkout",
    software: "Software - Premiere Pro",
    format: ".ffx · .prfpset",
    price: "₹999",
    visual: "motion",
    buyUrl: presetsDriveUrl,
    shopifyHandle: "flashy-pixel-grid-effect-transition",
    shopifyHandles: ["flashy-pixel-grid-effect-transition", "smoky-effect", "pixel-preset"],
    imageSrc: "/presets/smoky-effect.jpg",
    previewSrc: "/video/smoky-effect.mp4",
    resolution: "1920×1080",
    description:
      "Pixel grid effect transition made for Premiere Pro.",
    tags: ["Special Effects", "Transitions", "Premiere Pro"],
  },
  {
    id: "color-grading-lut-pack",
    title: "Color Grading & Finishing Pack",
    badge: "Shopify Checkout",
    software: "DaVinci Resolve · Premiere Pro",
    format: ".cube · Presets",
    price: "₹499",
    visual: "color",
    buyUrl: presetsDriveUrl,
    shopifyHandle: "color-grading-finishing-pack",
    description:
      "Filmic LUTs, contrast curves, and finishing looks tailored for commercial promos, SaaS films, and social reels.",
    tags: ["Color Grading", "DaVinci Resolve", "LUTs"],
  },
];

export const videos: VideoProject[] = [
  {
    id: "reve8-saas-promo",
    title: "Gene Academy ad",
    client: "Gene Academy",
    year: "2026",
    duration: "0:50",
    resolution: "1920×1080",
    src: "/video/reve8-saas-promo-50s.mp4",
    description:
      "Gene Academy is the brand name you use for your online video editing coaching business. It encompasses the video editing classes you've been structuring, as well as the promotional materials—like marketing carousels—you create to offer online coaching to your students.",
    tags: ["Motion Graphics", "After Effects"],
  },
  {
    id: "reve8-saas-short",
    title: "reve8 — SaaS Promo",
    titleNote: "Short Cut",
    client: "reve8",
    year: "2026",
    duration: "0:25",
    resolution: "1920×1080",
    src: "/video/reve8-saas-promo-25s.mp4",
    description:
      "Reve8 is a cutting-edge software development company based in Visakhapatnam, India that specializes in building intelligent, data-driven solutions for small and medium enterprises (SMEs). They're positioned at the intersection of AI automation, custom web development, and business intelligence — solving real operational challenges for businesses that want to scale without the overhead.",
    tags: ["Motion Graphics", "After Effects"],
  },
];

export const aboutCopy = [
  "I'm a video editor and motion designer focused on clean, fast-paced brand content. I handle the full pipeline — concept and storyboard, edit and sound design, motion graphics, and the final color grade.",
  "I work with After Effects for graphics and compositing, Premiere Pro for cutting and sound, and DaVinci Resolve for grading and finishing.",
];

export const skills: Skill[] = [
  { label: "Editing", detail: "Premiere Pro · DaVinci Resolve" },
  { label: "Motion", detail: "After Effects · Illustrator" },
  { label: "Post", detail: "Color Grading · Sound Design" },
  { label: "Formats", detail: "16:9 · 1:1 · 9:16" },
];
