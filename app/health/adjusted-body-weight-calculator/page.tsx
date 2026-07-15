import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import AdjustedBodyWeightCalculator from "@/components/calculators/adjusted-body-weight-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { CheckCircle2, ArrowRight, Check, X } from "lucide-react"

export const metadata: Metadata = {
  title: "Adjusted Body Weight (AjBW) Calculator: Dosing Weight, IBW & Formula",
  description:
    "Free Adjusted Body Weight (AjBW) calculator. Get your adjusted body weight, ideal body weight (IBW), and dosing weight instantly using the standard clinical formula, plus the AjBW formula and when to use it.",
  keywords:
    "adjusted body weight calculator, AjBW calculator, adjusted body weight formula, dosing weight calculator, ideal body weight calculator, IBW calculation, adjusted body weight vs ideal body weight, adjusted body weight obesity",
  alternates: {
    canonical: "https://calqulate.net/health/adjusted-body-weight-calculator",
  },
  openGraph: {
    title: "Adjusted Body Weight (AjBW) Calculator: Dosing Weight, IBW & Formula",
    description:
      "Get your adjusted body weight, ideal body weight, and dosing weight instantly using the standard clinical formula, plus the AjBW formula and when to use it.",
    url: "https://calqulate.net/health/adjusted-body-weight-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adjusted Body Weight (AjBW) Calculator: Dosing Weight, IBW & Formula",
    description:
      "Get your adjusted body weight, ideal body weight, and dosing weight instantly using the standard clinical formula.",
  },
}

const faqs = [
  {
    question: "What is Adjusted Body Weight?",
    answer:
      "Adjusted Body Weight (AjBW) is a calculated weight used mainly for medication dosing and nutrition planning in adults with obesity. It combines ideal body weight with 40% of excess body weight so that dosing is not overestimated by fat mass.",
  },
  {
    question: "How do you calculate Adjusted Body Weight?",
    answer:
      "First calculate ideal body weight (IBW) from height and sex, then apply AjBW = IBW + 0.4 x (actual weight - IBW). For example, a 95 kg adult with an IBW of 73 kg has an AjBW of 73 + 0.4 x 22, which is 81.8 kg.",
  },
  {
    question: "What is the Adjusted Body Weight formula?",
    answer:
      "The formula is AjBW = IBW + 0.4 x (ABW - IBW), where ABW is actual body weight and IBW is ideal body weight. The 0.4 factor reflects the roughly 40% of excess tissue that is metabolically active.",
  },
  {
    question: "When should Adjusted Body Weight be used?",
    answer:
      "Use AjBW when actual weight would overestimate dose or nutritional needs, typically in adults who are overweight or obese, for many medication doses, and for clinical nutrition. It is not used for normal-weight adults, pregnancy, or children.",
  },
  {
    question: "What is the difference between IBW and AjBW?",
    answer:
      "IBW is a healthy reference weight based only on height and sex. AjBW starts from IBW but adds part of the excess weight back, so it better reflects the metabolically active mass of a heavier person for dosing.",
  },
  {
    question: "Should I use Actual Body Weight or Adjusted Body Weight?",
    answer:
      "For a normal-weight adult, actual body weight is correct. For an overweight or obese adult, adjusted body weight is usually the safer figure for medication dosing and nutrition. A pharmacist or physician confirms the right choice for a given drug.",
  },
  {
    question: "Why do hospitals use Adjusted Body Weight?",
    answer:
      "Hospitals use AjBW because dosing many drugs on actual weight can cause toxicity in heavier patients, while dosing on ideal weight can underdose them. AjBW gives a middle value that keeps drug levels and nutrition in a safer range.",
  },
  {
    question: "Is Adjusted Body Weight only for obesity?",
    answer:
      "It is used mainly when a person is above their ideal body weight, so it is most relevant in overweight and obesity. For people at or below ideal weight, actual or ideal body weight is used instead.",
  },
  {
    question: "How is Adjusted Body Weight used for medication dosing?",
    answer:
      "For weight-based drugs such as some antibiotics and chemotherapy agents, clinicians multiply the dose per kilogram by the adjusted body weight instead of actual weight, so heavier patients are not overdosed by inactive fat mass.",
  },
  {
    question: "Can dietitians use Adjusted Body Weight?",
    answer:
      "Yes. Dietitians often use AjBW to estimate energy and protein needs in adults with obesity, so that calorie targets are not overestimated by using actual weight.",
  },
]

