import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FreeVsPremium } from "@/components/marketing/FreeVsPremium"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/search-bar"
import { ScoreGauge } from "@/components/vitals/ScoreGauge"
import { SinglePlan } from "@/components/vitals/SinglePlan"
import { FounderVision } from "@/components/marketing/FounderVision"
import { SocialProof } from "@/components/marketing/SocialProof"
import { PremiumTrackersBand } from "@/components/marketing/PremiumTrackersBand"
import { GLP1StorySlides } from "@/components/marketing/GLP1StorySlides"
import { WhyPeopleFail, Glp1Journey, FreeThenPremium } from "@/components/marketing/Glp1Platform"
import {
  MuscleStat, WhatAreYouLosing, Transformation, TrajectoryTimeline,
  FoundersStory, FinalPromise,
} from "@/components/marketing/Trajectory"
import { getAccess, hasPaidAccess } from "@/lib/auth"

import {
  Calculator,
  Wrench,
  TrendingUp,
  Heart,
  HeartPulse,
  Activity,
  Scale,
  Brain,
  Zap,
  Shield,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
  Target,
  LineChart,
  Lock,
  ChevronDown,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Full calculator list (used for count display)
const allCalculators = [
  { href: "/health/absi-calculator", title: "ABSI Calculator", category: "Body Composition" },
  { href: "/health/lean-body-mass-calculator", title: "Lean Body Mass Calculator", category: "Body Composition" },
  { href: "/health/rfm-calculator", title: "RFM Calculator", category: "Body Composition" },
  { href: "/health/ponderal-index-calculator", title: "Ponderal Index Calculator", category: "Body Composition" },
  { href: "/health/adjusted-body-weight-calculator", title: "Adjusted Body Weight Calculator", category: "Body Composition" },
  { href: "/health/karvonen-formula-calculator", title: "Karvonen Formula Calculator", category: "Cardio Health" },
  { href: "/health/body-shape-calculator", title: "Body Shape Calculator", category: "Body Composition" },
  { href: "/health/draw-length-calculator", title: "Draw Length Calculator", category: "Fitness" },
  { href: "/health/face-shape-calculator", title: "Face Shape Calculator", category: "Appearance" },
  { href: "/health/cholesterol-ratio-calculator", title: "Cholesterol Ratio Calculator", category: "Cardio Health" },
  { href: "/health/heart-rate-calculator", title: "Heart Rate Calculator", category: "Cardio Health" },
  { href: "/health/creatinine-clearance-calculator", title: "Creatinine Clearance Calculator", category: "Disease Risk" },
  { href: "/health/pregnancy-weight-gain-calculator", title: "Pregnancy Weight Gain Calculator", category: "Women's Health" },
  { href: "/health/fat-intake-calculator", title: "Fat Intake Calculator", category: "Nutrition" },
  { href: "/health/mean-arterial-pressure-calculator", title: "Mean Arterial Pressure Calculator", category: "Cardio Health" },
  { href: "/health/framingham-risk-score-calculator", title: "Framingham Risk Score Calculator", category: "Disease Risk" },
  { href: "/health/pulse-pressure-calculator", title: "Pulse Pressure Calculator", category: "Cardio Health" },
  { href: "/health/ascvd-risk-calculator", title: "ASCVD Risk Calculator", category: "Disease Risk" },
  { href: "/health/qrisk3-calculator", title: "Qrisk3 Calculator", category: "Disease Risk" },
  { href: "/health/tdee-calculator", title: "TDEE Calculator", category: "Nutrition" },
  { href: "/health/macro-calculator", title: "Macro Calculator", category: "Nutrition" },
  { href: "/health/one-rep-max-calculator", title: "One-Rep Max Calculator", category: "Fitness" },
  { href: "/health/vo2-max-calculator", title: "VO2 Max Calculator", category: "Fitness" },
  { href: "/health/wilks-calculator", title: "Wilks Calculator", category: "Fitness" },
  { href: "/health/bmi-calculator", title: "BMI Calculator", category: "Body Composition" },
  { href: "/health/age-calculator", title: "Age Calculator", category: "General" },
  { href: "/health/waist-to-height-ratio-calculator", title: "Waist-to-Height Ratio Calculator", category: "Body Composition" },
  { href: "/health/ideal-body-weight-calculator", title: "Ideal Body Weight Calculator", category: "Body Composition" },
  { href: "/health/body-fat-calculator", title: "Body Fat Percentage Calculator", category: "Body Composition" },
  { href: "/health/blood-pressure-calculator", title: "Blood Pressure Calculator", category: "Cardio Health" },
  { href: "/health/resting-heart-rate-calculator", title: "Resting Heart Rate Calculator", category: "Cardio Health" },
  { href: "/health/heart-age-calculator", title: "Heart Age Calculator", category: "Cardio Health" },
  { href: "/health/diabetes-risk-calculator", title: "Diabetes Risk Calculator", category: "Disease Risk" },
  { href: "/health/estimated-average-glucose-calculator", title: "eAG Calculator", category: "Disease Risk" },
  { href: "/health/daily-water-intake-calculator", title: "Daily Water Intake Calculator", category: "Nutrition" },
  { href: "/health/calorie-deficit-calculator", title: "Calorie Deficit Calculator", category: "Nutrition" },
  { href: "/health/bmr-calculator", title: "BMR Calculator", category: "Nutrition" },
  { href: "/health/obesity-risk-calculator", title: "Obesity Risk Calculator", category: "Disease Risk" },
  { href: "/health/stress-level-calculator", title: "Stress Level Calculator", category: "Mental Wellness" },
  { href: "/health/breast-cancer-risk-calculator", title: "Breast Cancer Risk Calculator", category: "Disease Risk" },
  { href: "/health/sleep-cycle-calculator", title: "Sleep Cycle Calculator", category: "Mental Wellness" },
  { href: "/health/sleep-debt-calculator", title: "Sleep Debt Calculator", category: "Mental Wellness" },
  { href: "/health/calories-burned-calculator", title: "Calories Burned Calculator", category: "Fitness" },
  { href: "/health/running-pace-calculator", title: "Running Pace Calculator", category: "Fitness" },
  { href: "/health/period-cycle-calculator", title: "Period Cycle Calculator", category: "Women's Health" },
  { href: "/health/ovulation-calculator", title: "Ovulation Calculator", category: "Women's Health" },
  { href: "/health/ivf-pregnancy-due-date-calculator", title: "IVF Due Date Calculator", category: "Women's Health" },
  { href: "/health/golden-ratio-face-calculator", title: "Golden Ratio Face Calculator", category: "Appearance" },
  { href: "/health/weight-loss-percentage-calculator", title: "Weight Loss Percentage Calculator", category: "Body Composition" },
  { href: "/health/glp-1-dose-calculator", title: "GLP-1 Dose Calculator", category: "Disease Risk" },
  { href: "/health/dress-size-calculator", title: "Dress Size Calculator", category: "Appearance" },
  { href: "/health/ai-attractiveness-test", title: "AI Attractiveness Test", category: "Appearance" },
]

// ─── Category Groups ─────────────────────────────────────────────────────────

const categoryGroups = [
  {
    name: "Body Composition",
    icon: <Scale className="h-6 w-6" />,
    description: "BMI, body fat, lean mass, body shape & weight metrics",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconColor: "text-emerald-600",
    bgAccent: "bg-emerald-500",
    count: allCalculators.filter((c) => c.category === "Body Composition").length,
  },
  {
    name: "Cardio Health",
    icon: <Heart className="h-6 w-6" />,
    description: "Heart rate, blood pressure, cardiovascular risk",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    iconColor: "text-rose-500",
    bgAccent: "bg-rose-500",
    count: allCalculators.filter((c) => c.category === "Cardio Health").length,
  },
  {
    name: "Nutrition & Weight",
    icon: <Zap className="h-6 w-6" />,
    description: "Calories, macros, TDEE, BMR, deficit & intake",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    iconColor: "text-amber-600",
    bgAccent: "bg-amber-500",
    count: allCalculators.filter((c) => c.category === "Nutrition").length,
  },
  {
    name: "Fitness Performance",
    icon: <TrendingUp className="h-6 w-6" />,
    description: "VO2 max, one-rep max, running pace, draw length",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    iconColor: "text-blue-600",
    bgAccent: "bg-blue-500",
    count: allCalculators.filter((c) => c.category === "Fitness").length,
  },
  {
    name: "Disease Risk",
    icon: <Shield className="h-6 w-6" />,
    description: "Diabetes, ASCVD, Framingham, cancer risk screening",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    iconColor: "text-violet-600",
    bgAccent: "bg-violet-500",
    count: allCalculators.filter((c) => c.category === "Disease Risk").length,
  },
  {
    name: "Mental Wellness",
    icon: <Brain className="h-6 w-6" />,
    description: "Sleep cycles, sleep debt, stress level analysis",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    iconColor: "text-teal-600",
    bgAccent: "bg-teal-500",
    count: allCalculators.filter((c) => c.category === "Mental Wellness").length,
  },
  {
    name: "Women's Health",
    icon: <Activity className="h-6 w-6" />,
    description: "Ovulation, periods, pregnancy weight & IVF dates",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    iconColor: "text-pink-600",
    bgAccent: "bg-pink-500",
    count: allCalculators.filter((c) => c.category === "Women's Health").length,
  },
  {
    name: "Appearance",
    icon: <Sparkles className="h-6 w-6" />,
    description: "Face shape, body shape, personal style guidance",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconColor: "text-emerald-600",
    bgAccent: "bg-emerald-500",
    count: allCalculators.filter((c) => c.category === "Appearance").length,
  },
]

// ─── Why Choose Us Points ─────────────────────────────────────────────────────

const trustPoints = [
  {
    icon: <CheckCircle2 className="h-5 w-5" />,
    title: "Clinically-Grounded Formulas",
    desc: "Every calculator uses peer-reviewed, medically validated formulas, which are the same tools used by healthcare professionals.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Built for Real People",
    desc: "Results come with context, not just numbers. We explain what your score means and what to do next.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "100% Private, No Account Needed",
    desc: "Nothing is stored. Your health data stays on your device. No login, no tracking, no selling your information.",
  },
  {
    icon: <Award className="h-5 w-5" />,
    title: "Updated to Current Standards",
    desc: "We regularly review and update our calculators to reflect the latest clinical guidelines from AHA, WHO, and NHS.",
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: "Trusted by Thousands Monthly",
    desc: "From fitness enthusiasts to healthcare professionals, Calqulate is a go-to resource for accurate health insight.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Instant, No-Friction Results",
    desc: "No email gates, no confusing interfaces. Just enter your numbers and get your answer.",
  },
  {
    icon: <LineChart className="h-5 w-5" />,
    title: "Track Change Over Time",
    desc: "See your trajectory, not a one-off number. Watch your Metabolic Health Score and risk fall month over month.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Privacy-First Paid Tier",
    desc: "GDPR/CCPA data export and permanent delete, anytime. Your health data is yours to take or erase.",
  },
]

// ─── Calqulate Vitals services ────────────────────────────────────────────────

const vitalsServices = [
  {
    icon: <Activity className="h-6 w-6" />,
    title: "Metabolic Health Tracker",
    desc: "A composite Metabolic Health Score plus heart age and 10-year ASCVD risk, tracked over time.",
    href: "/product/metabolic-health-tracker",
  },
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Heart Age Tracker",
    desc: "See your vascular age versus your real age with the validated Framingham model - and watch it fall.",
    href: "/product/heart-age-tracker",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "GLP-1 Progress Tracker",
    desc: "On semaglutide or Ozempic? Track results that matter beyond the scale - risk, not just pounds.",
    href: "/product/glp1-progress-tracker",
  },
]


