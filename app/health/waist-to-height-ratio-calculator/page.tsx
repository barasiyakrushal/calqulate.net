import type { Metadata } from "next"
import Link from "next/link"
import { ClickableImage } from "@/components/ui/image-lightbox"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import WHtRCalculator from "@/components/calculators/whtr-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import {
  CheckCircle2,
  ArrowRight,
  Check,
  X,
  Ruler,
  Dumbbell,
  Footprints,
  Drumstick,
  Moon,
  Flame,
  ShieldCheck,
} from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Waist to Height Ratio Calculator: Your WHtR Score & Healthy Range",
  description:
    "Free Waist-to-Height Ratio calculator. Get your WHtR score in seconds, see if your waist is in the healthy below 0.50 range, find your target waist for your height, and compare WHtR with BMI.",
  keywords:
    "waist to height ratio calculator, WHtR calculator, healthy waist to height ratio, waist to height ratio chart, waist size for height, BMI vs waist to height ratio, waist to height ratio NHS",
  alternates: {
    canonical: "https://calqulate.net/health/waist-to-height-ratio-calculator",
  },
  openGraph: {
    title: "Waist to Height Ratio Calculator: Your WHtR Score & Healthy Range",
    description:
      "Get your WHtR score in seconds, see if your waist is in the healthy below 0.50 range, and find your target waist for your height.",
    url: "https://calqulate.net/health/waist-to-height-ratio-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waist to Height Ratio Calculator: Your WHtR Score & Healthy Range",
    description:
      "Get your WHtR score in seconds, see if your waist is in the healthy below 0.50 range, and find your target waist for your height.",
  },
}

const faqs = [
  {
    question: "What is a healthy waist to height ratio?",
    answer:
      "A healthy Waist-to-Height Ratio is below 0.50, which means your waist circumference should be less than half of your height. Ratios of 0.50 and above signal increasing health risk.",
  },
  {
    question: "Is waist to height ratio better than BMI?",
    answer:
      "For many people, yes. Waist-to-Height Ratio accounts for where fat is stored and detects abdominal fat, while BMI only uses total weight and height and can misclassify athletes and people with a normal weight but high visceral fat.",
  },
  {
    question: "What should my waist measurement be for my height?",
    answer:
      "Your waist should be less than half your height. For example, a healthy waist is under 80 cm at 160 cm tall, under 85 cm at 170 cm, under 90 cm at 180 cm, and under 95 cm at 190 cm.",
  },
  {
    question: "How do I calculate waist to height ratio?",
    answer:
      "Divide your waist circumference by your height using the same unit for both. For example, a 80 cm waist divided by 170 cm height gives a ratio of 0.47.",
  },
  {
    question: "Where should I measure my waist?",
    answer:
      "Measure at the midpoint between the bottom of your ribs and the top of your hip bones, roughly level with your belly button. Stand relaxed, breathe out, and keep the tape snug but not tight.",
  },
  {
    question: "Does waist to height ratio work for women?",
    answer:
      "Yes. The same target applies to women: keep your Waist-to-Height Ratio below 0.50. The measurement is taken the same way regardless of gender.",
  },
  {
    question: "Does waist to height ratio work for men?",
    answer:
      "Yes. Men use the same below 0.50 target as women. Keeping your waist under half your height is a simple, reliable marker of lower abdominal fat.",
  },
  {
    question: "Is the NHS waist to height ratio the same?",
    answer:
      "Yes. The NHS uses the same principle: keep your waist to less than half your height, which is a Waist-to-Height Ratio below 0.50.",
  },
  {
    question: "Can skinny people have unhealthy visceral fat?",
    answer:
      "Yes. Someone with a normal weight or BMI can still store fat around their organs, sometimes called skinny-fat. A Waist-to-Height Ratio of 0.50 or higher can flag this even when the scale looks fine.",
  },
  {
    question: "How often should I measure my waist?",
    answer:
      "Every 4 to 8 weeks is enough to track progress if you are actively changing your diet or activity. Measure at the same time of day, ideally in the morning before eating.",
  },
]

const healthyRanges = [
  { range: "Below 0.40", label: "Possibly underweight", tone: "blue" },
  { range: "0.40 to 0.49", label: "Healthy", tone: "green" },
  { range: "0.50 to 0.59", label: "Increased health risk", tone: "orange" },
  { range: "0.60 and above", label: "High risk", tone: "red" },
]

const toneStyles: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  red: "border-red-200 bg-red-50 text-red-700",
}

const chartRows = [
  { ratio: "Below 0.40", category: "Possibly underweight", meaning: "Waist is much less than half your height." },
  { ratio: "0.40 to 0.49", category: "Healthy", meaning: "Waist is under half your height. Lowest risk." },
  { ratio: "0.50 to 0.59", category: "Increased risk", meaning: "Waist is over half your height. More visceral fat." },
  { ratio: "0.60 and above", category: "High risk", meaning: "Strongly linked to metabolic disease." },
]