/** Actual vs IBW vs AjBW, what each is used for. */
const weightTypes = [
  { type: "Actual Body Weight (ABW)", used: "Your measured scale weight. Used for BMI and general health." },
  { type: "Ideal Body Weight (IBW)", used: "A healthy reference weight from height and sex." },
  { type: "Adjusted Body Weight (AjBW)", used: "Drug dosing and nutrition in overweight and obesity." },
]

/** When to use AjBW, decision table. */
const whenToUse = [
  { situation: "Medication dosing in obesity", use: true },
  { situation: "Clinical nutrition assessment", use: true },
  { situation: "ICU nutrition and TPN", use: true },
  { situation: "Normal-weight adults", use: false },
  { situation: "Bodybuilders and elite athletes", use: false },
  { situation: "Pregnancy", use: false },
]

const clinicalUses = [
  "Medication dosing",
  "Clinical nutrition",
  "Calorie estimation",
  "Hospital calculations",
  "Renal dosing",
  "Chemotherapy",
  "Critical care",
]

const whoShouldUse = [
  "Healthcare professionals",
  "Dietitians",
  "Pharmacists",
  "Medical students",
  "Nurses",
  "Patients with obesity",
  "Clinical researchers",
]

const whenNotToUse = ["Elite athletes with high muscle mass", "Pregnancy", "Fluid retention or edema", "Children"]

const references = [
  "Devine BJ. Gentamicin therapy. Drug Intelligence and Clinical Pharmacy. 1974 (origin of the ideal body weight formula).",
  "Pai MP. Drug dosing based on weight and body surface area. Pharmacotherapy. 2012 (review of adjusted body weight in dosing).",
  "Bauer LA. Applied Clinical Pharmacokinetics (adjusted body weight in aminoglycoside and vancomycin dosing).",
  "ASPEN clinical guidelines on nutrition support, which use adjusted body weight for energy needs in obesity.",
]

