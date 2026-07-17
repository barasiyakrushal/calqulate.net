import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import BMRCalculator from "@/components/calculators/bmr-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "BMR Calculator: Calculate Your Basal Metabolic Rate & Calories",
  description:
    "Free BMR calculator. Calculate your basal metabolic rate, resting metabolic rate (RMR), and daily calorie needs (TDEE) in under 30 seconds using the Mifflin-St Jeor equation, for men and women.",
  keywords:
    "bmr calculator, basal metabolic rate calculator, resting metabolic rate calculator, rmr calculator, metabolic rate calculator, bmr formula, mifflin st jeor calculator, bmr calculator for weight loss, bmr calculator men, bmr calculator women, calories burned at rest",
  alternates: {
    canonical: "https://calqulate.net/health/bmr-calculator",
  },
  openGraph: {
    title: "BMR Calculator: Calculate Your Basal Metabolic Rate & Calories",
    description:
      "Calculate your basal metabolic rate, resting metabolic rate (RMR), and daily calorie needs in under 30 seconds using the Mifflin-St Jeor equation.",
    url: "https://calqulate.net/health/bmr-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BMR Calculator: Calculate Your Basal Metabolic Rate & Calories",
    description:
      "Calculate your basal metabolic rate, RMR, and daily calorie needs in under 30 seconds using the Mifflin-St Jeor equation.",
  },
}

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Calculate Your BMR and Use It for Weight Loss",
  description:
    "Step-by-step guide to calculating your basal metabolic rate (BMR) and using it to find your TDEE and weight loss calorie target.",
  step: [
    { "@type": "HowToStep", position: 1, name: "Enter your details", text: "Input your age, weight, height, and sex into the BMR calculator." },
    { "@type": "HowToStep", position: 2, name: "Choose your formula", text: "Select the Mifflin-St Jeor equation, recommended for most adults." },
    { "@type": "HowToStep", position: 3, name: "Select your activity level", text: "Choose your daily activity level to calculate your TDEE." },
    { "@type": "HowToStep", position: 4, name: "Calculate your BMR and TDEE", text: "Get your basal metabolic rate and total daily energy expenditure." },
    { "@type": "HowToStep", position: 5, name: "Apply your calorie deficit", text: "Subtract 300 to 500 kcal from your TDEE for fat loss. Never eat below your BMR." },
  ],
}

const faqs = [
  {
    question: "What is a good BMR?",
    answer:
      "There is no single good BMR, because it depends on your age, sex, size, and muscle mass. A typical BMR is 1,300 to 1,600 kcal for women aged 20 to 40, and 1,600 to 2,000 kcal for men. A higher BMR usually reflects more muscle mass.",
  },
  {
    question: "Is BMR the same as RMR?",
    answer:
      "Almost. Resting metabolic rate (RMR) is measured under slightly less strict conditions than BMR and is usually 10 to 20 kcal higher. For nutrition and weight loss planning, you can treat BMR and RMR as the same number.",
  },
  {
    question: "What is the difference between BMR and TDEE?",
    answer:
      "BMR is the calories your body burns at complete rest. TDEE (total daily energy expenditure) is your full daily burn including activity, and it is 20 to 90% higher than BMR. Base your diet on your TDEE, not your BMR.",
  },
  {
    question: "How accurate is a BMR calculator?",
    answer:
      "BMR formulas are estimates with a margin of about 10%. The Mifflin-St Jeor equation is the most accurate for most modern adults. For the best real-world accuracy, track your intake and weight for a few weeks and adjust.",
  },
  {
    question: "Which BMR formula is best?",
    answer:
      "Mifflin-St Jeor is best for most people. Harris-Benedict is an older alternative, and Katch-McArdle is best if you know your body fat percentage, since it is based on lean body mass.",
  },
  {
    question: "Why is my BMR low?",
    answer:
      "A lower BMR usually means less muscle mass, older age, a smaller body size, or being female, since all of these reduce resting calorie burn. Aggressive dieting can also lower BMR over time.",
  },
  {
    question: "Does muscle increase BMR?",
    answer:
      "Yes. Muscle tissue burns more energy at rest than fat, so building muscle through resistance training raises your BMR over time and is the most reliable way to increase it.",
  },
  {
    question: "Can I eat below my BMR?",
    answer:
      "It is not recommended. Eating below your BMR for long periods can lead to muscle loss and a slower metabolism. Aim to eat below your TDEE but at or above your BMR.",
  },
  {
    question: "How often should I recalculate BMR?",
    answer:
      "Recalculate every 4 to 6 weeks, or whenever your weight changes by more than about 5 kg, since your BMR falls as you lose weight.",
  },
  {
    question: "What happens to my BMR if I lose 10 kg?",
    answer:
      "Losing 10 kg lowers your BMR by roughly 100 kcal per day, because a smaller body needs less energy at rest. Recalculate so your calorie target stays accurate and fat loss does not stall.",
  },
]