// ─── Homepage FAQ (rendered + marked up as FAQPage JSON-LD) ──────────────────

const faqs = [
  {
    question: "I already use MyFitnessPal. Why do I need this?",
    answer:
      "Generic trackers are designed just for counting calories. Calqulate is built specifically for people on GLP-1 medications for weight loss (Ozempic, Wegovy, Mounjaro). We monitor the unique side effects of these glucagon-like peptide-1 (GLP-1) drugs, things like rapid muscle loss, extreme drops in appetite, and metabolic changes, so you lose weight safely.",
  },
  {
    question: "Which GLP-1 is best for weight loss?",
    answer:
      "The best GLP-1 for weight loss depends on you. Tirzepatide (Mounjaro, Zepbound) tends to drive the largest average loss, while semaglutide (Ozempic, Wegovy) is a proven all-rounder, and Rybelsus is the oral GLP-1 pill option. Whichever GLP-1 drug or shot you're on, what actually protects your results is tracking fat vs. muscle, not just the scale.",
    link: { label: "Compare the best GLP-1s for weight loss →", href: "/answers/best-glp-1-for-weight-loss" },
  },
  {
    question: "How do I know if I am losing muscle instead of fat?",
    answer:
      "The standard bathroom scale lies to you. Up to 30% of weight lost on GLP-1s can be muscle. Our Body Composition Tracker uses clinically validated inputs to show you exactly how much fat you are burning versus muscle, so you don't end up 'skinny fat'.",
  },
  {
    question: "Why do you track 'Heart Age' and Labs?",
    answer:
      "Insurance companies and doctors require proof that your medication is actually making you healthier to keep refilling it. By tracking your labs and your 'Heart Age' in our app, you have undeniable proof that your internal health is drastically improving.",
  },
  {
    question: "What is the Founding Member Beta offer?",
    answer:
      "We just launched the GLP-1 suite! For our first 100 users, instead of a $9.99 monthly subscription, we are offering a one-time lifetime pass for just $49. No recurring fees, ever.",
  },
  {
    question: "Is my medical data safe?",
    answer:
      "100% yes. We do not require an account for basic calculators, and for premium users, your data is never sold. You can export or permanently delete your health history with the click of a single button.",
  },
]