/** One-sentence lead answer for AI Overviews and quick scanning. */
function Answer({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base font-medium leading-relaxed text-slate-800 sm:text-lg">{children}</p>
}

export default function AdjustedBodyWeightCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Adjusted Body Weight (AjBW) Calculator"
        description="Calculate adjusted body weight (AjBW), ideal body weight (IBW), and dosing weight using the standard clinical formula."
        url="https://calqulate.net/health/adjusted-body-weight-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />
      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 md:py-16">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Adjusted Body Weight (AjBW) Calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Calculate your Adjusted Body Weight (AjBW), Ideal Body Weight (IBW), and dosing weight instantly using the
              standard clinical formula used by hospitals, pharmacists, dietitians, and healthcare professionals.
            </p>

            <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Adjusted Body Weight", "Ideal Body Weight", "Devine Formula", "Medication Dosing Weight", "Nutrition Planning"].map(
                (chip) => (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
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
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                Calculate AjBW
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* CALCULATOR (and dynamic "Understand your result") */}
        <section id="calculator" className="scroll-mt-20">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
            <AdjustedBodyWeightCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8">
          <div className="mx-auto max-w-3xl space-y-14">
            {/* WHAT IS AjBW */}
            <section id="what-is-ajbw" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What is Adjusted Body Weight?</h2>
              <Answer>
                Adjusted Body Weight (AjBW) is a calculated weight used mainly for medication dosing and nutrition
                planning in adults with obesity, combining ideal body weight with 40% of excess body weight.
              </Answer>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                It is not a weight goal. Think of it as a dosing weight: a more accurate number for clinical
                calculations than either actual or ideal weight, because fat tissue is less metabolically active than
                lean tissue.
              </p>
            </section>

            {/* ABW vs IBW vs AjBW */}
            <section id="comparison" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Actual vs Ideal vs Adjusted body weight</h2>
              <Answer>
                Actual body weight is your scale weight, ideal body weight is a healthy reference, and adjusted body
                weight is the figure used for drug dosing and nutrition.
              </Answer>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Weight</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Used for</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightTypes.map((row) => (
                      <tr key={row.type} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.type}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{row.used}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* WHEN TO USE */}
            <section id="when-to-use" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">When should you use Adjusted Body Weight?</h2>
              <Answer>
                Use Adjusted Body Weight when actual weight would overestimate dosing or nutrition, mainly in overweight
                and obese adults, and not for normal-weight adults, athletes, pregnancy, or children.
              </Answer>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Situation</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 text-center font-bold text-slate-900">Use AjBW?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whenToUse.map((row) => (
                      <tr key={row.situation} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">{row.situation}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-center">
                          {row.use ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                              <Check className="h-4 w-4" aria-hidden="true" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                              <X className="h-4 w-4" aria-hidden="true" /> No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* FORMULA */}
            <section id="formula" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Adjusted Body Weight formula</h2>
              <Answer>
                The Adjusted Body Weight formula is AjBW = IBW + 0.4 x (actual weight - IBW), where IBW is ideal body
                weight from the Devine formula.
              </Answer>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Ideal Body Weight (Devine)</p>
                  <div className="mt-3 space-y-1 font-mono text-sm text-slate-800">
                    <p>Men: 50 kg + 2.3 kg per inch over 5 ft</p>
                    <p>Women: 45.5 kg + 2.3 kg per inch over 5 ft</p>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">5 feet equals 60 inches (about 152.4 cm).</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Adjusted Body Weight</p>
                  <p className="mt-3 font-mono text-base text-slate-800">AjBW = IBW + 0.4 x (ABW - IBW)</p>
                  <p className="mt-3 text-xs text-slate-500">
                    ABW is actual body weight. The 0.4 factor reflects the roughly 40% of excess tissue that is
                    metabolically active.
                  </p>
                </div>
              </div>
            </section>

            {/* WORKED EXAMPLE */}
            <section id="example" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Worked example</h2>
              <Answer>
                For a 5 ft 10 in man weighing 95 kg, ideal body weight is 73 kg and adjusted body weight is 81.8 kg.
              </Answer>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <div className="space-y-1 p-5 font-mono text-sm text-slate-800">
                  <p>Height: 5 ft 10 in = 70 inches, so 10 inches over 5 feet.</p>
                  <p>IBW = 50 + 2.3 x 10 = 73 kg</p>
                  <p>Excess weight = 95 - 73 = 22 kg</p>
                  <p>AjBW = 73 + 0.4 x 22 = 73 + 8.8 = 81.8 kg</p>
                </div>
                <div className="border-t border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900">
                  Adjusted Body Weight = 81.8 kg
                </div>
              </div>
            </section>

            {/* COMMON CLINICAL USES */}
            <section id="clinical-uses" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Common clinical uses</h2>
              <Answer>
                Adjusted Body Weight is used for medication dosing, clinical nutrition, and calorie estimation,
                especially in hospital and critical care settings.
              </Answer>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {clinicalUses.map((use) => (
                  <li key={use} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {use}
                  </li>
                ))}
              </ul>
            </section>

            {/* WHO SHOULD USE */}
            <section id="who-should-use" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Who should use this calculator?</h2>
              <Answer>
                This calculator is built for healthcare professionals, dietitians, pharmacists, students, and patients
                who need an adjusted body weight for dosing or nutrition.
              </Answer>
              <ul className="mt-6 flex flex-wrap gap-2">
                {whoShouldUse.map((who) => (
                  <li key={who} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                    {who}
                  </li>
                ))}
              </ul>
            </section>

            {/* WHEN NOT TO USE */}
            <section id="when-not" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">When not to use AjBW</h2>
              <Answer>
                Do not use Adjusted Body Weight for elite athletes, pregnancy, fluid retention, or children, where the
                40% assumption does not hold.
              </Answer>
              <ul className="mt-6 space-y-2">
                {whenNotToUse.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-slate-700">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                For lean or very muscular people, lean body mass or fat-free mass is a better basis. Always confirm
                clinical dosing with a qualified professional.
              </p>
            </section>

            {/* FAQ */}
            <section id="faqs" className="scroll-mt-20">
              <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Frequently asked questions</h2>
              <FAQSection faqs={faqs} />
            </section>

            {/* REFERENCES */}
            <section id="references" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Clinical references and evidence</h2>
              <ul className="mt-4 space-y-3">
                {references.map((ref) => (
                  <li key={ref} className="text-sm leading-relaxed text-slate-600">
                    {ref}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-500">
                See also our{" "}
                <Link href="/health/ideal-body-weight-calculator" className="font-semibold text-emerald-700 hover:underline">
                  Ideal Body Weight calculator
                </Link>{" "}
                and{" "}
                <Link href="/health/bmi-calculator" className="font-semibold text-emerald-700 hover:underline">
                  BMI calculator
                </Link>
                .
              </p>
            </section>
          </div>

          <div className="mx-auto max-w-3xl">
            <RelatedCalculators slug="adjusted-body-weight-calculator" />
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
