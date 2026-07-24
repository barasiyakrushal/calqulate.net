// app/sitemap.ts
import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { blogs } from "@/lib/blog/blogs-data";
import { STANDALONE_QUESTIONS } from "@/app/answers/questions-data";
import { SIDE_EFFECT_SLUGS } from "@/lib/glp1/sideEffects";

const baseUrl = "https://calqulate.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const appDir = path.join(process.cwd(), "app");
  const urls: MetadataRoute.Sitemap = [];

  function scanDir(dir: string, parentPath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("_")) continue;
      if (entry.name.startsWith("@")) continue;
      if (entry.name.startsWith("[")) continue; // skip dynamic route segments
      if (["api"].includes(entry.name)) continue;

      const isRouteGroup = entry.name.startsWith("(") && entry.name.endsWith(")");

      // Route groups: traverse but don't add to URL path
      const currentPath = isRouteGroup
        ? parentPath
        : `${parentPath}/${entry.name}`;

      if (!isRouteGroup) {
        const pageExists = ["page.tsx", "page.jsx", "page.ts", "page.js"].some(
          (f) => fs.existsSync(path.join(dir, entry.name, f))
        );

        if (pageExists) {
          urls.push({
            url: `${baseUrl}${currentPath}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: currentPath.split("/").length <= 2 ? 0.9 : 0.8,
          });
        }
      }

      // Always recurse into every directory (including route groups)
      scanDir(path.join(dir, entry.name), currentPath);
    }
  }

  // Home page
  urls.push({
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });

  scanDir(appDir);

  // Calqulate Vitals product landing pages (dynamic /product/[slug] route).
  for (const slug of ["metabolic-health-tracker", "heart-age-tracker", "glp1-progress-tracker"]) {
    urls.push({
      url: `${baseUrl}/product/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // Standalone health-question pages (dynamic /answers/[slug] route).
  for (const q of STANDALONE_QUESTIONS) {
    urls.push({
      url: `${baseUrl}/answers/${q.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // GLP-1 side-effect symptom pages (dynamic /health/glp-1-side-effects/[symptom]).
  for (const slug of SIDE_EFFECT_SLUGS) {
    urls.push({
      url: `${baseUrl}/health/glp-1-side-effects/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  // Blog posts — add each individual slug
  for (const blog of blogs) {
    urls.push({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return urls;
}