import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Calqulate Vitals: Lose Weight You Can Actually Keep Off",
    short_name: "Calqulate",
    description:
      "Most GLP-1 users watch the scale. Calqulate watches what the scale cannot. Track every injection, see how much of your loss is fat and how much is muscle, and spot a plateau before it lands.",
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
