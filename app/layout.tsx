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
  title: "Stop GLP-1 Muscle Loss: Track Metabolism & Look Younger",
  description:
    "Stop GLP-1 muscle loss. The only app to track your dosage, Metabolism Score, and Heart Age. Burn pure fat, protect muscle, and look 15 years younger.",
  keywords: "calqulate.net, Glp-1 tracker",
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
    title: "Calqulate - Professional Calculators",
    description: "Free online calculators for health improvement",
    type: "website",
    siteName: "Calqulate",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Calqulate — professional health calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calqulate - Professional Calculators",
    description: "Free online calculators for health improvement",
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