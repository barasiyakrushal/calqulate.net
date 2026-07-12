import type React from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/structured-data";
import "./globals.css";
import { Suspense } from "react";
import ClarityProvider from "@/components/analytics/clarity-provider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { NonEmbedChrome } from "@/components/layout/non-embed-chrome";
import { Toaster } from "@/components/ui/sonner";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://calqulate.net";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Lose Weight You Can Actually Keep Off | Calqulate Vitals GLP-1 Tracker",
  description:
    "Most GLP-1 users watch the scale. Calqulate watches what the scale cannot. Track every injection, know how much of your loss is fat and how much is muscle, and see a plateau coming before it happens. Built for Ozempic, Wegovy, Mounjaro and Zepbound. Free calculators, forever.",
  keywords: "glp-1 tracker, ozempic tracker, wegovy tracker, mounjaro tracker, zepbound, muscle loss on glp-1, semaglutide dose calculator, calqulate.net",
  generator: "Calqulate",
  robots: "index, follow",
  applicationName: "Calqulate",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calqulate",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Lose weight you can actually keep off",
    description:
      "Most GLP-1 users watch the scale. Calqulate watches what the scale cannot. Lose fat. Keep muscle. Stay healthy.",
    type: "website",
    siteName: "Calqulate Vitals",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Calqulate Vitals, the daily companion for people on GLP-1 medications",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lose weight you can actually keep off",
    description:
      "Most GLP-1 users watch the scale. Calqulate watches what the scale cannot. Lose fat. Keep muscle. Stay healthy.",
    images: ["/og-image.webp"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/calqulate-logo-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <OrganizationSchema />
        <WebSiteSchema />

        {/* Google AdSense Verification */}
        <meta name="google-adsense-account" content="ca-pub-4361792190799561" />

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

      </head>

      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {/* Skip to content — first focusable element for keyboard / AT users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-emerald-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>

        {/* Google Tag Manager — loaded after page becomes interactive */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MNCCJNHF');`
          }}
        />

        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MNCCJNHF" height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
        </noscript>

        <ClarityProvider />

        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>

        <NonEmbedChrome />
        <ServiceWorkerRegister />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}