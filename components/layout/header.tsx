"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, Search, Activity, LayoutDashboard, Settings, Download, LogOut, User, Check } from "lucide-react"
import { SearchBar } from "@/components/search/search-bar"
import { createClient } from "@/lib/supabase/client"
import { PrimaryCTA } from "@/components/layout/PrimaryCTA"
import { ctaSuppressed } from "@/lib/cta"

// ─── Product links (listed first) ─────────────────────────────────────────────

const productLinks = [
  { name: "Metabolic Health Tracker", href: "/product/metabolic-health-tracker", desc: "Composite score + heart age + 10-yr risk" },
  { name: "Heart Age Tracker", href: "/product/heart-age-tracker", desc: "Your vascular age vs. your real age" },
  { name: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker", desc: "Track results beyond the scale" },
  { name: "How the product works", href: "/how-it-works", desc: "From a one-time number to a trajectory" },
  { name: "Pricing", href: "/pricing", desc: "One simple plan, everything included" },
]

// ─── GLP-1 Companion — grouped by where you are in the journey ────────────────

const glp1Groups = [
  {
    title: "Your journey",
    items: [
      { name: "First 30 Days on a GLP-1", href: "/health/first-30-days-on-glp-1", desc: "Just got a prescription? Start here" },
      { name: "Side Effects: Am I Normal?", href: "/health/glp-1-side-effects", desc: "Nausea, fatigue, timeline & red flags" },
      { name: "Plateau Analyzer", href: "/health/glp-1-plateau-analyzer", desc: "Why did my weight loss stall?" },
      { name: "Maintenance & Keeping It Off", href: "/health/glp-1-maintenance", desc: "Maintenance dose + weight planner" },
      { name: "Stopping: Will I Gain It Back?", href: "/health/glp-1-stopping", desc: "Regain risk + tapering planner" },
    ],
  },
  {
    title: "Choose & predict",
    items: [
      { name: "How Much Will I Lose?", href: "/health/glp-1-weight-loss-projection-calculator", desc: "Project your weight loss" },
      { name: "Tirzepatide vs Semaglutide", href: "/compare/tirzepatide-vs-semaglutide", desc: "Zepbound vs Wegovy, head to head" },
      { name: "Ozempic vs Wegovy", href: "/compare/ozempic-vs-wegovy", desc: "Same drug, different label" },
    ],
  },
  {
    title: "Dosing tools",
    items: [
      { name: "Semaglutide Dose Calculator", href: "/health/semaglutide-dose-calculator", desc: "Am I on the right dose?" },
      { name: "Tirzepatide Dose Calculator", href: "/health/tirzepatide-dose-calculator", desc: "Mounjaro & Zepbound schedules" },
      { name: "GLP-1 Half-Life Calculator", href: "/health/glp-1-half-life-calculator", desc: "Is my medication still active?" },
      { name: "GLP-1 Unit Converter", href: "/health/glp-1-unit-converter", desc: "Am I measuring it correctly?" },
      { name: "GLP-1 Injection Day Calculator", href: "/health/glp-1-injection-day-calculator", desc: "When should I inject next?" },
      { name: "GLP-1 Body Composition Tracker", href: "/health/glp-1-dose-calculator", desc: "Am I losing fat or muscle?" },
    ],
  },
  {
    title: "Track over time",
    items: [
      { name: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker", desc: "How is my treatment working over time?" },
    ],
  },
]

// ─── Calculator categories (free snapshot tools that feed the service) ───────

const categories = [
  {
    name: "Body Composition",
    slug: "/health/body-composition",
    description: "BMI, body fat, lean mass & weight metrics",
    count: 11,
    calculators: [
      { name: "BMI Calculator", href: "/health/bmi-calculator" },
      { name: "Body Fat Calculator", href: "/health/body-fat-calculator" },
      { name: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
      { name: "Body Shape Calculator", href: "/health/body-shape-calculator" },
      { name: "Ideal Body Weight Calculator", href: "/health/ideal-body-weight-calculator" },
      { name: "Adjusted Body Weight Calculator", href: "/health/adjusted-body-weight-calculator" },
      { name: "ABSI Calculator", href: "/health/absi-calculator" },
      { name: "RFM Calculator", href: "/health/rfm-calculator" },
      { name: "Ponderal Index Calculator", href: "/health/ponderal-index-calculator" },
      { name: "Waist-to-Height Ratio Calculator", href: "/health/waist-to-height-ratio-calculator" },
      { name: "Weight Loss % Calculator", href: "/health/weight-loss-percentage-calculator" },
    ],
  },
  {
    name: "Cardio Health",
    slug: "/health/cardio",
    description: "Heart rate, blood pressure & cardiovascular risk",
    count: 8,
    calculators: [
      { name: "Heart Rate Calculator", href: "/health/heart-rate-calculator" },
      { name: "Blood Pressure Calculator", href: "/health/blood-pressure-calculator" },
      { name: "Resting Heart Rate Calculator", href: "/health/resting-heart-rate-calculator" },
      { name: "Heart Age Calculator", href: "/health/heart-age-calculator" },
      { name: "Karvonen Formula Calculator", href: "/health/karvonen-formula-calculator" },
      { name: "Mean Arterial Pressure Calculator", href: "/health/mean-arterial-pressure-calculator" },
      { name: "Pulse Pressure Calculator", href: "/health/pulse-pressure-calculator" },
      { name: "Cholesterol Ratio Calculator", href: "/health/cholesterol-ratio-calculator" },
    ],
  },
  {
    name: "Nutrition & Weight",
    slug: "/health/nutrition",
    description: "Calories, macros, TDEE, BMR & deficit",
    count: 6,
    calculators: [
      { name: "TDEE Calculator", href: "/health/tdee-calculator" },
      { name: "BMR Calculator", href: "/health/bmr-calculator" },
      { name: "Macro Calculator", href: "/health/macro-calculator" },
      { name: "Calorie Deficit Calculator", href: "/health/calorie-deficit-calculator" },
      { name: "Fat Intake Calculator", href: "/health/fat-intake-calculator" },
      { name: "Daily Water Intake Calculator", href: "/health/daily-water-intake-calculator" },
    ],
  },
  {
    name: "Fitness Performance",
    slug: "/health/fitness",
    description: "VO2 max, one-rep max, running pace",
    count: 6,
    calculators: [
      { name: "VO2 Max Calculator", href: "/health/vo2-max-calculator" },
      { name: "One-Rep Max Calculator", href: "/health/one-rep-max-calculator" },
      { name: "Running Pace Calculator", href: "/health/running-pace-calculator" },
      { name: "Calories Burned Calculator", href: "/health/calories-burned-calculator" },
      { name: "Wilks Calculator", href: "/health/wilks-calculator" },
      { name: "Draw Length Calculator", href: "/health/draw-length-calculator" },
    ],
  },
  {
    name: "Disease Risk",
    slug: "/health/disease-risk",
    description: "Diabetes, ASCVD, Framingham & cancer screening",
    count: 9,
    calculators: [
      { name: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
      { name: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" },
      { name: "Framingham Risk Score", href: "/health/framingham-risk-score-calculator" },
      { name: "Qrisk3 Calculator", href: "/health/qrisk3-calculator" },
      { name: "Breast Cancer Risk Calculator", href: "/health/breast-cancer-risk-calculator" },
      { name: "Obesity Risk Calculator", href: "/health/obesity-risk-calculator" },
      { name: "Creatinine Clearance Calculator", href: "/health/creatinine-clearance-calculator" },
      { name: "EAG Calculator", href: "/health/estimated-average-glucose-calculator" },
      { name: "GLP-1 Dose Calculator", href: "/health/glp-1-dose-calculator" },
    ],
  },
  {
    name: "Mental Wellness",
    slug: "/health/mental-wellness",
    description: "Sleep cycles, sleep debt & stress analysis",
    count: 3,
    calculators: [
      { name: "Sleep Cycle Calculator", href: "/health/sleep-cycle-calculator" },
      { name: "Sleep Debt Calculator", href: "/health/sleep-debt-calculator" },
      { name: "Stress Level Calculator", href: "/health/stress-level-calculator" },
    ],
  },
  {
    name: "Women's Health",
    slug: "/health/womens-health",
    description: "Ovulation, periods, pregnancy & IVF dates",
    count: 4,
    calculators: [
      { name: "Ovulation Calculator", href: "/health/ovulation-calculator" },
      { name: "Period Cycle Calculator", href: "/health/period-cycle-calculator" },
      { name: "Pregnancy Weight Gain Calculator", href: "/health/pregnancy-weight-gain-calculator" },
      { name: "IVF Pregnancy Due Date Calculator", href: "/health/ivf-pregnancy-due-date-calculator" },
    ],
  },
  {
    name: "Appearance",
    slug: "/health/appearance",
    description: "Face shape, body shape & personal style",
    count: 2,
    calculators: [
      { name: "Face Shape Calculator", href: "/health/face-shape-calculator" },
      { name: "Golden Ratio Face Calculator", href: "/health/golden-ratio-face-calculator" },
      { name: "Body Shape Calculator", href: "/health/body-shape-calculator" },
      { name: "Ai Attraciveness Test", href: "/health/ai-attractiveness-test" },
      { name: "facial harmony calculator", href: "/health/facial-harmony-calculator" },
    ],
  },
]

type Category = (typeof categories)[0]

// ─── Product mega dropdown ─────────────────────────────────────────────────────

function ProductMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden py-2">
      <div className="px-4 pt-2 pb-1.5 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">The product</span>
      </div>
      {productLinks.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onClose}
          className="flex flex-col px-4 py-2 hover:bg-emerald-50 transition-colors group"
        >
          <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700">{l.name}</span>
          <span className="text-xs text-gray-400">{l.desc}</span>
        </Link>
      ))}
    </div>
  )
}

