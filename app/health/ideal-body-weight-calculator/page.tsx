import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import IdealWeightExperience from "@/components/ideal-weight/IdealWeightExperience"
import { FormulaExplorer, HeightChart } from "@/components/ideal-weight/IdealWeightVisuals"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { SourcesSection } from "@/components/seo/sources-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import {
  Scale, Sparkles, ShieldCheck, ArrowRight, Ruler, AlertTriangle,
  Info, Dumbbell, Baby, Target, HeartPulse,
} from "lucide-react"

const TITLE = "Ideal Body Weight Calculator: What Should I Weigh for My Height?"
const DESCRIPTION =
  "Free ideal body weight calculator using the Devine, Robinson, Miller and Hamwi formulas. See exactly what you should weigh for your height and sex, in kg or lb, plus your healthy weight range and how the formulas actually work."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "ideal body weight calculator, ideal weight calculator, ibw calculator, ideal body weight formula, devine formula, what should i weigh, how much should i weigh, healthy weight calculator, ideal weight for height, ideal body weight formula male 50 kg 2.3, ideal body weight formula female 45.5",
  alternates: { canonical: "https://calqulate.net/health/ideal-body-weight-calculator" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/ideal-body-weight-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

const FORMULA_TABLE = [
  { name: "Devine (1974)", men: "50 kg + 2.3 kg per inch over 5 ft", women: "45.5 kg + 2.3 kg per inch over 5 ft", use: "The clinical standard. Used for drug dosing and ventilator settings." },
  { name: "Robinson (1983)", men: "52 kg + 1.9 kg per inch over 5 ft", women: "49 kg + 1.7 kg per inch over 5 ft", use: "A revision of Devine. Usually reads slightly lower." },
  { name: "Miller (1983)", men: "56.2 kg + 1.41 kg per inch over 5 ft", women: "53.1 kg + 1.36 kg per inch over 5 ft", use: "Rises most slowly with height, so it is lowest for tall people." },
  { name: "Hamwi (1964)", men: "48 kg + 2.7 kg per inch over 5 ft", women: "45.5 kg + 2.2 kg per inch over 5 ft", use: "The oldest. Still widely used in dietetics." },
]

const COMPARE_TOOLS = [
  { tool: "Ideal Body Weight", measures: "A target weight from height and sex", best: "A quick reference point for one person", href: "/health/ideal-body-weight-calculator" },
  { tool: "BMI", measures: "Weight relative to height squared", best: "Population screening, not individuals", href: "/health/bmi-calculator" },
  { tool: "Body Fat", measures: "How much of your weight is fat", best: "Knowing your actual composition", href: "/health/body-fat-calculator" },
  { tool: "Lean Body Mass", measures: "Muscle, bone, organs and water", best: "Protecting muscle while losing fat", href: "/health/lean-body-mass-calculator" },
]

const faqs = [
  {
    question: "What should my ideal weight be for my height?",
    answer:
      "Your ideal weight depends mainly on your height and sex. Using the Devine formula, a man starts at 50 kg for the first 5 feet of height and adds 2.3 kg for every inch above that. A woman starts at 45.5 kg and adds the same 2.3 kg per inch. A 5 foot 10 inch man comes out at about 73 kg. Rather than one fixed number, aim to sit inside your healthy range.",
  },
  {
    question: "How do doctors calculate ideal body weight?",
    answer:
      "Most clinicians use the Devine formula: 50 kg for men or 45.5 kg for women, plus 2.3 kg for every inch of height above 5 feet. It was created in 1974 to calculate drug doses, not to set beauty standards, which is why it is deliberately simple and uses only height and sex.",
  },
  {
    question: "What is the ideal body weight formula for men?",
    answer:
      "The Devine formula for men is 50 kg plus 2.3 kg for each inch over 5 feet. For a man who is 6 feet tall, that is 12 inches above 5 feet, so 12 times 2.3 equals 27.6 kg, added to the 50 kg base, giving about 77.6 kg.",
  },
  {
    question: "What is the ideal body weight formula for women?",
    answer:
      "The Devine formula for women is 45.5 kg plus 2.3 kg for each inch over 5 feet. For a woman who is 5 feet 6 inches tall, that is 6 inches above 5 feet, so 6 times 2.3 equals 13.8 kg, added to the 45.5 kg base, giving about 59.3 kg.",
  },
  {
    question: "Which ideal body weight formula is most accurate?",
    answer:
      "No single formula is most accurate, because none of them measure your body. Devine is the clinical standard and the one most doctors use. Robinson and Miller tend to read lower for tall people. Hamwi rises fastest with height. We show all four and average them, because the spread between them is a more honest answer than any single number.",
  },
  {
    question: "Why do different ideal weight calculators show different results?",
    answer:
      "Because they use different formulas, built on different populations, for different clinical purposes. Devine was designed for drug dosing, Hamwi for dietetics. They can disagree by several kilograms for the same person, and that disagreement is exactly why you should treat ideal weight as a range rather than a single target.",
  },
  {
    question: "Is ideal body weight the same as BMI?",
    answer:
      "No. Ideal body weight gives you a target weight in kilograms from your height and sex. BMI takes the weight you already have and divides it by your height squared to place you in a category. Ideal weight tells you where to aim, BMI tells you where you are. Neither can tell muscle from fat.",
  },
  {
    question: "Is ideal body weight different for men and women?",
    answer:
      "Yes. Every formula uses a lower base weight for women, typically 45.5 kg against 50 kg for men at 5 feet, because of differences in average body composition and bone mass. The amount added per inch of height is the same in the Devine formula and slightly different in the others.",
  },
  {
    question: "Does age affect ideal body weight?",
    answer:
      "The classic formulas do not include age at all. Height and sex are the only inputs. Body composition does change with age, since muscle mass tends to fall and fat tends to rise, but that affects what your weight is made of rather than what you should weigh. A healthy range matters more with age than a single number.",
  },
  {
    question: "Can athletes rely on ideal body weight?",
    answer:
      "No, and this is the formulas' biggest blind spot. Muscle is denser than fat, so a muscular athlete will often weigh well above their calculated ideal weight while carrying very little fat. If you train seriously, use a body fat or lean body mass measurement instead. Ideal body weight will simply tell you that you are heavy, which is not useful.",
  },
  {
    question: "Does muscle mass change ideal body weight?",
    answer:
      "It does not change the calculated number, because the formulas only look at height and sex. But it absolutely changes how you should interpret that number. Two people of the same height can have the same ideal weight and completely different bodies. Composition matters more than the number on the scale.",
  },
  {
    question: "Is there really a perfect body weight?",
    answer:
      "No. There is no medical definition of a perfect weight. What exists is a healthy weight range, which for most adults means a BMI between 18.5 and 24.9. Health outcomes are similar across that whole band, so chasing one exact number is not supported by the evidence.",
  },
  {
    question: "Does frame size change your ideal weight?",
    answer:
      "It shifts where in the range you should sit. People with a larger skeletal frame naturally carry more bone and lean tissue, so they will sit toward the upper end of a healthy range, and small-framed people toward the lower end. A rough check is to wrap your thumb and middle finger around the opposite wrist. If they overlap, your frame is small. If they do not meet, it is large.",
  },
  {
    question: "How much should I weigh if I am 5 feet 2 inches?",
    answer:
      "At 5 feet 2 inches, which is about 157 cm, the Devine formula gives roughly 50 kg for a woman and about 55 kg for a man. The healthy BMI range at that height is roughly 46 to 62 kg. Aim to sit inside that range rather than hitting one exact figure.",
  },
  {
    question: "Should I use kilograms or pounds?",
    answer:
      "It makes no difference to the result. The formulas are defined in kilograms and inches, and the calculator converts for you. Use whichever unit you think in. Just be consistent so you are not comparing a weight in pounds against a target in kilograms.",
  },
]

export default function IdealBodyWeightCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Ideal Body Weight Calculator"
        description="Calculate your ideal body weight using the Devine, Robinson, Miller and Hamwi formulas, with your healthy weight range."
        url="https://calqulate.net/health/ideal-body-weight-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Your healthiest weight, personalized in a minute
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Ideal Body Weight Calculator: <span className="text-emerald-700">What Should I Weigh?</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Find what you should weigh for your height and sex using the four formulas doctors actually use: Devine,
              Robinson, Miller and Hamwi. You get a healthy range, not a single number to obsess over.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#calculator" className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800">
                Find my ideal weight ↓
              </a>
              <a href="#formula" className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                See the formula
              </a>
            </div>
          </div>
        </section>

        {/* 30-SECOND ANSWER */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-6 md:p-7">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-4 w-4" /> The 30-second answer
              </p>
              <p className="text-base md:text-lg leading-relaxed text-slate-800">
                Your ideal weight depends mainly on your <strong>height and sex</strong>. The formula doctors use most is
                Devine: <strong>50 kg for men or 45.5 kg for women</strong>, plus <strong>2.3 kg for every inch above 5
                feet</strong>. A 5 foot 10 inch man comes out at about 73 kg. But no single number is correct, which is
                why clinicians work with a healthy weight range rather than one target.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "4", label: "Formulas", sub: "Medical standard" },
              { value: "Ideal", label: "Weight range", sub: "Personalized" },
              { value: "BMI", label: "Health status", sub: "Instant" },
              { value: "Goal", label: "Weight plan", sub: "Safe target" },
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

        {/* CALCULATOR */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
            <IdealWeightExperience />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-14">

            {/* CLUSTER 2: FORMULA INTENT (the biggest opportunity) */}
            <section id="formula" className="scroll-mt-20">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Ruler className="h-6 w-6 text-emerald-700" />
                How doctors calculate ideal body weight
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                The formula most clinicians reach for is <strong>Devine</strong>, published in 1974. It is deliberately
                simple, and it uses only two things: your height and your sex.
              </p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">The Devine formula</p>
                <p className="mt-2 font-mono text-sm font-bold leading-relaxed text-white sm:text-base">
                  Men: <span className="text-emerald-400">50 kg</span> + <span className="text-emerald-400">2.3 kg</span> per inch over 5 feet
                </p>
                <p className="mt-1 font-mono text-sm font-bold leading-relaxed text-white sm:text-base">
                  Women: <span className="text-emerald-400">45.5 kg</span> + <span className="text-emerald-400">2.3 kg</span> per inch over 5 feet
                </p>
              </div>
              <p className="mt-4 text-slate-700 leading-relaxed">
                Here is the arithmetic worked through for a 6 foot man. Six feet is 72 inches, which is 12 inches above 5
                feet. Twelve inches times 2.3 kg is 27.6 kg. Add the 50 kg base and you get <strong>77.6 kg</strong>. That
                is the whole calculation. Change your height below and watch every formula update.
              </p>
              <div className="mt-6">
                <FormulaExplorer />
              </div>
            </section>

            {/* WHICH FORMULA IS BEST */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Which ideal body weight formula is best?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                None of them is best, and that is not a cop-out. Each was built on a different population for a different
                clinical job. Devine exists so anaesthetists can dose drugs safely. Hamwi comes from dietetics. They were
                never designed to tell you what to weigh in the mirror.
              </p>
              <div className="mt-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[680px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Formula</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Men</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Women</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Why it exists</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {FORMULA_TABLE.map((f, i) => (
                      <tr key={f.name} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                        <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{f.name}</td>
                        <td className="px-4 py-3 text-slate-700">{f.men}</td>
                        <td className="px-4 py-3 text-slate-700">{f.women}</td>
                        <td className="px-4 py-3 text-slate-600">{f.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-slate-500 sm:hidden">Swipe the table sideways to see every column.</p>
            </section>

            {/* WHY RESULTS DIFFER */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Why do different calculators give different results?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Because they are not measuring you. They are applying an equation that was fitted to a group of people
                decades ago, and different research groups fitted different equations. For a 6 foot man, Devine says about
                77.6 kg, Hamwi says roughly 80 kg, and Miller says about 73 kg. All three are correct outputs of their own
                formula.
              </p>
              <p className="mt-3 text-slate-700 leading-relaxed">
                The useful conclusion is not to pick a winner. It is to notice that the spread between them, usually five
                to seven kilograms, <em>is</em> the answer. Your ideal weight is a band, not a point. Anywhere inside your
                healthy range is a legitimate place for your body to sit.
              </p>
            </section>

            {/* CLUSTER 3 + 4: WHAT SHOULD I WEIGH, BY HEIGHT */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Scale className="h-6 w-6 text-emerald-700" />
                What should I weigh for my height?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Your ideal weight depends primarily on your height and sex. Most doctors estimate it with validated
                formulas such as Devine, Robinson, Miller and Hamwi rather than choosing one fixed number. The table below
                gives both: the single Devine estimate, and the broader healthy range you should actually aim to sit
                inside.
              </p>
              <div className="mt-6">
                <HeightChart />
              </div>
            </section>

            {/* CLUSTER 5: THE TERMINOLOGY */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="h-6 w-6 text-emerald-700" />
                Ideal weight vs healthy weight vs target weight
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                These four terms get used interchangeably and they should not be. The difference matters.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  { t: "Ideal weight", d: "A formula-based estimate from your height and sex. One number, no measurement of your actual body." },
                  { t: "Healthy weight", d: "A broader medical range, usually BMI 18.5 to 24.9. Health outcomes are similar right across this band." },
                  { t: "Target weight", d: "Your personal goal. It should sit inside the healthy range, but it is a choice, not a clinical figure." },
                  { t: "Perfect weight", d: "Has no medical definition at all. Nobody in medicine uses this term, and no evidence supports one exact number." },
                ].map((c) => (
                  <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="font-bold text-slate-900">{c.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
                <h3 className="font-bold text-slate-900">Is there really a perfect body weight?</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                  No. There is no such thing in medicine. What exists is a healthy weight range, and health outcomes are
                  broadly similar across the whole of it. Two people of the same height can both be healthy several
                  kilograms apart. Chasing one exact number is not supported by evidence, and it is a reliable way to make
                  yourself miserable.
                </p>
              </div>
            </section>

            {/* COMPARISON: WHICH TOOL SHOULD YOU USE */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Ideal body weight vs BMI vs body fat: which should you use?
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Ideal weight tells you where to aim. BMI tells you roughly where you are. Neither can tell muscle from
                fat, which is the thing that actually matters. Pick the tool that answers your real question.
              </p>
              <div className="mt-5 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[620px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Tool</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">What it measures</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-800">Best for</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {COMPARE_TOOLS.map((t, i) => (
                      <tr key={t.tool} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          <Link href={t.href} className="text-emerald-700 hover:underline">{t.tool}</Link>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{t.measures}</td>
                        <td className="px-4 py-3 text-slate-600">{t.best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* WHERE THE FORMULAS BREAK DOWN */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-emerald-700" />
                Where these formulas break down
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                Being straight about the limits is more useful than pretending the number is precise. There are four
                situations where ideal body weight will actively mislead you.
              </p>
              <div className="mt-5 space-y-4">
                {[
                  {
                    icon: <Dumbbell className="h-5 w-5" />,
                    t: "Athletes and muscular people",
                    d: "This is the biggest blind spot. Muscle is denser than fat, so a lean, muscular person will often weigh well above their calculated ideal weight while carrying very little fat. The formula will simply call them heavy, which is useless. If you train seriously, use body fat or lean body mass instead.",
                  },
                  {
                    icon: <Ruler className="h-5 w-5" />,
                    t: "Frame size",
                    d: "The formulas assume one skeleton for everyone of a given height. In reality a large-framed person carries more bone and lean tissue and belongs toward the top of their healthy range, while a small-framed person belongs nearer the bottom. A rough test: wrap your thumb and middle finger around the opposite wrist. Overlapping suggests a small frame, not meeting suggests a large one.",
                  },
                  {
                    icon: <Baby className="h-5 w-5" />,
                    t: "Pregnancy",
                    d: "Ideal body weight is not designed for pregnancy and should not be used to guide it. Weight gain in pregnancy is expected, healthy and monitored against completely different guidance. Follow your midwife or doctor, not this calculator.",
                  },
                  {
                    icon: <HeartPulse className="h-5 w-5" />,
                    t: "Age and ethnicity",
                    d: "The classic formulas include neither. Body composition shifts with age as muscle falls and fat rises, and healthy body composition varies between ethnic groups, which is why some health bodies use lower BMI thresholds for people of South Asian descent. The formula stays the same, but how you read the result should not.",
                  },
                ].map((c) => (
                  <div key={c.t} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      {c.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900">{c.t}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* HOW WE CALCULATED THIS */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <h2 className="mt-0 text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-emerald-700" /> How we calculated this
              </h2>
              <p className="mt-3 text-slate-700 leading-relaxed">
                We compute all four classic equations (Devine 1974, Robinson 1983, Miller 1983, Hamwi 1964) exactly as
                published, in kilograms, from your height in inches above 5 feet. The headline recommendation is the mean
                of the four, then pinned inside your healthy BMI band of 18.5 to 24.9 so it can never fall outside a
                medically sensible range. The healthy range itself is calculated from your height using the WHO BMI
                thresholds. We do not store your data, and nothing leaves your browser.
              </p>
            </section>

            {/* REFERENCES */}
            <SourcesSection
              items={[
                { label: "Devine BJ. Gentamicin therapy (1974), the origin of the ideal body weight formula", href: "https://journals.sagepub.com/doi/10.1177/106002807400800914" },
                { label: "Pai MP, Paloucek FP. The origin of the ideal body weight equations", href: "https://pubmed.ncbi.nlm.nih.gov/10919523/" },
                { label: "WHO: Body mass index and healthy weight ranges", href: "https://www.who.int/europe/news-room/fact-sheets/item/a-healthy-lifestyle---who-recommendations" },
                { label: "NIH, National Heart, Lung, and Blood Institute: Assessing your weight and health risk", href: "https://www.nhlbi.nih.gov/health/educational/lose_wt/risk.htm" },
                { label: "CDC: Assessing your weight", href: "https://www.cdc.gov/healthy-weight-growth/about/index.html" },
              ]}
            />

            {/* DISCLAIMER */}
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm leading-relaxed text-slate-600">
                <strong className="text-slate-900">Medical disclaimer:</strong> Ideal body weight is an educational
                estimate from a formula, not a measurement of your body and not a diagnosis. It does not account for
                muscle mass, frame size, age or pregnancy. Always consult a qualified healthcare provider before setting a
                weight goal.
              </p>
            </section>

            {/* FAQ */}
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">
                Common ideal weight questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* RELATED */}
         

            <RelatedCalculators slug="ideal-body-weight-calculator" />

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