/** BMR vs RMR vs TDEE. */
const bmrRmrTdee = [
  { term: "BMR", measures: "Calories burned at complete rest", use: "Your metabolic floor. Do not eat below it." },
  { term: "RMR", measures: "Calories at rest, measured less strictly", use: "Interchangeable with BMR for planning." },
  { term: "TDEE", measures: "Total daily burn including activity", use: "Your real calorie target. Base your diet on it." },
]

/** Weight-loss targets. */
const weightLossTargets = [
  { goal: "Maintenance", note: "Eat what you burn", math: "TDEE" },
  { goal: "Mild loss", note: "About 0.25 kg per week", math: "TDEE - 300" },
  { goal: "Steady loss", note: "About 0.5 kg per week", math: "TDEE - 500" },
  { goal: "Muscle gain", note: "Lean surplus", math: "TDEE + 300" },
  { goal: "Recomposition", note: "Lose fat, keep muscle", math: "Around TDEE, high protein" },
]

/** Formula accuracy. */
const formulaAccuracy = [
  { formula: "Mifflin-St Jeor", best: "Most adults, recommended default" },
  { formula: "Harris-Benedict", best: "Traditional clinical estimate" },
  { formula: "Katch-McArdle", best: "When you know your body fat %" },
]

/** Average BMR. */
const averageBmr = [
  { group: "Women (20 to 40)", bmr: "1,300 to 1,600 kcal", tdee: "2,000 to 2,400 kcal" },
  { group: "Men (20 to 40)", bmr: "1,600 to 2,000 kcal", tdee: "2,400 to 3,000 kcal" },
  { group: "Women (40 to 60)", bmr: "1,200 to 1,500 kcal", tdee: "1,850 to 2,300 kcal" },
  { group: "Men (40 to 60)", bmr: "1,500 to 1,900 kcal", tdee: "2,300 to 2,900 kcal" },
  { group: "Athletes (any sex)", bmr: "1,700 to 2,400+ kcal", tdee: "3,000 to 4,500+ kcal" },
]

const menChart = {
  header: ["Age", "70 kg / 175 cm", "80 kg / 175 cm", "90 kg / 175 cm"],
  rows: [
    ["25", "1,788", "1,888", "1,988"],
    ["35", "1,738", "1,838", "1,938"],
    ["45", "1,688", "1,788", "1,888"],
    ["55", "1,638", "1,738", "1,838"],
  ],
}

const womenChart = {
  header: ["Age", "55 kg / 163 cm", "65 kg / 163 cm", "75 kg / 163 cm"],
  rows: [
    ["25", "1,332", "1,432", "1,532"],
    ["35", "1,282", "1,382", "1,482"],
    ["45", "1,232", "1,332", "1,432"],
    ["55", "1,182", "1,282", "1,382"],
  ],
}

const increaseMetabolism = [
  { title: "Resistance training", body: "Building muscle is the most reliable way to raise your BMR for the long term." },
  { title: "Higher protein intake", body: "Protein has a high thermic effect, so you burn more digesting it than carbs or fat." },
  { title: "Prioritise sleep", body: "Poor sleep disrupts appetite hormones and lowers your effective metabolic rate." },
  { title: "Move more (NEAT)", body: "Walking, standing, and fidgeting add up to a meaningful share of your daily burn." },
  { title: "Stay hydrated", body: "Even mild dehydration slightly reduces how efficiently your body burns energy." },
]

const mistakes = [
  { title: "Dieting to your BMR", body: "BMR is your floor. Always calculate TDEE and eat below that instead." },
  { title: "Eating below your BMR", body: "It triggers muscle loss and metabolic slowdown within weeks." },
  { title: "Not recalculating after weight loss", body: "Lose 10 kg and your BMR drops about 100 kcal, so your deficit shrinks." },
  { title: "Overestimating activity level", body: "Most people pick a level too high, which inflates their calorie target." },
]

