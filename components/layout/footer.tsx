import Link from "next/link"
import Image from "next/image"
import { Mail, ShieldCheck, Lock, ArrowRight } from "lucide-react"
import { PaymentBadges } from "./payment-badges"
import { TrackedLink } from "@/components/analytics/TrackedLink"

const linkCls = "block text-white/55 hover:text-white transition-colors py-1.5 sm:py-1"

/** The GLP-1 tools, in the order a user actually meets the questions they answer. */
const GLP1_COMPANION = [
  { href: "/health/semaglutide-dose-calculator", label: "Semaglutide Dose Calculator" },
  { href: "/health/tirzepatide-dose-calculator", label: "Tirzepatide Dose Calculator" },
  { href: "/health/glp-1-half-life-calculator", label: "GLP-1 Half-Life Calculator" },
  { href: "/health/glp-1-unit-converter", label: "GLP-1 Unit Converter" },
  { href: "/health/glp-1-injection-day-calculator", label: "GLP-1 Injection Day Calculator" },
  { href: "/health/glp-1-dose-calculator", label: "GLP-1 Body Composition Tracker" },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Brand */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label="Calqulate.NET Home" className="inline-flex">
              <Image
                src="/calqulate-wordmark.png"
                alt="Calqulate.NET"
                width={654}
                height={167}
                className="h-9 w-auto rounded-lg"
              />
            </Link>
            <p className="text-sm text-white/55">
              Lose weight you can actually keep off. Calqulate tracks every injection, shows you how much of your loss
              is fat and how much is muscle, and warns you before a plateau lands. Built for people on Ozempic, Wegovy,
              Mounjaro and Zepbound, on validated clinical models.
            </p>
            <div className="space-y-2 text-sm text-white/55">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:krushal.barasiya@calqulate.net" className="hover:text-white hover:underline">
                  krushal.barasiya@calqulate.net
                </a>
              </div>
              <div className="flex items-center gap-2 text-brand">
                <ShieldCheck className="h-4 w-4" /> We never sell your data.
              </div>
            </div>
          </div>

          {/* Vitals (service) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Calqulate Vitals</h3>
            {/* Primary signup path. Every page in the site has a footer, so this is
                the site-wide fallback door into the GLP-1 tracker. */}
            <TrackedLink
              href="/signup?next=/dashboard/glp1"
              ctaId="footer_start_free"
              label="Start free"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start free <ArrowRight className="h-3.5 w-3.5" />
            </TrackedLink>
            <ul className="space-y-1 text-sm">
              <li><Link href="/product/metabolic-health-tracker" className={linkCls}>Metabolic Health Tracker</Link></li>
              <li><Link href="/product/heart-age-tracker" className={linkCls}>Heart Age Tracker</Link></li>
              <li><Link href="/product/glp1-progress-tracker" className={linkCls}>GLP-1 Progress Tracker</Link></li>
              <li><Link href="/pricing" className={linkCls}>Pricing</Link></li>
              <li><Link href="/calqulate-vitals/free-features-list" className={linkCls}>Free Features List</Link></li>
              <li><Link href="/dashboard" className={linkCls}>Dashboard</Link></li>
            </ul>
          </div>

          {/* GLP-1 Companion */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">GLP-1 Companion</h3>
            <ul className="space-y-1 text-sm">
              {GLP1_COMPANION.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className={linkCls}>{tool.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Calculators */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Popular Calculators</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/health/absi-calculator" className={linkCls}>ABSI Calculator</Link></li>
              <li><Link href="/health/lean-body-mass-calculator" className={linkCls}>Lean Body Mass Calculator</Link></li>
              <li><Link href="/health/rfm-calculator" className={linkCls}>RFM Calculator</Link></li>
              <li><Link href="/search" className={linkCls}>View All Calculators</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/about-us" className={linkCls}>About Us</Link></li>
              <li><Link href="/how-it-works" className={linkCls}>How It Works</Link></li>
              <li><Link href="/gallery" className={linkCls}>Gallery</Link></li>
              <li><Link href="/answers" className={linkCls}>Health Questions</Link></li>
              <li><Link href="/contact-us" className={linkCls}>Contact Us</Link></li>
              <li><Link href="/privacy-policy" className={linkCls}>Privacy Policy</Link></li>
              <li><Link href="/sitemap.xml" className={linkCls}>Sitemap</Link></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Legal &amp; Support</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/terms-and-conditions" className={linkCls}>Terms &amp; Conditions</Link></li>
              <li><Link href="/refund-policy" className={linkCls}>Refund Policy</Link></li>
              <li><Link href="/disclaimer" className={linkCls}>Disclaimer</Link></li>
              <li><Link href="/cookie-policy" className={linkCls}>Cookie Policy</Link></li>
              <li><Link href="/dashboard/settings" className={linkCls}>Your privacy choices / Delete my data</Link></li>
              <li><span className="block py-1.5 text-white/55 sm:py-1">24/7 Support · Free to start</span></li>
            </ul>
          </div>
        </div>

        {/* One high-intent question, then straight through to every answer */}
        <div className="mt-8 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/answers/best-glp-1-for-weight-loss"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white hover:underline"
            >
              What is the best GLP-1 for weight loss?
            </Link>
            <Link
              href="/answers"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-light hover:underline"
            >
              View all answers
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-8 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 text-center lg:text-left">
              <h3 className="flex items-center justify-center gap-2 text-sm font-semibold text-white lg:justify-start">
                <Lock className="h-4 w-4 text-brand" /> Secure payment methods we accept
              </h3>
              <div className="flex justify-center lg:justify-start">
                <PaymentBadges />
              </div>
            </div>
            <div className="max-w-md space-y-1.5 text-center text-xs text-white/55 lg:text-right">
              <p>
                <span className="font-semibold text-white/80">🇺🇸 In the USA &amp; worldwide:</span>{" "}
                buy your subscription securely with <span className="text-white/80">PayPal</span>. Credit
                &amp; debit cards (Visa, Mastercard, Amex) accepted, no PayPal account required.
              </p>
              <p>
                <span className="font-semibold text-white/80">🇮🇳 In India:</span>{" "}
                pay via <span className="text-white/80">Razorpay</span>. UPI, cards, netbanking &amp; wallets.
              </p>
              <p className="text-white/40">
                Payments are processed by PCI-DSS compliant gateways. We never store your card details.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-white/55">
            &copy; {new Date().getFullYear()} Calqulate.NET. All rights reserved.
          </p>
          <p className="text-center text-xs text-white/40">
            Educational decision-support, not medical, legal, or financial advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