// ─── Page Component ───────────────────────────────────────────────────────────

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://calqulate.net/#org",
      name: "Calqulate.net",
      url: "https://calqulate.net",
      email: "krushal.barasiya@calqulate.net",
      description:
        "A USA metabolic and cardiovascular risk-reversal service. Track your Metabolic Health Score, Longevity Index, heart age and disease risk, and reverse it over time.",
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": "https://calqulate.net/#website",
      name: "Calqulate.net",
      url: "https://calqulate.net",
      publisher: { "@id": "https://calqulate.net/#org" },
      description:
        "A metabolic and cardiovascular risk-reversal service. Know your score, track your trend, lower your risk.",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://calqulate.net/search?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Calqulate Vitals",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web, iOS, Android (PWA)",
      url: "https://calqulate.net/pricing",
      description:
        "Track your Metabolic Health Score, Longevity Index, biological age, heart age and 10-year disease risk over time. Run a Future You simulation and follow a GLP-1 protocol that protects muscle.",
      offers: {
        "@type": "Offer",
        price: "79",
        priceCurrency: "USD",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Metabolic Health Score tracking",
        "Longevity Index and biological age",
        "Future You Monte-Carlo simulator",
        "Heart age and 10-year ASCVD and diabetes risk",
        "GLP-1 Autopilot protocol with muscle protection",
        "Doctor-shareable PDF reports",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://calqulate.net/#faq",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ],
}

