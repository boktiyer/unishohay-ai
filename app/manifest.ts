import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UnishohayAI - PCIU Admission Assistant",
    short_name: "UnishohayAI",
    description: "Bilingual (Bangla & English) AI admission assistant for Port City International University.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAFF",
    theme_color: "#2563EB",
    lang: "en",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "AI Chat", url: "/chat", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Admission Guide", url: "/admission-guide", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Tools", url: "/tools", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
