import withSerwistInit from "@serwist/next";

const revision = crypto.randomUUID();

const withSerwist = withSerwistInit({
  cacheOnNavigation: true,
  additionalPrecacheEntries: [{ url: "/offline", revision }],
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Building the service worker in dev bloats the compile graph and memory.
  // The SW is a production concern, so skip it during `next dev`.
  disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    deviceSizes: [320, 420, 768, 1024, 1200, 1600],
  },
  async headers() {
    return [
      {
        // Let the embeddable widgets be framed on any third-party site.
        // CSP frame-ancestors is the modern control; we deliberately do NOT
        // send X-Frame-Options here so older browsers don't block framing.
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
    ]
  },
  webpack: (config, { dev }) => {
    // Next/webpack's filesystem cache gzips its pack files. On large projects
    // this can throw "RangeError: Array buffer allocation failed" inside zlib
    // (Gunzip/Gzip) and hard-crash the dev server. Writing the cache
    // uncompressed removes that zlib allocation path entirely.
    if (dev && config.cache && typeof config.cache === "object") {
      config.cache = { ...config.cache, compression: false }
    }
    return config
  },
}

export default withSerwist(nextConfig)
