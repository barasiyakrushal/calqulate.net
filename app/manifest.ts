import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calqulate — Smart Health Calculators & Vitals Tracker",
    short_name: "Calqulate",
    description:
      "Calculate your health metrics, track Metabolic Health Score, heart age, and disease risk — all in one place.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#059669",
    categories: ["health", "fitness", "medical"],
    icons: [
      {
        src: "/calqulate-logo-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/calqulate-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/calqulate-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