const waistForHeight = [
  { height: "150 cm (4 ft 11 in)", waist: "Under 75 cm (29.5 in)" },
  { height: "160 cm (5 ft 3 in)", waist: "Under 80 cm (31.5 in)" },
  { height: "170 cm (5 ft 7 in)", waist: "Under 85 cm (33.5 in)" },
  { height: "180 cm (5 ft 11 in)", waist: "Under 90 cm (35.5 in)" },
  { height: "190 cm (6 ft 3 in)", waist: "Under 95 cm (37.5 in)" },
]

const bmiVsWhtr = [
  { factor: "Shows where fat is stored", bmi: false, whtr: true },
  { factor: "Uses your waist measurement", bmi: false, whtr: true },
  { factor: "Detects abdominal (visceral) fat", bmi: false, whtr: true },
  { factor: "Works well for athletes", bmi: "Often wrong", whtr: "Better" },
  { factor: "Predicts metabolic disease", bmi: "Limited", whtr: "Better" },
]

const improveSteps = [
  {
    icon: Flame,
    title: "Lose abdominal fat",
    body: "Even a small drop in waist size lowers your ratio. A modest calorie deficit is the most direct way to shrink the fat stored around your middle.",
  },
  {
    icon: Dumbbell,
    title: "Strength training",
    body: "Lifting two to three times a week builds muscle and helps burn visceral fat, which improves your ratio even if the scale barely moves.",
  },
  {
    icon: Footprints,
    title: "Daily walking",
    body: "Aiming for 7,000 to 10,000 steps a day burns extra calories and is one of the easiest habits to keep long term.",
  },
  {
    icon: Drumstick,
    title: "Higher protein",
    body: "More protein keeps you full, protects muscle in a calorie deficit, and makes fat loss around the waist easier to sustain.",
  },
  {
    icon: Moon,
    title: "Better sleep",
    body: "Poor sleep raises cortisol and appetite, which encourages fat storage around the middle. Aim for seven to nine hours.",
  },
]