/** One-sentence lead answer for AI Overviews and quick scanning. */
function Answer({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base font-medium leading-relaxed text-slate-800 sm:text-lg">{children}</p>
}

function SimpleTable({ header, rows, unit }: { header: string[]; rows: string[][]; unit?: string }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {header.map((h) => (
              <th key={h} scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50/60">
              {row.map((cell, j) => (
                <td key={j} className={`border-b border-slate-100 px-4 py-3 ${j === 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                  {cell}{unit && j > 0 ? ` ${unit}` : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function BMRCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="BMR Calculator"
        description="Free basal metabolic rate calculator using the Mifflin-St Jeor equation. Calculate calories burned at rest, RMR, TDEE, and daily calorie targets for weight loss."
        url="https://calqulate.net/health/bmr-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://calqulate.net" },
              { "@type": "ListItem", position: 2, name: "Health Calculators", item: "https://calqulate.net/health" },
              { "@type": "ListItem", position: 3, name: "BMR Calculator", item: "https://calqulate.net/health/bmr-calculator" },
            ],
          }),
        }}
      />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 md:py-16">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Free BMR Calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Calculate your Basal Metabolic Rate, Resting Metabolic Rate (RMR), and daily calorie needs in under 30
              seconds using the Mifflin-St Jeor equation.
            </p>

            <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
              {["BMR", "RMR", "TDEE", "Weight-loss calories"].map((chip) => (
                <li
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  {chip}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                Calculate my BMR
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* CALCULATOR (and dynamic 'Understand your result') */}
        <section id="calculator" className="scroll-mt-20">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
            <BMRCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8">
          <div className="mx-auto max-w-3xl space-y-14">
            {/* WHAT IS BMR */}
            <section id="what-is-bmr" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What is basal metabolic rate (BMR)?</h2>
              <Answer>
                Your basal metabolic rate is the number of calories your body burns at complete rest to keep you alive,
                covering things like breathing, circulation, and brain function.
              </Answer>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Think of BMR as your body&apos;s idle fuel cost, before any movement, exercise, or digestion. It usually
                makes up 60 to 70% of the calories you burn each day, which is why it is the foundation of any calorie or
                weight loss plan.
              </p>
            </section>

            {/* BMR vs RMR vs TDEE */}
            <section id="bmr-vs-rmr-vs-tdee" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">BMR vs RMR vs TDEE</h2>
              <Answer>
                BMR is calories burned at rest, RMR is nearly the same measured less strictly, and TDEE is your full
                daily burn including activity, which is the number you should base your diet on.
              </Answer>
              <SimpleTable header={["Term", "What it measures", "How to use it"]} rows={bmrRmrTdee.map((r) => [r.term, r.measures, r.use])} />
            </section>

            {/* BMR FOR WEIGHT LOSS */}
            <section id="weight-loss" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">BMR calculator for weight loss</h2>
              <Answer>
                To lose weight, eat 300 to 500 kcal below your TDEE, not below your BMR, which gives steady fat loss
                while protecting your muscle.
              </Answer>
              <SimpleTable header={["Goal", "What it does", "Calories"]} rows={weightLossTargets.map((t) => [t.goal, t.note, t.math])} />
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                A 500 kcal daily deficit gives roughly 0.5 kg of fat loss per week. The calculator above shows your exact
                weight loss, maintenance, and muscle gain calories once you enter your details.
              </p>
            </section>

            {/* CALORIES AT REST */}
            <section id="calories-at-rest" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How many calories do I burn at rest?</h2>
              <Answer>
                The calories you burn at rest are your BMR, typically 1,300 to 1,600 kcal a day for women and 1,600 to
                2,000 kcal a day for men.
              </Answer>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Most of this resting burn comes from your organs. The liver, brain, muscles, and kidneys together account
                for more than 70% of the energy your body uses while doing nothing at all. Enter your details above to
                see your own number.
              </p>
            </section>

            {/* HOW TO CALCULATE / FORMULAS */}
            <section id="how-to-calculate" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How to calculate BMR</h2>
              <Answer>
                Calculate BMR with the Mifflin-St Jeor equation, which uses your weight, height, age, and sex.
              </Answer>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Mifflin-St Jeor (recommended)</p>
                  <div className="mt-3 space-y-1 font-mono text-sm text-slate-800">
                    <p>Men: (10 x kg) + (6.25 x cm) - (5 x age) + 5</p>
                    <p>Women: (10 x kg) + (6.25 x cm) - (5 x age) - 161</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Harris-Benedict (revised)</p>
                  <div className="mt-3 space-y-1 font-mono text-xs text-slate-800">
                    <p>Men: 88.362 + (13.397 x kg) + (4.799 x cm) - (5.677 x age)</p>
                    <p>Women: 447.593 + (9.247 x kg) + (3.098 x cm) - (4.330 x age)</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-sm font-semibold text-slate-500">Katch-McArdle (needs body fat %)</p>
                  <p className="mt-3 font-mono text-sm text-slate-800">BMR = 370 + (21.6 x lean body mass in kg)</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Worked example</p>
                <p className="mt-1">30-year-old woman, 65 kg, 165 cm, Mifflin-St Jeor:</p>
                <p className="mt-1 font-mono">(10 x 65) + (6.25 x 165) - (5 x 30) - 161 = 1,370 kcal/day</p>
              </div>
            </section>

            {/* MOST ACCURATE FORMULA */}
            <section id="most-accurate" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Which BMR formula is most accurate?</h2>
              <Answer>
                The Mifflin-St Jeor equation is the most accurate for most adults, while Katch-McArdle is best if you
                know your body fat percentage.
              </Answer>
              <SimpleTable header={["Formula", "Best for"]} rows={formulaAccuracy.map((f) => [f.formula, f.best])} />
            </section>

            {/* BMR FOR MEN */}
            <section id="bmr-men" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">BMR calculator for men</h2>
              <Answer>
                Men usually have a higher BMR than women of the same size because they carry more muscle and less
                essential body fat.
              </Answer>
              <SimpleTable header={menChart.header} rows={menChart.rows} unit="kcal" />
            </section>

            {/* BMR FOR WOMEN */}
            <section id="bmr-women" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">BMR calculator for women</h2>
              <Answer>
                Women have a slightly lower BMR than men of the same size, reflected by the -161 term in the female
                Mifflin-St Jeor equation.
              </Answer>
              <SimpleTable header={womenChart.header} rows={womenChart.rows} unit="kcal" />
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Pregnancy, menopause, and thyroid conditions can shift your actual BMR beyond what any formula predicts.
              </p>
            </section>

            {/* AVERAGE BMR */}
            <section id="average-bmr" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What is a normal or average BMR?</h2>
              <Answer>
                A normal BMR is roughly 1,300 to 1,600 kcal for younger women and 1,600 to 2,000 kcal for younger men,
                falling gradually with age.
              </Answer>
              <SimpleTable header={["Group", "Average BMR", "Average TDEE (moderate)"]} rows={averageBmr.map((r) => [r.group, r.bmr, r.tdee])} />
            </section>

            {/* INCREASE METABOLISM */}
            <section id="increase-metabolism" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How to increase your metabolism</h2>
              <Answer>
                The most effective way to increase your BMR is to build muscle with resistance training, supported by
                enough protein, sleep, and daily movement.
              </Answer>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {increaseMetabolism.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* COMMON MISTAKES */}
            <section id="mistakes" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Common BMR mistakes</h2>
              <Answer>
                The most common BMR mistakes are dieting to your BMR instead of your TDEE, and not recalculating after
                you lose weight.
              </Answer>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {mistakes.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section id="faqs" className="scroll-mt-20">
              <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Frequently asked questions</h2>
              <FAQSection faqs={faqs} />
            </section>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="Your BMR is a moving target"
              title="Your BMR drops as you lose weight"
              body="The number above is true today. Six weeks and 5 kg from now it is not, which is why calorie targets quietly stop working and fat loss stalls. Calqulate Vitals keeps your weight, meals and doses on one timeline so your numbers stay current instead of going stale."
              bullets={[
                "Log a weight or meal in seconds",
                "Everything you log on one timeline",
                "Protein check on your meals",
                "Fat vs muscle trend (Premium)",
              ]}
              href="/signup?next=/dashboard/glp1"
              learnMoreHref="/product/glp1-progress-tracker"
              cta="Start tracking free"
            />
          </div>

          <div className="mx-auto max-w-3xl">
            <RelatedCalculators slug="bmr-calculator" />
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
