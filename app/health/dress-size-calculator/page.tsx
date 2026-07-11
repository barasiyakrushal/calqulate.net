import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import DressSizeAssistant from "@/components/dress-size/DressSizeAssistant"
import {
  SizeJourney, AccuracyComparison, MeasurementGuide, CountryConverter,
  BetweenSizesTree, ReturnRisk, SameSizeDifferentBody, BrandFit, DressLength,
  IllustrationSlot,
} from "@/components/dress-size/DressSizeVisuals"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { SourcesSection } from "@/components/seo/sources-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import {
  Ruler, Sparkles, ShieldCheck, ArrowRight, Shirt, Globe, Heart,
  Info, AlertTriangle,
} from "lucide-react"

const TITLE = "Dress Size Calculator: What Size Dress Am I?"
const DESCRIPTION =
  "Free dress size calculator. Enter your bust, waist and hips to find your US, UK, EU, AU and India dress size, with body shape, brand fit and between-sizes guidance so you order the right size first time."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "dress size calculator, what dress size am i, what size dress am i, dress size by measurements, dress size calculator based on weight and height, us uk eu dress size converter, how to measure bust waist hips, wedding dress size calculator, between sizes, brand sizing",
  alternates: { canonical: "https://calqulate.net/health/dress-size-calculator" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/dress-size-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

const SHAPES = [
  {
    name: "Hourglass", src: "/images/dress-size/shape-hourglass.webp",
    alt: "Hourglass body shape silhouette with balanced bust and hips and a defined waist",
    best: "Wrap, bodycon, fit and flare, belted",
    avoid: "Shapeless shift and boxy cuts that hide the waist",
    size: "Size to your bust or hips, whichever is larger, then have the waist taken in.",
  },
  {
    name: "Pear", src: "/images/dress-size/shape-pear.webp",
    alt: "Pear body shape silhouette with hips wider than bust",
    best: "A-line, fit and flare, off shoulder, statement necklines",
    avoid: "Tight pencil skirts and clingy fabric across the hip",
    size: "Size to your hips. The bust will almost always need taking in.",
  },
  {
    name: "Apple", src: "/images/dress-size/shape-apple.webp",
    alt: "Apple body shape silhouette carrying width through the midsection",
    best: "Empire waist, wrap, A-line, structured V necks",
    avoid: "Bodycon and anything with a tight waistband",
    size: "Size to your bust. Look for an empire line that skims rather than cinches.",
  },
  {
    name: "Rectangle", src: "/images/dress-size/shape-rectangle.webp",
    alt: "Rectangle body shape silhouette with bust waist and hips similar in width",
    best: "Peplum, ruffles, belted, sheath with detail at the waist",
    avoid: "Straight shift dresses with no shaping",
    size: "Your three measurements are close, so you usually fit one clean size. Add a belt for shape.",
  },
  {
    name: "Inverted triangle", src: "/images/dress-size/shape-inverted-triangle.webp",
    alt: "Inverted triangle body shape silhouette with shoulders and bust wider than hips",
    best: "A-line, full skirts, V necks, anything that adds volume below",
    avoid: "Shoulder detail, puff sleeves, halter necks",
    size: "Size to your bust and shoulders, then take in the waist and hip.",
  },
]

const faqs = [
  {
    question: "What size dress am I?",
    answer:
      "Your dress size is decided by your bust, waist and hip measurements, not by your height or weight. Measure all three, then match your largest measurement to a size chart. A US 8 typically fits a 35 to 36 inch bust, a 28 to 29 inch waist and a 38 to 39 inch hip. Brand grading then moves that by up to a full size either way.",
  },
  {
    question: "How do I know my dress size without trying anything on?",
    answer:
      "Take three measurements with a soft tape: bust at the fullest point, waist at the narrowest point, and hips at the widest point. Enter them into the calculator on this page. If the three land in different sizes, buy for the largest one, because taking a seam in is far easier than letting it out.",
  },
  {
    question: "Can height and weight predict my dress size?",
    answer:
      "They can estimate it, but they cannot replace measurements. Two women who are both 165 cm and 60 kg can wear sizes two apart, because dress sizing is built around bust, waist and hip proportions rather than total mass. Use height and weight only as a rough starting point.",
  },
  {
    question: "What is a US 8 in UK and EU sizes?",
    answer:
      "A US 8 is a UK 12, an EU 40, an Australian 12, and roughly an M or 38 in India. The measurements behind it are about a 35 to 36 inch bust, a 28 to 29 inch waist and a 38 to 39 inch hip.",
  },
  {
    question: "Should I size up or size down if I am between sizes?",
    answer:
      "It depends on the fabric and the cut. If the fabric has stretch and the style is relaxed, size down, because it will give as you wear it. If the fabric is woven with no stretch and the dress is structured or fitted, size up and have it taken in. For a stretchy bodycon, stay true to size.",
  },
  {
    question: "How should I measure my bust, waist and hips?",
    answer:
      "Bust: around the fullest part of your chest, level under the arms, wearing a non-padded bra. Waist: the narrowest part of your torso, usually just above the navel. Hips: the widest part of your hips and seat, about 7 to 9 inches below your waist. Keep the tape snug but never tight, and do not hold your breath.",
  },
  {
    question: "Why does the same dress size fit differently at Zara, H&M and Shein?",
    answer:
      "Because there is no legal standard for a dress size. Every brand grades to its own fit model. Zara and H&M generally run small, Shein runs very small, and US high street brands like Old Navy often run large. Always check the garment measurements listed on the product page rather than trusting the size label.",
  },
  {
    question: "What size wedding dress should I order?",
    answer:
      "Bridal sizing typically runs one to two sizes smaller than high street, so a street size 8 is often a bridal 10 or 12. Always order to your largest measurement, usually the bust, and budget for alterations. Nearly every wedding dress is altered, and taking a dress in is routine while letting it out may be impossible.",
  },
  {
    question: "Does body shape change my dress size?",
    answer:
      "It does not change the number on the label, but it changes which size actually fits and which styles work. A pear shape sizes to the hip and takes the bust in. An apple sizes to the bust and looks for an empire line. Two women with the same bust measurement can need different sizes because of where the rest of their width sits.",
  },
  {
    question: "What dress length should I wear for my height?",
    answer:
      "Under 5 feet 2 inches, a standard midi often falls like a maxi, so look for petite ranges. Between 5 feet 2 and 5 feet 8, standard lengths usually work as designed. At 5 feet 9 and above, a standard maxi frequently lands at the ankle rather than the floor, so tall ranges are worth seeking out.",
  },
  {
    question: "What is the most common reason dresses get returned?",
    answer:
      "Fit, and specifically the bust. It is the hardest area to alter and the first place a dress pulls. Waist comes second, usually because the buyer sized to their bust and ignored a smaller waist. Buying for your largest measurement and checking the brand's own garment measurements removes most of that risk.",
  },
]

export default function DressSizeCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Dress Size Calculator"
        description="Find your dress size from your bust, waist and hip measurements, converted across US, UK, EU, AU and India sizing."
        url="https://calqulate.net/health/dress-size-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <Shirt className="h-3.5 w-3.5" />
              Order the right size the first time
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Dress Size Calculator: <span className="text-emerald-700">What Size Dress Am I?</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Enter your bust, waist and hips and get your size in US, UK, EU, Australian and Indian sizing, adjusted for
              your body shape, the dress style and how you like things to fit.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#calculator" className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800">
                Find my dress size ↓
              </a>
              <a href="#measure" className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                How to measure
              </a>
            </div>
          </div>
        </section>

        {/* 30-SECOND ANSWER (AI Overview target) */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-6 md:p-7">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-4 w-4" /> The 30-second answer
              </p>
              <p className="text-base md:text-lg leading-relaxed text-slate-800">
                Your dress size depends primarily on your <strong>bust, waist and hip measurements</strong>, not on your
                height or weight alone. The Calqulate.net Dress Size Calculator compares your measurements against US, UK,
                EU and Indian sizing standards while adjusting for body shape, dress style and fit preference. Instead of
                showing one number, it recommends the size most likely to fit comfortably across different brands.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "3", label: "Measurements", sub: "Bust waist hips" },
              { value: "5", label: "Size systems", sub: "US UK EU AU IN" },
              { value: "Shape", label: "Aware", sub: "Not just numbers" },
              { value: "Brand", label: "Adjusted", sub: "Zara to Shein" },
              { value: "100%", label: "Private", sub: "In-browser" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* THE ASSISTANT: a conversation, not a form */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Your personal shopping assistant</h2>
              <p className="mt-2 text-slate-600">
                Not a size chart. Tell it the occasion, the brand and the fabric, and it will tell you which size to
                actually order, and why.
              </p>
            </div>
            <DressSizeAssistant />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-14">

            {/* INTENT 1: WHAT DRESS SIZE AM I */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Shirt className="h-6 w-6 text-emerald-700" />
                What dress size am I?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                The fastest way to find your dress size is by measuring your bust, waist and hips. Those three numbers are
                what every size chart in the world is built around. Height and weight are not, which is why a friend who
                weighs the same as you can wear a different size.
              </p>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Unlike a basic size chart, the Calqulate.net Dress Size Calculator compares multiple sizing systems and
                explains why a recommendation was made, taking your body shape, the dress style and your fit preference
                into account.
              </p>
              <div className="mt-6">
                <SizeJourney />
              </div>
            </section>

            {/* INTENT 3: HOW TO MEASURE */}
            <section id="measure" className="scroll-mt-20">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Ruler className="h-6 w-6 text-emerald-700" />
                How to measure yourself for the perfect dress size
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Three measurements, five minutes, and a soft tape. Getting these right is the single highest-value thing
                you can do to stop dresses going back.
              </p>
              <div className="mt-6">
                <MeasurementGuide />
              </div>
            </section>

            {/* INTENT 2: HEIGHT AND WEIGHT */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Can height and weight predict your dress size?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Height and weight can estimate a likely dress size, but they cannot replace body measurements. Two women
                with the same height and weight can wear different dress sizes because of differences in bust, waist and
                hip proportion, muscle mass, and how each brand grades its patterns.
              </p>
              <div className="mt-6">
                <AccuracyComparison />
              </div>
              <p className="mt-4 text-slate-700 leading-relaxed">
                For the most accurate recommendation, use the calculator with your actual bust, waist and hip measurements
                rather than height and weight alone.
              </p>
            </section>

            {/* THE SECRET WEAPON */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Why two women with the same height and weight wear different sizes
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                This is the misconception behind most bad online orders. Weight is a total. A dress is cut to a shape.
              </p>
              <div className="mt-6">
                <SameSizeDifferentBody />
              </div>
            </section>

            {/* INTENT 4: COUNTRY CONVERSION */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-6 w-6 text-emerald-700" />
                US, UK, EU and India dress size conversion
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                A US 8 is a UK 12 and an EU 40. The rule of thumb is that UK sizes run four numbers above US, and EU sizes
                run thirty-two above US. Tap any size below to convert it instantly and see the measurements behind it.
              </p>
              <div className="mt-6">
                <CountryConverter />
              </div>
            </section>

            {/* INTENT 6: BRAND SIZING */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Why Zara, H&amp;M, Shein and ASOS all fit differently
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                There is no law that defines a dress size. Each brand fits its patterns to its own house model, then
                grades up and down from there. That is why you can hold three dresses in three different sizes and all
                three fit.
              </p>
              <div className="mt-6">
                <BrandFit />
              </div>
            </section>

            {/* INTENT 10: BETWEEN SIZES */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Should you size up or size down when you are between sizes?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                There is no universal rule, and anyone who gives you one is guessing. The right answer depends on the
                fabric and the cut. Answer two questions and you will know.
              </p>
              <div className="mt-6">
                <BetweenSizesTree />
              </div>
            </section>

            {/* INTENT 9: BODY SHAPE */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Heart className="h-6 w-6 text-emerald-700" />
                Dress size by body shape
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Your measurements say what size. Your shape says which size actually fits, and which styles are worth
                buying. If you are not sure which shape you are, start with the{" "}
                <Link href="/health/body-shape-calculator" className="font-semibold text-emerald-700 hover:underline">
                  Calqulate.net Body Shape Calculator
                </Link>
                , then come back here.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SHAPES.map((s) => (
                  <div key={s.name} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_-24px_rgba(6,110,67,0.35)]">
                    <IllustrationSlot src={s.src} alt={s.alt} aspect="aspect-[3/4]" />
                    <h3 className="mt-3 font-bold text-slate-900">{s.name}</h3>
                    <dl className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
                      <div>
                        <dt className="inline font-bold text-emerald-800">Best: </dt>
                        <dd className="inline text-slate-600">{s.best}</dd>
                      </div>
                      <div>
                        <dt className="inline font-bold text-slate-700">Avoid: </dt>
                        <dd className="inline text-slate-600">{s.avoid}</dd>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2">
                        <dt className="inline font-bold text-emerald-900">Sizing: </dt>
                        <dd className="inline text-emerald-900/90">{s.size}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>

            {/* INTENT 8: DRESS LENGTH */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Dress length by height</h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Size and length are two different problems. A dress can fit perfectly and still be the wrong length,
                because brands cut to a sample model who is usually around 5 feet 8.
              </p>
              <div className="mt-6">
                <DressLength />
              </div>
            </section>

            {/* INTENT 5: WEDDING */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Wedding dress size guide</h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Bridal sizing is its own world, and it will shock you if nobody warns you. It typically runs{" "}
                <strong>one to two sizes smaller</strong> than high street, so a street size 8 is commonly a bridal 10 or
                12. This is not a comment on your body. It is a hangover from decades-old bridal patterns.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { t: "Order to your largest measurement", d: "Almost always the bust. A bridal seamstress can take a dress in easily. Letting one out is often impossible, because there is no seam allowance to work with." },
                  { t: "Budget for alterations", d: "Nearly every wedding dress is altered. Treat alterations as part of the price, not as a failure of sizing." },
                  { t: "Order early", d: "Made-to-order gowns commonly take four to six months, plus six to eight weeks for fittings. Ordering late is what forces bad size decisions." },
                  { t: "Do not order to a goal weight", d: "Order for the body you have. A dress can be taken in at a final fitting. It cannot be conjured larger." },
                ].map((c) => (
                  <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-900">{c.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.d}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* INTENT 11: RETURN RISK */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Why dresses get returned</h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Fit is the single biggest reason clothing goes back, and it is almost entirely avoidable. Knowing where
                orders fail tells you exactly what to check before you click buy.
              </p>
              <div className="mt-6">
                <ReturnRisk />
              </div>
            </section>

            {/* PETITE, TALL, PLUS */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Petite, tall and plus size ranges</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  { t: "Petite", d: "For roughly 5 feet 3 and under. Not a smaller size, but the same size cut with a shorter torso, a higher waist and a shorter hem. If dresses always look like they are wearing you, this is why." },
                  { t: "Tall", d: "For roughly 5 feet 9 and over. Longer torso, longer sleeves, longer hem. A standard maxi that lands at your ankle is the clearest sign you should be shopping tall." },
                  { t: "Plus size", d: "Typically US 14 and up. Grading is not simply scaled up, so measurements matter even more. Always check the garment measurements rather than trusting the label." },
                ].map((c) => (
                  <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-900">{c.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.d}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* HOW WE DETERMINE DRESS SIZE (EEAT) */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="mt-0 text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-emerald-700" /> How we determine your dress size
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                We map your bust, waist and hip measurements onto standard apparel size charts, which are built on the
                same body dimensions used in the ISO and ASTM apparel sizing standards. Where your three measurements fall
                into different sizes, we recommend the larger, because taking a garment in is a routine alteration while
                letting it out often is not. We then adjust for body shape, dress style and fit preference, and convert the
                result across US, UK, EU, Australian and Indian systems. We do not store your measurements, and nothing
                leaves your browser.
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-500">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                No sizing standard is legally binding on brands. Treat any calculated size as a strong starting point, and
                always check the garment measurements published on the product page before ordering.
              </p>
            </section>

            {/* REFERENCES */}
            <SourcesSection
              items={[
                { label: "ISO 8559: Size designation of clothes and body measurement definitions", href: "https://www.iso.org/standard/61686.html" },
                { label: "ASTM D5585: Standard tables of body measurements for adult female misses figure type", href: "https://www.astm.org/d5585-11r21.html" },
                { label: "ASTM D6960: Standard tables of body measurements for plus size women", href: "https://www.astm.org/d6960_d6960m-22.html" },
                { label: "Zara size guide", href: "https://www.zara.com/us/en/help/size-guide" },
                { label: "ASOS size guide", href: "https://www.asos.com/us/size-guide/" },
              ]}
            />

            {/* FAQ */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
                Common dress size questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* RELATED */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">You may also like</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { href: "/health/body-shape-calculator", label: "Body Shape Calculator", desc: "Find your shape in 3D before you choose a size" },
                  { href: "/health/body-fat-calculator", label: "Body Fat Calculator", desc: "What your measurements say about composition" },
                  { href: "/health/ideal-body-weight-calculator", label: "Ideal Body Weight Calculator", desc: "What you should weigh for your height" },
                  { href: "/health/bmi-calculator", label: "BMI Calculator", desc: "Where your weight sits on the medical scale" },
                ].map((r) => (
                  <Link key={r.href} href={r.href} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
                    <span>
                      <span className="block font-semibold text-slate-900">{r.label}</span>
                      <span className="block text-sm text-slate-500">{r.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <p className="text-center text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Your measurements are private. Nothing is stored and nothing leaves your browser.
            </p>

            <RelatedCalculators slug="dress-size-calculator" />

            <MedicalReviewerSection />
            <AuthorSection />
          </div>
        </div>
      </main>

      <AuthorSchema />
      <Footer />
    </div>
  )
}