// Shared luxe dark-emerald + gold background for premium sections.
const LUXE_BG =
  "radial-gradient(70% 60% at 82% -10%, rgba(16,185,129,0.22), transparent 60%)," +
  "radial-gradient(55% 60% at 2% 112%, rgba(245,158,11,0.14), transparent 55%)," +
  "linear-gradient(160deg, #0a3a2b 0%, #052017 45%, #02120c 100%)"

export default async function HomePage() {
  const access = await getAccess();
  const paid = hasPaidAccess(access);
  const loggedIn = access.userId !== null;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
      {/* Global CSS for floating animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out 2s infinite;
        }
      `}</style>

      <Header />

      <main id="main" className="flex-1">

        {/* ── HERO SECTION (GLP-1 focused, light product-page palette) ──────── */}
        <section className="relative overflow-hidden bg-surface py-16 lg:py-24">
          {/* Soft light background accents (match product-page hero) */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
            <div className="absolute -left-24 top-40 h-72 w-72 rounded-full bg-curve/10 blur-3xl" />
          </div>

          <div className="relative container mx-auto px-3 sm:px-4">
            <div className="grid grid-cols-1 items-center gap-10 sm:gap-14 lg:grid-cols-12 lg:gap-8">

              {/* LEFT: copy */}
              <div className="lg:col-span-6 text-center lg:text-left lg:pl-8 xl:pl-14">
                <div className="mb-5 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-brand-800">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
                  Built for Ozempic, Wegovy, Mounjaro &amp; Zepbound
                </div>

                <h1 className="animate-hero-in text-balance text-3xl sm:text-5xl xl:text-6xl font-extrabold leading-[1.07] tracking-tight text-ink">
                  Lose weight you can{" "}
                  <span className="hero-shimmer">actually keep off.</span>
                </h1>

                <p className="mx-auto mt-5 sm:mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-copy lg:mx-0">
                  Most GLP-1 users watch the scale.{" "}
                  <strong className="font-semibold text-ink">Calqulate watches what the scale cannot.</strong>
                </p>

                {/* three outcomes, not thirty features */}
                <div className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                  {["Lose fat.", "Keep muscle.", "Stay healthy."].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm ring-1 ring-line"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mx-auto mt-6 sm:mt-8 max-w-md lg:mx-0">
                  <SearchBar placeholder="Search free tools... e.g. glp-1 dose, heart age" className="h-13 rounded-xl border border-line bg-white text-base shadow-md" />
                </div>

                <div className="mt-5 sm:mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
                  {paid ? (
                    <Button size="lg" className="w-full sm:w-auto rounded-xl bg-emerald-700 px-7 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 min-h-[44px]" asChild>
                      <Link href="/dashboard">Go to dashboard<ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  ) : (
                    <>
                    <Button size="lg" className="w-full sm:w-auto rounded-xl bg-brand px-7 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-600 min-h-[44px]" asChild>
                      <Link href={loggedIn ? "/dashboard" : "/signup"}>Start free<ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                      <Button size="lg" className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-gold-light to-gold px-7 py-3 font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5 hover:opacity-95 min-h-[44px]" asChild>
                        <Link href="/pricing">Go Premium<ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </>
                  )}
                </div>
                <div className="mt-3 text-center lg:text-left">
                  <Link href="/how-it-works" className="text-sm font-medium text-brand-700 hover:underline">See how it works →</Link>
                </div>

                <div className="mt-7 sm:mt-9 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-faint lg:justify-start">
                  {["Based on clinical formulas", "100% private & secure", "Built for GLP-1 users"].map((t) => (
                    <span key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand" />{t}</span>
                  ))}
                </div>
              </div>

              {/* RIGHT: GLP-1 reality-check video (responsive) */}
              <div className="relative lg:col-span-6">
                <div className="absolute inset-0 rounded-[2.5rem] bg-brand/20 blur-3xl" />
                <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-black shadow-2xl">
                  <div className="relative aspect-video w-full">
                    <iframe
                      src="https://player.cloudinary.com/embed/?cloud_name=tiotxqvw&public_id=GLP-1_Reality_Check_xsfptb"
                      title="GLP-1 Reality Check"
                      className="absolute inset-0 h-full w-full"
                      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. THE PROBLEM: one number nobody forgets ─────────────────────── */}
        <MuscleStat />

        {/* ── 2b. PROVE IT: let them feel the difference themselves ─────────── */}
        <WhatAreYouLosing />

        {/* ── 2c. WHY PEOPLE FAIL: the six things nobody warns them about ───── */}
        <WhyPeopleFail />

        {/* ── 3. THE TRANSFORMATION: before vs with Calqulate ───────────────── */}
        <Transformation />

        {/* ── 4. THE TRAJECTORY: today -> week 2 -> month 2 -> 6mo -> 1 year ── */}
        <TrajectoryTimeline />

        {/* ── 5. PRODUCT WALKTHROUGH: calculate -> track -> understand -> improve */}
        <Glp1Journey />

        {/* ── PREMIUM TRACKERS BAND (luxe, top-of-funnel) ──────────────────── */}
        <PremiumTrackersBand />

        {/* ── SECTION B: THE GLP-1 STORY (miracle → danger → solution) ──────── */}
        <GLP1StorySlides />

        {/* ── SECTION C: INTRODUCING CALQULATE VITALS ──────────────────────── */}
        <section id="how-it-works" className="py-12 sm:py-16 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 scroll-mt-20">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-10 sm:mb-12 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold mb-4">
                <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5" />
                Introducing Calqulate Vitals
              </div>
              <h2 id="vitals-intro" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                From a one-time number to a health trajectory.
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                Calqulate Vitals turns your numbers into a tracked score, validated risk models, and the
                single highest-impact change to make next.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 items-center max-w-6xl mx-auto">
              {/* 3-step how it works */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                {[
                  { n: "1", icon: <Calculator className="h-5 w-5" />, title: "Compute", desc: "Run every clinical engine free and stateless - no login required." },
                  { n: "2", icon: <LineChart className="h-5 w-5" />, title: "Save & track", desc: "Trend your Metabolic Health Score, heart age, and 10-yr ASCVD & diabetes risk over time." },
                  { n: "3", icon: <Target className="h-5 w-5" />, title: "Act", desc: "A weighted risk-graph engine surfaces your single highest-impact 'next lever.'" },
                ].map((step) => (
                  <div key={step.n} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{step.n}</span>
                      <span className="text-emerald-600">{step.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              {/* Score gauge + trend illustration */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm flex flex-col items-center">
                <ScoreGauge score={82} grade="B" />
                <svg viewBox="0 0 240 60" className="mt-4 w-full" role="img" aria-label="Sample improving score trend">
                  <polyline
                    points="0,48 40,44 80,46 120,36 160,30 200,22 240,14"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {[[0,48],[40,44],[80,46],[120,36],[160,30],[200,22],[240,14]].map(([x,y],i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />
                  ))}
                </svg>
                <p className="mt-2 text-xs text-gray-400 text-center">Sample score trending up over six measurements.</p>
              </div>
            </div>

            <p className="mt-10 text-center text-sm text-gray-500 max-w-3xl mx-auto">
              Built on validated, published models:{" "}
              <a
                href="https://www.ahajournals.org/doi/10.1161/01.cir.0000437741.48606.98"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-emerald-700"
              >
                Pooled Cohort Equations (ASCVD)
              </a>
              ,{" "}
              <a
                href="https://www.framinghamheartstudy.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-emerald-700"
              >
                Framingham (heart age)
              </a>
              , and{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/12610029/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-700 underline decoration-gray-300 underline-offset-2 hover:text-emerald-700"
              >
                FINDRISC (type-2 diabetes risk)
              </a>
              . Educational decision-support - not medical advice.
            </p>
          </div>
        </section>

        {/* ── ADVANCED PLATFORM (v2 capabilities) ──────────────────────────── */}
        <section className="relative overflow-hidden py-12 sm:py-16 text-gray-100" style={{ background: LUXE_BG }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }} />
          <div className="container relative mx-auto px-3 sm:px-4 max-w-6xl">
            <div className="text-center mb-10 sm:mb-12 max-w-2xl mx-auto">
              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-ink">
                ✦ Your daily health operating system
              </span>
              <h2 id="advanced-platform" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">More than a tracker &mdash; a model of your future self</h2>
              <p className="mt-3 text-sm sm:text-base text-gray-400">
                First-principles health: break your biology into measurable systems, model reality, and get god-mode
                control over your trajectory.
              </p>
            </div>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {[
                { tag: "Live", t: "Longevity Index (0–1000)", d: "One number that rolls up cardiovascular, metabolic, body-composition, fitness and glucose control - with the exact levers to raise it." },
                { tag: "Live", t: "Biological age", d: "A transparent biomarker-weighted estimate of how old your body really is, and the top drivers aging you faster." },
                { tag: "Live", t: "“Future You” simulator", d: "A Monte-Carlo engine projects your weight, score and heart age 6–60 months out - across optimistic, realistic and pessimistic adherence, with honest confidence bands." },
                { tag: "Live", t: "3D body + organ systems", d: "An interactive avatar that morphs with your composition, plus per-organ biological-age gauges (heart, liver, pancreas, brain, muscle)." },
                { tag: "Live", t: "GLP-1 Autopilot", d: "An adaptive 12–24 week titration + protein + training protocol that adjusts to your logged side-effects and progress." },
                { tag: "Live", t: "Mobile + weekly email", d: "Opt-in mobile notifications and a week-on-week progress email so your trajectory stays top of mind." },
              ].map((f) => (
                <div key={f.t} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-gold/25 hover:bg-white/10">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${f.tag === "Live" ? "bg-gradient-to-r from-gold-light to-gold text-gold-ink" : "bg-white/10 text-white/70"}`}>
                    {f.tag}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white">{f.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">{f.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-white/45">
              All calculations are pure, transparent code - no black-box AI. Methodology is shown on every result.
            </p>
          </div>
        </section>

        {/* ── FREE IS TODAY, PREMIUM IS THE FUTURE (the story, then the table) ── */}
        {!paid && (
          <>
            <FreeThenPremium loggedIn={loggedIn} />
            <section className="bg-white py-12 sm:py-16">
              <div className="container mx-auto px-3 sm:px-4">
                <FreeVsPremium showCta />
              </div>
            </section>
          </>
        )}

        {/* ── SECTION E: PRICING ───────────────────────────────────────────── */}
        <section id="pricing" className="py-12 sm:py-16 bg-gray-50 border-y border-gray-100 scroll-mt-20">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
              <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                Simple, honest and transparent pricing
              </span>
              <h2 id="pricing-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                 Upgrade Calqulate Vitals to track Glp-1 dose, Metabolism &amp; Heart age.
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                The free snapshot is genuinely free &mdash; run any engine once, nothing saved. One plan unlocks
                saved history, the trajectory engine, your next-lever protocol, and doctor-shareable reports.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="order-2 lg:order-1">
                <FounderVision />
              </div>
              <div className="order-1 lg:order-2">
                <SinglePlan paid={paid} />
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-gray-400">
              Educational decision-support - not medical advice. Cancel anytime.
            </p>
          </div>
        </section>

        {/* ── FEATURED: Face & Body Shape ──────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-50 to-white">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-10">
              <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                Featured Calculators
              </span>
              <h2 id="face-body-shape" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Discover Your Body &amp; Face Shape
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                Two of our most-loved tools. Hundreds of thousands of people use them to understand their physical traits and receive personalized lifestyle guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
              {/* Body Shape Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-x-8 -translate-y-8 group-hover:bg-emerald-100 transition-colors" />
                <div className="p-5 sm:p-8 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 sm:p-3 bg-emerald-100 rounded-xl">
                      <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2.5 sm:px-3 py-1 rounded-full">
                      Trending
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Body Shape Calculator</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-2 leading-relaxed">
                    Enter your bust, waist, and hip measurements to discover your body shape, such as hourglass, pear, apple, or rectangle.
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    {["Identify your exact body type", "Get fitness tips for your shape", "Find flattering clothing styles"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                    asChild
                  >
                    <Link href="/health/body-shape-calculator">
                      Find My Body Shape
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Face Shape Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -translate-x-8 -translate-y-8 group-hover:bg-teal-100 transition-colors" />
                <div className="p-5 sm:p-8 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 sm:p-3 bg-teal-100 rounded-xl">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-700 px-2.5 sm:px-3 py-1 rounded-full">
                      Trending
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Face Shape Detector</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-2 leading-relaxed">
                    Use precise facial measurements, including your forehead, cheekbones, jaw, and face length, to identify your exact face shape.
                  </p>
                  <ul className="space-y-1.5 mb-6">
                    {["Determine oval, round, square, heart, diamond, or oblong", "Get hairstyle recommendations", "Find the best glasses for your features"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl"
                    asChild
                  >
                    <Link href="/health/face-shape-calculator">
                      Find My Face Shape
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORY SECTION ──────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-10">
              <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                Browse by Category
              </span>
              <h2 id="categories" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Every Aspect of Your Health, Covered
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                Eight specialized health categories help you find the calculator you need quickly.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
              {categoryGroups.map((cat) => (
                <div
                  key={cat.name}
                  className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${cat.color} border`}>
                    <span className={cat.iconColor}>{cat.icon}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 mb-1">{cat.name}</div>
                  <div className="text-xs text-gray-400 mb-2 leading-relaxed">{cat.description}</div>
                  <div className="text-xs font-semibold text-emerald-600">{cat.count} calculators</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIFFERENTIATION / VALUE SECTION ──────────────────────────────── */}
        <section className="relative overflow-hidden py-12 sm:py-16" style={{ background: LUXE_BG }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }} />
          <div className="container relative mx-auto px-3 sm:px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">

              {/* Left: Headline */}
              <div>
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-ink">
                  ✦ Our Difference
                </span>
                <h2 id="our-difference" className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                  Go Beyond Raw Numbers.{" "}
                  <span className="text-gold-light">A Decision Guide for Your Health.</span>
                </h2>
                <p className="text-white/65 text-lg leading-relaxed mb-6">
                  Most health calculators stop at a result. Calqulate goes further. Every calculation comes
                  with an explanation of what your result means, how it compares to healthy ranges, and what
                  concrete steps you should take next.
                </p>
                <p className="text-white/65 leading-relaxed">
                  You might want to optimize your fitness, manage a chronic condition, track weight loss,
                  or understand your body. Calqulate turns raw data into real decisions.
                </p>
              </div>

              {/* Right: Features list */}
              <div className="space-y-4">
                {[
                  { title: "Result + Interpretation", desc: "Every score includes a plain-English explanation of what it means for your health." },
                  { title: "Healthy Range Benchmarks", desc: "See where you stand compared to clinical benchmarks instead of looking at a raw number." },
                  { title: "Actionable Recommendations", desc: "Actionable guidance for each result, telling you what to eat, how to train, and when to see a doctor." },
                  { title: "Multiple Validated Formulas", desc: "Where relevant, we show results from multiple clinical formulas side-by-side." },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm transition-colors hover:border-gold/25 hover:bg-white/10"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-gold-light to-gold rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-gold-ink" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm mb-0.5">{feature.title}</div>
                      <div className="text-sm text-white/60 leading-relaxed">{feature.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-10">
              <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                Why Calqulate
              </span>
              <h2 id="why-calqulate" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Built on Trust. Designed for Understanding.
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                We built Calqulate because health tools should help people make better decisions, rather than overwhelming or misleading them.
              </p>
            </div>

            {/* Full infographic — native 3:2 (1536×1024), fits without cropping */}
            <div className="relative max-w-5xl mx-auto">
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-emerald-400/15 blur-3xl" />
              <Image
                src="/why-calqulate.webp"
                alt="Why Calqulate: clinically grounded formulas, built for real people, 100% private, trusted by thousands, instant results, and track change over time"
                width={1536}
                height={1024}
                sizes="(max-width: 1024px) 100vw, 1024px"
                quality={100}
                className="relative w-full h-auto rounded-3xl ring-1 ring-emerald-100 shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* ── VISUAL GALLERY ───────────────────────────────────────────────── */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-10">
              <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                Visual Guides
              </span>
              <h2 id="visual-guides" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Explore Health Visuals
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                Body shapes, face shapes, and BMI charts are easier to understand visually. Click any image to explore detailed guides.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
              {[
                { title: "Body Shapes", href: "/gallery#pear-shape", image: "/images/body-shapes/pear-shape.webp", color: "bg-rose-50" },
                { title: "Face Shapes", href: "/gallery#face-shape-comparison", image: "/face-shape-comparison.webp", color: "bg-blue-50" },
                { title: "BMI Chart", href: "/gallery#bmi-chart", image: "/bmi-chart.webp", color: "bg-emerald-50" },
                { title: "Sleep Guide", href: "/gallery#sleep-cycle", image: "/recommendation-sleep-cycle-by-age-infographic.webp", color: "bg-violet-50" },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group block rounded-2xl overflow-hidden bg-white ring-1 ring-gray-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className={`relative w-full aspect-[4/3] ${item.color}`}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                View All Visual Guides
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── 8. TRUST: why we built this, in our own words ─────────────────── */}
        <FoundersStory />

        {/* ── SOCIAL PROOF: testimonials, stats, success stories ───────────── */}
        <SocialProof />

        {/* ── FAQ (rendered + FAQPage JSON-LD) ─────────────────────────────── */}
        <section id="faq" className="py-12 sm:py-16 bg-gray-50 border-b border-gray-100 scroll-mt-20">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-10">
              <span className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                Frequently Asked Questions
              </span>
              <h2 id="faq-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Common questions about Calqulate
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                Everything you need to know about our calculators, your data, and the clinical models behind the numbers.
              </p>
            </div>

            <div className="max-w-3xl mx-auto divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
              {faqs.map((faq, i) => (
                <details key={faq.question} className="group px-5 sm:px-6" open={i === 0}>
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 sm:py-5 list-none [&::-webkit-details-marker]:hidden">
                    <h3
                      id={`faq-${i}`}
                      className="text-sm sm:text-base font-semibold text-gray-900 scroll-mt-24"
                    >
                      {faq.question}
                    </h3>
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-emerald-600 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="pb-5 text-sm sm:text-base leading-relaxed text-gray-600">
                    <p>{faq.answer}</p>
                    {"link" in faq && faq.link && (
                      <Link href={faq.link.href} className="mt-2 inline-block font-semibold text-emerald-700 hover:underline">
                        {faq.link.label}
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. THE CLOSER: an emotional promise, not a feature list ────────── */}
        <FinalPromise loggedIn={loggedIn} />

      </main>

      <Footer />
    </div>
  )
}