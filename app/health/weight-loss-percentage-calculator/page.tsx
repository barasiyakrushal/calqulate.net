import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import WeightLossPercentageWizard from "@/components/calculators/weight-loss-percentage-wizard"
import { MilestoneChart, CompositionChart, PaceGauge, FormulaWalkthrough } from "@/components/weight-loss/WeightLossVisuals"
import { ServiceCTA } from "@/components/seo/service-cta"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { SourcesSection } from "@/components/seo/sources-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import {
  TrendingDown, Scale, Sparkles, ShieldCheck, ArrowRight, Syringe,
  AlertTriangle, Info, Baby, Calculator as CalcIcon,
} from "lucide-react"

const TITLE = "Weight Loss Percentage Calculator: What Percent of Your Body Weight Have You Lost?"
const DESCRIPTION =
  "Free weight loss percentage calculator. Find out exactly what percent of your body weight you have lost, in kg, lb or stone, and see whether your pace is healthy. Includes a clinical milestone chart and a fat vs water vs muscle breakdown."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "weight loss percentage calculator, percent weight loss calculator, how much weight have i lost calculator, what percentage of body weight have i lost, weight loss percentage chart, fat loss percentage calculator, weight loss percentage formula, how to calculate percentage of weight loss, healthy weight loss percentage, percent weight change",
  alternates: { canonical: "https://calqulate.net/health/weight-loss-percentage-calculator" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/weight-loss-percentage-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

// Worked examples answer the "jacob lost 11 kg", "98 kg lost 8 kg" style queries.
const EXAMPLES = [
  { start: "220 lb", now: "195 lb", lost: "25 lb", pct: "11.4%", note: "A strong result. Past the 10 percent milestone." },
  { start: "98 kg", now: "90 kg", lost: "8 kg", pct: "8.2%", note: "Approaching the 10 percent milestone." },
  { start: "100 kg", now: "89 kg", lost: "11 kg", pct: "11.0%", note: "Started at 100 kg, so 11 kg is 11 percent." },
  { start: "15 st 0 lb", now: "13 st 8 lb", lost: "1 st 6 lb", pct: "9.5%", note: "Stones work too, once converted to pounds." },
  { start: "150 lb", now: "135 lb", lost: "15 lb", pct: "10.0%", note: "10 percent of 150 lb is 15 lb." },
]

const faqs = [
  {
    question: "What percentage of my body weight have I lost?",
    answer:
      "Subtract your current weight from your starting weight, divide the result by your starting weight, then multiply by 100. For example, going from 220 lb to 195 lb is 25 lb lost, and 25 divided by 220 is 0.114, so you have lost 11.4 percent of your body weight. The unit does not matter as long as both weights use the same one.",
  },
  {
    question: "How do I calculate percentage of weight loss?",
    answer:
      "Use the formula ((starting weight minus current weight) divided by starting weight) times 100. Always use your original starting weight, not last month's weight, or you will erase your own progress. The calculator on this page does it instantly in kg, lb or stone.",
  },
  {
    question: "What is a good weight loss percentage?",
    answer:
      "Losing 5 percent of your starting body weight is considered clinically meaningful and is enough to improve blood pressure, blood sugar and cholesterol. 10 percent is an excellent result and is the target most clinical guidelines aim for. Anything above 15 percent brings major metabolic improvements but usually needs medical support.",
  },
  {
    question: "I lost 8 kg. Is that good?",
    answer:
      "It depends entirely on your starting weight. Losing 8 kg from 98 kg is 8.2 percent, which is a strong result approaching the 10 percent milestone. Losing the same 8 kg from 150 kg is only 5.3 percent. That is exactly why percentage is a fairer measure of progress than raw kilograms.",
  },
  {
    question: "How much weight should I lose per week?",
    answer:
      "About 0.5 to 1 percent of your body weight per week is the safe, sustainable range. At 200 lb that is roughly 1 to 2 lb a week. Losing faster than about 1 percent a week increasingly pulls weight from muscle and water rather than fat.",
  },
  {
    question: "Is losing 15 percent of your body weight too fast?",
    answer:
      "The percentage itself is not the problem, the timeframe is. Losing 15 percent over six to twelve months is an excellent, well-paced result. Losing 15 percent in six weeks is far too fast and will cost you significant muscle. Judge the rate per week, not the total.",
  },
  {
    question: "How much of my weight loss is fat, water or muscle?",
    answer:
      "Early, fast weight loss is heavily water, because your body stores roughly 3 g of water with every gram of glycogen it burns off. A steady loss of 0.5 to 1 percent a week is typically about 75 percent fat. Eating enough protein and doing resistance training can push that toward 85 percent or more fat.",
  },
  {
    question: "Why is my weight loss percentage lower than I expected?",
    answer:
      "Usually because percentage is measured against your starting weight, which is a large number. Losing 10 lb from 250 lb is only 4 percent, even though 10 lb is real progress. It can also mean you updated your starting weight, which resets your progress to zero. Always keep the original number.",
  },
  {
    question: "What percent weight loss is noticeable to other people?",
    answer:
      "Research on facial perception suggests changes become visible to others at around 3 to 4 percent of body weight, and clearly noticeable around 5 to 10 percent. Where you carry weight, your height and your clothing all shift that threshold, so the number varies between people.",
  },
  {
    question: "Does this calculator work in kg, pounds and stones?",
    answer:
      "Yes. Percentage is a ratio, so the unit cancels out. A 10 percent loss is 10 percent whether you measure in kilograms, pounds or stones. The only rule is that your starting weight and current weight must both be in the same unit.",
  },
  {
    question: "What is percent weight loss in newborns?",
    answer:
      "That is a different, clinical measurement. Most newborns lose 5 to 7 percent of their birth weight in the first few days of life, and a loss of more than 10 percent is a medical concern that needs a healthcare professional. This calculator is designed for adults tracking intentional weight loss and should not be used for infants.",
  },
]

export default function WeightLossPercentageCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Weight Loss Percentage Calculator"
        description="Calculate what percentage of your body weight you have lost, in kg, lb or stone, and see whether your weekly pace is healthy."
        url="https://calqulate.net/health/weight-loss-percentage-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <TrendingDown className="h-3.5 w-3.5" />
              The fairest way to measure your progress
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Weight Loss Percentage Calculator: <span className="text-emerald-700">What Percent Have You Lost?</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Losing 10 lb means something very different at 150 lb than it does at 300 lb. Percentage is how doctors,
              trainers and clinical trials actually measure progress. Works in kg, pounds or stones.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#calculator" className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800">
                Calculate my percentage ↓
              </a>
              <Link
                href="/product/glp1-progress-tracker"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> Track loss and muscle together
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 30-SECOND ANSWER: snippet / AI Overview target */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-6 md:p-7">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-4 w-4" /> The 30-second answer
              </p>
              <p className="text-base md:text-lg leading-relaxed text-slate-800">
                To find what percentage of your body weight you have lost, subtract your current weight from your starting
                weight, divide by your starting weight, then multiply by 100. Going from 220 lb to 195 lb is 25 lb lost,
                and 25 ÷ 220 × 100 = <strong>11.4 percent</strong>. Losing 5 percent is clinically meaningful, and 10
                percent is the target most medical guidelines aim for.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "5%", label: "Clinically meaningful", sub: "Health markers move" },
              { value: "10%", label: "Excellent", sub: "Guideline target" },
              { value: "0.5 to 1%", label: "Healthy pace", sub: "Per week" },
              { value: "kg · lb · st", label: "Any unit", sub: "Percentage is a ratio" },
              { value: "100%", label: "Private", sub: "In-browser" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-xl md:text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">How much have you really lost?</h2>
              <p className="mt-2 text-slate-600">
                A few quick taps. No account, no email, your answers never leave your browser.
              </p>
            </div>
            <WeightLossPercentageWizard />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-14">

            {/* INTENT BLOCK: what percentage have I lost (GSC position 2) */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <CalcIcon className="h-6 w-6 text-emerald-700" />
                How do I know what percentage of my body weight I have lost?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                You need two numbers and nothing else: the weight you started at, and the weight you are now. Subtract
                the second from the first to get the weight you have lost, divide that by your starting weight, and
                multiply by 100. That single number tells you more about your progress than the pounds ever will, because
                it is scaled to the body you began with.
              </p>
              <p className="mt-3 text-slate-700 leading-relaxed">
                The one rule that trips people up: always use your <strong>original</strong> starting weight. If you keep
                resetting it to last month&apos;s number, your percentage will hover near zero forever and hide months of
                real progress.
              </p>
              <div className="mt-6">
                <FormulaWalkthrough />
              </div>
            </section>

            {/* INTENT BLOCK: the missing chart (GSC position 3, zero clicks) */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="h-6 w-6 text-emerald-700" />
                What does your percentage actually mean?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Weight loss percentage is not a vanity metric. Each milestone maps to a specific, measurable change in
                your health, which is why clinical trials report results as a percentage of starting body weight rather
                than in pounds.
              </p>
              <div className="mt-6">
                <MilestoneChart startWeightLb={220} />
              </div>
            </section>

            {/* INTENT BLOCK: fat vs water vs muscle (GSC position 4.93) */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Scale className="h-6 w-6 text-emerald-700" />
                Did you lose fat, water, or muscle?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                This is the question the scale can never answer, and it is the one that decides whether your results last.
                Take a real example: someone at 98 kg who has lost 8 kg in 7 weeks. That is 8.2 percent, at a pace of
                about 1.2 percent a week, which is on the fast side. At that speed a meaningful share of those 8 kg is
                water and muscle, not fat.
              </p>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Water comes off first and fast, because your body stores roughly three grams of water with every gram of
                glycogen it burns through. That is why week one on any diet looks miraculous and week three looks like a
                stall. Nothing has gone wrong. The water simply ran out.
              </p>
              <div className="mt-6">
                <CompositionChart />
              </div>
              <p className="mt-4 text-slate-700 leading-relaxed">
                To find out where your own loss is coming from, run the{" "}
                <Link href="/health/glp-1-dose-calculator" className="font-semibold text-emerald-700 hover:underline">
                  GLP-1 Body Composition Tracker to see if you are losing fat or muscle
                </Link>
                , then set a protein target with the{" "}
                <Link href="/health/lean-body-mass-calculator" className="font-semibold text-emerald-700 hover:underline">
                  lean body mass calculator
                </Link>
                .
              </p>
            </section>

            {/* INTENT BLOCK: weekly pace */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                How much weight should you lose per week?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Judge your pace as a percentage of your body weight, not in pounds. Two pounds a week is gentle at 300 lb
                and aggressive at 130 lb. The safe, sustainable range is 0.5 to 1 percent of body weight per week,
                which is roughly what the CDC describes as steady, gradual weight loss.
              </p>
              <div className="mt-6">
                <PaceGauge weeklyPct={0.8} />
              </div>
            </section>

            {/* INTENT BLOCK: worked examples */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Real weight loss examples</h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                The same amount of weight is a very different percentage depending on where you started. These worked
                examples show exactly how the maths lands.
              </p>
              <div className="mt-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[600px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Started at</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Now</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Lost</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Percentage</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">What it means</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {EXAMPLES.map((e, i) => (
                      <tr key={e.start} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{e.start}</td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{e.now}</td>
                        <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{e.lost}</td>
                        <td className="px-4 py-3 font-bold text-emerald-800 whitespace-nowrap">{e.pct}</td>
                        <td className="px-4 py-3 text-slate-600">{e.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-500 sm:hidden">Swipe the table sideways to see every column.</p>
            </section>

            {/* INTENT BLOCK: the real questions people type */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">The questions people actually ask</h2>
              <div className="mt-6 space-y-6">
                {[
                  {
                    q: "I lost 8 kg. Is that good?",
                    a: "It depends completely on where you started. Eight kilograms from 98 kg is 8.2 percent, a strong result closing in on the 10 percent milestone. The same 8 kg from 150 kg is 5.3 percent, which is still clinically meaningful but a smaller share of your body. This is precisely why percentage is the fairer measure.",
                  },
                  {
                    q: "What percentage is 10 pounds?",
                    a: "Divide 10 by your starting weight. From 150 lb it is 6.7 percent. From 200 lb it is 5 percent. From 250 lb it is 4 percent. Ten pounds is real progress at any size, but its percentage shrinks as your starting weight grows, which is why the scale alone can feel discouraging for heavier people.",
                  },
                  {
                    q: "Is losing 15 percent of your body weight too fast?",
                    a: "The total is not the issue, the timeframe is. Fifteen percent over six to twelve months is an excellent, well-paced result that many clinical programmes aim for. Fifteen percent in six weeks is far too fast, and a large share of it will be muscle and water. Always judge the rate per week, not the headline number.",
                  },
                  {
                    q: "Why is my weight loss percentage lower than I expected?",
                    a: "Two common reasons. First, percentage is measured against your starting weight, which is a big number, so 10 lb from 250 lb is only 4 percent. Second, and more damaging, you may have updated your starting weight along the way. Doing that erases your own progress. Lock in the original number and never change it.",
                  },
                  {
                    q: "What is 5 percent of my body weight?",
                    a: "Multiply your starting weight by 0.05. At 150 lb it is 7.5 lb. At 200 lb it is 10 lb. At 100 kg it is 5 kg. That 5 percent is the threshold where blood pressure, blood sugar and cholesterol begin measurably improving, which is why doctors treat it as the first real milestone.",
                  },
                  {
                    q: "What percent weight loss is noticeable to other people?",
                    a: "Studies of facial perception suggest change becomes visible to strangers at roughly 3 to 4 percent of body weight, and is clearly noticeable by around 5 to 10 percent. Height, where you store fat, and what you wear all move that line, so the point at which people start commenting varies a lot.",
                  },
                  {
                    q: "How do I calculate weight loss percentage in kg or stones?",
                    a: "Exactly the same way. Percentage is a ratio, so the unit cancels out entirely. A 10 percent loss is 10 percent in kilograms, pounds or stones. The only requirement is that your starting weight and your current weight are both expressed in the same unit. If you work in stones and pounds, convert both figures to pounds first.",
                  },
                ].map((item) => (
                  <div key={item.q} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="text-lg font-bold text-slate-900">{item.q}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* INTENT BLOCK: newborn (distinct clinical intent) */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-7">
              <h2 className="mt-0 text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Baby className="h-6 w-6 text-emerald-700" />
                What about percent weight loss in newborns?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                This is a completely different, clinical measurement, and this calculator is not the right tool for it.
                Most newborns lose 5 to 7 percent of their birth weight in the first few days of life, which is normal.
                A loss of more than 10 percent is a recognised medical concern and needs assessment by a paediatrician or
                lactation consultant, not a general calculator. If you are tracking an infant, please speak to a
                healthcare professional.
              </p>
            </section>

            {/* GLP-1 CONTEXT */}
            <section className="rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Syringe className="w-7 h-7 text-emerald-300" />
                <h2 className="text-xl md:text-2xl font-bold text-white m-0">Weight loss percentage on a GLP-1</h2>
              </div>
              <p className="text-emerald-50/90 leading-relaxed">
                If you are on Ozempic, Wegovy, Mounjaro or Zepbound, these are the averages people tend to hit. Use them
                as a gut check, not a scoreboard.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-200">Semaglutide (Wegovy)</p>
                  <ul className="mt-3 space-y-2 text-emerald-50/90 text-sm">
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>Month 2</span><span className="font-bold">about 2 to 4%</span></li>
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>Month 3</span><span className="font-bold">about 4 to 6%</span></li>
                    <li className="flex justify-between"><span>Month 6</span><span className="font-bold">around 11%</span></li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-200">Tirzepatide (Zepbound / Mounjaro)</p>
                  <ul className="mt-3 space-y-2 text-emerald-50/90 text-sm">
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>By month 3</span><span className="font-bold">about 5 to 8%</span></li>
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>By month 6</span><span className="font-bold">about 10 to 15%</span></li>
                    <li className="flex justify-between"><span>Note</span><span className="font-bold">more than semaglutide</span></li>
                  </ul>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-white/10 border border-white/20 p-5">
                <p className="text-base font-semibold text-white">
                  A falling percentage is only half the story. Up to 40 percent of GLP-1 weight loss can be muscle if you
                  do not protect it. Check your split with the{" "}
                  <Link href="/health/glp-1-dose-calculator" className="font-bold text-gold-light underline decoration-gold/50 underline-offset-2 hover:decoration-gold-light">
                    GLP-1 Body Composition Tracker to see if you are losing fat or muscle
                  </Link>
                  .
                </p>
              </div>
            </section>

            {/* LIMITATIONS (EEAT) */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-emerald-700" />
                What this number cannot tell you
              </h2>
              <ul className="mt-4 space-y-3">
                {[
                  "It measures total body weight, which includes fat, water, glycogen and muscle. It cannot separate them.",
                  "Day-to-day weight swings of 2 to 4 lb are normal from water, salt and food. Weigh weekly under the same conditions and trust the trend.",
                  "A falling percentage is not automatically good. Losing quickly, or losing while under-eating protein, can mean losing muscle.",
                  "It says nothing about where you carry weight. Waist circumference is a better marker of visceral fat risk.",
                  "It is not designed for infants, pregnancy, or clinical fluid-loss assessment.",
                ].map((l) => (
                  <li key={l} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* HOW WE CALCULATED THIS (EEAT) */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="mt-0 text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-emerald-700" /> How we calculated this
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                We use the standard percentage change formula, ((starting weight minus current weight) divided by starting
                weight) times 100, applied to your original starting weight. Weekly pace is expressed as a percentage of
                body weight per week, and the healthy range of 0.5 to 1 percent follows CDC guidance on gradual, steady
                weight loss. Milestone health benefits at 5, 10 and 15 percent follow CDC and NIH guidance. We do not
                store your weights, and nothing leaves your browser.
              </p>
            </section>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="Track results, not just the scale"
              title="Make the weight you lose the weight that stays off"
              body="A percentage is a snapshot. What protects your results is watching your loss and your lean mass on one timeline, keeping protein and training on track, and catching the weeks you drop weight too fast to be all fat. Calqulate Vitals does exactly that, and for GLP-1 users it adds an adaptive titration and rebound-risk view."
              bullets={[
                "Weight loss and lean mass on one timeline",
                "Projected goal date from your own pace",
                "Protein target built from your numbers",
                "Adaptive titration and rebound-risk view for GLP-1 users",
              ]}
              href="/product/glp1-progress-tracker"
              cta="Start the GLP-1 Progress Tracker"
            />

            {/* SCIENTIFIC REFERENCES */}
            <SourcesSection
              items={[
                { label: "CDC: Losing weight, what is healthy weight loss?", href: "https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html" },
                { label: "NIH, National Heart, Lung, and Blood Institute: Managing overweight and obesity in adults", href: "https://www.nhlbi.nih.gov/health-topics/managing-overweight-obesity-in-adults" },
                { label: "NIDDK: Health risks of overweight and obesity", href: "https://www.niddk.nih.gov/health-information/weight-management/adult-overweight-obesity/health-risks" },
                { label: "American Heart Association: Losing weight", href: "https://www.heart.org/en/healthy-living/healthy-eating/losing-weight" },
                { label: "World Health Organization: Obesity and overweight", href: "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight" },
              ]}
            />

            {/* MEDICAL DISCLAIMER */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm leading-relaxed text-slate-600">
                <strong className="text-slate-900">Medical disclaimer:</strong> This calculator is for educational purposes
                only and does not diagnose or treat any condition. Always consult a qualified healthcare provider before
                starting a weight loss programme, especially if you have underlying health conditions, are pregnant, or
                take medication.
              </p>
            </section>

            {/* FAQ */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
                Common weight loss percentage questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* RELATED TOOLS */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">You may also like</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { href: "/health/glp-1-dose-calculator", label: "GLP-1 Body Composition Tracker", desc: "Are you losing fat or muscle?" },
                  { href: "/health/lean-body-mass-calculator", label: "Lean Body Mass Calculator", desc: "Set a protein target that protects muscle" },
                  { href: "/health/body-fat-calculator", label: "Body Fat Calculator", desc: "Estimate your body fat percentage" },
                  { href: "/health/tdee-calculator", label: "TDEE Calculator", desc: "How many calories you burn a day" },
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
              Your data is private. We do not store your weight or measurements.
            </p>

            <RelatedCalculators slug="weight-loss-percentage-calculator" />

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