// ─── GLP-1 mega menu (grouped by journey stage) ──────────────────────────────

function Glp1Menu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute left-0 right-0 top-full z-50 border-t border-gray-100 bg-white shadow-xl">
      <div className="container mx-auto px-6 py-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="text-base font-semibold text-gray-900">
            GLP-1 Companion <span className="text-sm font-normal text-gray-400">— tools for every stage of your journey</span>
          </span>
          <Link href="/health/first-30-days-on-glp-1" onClick={onClose} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            New to GLP-1? Start here →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4">
          {glp1Groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600">{group.title}</p>
              <ul className="space-y-2.5">
                {group.items.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className="group flex flex-col rounded-lg px-2 py-1 -mx-2 transition-colors hover:bg-emerald-50"
                    >
                      <span className="text-[13.5px] font-semibold text-gray-800 group-hover:text-emerald-700">{l.name}</span>
                      <span className="text-xs text-gray-400">{l.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Calculators mega menu (all 8 categories) ────────────────────────────────

function CalculatorsMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-xl">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <span className="text-base font-semibold text-gray-900">
            Free snapshot tools <span className="text-sm font-normal text-gray-400">— the free entry point into the product</span>
          </span>
          <Link href="/search" onClick={onClose} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
          {categories.map((cat) => (
            <div key={cat.name}>
              <Link
                href="/search"
                onClick={onClose}
                className="flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-emerald-700 mb-1.5"
              >
                {cat.name}
                <span className="text-[11px] font-medium text-gray-300">{cat.count}</span>
              </Link>
              <ul className="space-y-0.5">
                {cat.calculators.slice(0, 5).map((calc) => (
                  <li key={calc.href}>
                    <Link
                      href={calc.href}
                      onClick={onClose}
                      className="block text-[13px] text-gray-500 hover:text-emerald-700 py-0.5 transition-colors"
                    >
                      {calc.name}
                    </Link>
                  </li>
                ))}
                {cat.calculators.length > 5 && (
                  <li>
                    <Link href="/search" onClick={onClose} className="block text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 py-0.5">
                      +{cat.calculators.length - 5} more
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mobile accordion item ────────────────────────────────────────────────────

function MobileCategory({ category, onLinkClick }: { category: Category; onLinkClick: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 sm:py-3 text-left min-h-[44px]">
        <div>
          <p className="text-sm font-semibold text-gray-900">{category.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{category.count} calculators</p>
        </div>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180 text-emerald-600" : "text-gray-400"}`} />
      </button>
      {open && (
        <div className="bg-gray-50 pb-1">
          {category.calculators.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              onClick={onLinkClick}
              className="flex items-center gap-2.5 px-6 py-2.5 sm:py-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors min-h-[44px]"
            >
              <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
              {calc.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Header ──────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname()
  const [activeMenu, setActiveMenu] = useState<"product" | "calculators" | "glp1" | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileProductOpen, setMobileProductOpen] = useState(true)
  const [mobileGlp1Open, setMobileGlp1Open] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  const suppressed = ctaSuppressed(pathname)

  const headerRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Session-aware: resolve auth state in the browser (drop-in for every page).
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      setAuthReady(true)
      return
    }
    let sub: { unsubscribe: () => void } | undefined
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => {
        setUserEmail(data.user?.email ?? null)
        setAuthReady(true)
      })
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        setUserEmail(session?.user?.email ?? null)
      })
      sub = data.subscription
    } catch {
      setAuthReady(true)
    }
    return () => sub?.unsubscribe()
  }, [])

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
        setAvatarOpen(false)
      }
    }
    const onScroll = () => setActiveMenu(null)
    document.addEventListener("mousedown", onOutside)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      document.removeEventListener("mousedown", onOutside)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  const startClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 180)
  }, [])
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])
  const closeAll = useCallback(() => {
    setActiveMenu(null)
    setMobileOpen(false)
    setSearchOpen(false)
    setAvatarOpen(false)
  }, [])

  const loggedIn = !!userEmail

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      {/* ── Main bar ── */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-[60px] items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Logo */}
          <Link href="/" onClick={closeAll} aria-label="Calqulate.NET — Home" className="flex-shrink-0">
            <Image
              src="/calqulate-wordmark.png"
              alt="Calqulate.NET"
              width={654}
              height={167}
              priority
              className="h-8 w-auto object-contain lg:h-10"
            />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1" onMouseLeave={startClose} onMouseEnter={cancelClose}>
            {/* Product */}
            <div className="relative">
              <button
                onMouseEnter={() => { cancelClose(); setActiveMenu("product") }}
                onClick={() => setActiveMenu(activeMenu === "product" ? null : "product")}
                className={`flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-semibold rounded-md whitespace-nowrap transition-colors
                  ${activeMenu === "product" ? "text-emerald-700 bg-emerald-50" : "text-emerald-700 hover:bg-emerald-50"}`}
              >
                <Activity className="h-4 w-4" />
                Product
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === "product" ? "rotate-180 text-emerald-600" : "text-emerald-400"}`} />
              </button>
              {activeMenu === "product" && <ProductMenu onClose={closeAll} />}
            </div>

            {/* Calculators (free snapshot tools) */}
            <button
              onMouseEnter={() => { cancelClose(); setActiveMenu("calculators") }}
              onClick={() => setActiveMenu(activeMenu === "calculators" ? null : "calculators")}
              className={`flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-medium rounded-md whitespace-nowrap transition-colors
                ${activeMenu === "calculators" ? "text-emerald-700 bg-emerald-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              Calculators
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === "calculators" ? "rotate-180 text-emerald-600" : "text-gray-400"}`} />
            </button>

            {/* GLP-1 */}
            <div className="relative">
              <button
                onMouseEnter={() => { cancelClose(); setActiveMenu("glp1") }}
                onClick={() => setActiveMenu(activeMenu === "glp1" ? null : "glp1")}
                className={`flex items-center gap-1 px-3.5 py-2 text-[13.5px] font-medium rounded-md whitespace-nowrap transition-colors
                  ${activeMenu === "glp1" ? "text-emerald-700 bg-emerald-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
              >
                GLP-1
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${activeMenu === "glp1" ? "rotate-180 text-emerald-600" : "text-gray-400"}`} />
              </button>
            </div>

            <Link href="/how-it-works" onClick={closeAll} className="px-3.5 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              How it works
            </Link>
            <Link href="/pricing" onClick={closeAll} className="px-3.5 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              Pricing
            </Link>
            <Link href="/blog" onClick={closeAll} className="px-3.5 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              Blog
            </Link>
            <Link href="/about-us" onClick={closeAll} className="px-3.5 py-2 text-[13.5px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
              About
            </Link>
          </nav>

          {/* ── Desktop right: search + auth/CTA ── */}
          <div className="hidden lg:flex items-center gap-2 ml-auto flex-shrink-0">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className={`p-2 rounded-md transition-colors ${searchOpen ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {loggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setAvatarOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13.5px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User className="h-4 w-4" />
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${avatarOpen ? "rotate-180" : ""} text-gray-400`} />
                </button>
                {avatarOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5">
                    <div className="px-4 py-2 text-xs text-gray-400 truncate">{userEmail}</div>
                    <Link href="/dashboard" onClick={closeAll} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link href="/dashboard/settings" onClick={closeAll} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <a href="/api/account/export" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700">
                      <Download className="h-4 w-4" /> Download my data
                    </a>
                    <form action="/auth/signout" method="post" className="border-t border-gray-100 mt-1 pt-1">
                      <button type="submit" className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" onClick={closeAll} className="px-2.5 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 rounded-md transition-colors">
                  Log in
                </Link>
                <PrimaryCTA label="Start Free" ctaId="header_desktop" onClick={closeAll} />
              </>
            )}
          </div>

          {/* ── Mobile/tablet right ── */}
          <div className="flex lg:hidden items-center gap-1 ml-auto">
            {/* Primary CTA — always visible, never hidden in the menu */}
            {!loggedIn && !suppressed && (
              <PrimaryCTA label="Start Free" ctaId="header_mobile_top" onClick={closeAll} className="mr-0.5" />
            )}
            <button
              onClick={() => { setMobileOpen((v) => !v); setSearchOpen(false) }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="p-2.5 sm:p-3 rounded-md text-gray-500 hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── Inline search bar (desktop) ── */}
        {searchOpen && (
          <div className="hidden lg:block border-t border-gray-100 py-3">
            <SearchBar placeholder="Search calculators…" className="max-w-sm" />
          </div>
        )}
      </div>

      {/* ── Desktop dropdowns (full-width) ── */}
      <div className="hidden lg:block" onMouseEnter={cancelClose} onMouseLeave={startClose}>
        {activeMenu === "calculators" && <CalculatorsMenu onClose={closeAll} />}
        {activeMenu === "glp1" && <Glp1Menu onClose={closeAll} />}
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white flex flex-col max-h-[90vh] sm:max-h-[85vh]">
          <div className="overflow-y-auto flex-1">
            {/* Product (first) */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setMobileProductOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5 sm:py-3 text-left min-h-[44px]"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Product</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileProductOpen ? "rotate-180 text-emerald-600" : "text-gray-400"}`} />
              </button>
              {mobileProductOpen && (
                <div className="bg-emerald-50/40 pb-1">
      {productLinks.map((l) => (
                    <Link key={l.href} href={l.href} onClick={closeAll} className="flex items-center gap-2.5 px-6 py-2.5 sm:py-2 text-sm text-gray-700 hover:text-emerald-700 min-h-[44px]">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                      {l.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* GLP-1 Companion */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setMobileGlp1Open((v) => !v)}
                className="flex min-h-[44px] w-full items-center justify-between px-4 py-3.5 text-left sm:py-3"
              >
                <span className="text-sm font-semibold text-emerald-700">GLP-1</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${mobileGlp1Open ? "rotate-180 text-emerald-600" : "text-gray-400"}`} />
              </button>
              {mobileGlp1Open && (
                <div className="bg-emerald-50/40 pb-2">
                  {glp1Groups.map((group) => (
                    <div key={group.title} className="pt-1">
                      <p className="px-6 pt-2 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600">{group.title}</p>
                      {group.items.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={closeAll}
                          className="flex min-h-[44px] items-center gap-2.5 px-6 py-2.5 text-sm text-gray-700 hover:text-emerald-700 sm:py-2"
                        >
                          <span className="h-1 w-1 flex-shrink-0 rounded-full bg-emerald-500" />
                          {l.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculator categories */}
            <div className="px-4 pt-3 pb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Free snapshot tools</span>
            </div>
            {categories.map((cat) => (
              <MobileCategory key={cat.name} category={cat} onLinkClick={closeAll} />
            ))}

            <div className="px-4 py-4 flex flex-wrap gap-x-4 gap-y-3">
              <Link href="/how-it-works" onClick={closeAll} className="text-sm font-medium text-gray-600 hover:text-emerald-700 min-h-[44px] flex items-center">How it works</Link>
              <Link href="/pricing" onClick={closeAll} className="text-sm font-medium text-gray-600 hover:text-emerald-700 min-h-[44px] flex items-center">Pricing</Link>
              <Link href="/blog" onClick={closeAll} className="text-sm font-medium text-gray-600 hover:text-emerald-700 min-h-[44px] flex items-center">Blog</Link>
              <Link href="/about-us" onClick={closeAll} className="text-sm font-medium text-gray-600 hover:text-emerald-700 min-h-[44px] flex items-center">About</Link>
            </div>
          </div>

          {/* Auth / CTA pinned to bottom */}
          <div className="border-t border-gray-100 p-4 bg-white">
            {loggedIn ? (
              <div className="flex flex-col gap-2">
                <Link href="/dashboard" onClick={closeAll} className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 sm:py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 min-h-[44px]">
                  <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                </Link>
                <form action="/auth/signout" method="post">
                  <button type="submit" className="w-full rounded-lg border border-gray-300 px-4 py-3 sm:py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 min-h-[44px]">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <PrimaryCTA variant="block" label="Start Free" ctaId="drawer" onClick={closeAll} />
                <p className="flex items-center justify-center gap-3 text-[11px] font-medium text-gray-500">
                  {["Free", "No credit card", "Save progress"].map((t) => (
                    <span key={t} className="inline-flex items-center gap-1">
                      <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} /> {t}
                    </span>
                  ))}
                </p>
                <Link href="/login" onClick={closeAll} className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-900 min-h-[44px] flex items-center justify-center">
                  Already have an account? Log in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