/** One-sentence lead answer, styled for AI Overviews and quick scanning. */
function Answer({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base font-medium leading-relaxed text-slate-800 sm:text-lg">{children}</p>
}

export default function WHtRCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Waist to Height Ratio Calculator"
        description="Calculate your Waist-to-Height Ratio (WHtR) to check abdominal fat and metabolic health, see your healthy range, and find your target waist for your height."
        url="https://calqulate.net/health/waist-to-height-ratio-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 md:py-16">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Waist-to-Height Ratio Calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Calculate your Waist-to-Height Ratio (WHtR) in seconds and see whether your waist is within the healthy
              &quot;less than half your height&quot; range used by health professionals worldwide.
            </p>

            <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Health Risk Score", "Waist Target", "NHS <0.5 Rule", "Heart Disease Risk", "Free Calculator"].map(
                (chip) => (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {chip}
                  </li>
                ),
              )}
            </ul>

            <div className="mt-8">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Calculate my ratio
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* CALCULATOR (and dynamic "Understand Your Result" output) */}
        <section id="calculator" className="scroll-mt-20">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
            <WHtRCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8">
          <div className="mx-auto max-w-3xl space-y-14">
            {/* WHAT IS A HEALTHY WHtR */}
            <section id="healthy-ratio" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                What is a healthy Waist-to-Height Ratio?
              </h2>
              <Answer>
                A healthy Waist-to-Height Ratio is below 0.50, meaning your waist circumference should be less than half
                of your height.
              </Answer>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                The same 0.50 target applies to men and women of most ages. As your ratio rises above 0.50, the amount
                of fat stored around your organs tends to rise with it, and so does your risk of heart disease and type
                2 diabetes.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {healthyRanges.map((r) => (
                  <div key={r.range} className={`rounded-2xl border p-4 ${toneStyles[r.tone]}`}>
                    <p className="text-lg font-bold">{r.range}</p>
                    <p className="text-sm font-semibold">{r.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* WHtR CHART */}
            <section id="chart" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Waist-to-Height Ratio chart</h2>
              <Answer>
                Use this Waist-to-Height Ratio chart to see which category your score falls into, from healthy below
                0.50 to high risk at 0.60 and above.
              </Answer>

              {/* Chart image placeholder: upload the file to /public/charts/ and it renders here. */}
              <figure className="mt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/charts/waist-to-height-ratio-chart.webp"
                  alt="Waist-to-Height Ratio chart showing healthy below 0.50, increased risk from 0.50 to 0.59, and high risk at 0.60 and above"
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full rounded-2xl border border-slate-200 bg-slate-50"
                />
                <figcaption className="mt-3 text-sm leading-relaxed text-slate-500">
                  Waist-to-Height Ratio categories for adults. A ratio below 0.50 is the healthy target.
                </figcaption>
              </figure>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Ratio</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Category</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">What it means</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartRows.map((row) => (
                      <tr key={row.ratio} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.ratio}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{row.category}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{row.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* WAIST FOR HEIGHT */}
            <section id="waist-for-height" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                What should my waist be for my height?
              </h2>
              <Answer>
                Your waist should be less than half your height, so a healthy waist is roughly under 80 cm at 160 cm
                tall, under 85 cm at 170 cm, under 90 cm at 180 cm, and under 95 cm at 190 cm.
              </Answer>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Height</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Healthy waist (WHtR below 0.50)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waistForHeight.map((row) => (
                      <tr key={row.height} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.height}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-emerald-700 font-semibold">{row.waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                In inches the rule is identical: keep your waist under half your height in the same unit.
              </p>
            </section>

            {/* BMI vs WHtR */}
            <section id="bmi-vs-whtr" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">BMI vs Waist-to-Height Ratio</h2>
              <Answer>
                Waist-to-Height Ratio is often better than BMI because it accounts for where fat is stored, while BMI
                only uses total weight and height.
              </Answer>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Feature</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 text-center font-bold text-slate-900">
                        <Link href="/health/bmi-calculator" className="hover:underline">BMI</Link>
                      </th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 text-center font-bold text-emerald-700">WHtR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bmiVsWhtr.map((row) => (
                      <tr key={row.factor} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">{row.factor}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-center">
                          {typeof row.bmi === "boolean" ? (
                            row.bmi ? (
                              <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Yes" />
                            ) : (
                              <X className="mx-auto h-5 w-5 text-red-500" aria-label="No" />
                            )
                          ) : (
                            <span className="text-slate-500">{row.bmi}</span>
                          )}
                        </td>
                        <td className="border-b border-slate-100 px-4 py-3 text-center">
                          {typeof row.whtr === "boolean" ? (
                            row.whtr ? (
                              <Check className="mx-auto h-5 w-5 text-emerald-600" aria-label="Yes" />
                            ) : (
                              <X className="mx-auto h-5 w-5 text-red-500" aria-label="No" />
                            )
                          ) : (
                            <span className="font-semibold text-emerald-700">{row.whtr}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Using a{" "}
                <Link href="/health/bmi-calculator" className="font-semibold text-emerald-700 hover:underline">
                  BMI calculator
                </Link>{" "}
                and your Waist-to-Height Ratio together gives a fuller picture than either number alone.
              </p>
            </section>

            {/* HOW TO MEASURE WAIST */}
            <section id="measure-waist" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How to measure your waist</h2>
              <Answer>
                Measure your waist at the midpoint between the bottom of your ribs and the top of your hip bones,
                standing relaxed just after breathing out.
              </Answer>
              <div className="mt-6 grid items-center gap-6 sm:grid-cols-2">
                <div className="flex justify-center">
                  <ClickableImage
                    src="/images/dress-size/measure-waist.webp"
                    alt="Illustration showing where to place the tape measure to measure waist circumference, midway between the ribs and hips"
                    width={480}
                    height={480}
                    className="rounded-2xl border border-slate-200 shadow-sm"
                  />
                </div>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    Wrap the tape around your bare waist, level and parallel to the floor.
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    Stand up straight, relax, and breathe out before you read the number.
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    Keep the tape snug but not digging into the skin.
                  </li>
                  <li className="flex gap-2">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                    Do not hold your breath, pull the tape tight, or measure straight after a meal.
                  </li>
                </ul>
              </div>
            </section>

            {/* FORMULA (short) */}
            <section id="formula" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Waist-to-Height Ratio formula</h2>
              <Answer>
                To calculate your Waist-to-Height Ratio, divide your waist circumference by your height using the same
                unit for both.
              </Answer>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="font-mono text-xl font-bold text-emerald-700 sm:text-2xl">
                  WHtR = waist &divide; height
                </p>
                <p className="mt-3 text-sm text-slate-600">
                  Example: 80 cm waist &divide; 170 cm height = <span className="font-bold text-slate-900">0.47</span>, a
                  healthy result.
                </p>
              </div>
            </section>

            {/* NHS */}
            <section id="nhs" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Waist-to-Height Ratio and the NHS</h2>
              <Answer>
                The NHS uses the same rule as this calculator: keep your waist to less than half your height, which is a
                Waist-to-Height Ratio below 0.50.
              </Answer>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                This calculator applies the same evidence-based 0.50 threshold, so your result lines up with NHS
                guidance and with large population studies used by health services around the world.
              </p>
            </section>

            {/* HOW TO IMPROVE */}
            <section id="improve" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                How to improve your Waist-to-Height Ratio
              </h2>
              <Answer>
                To improve your Waist-to-Height Ratio, reduce abdominal fat through strength training, regular walking,
                higher protein intake, and better sleep.
              </Answer>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {improveSteps.map((s) => (
                  <div key={s.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                    <s.icon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold text-slate-900">{s.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                Re-measure every 4 to 8 weeks. A falling ratio is one of the clearest early signs that your health is
                moving in the right direction.
              </p>
            </section>

            {/* FAQ */}
            <section id="faqs" className="scroll-mt-20">
              <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Frequently asked questions</h2>
              <FAQSection faqs={faqs} />
            </section>
          </div>

          <div className="mx-auto max-w-3xl">
            <RelatedCalculators slug="waist-to-height-ratio-calculator" />
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
