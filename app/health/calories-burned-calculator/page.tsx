import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import CaloriesBurnedCalculator from "@/components/calculators/calories-burned-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, Flame, HeartPulse, Trophy, Info, Calculator as CalculatorIcon , Stethoscope, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "How Many Calories Do You Actually Burn? Free Calories Burned Calculator",
  description:
    "Calculate exact calories burned during running, walking, cycling, or any workout. Use our advanced Activity (MET) and Heart Rate formulas to track your fat loss accurately.",
  keywords:
    "calories burned calculator, how many calories did i burn, calorie burn calculator heart rate, walking calories calculator, running calories burned, MET value calculator, fat burn calculator",
  alternates: {
    canonical: "https://calqulate.net/health/calories-burned-calculator",
  },
  openGraph: {
    title: "How Many Calories Do You Actually Burn? Free Calories Burned Calculator",
    description: "Calculate exact calories burned during running, walking, cycling, or any workout. Use our advanced Activity (MET) and Heart Rate formulas to track your fat loss accurately.",
    url: "https://calqulate.net/health/calories-burned-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How Many Calories Do You Actually Burn? Free Calories Burned Calculator",
    description: "Calculate exact calories burned during running, walking, cycling, or any workout. Use our advanced Activity (MET) and Heart Rate formulas to track your fat loss accurately.",
  },
}

const faqs = [
  {
    question: "How accurate is this Calories Burned Calculator?",
    answer:
      "Our calculator is highly accurate because it offers two scientifically validated methods. The MET (Activity) method uses standard metabolic equivalents, while the Heart Rate method uses clinical formulas factoring in your age, weight, and actual exertion. However, results are estimates, as individual metabolism varies.",
  },
  {
    question: "What is a MET value?",
    answer:
      "MET stands for Metabolic Equivalent of Task. It's a ratio that estimates how much energy your body uses during a specific physical activity compared to resting. For example, sitting quietly is 1 MET, while vigorous running might be 10 METs, meaning you burn 10 times more calories running than sitting.",
  },
  {
    question: "Which formula should I use: Activity or Heart Rate?",
    answer:
      "If you are doing a general activity and don't wear a fitness tracker, use the Activity (MET) calculation. If you wear an Apple Watch, Fitbit, or Garmin and know your average heart rate for a session, the Heart Rate method will give you a much more personalized and exact calorie burn.",
  },
  {
    question: "Do heavier people burn more calories?",
    answer:
      "Yes. The larger your body mass, the more energy (calories) it takes to move your body through space. This is why weight is a critical factor in both our Activity and Heart Rate formulas.",
  },
  {
    question: "How does body shape affect calorie burning?",
    answer:
      "While your overall mass dictates the calories burned, your genetics and body shape determine where that fat is lost from. Ectomorphs might burn fat quickly, while Endomorphs may need more consistent activity. Try our Body Shape Calculator to learn more about your unique fat distribution.",
  },
  {
    question: "Why does the calculator ask for my biological gender in the Heart Rate tab?",
    answer:
      "Men and women generally have different muscle mass percentages and lung capacities, which affects how efficiently oxygen is used during exercise. The clinical Heart Rate formulas account for these physiological differences to give you a more accurate number.",
  },
]

export default function CaloriesBurnedCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
      <CalculatorSchema
        name="Calories Burned Calculator"
        description="Calculate the exact number of calories burned during exercise based on your weight, activity duration, MET values, or average heart rate."
        url="https://calqulate.net/health/calories-burned-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              Free · Instant · No sign-up required
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Calories Burned Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Stop guessing your output. Whether you're lifting weights, running, or doing office work, our advanced calculator uses industry-standard <b>MET Values</b> and clinical <b>Heart Rate Formulas</b> to tell you exactly how much you've burned.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#calculator"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Try the Calculator ↓
              </a>
            </div>
          </div>
        </section>

        {/* USP SUMMARY (TOFU) */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                Calqulate.net measures calories burned in any activity using validated MET values, with a heart-rate option for accuracy. You get a precise burn plus a relatable food equivalent.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "MET", label: "Based" },
              { value: "Free", label: "Price" },
              { value: "No", label: "Sign-up" },
              { value: "Instant", label: "Results" },
              { value: "Private", label: "In-browser" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="scroll-mt-20">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <CaloriesBurnedCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            {/* Long Form SEO Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none mt-16 space-y-16">
              
              {/* Introduction */}
              <section>
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white border-b pb-2 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-orange-500" /> The Science of Calorie Burning
                </h2>
                <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                  Whether your goal is weight loss, maintaining a healthy lifestyle, or athletic performance, understanding energy expenditure is crucial. Our <b>Calories Burned Calculator</b> goes beyond the standard web tools by offering two robust, scientifically-backed methods to track your progress: The MET system and the Heart Rate system.
                </p>
                <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                  By knowing your numbers, you can easily balance your caloric intake and optimize your workouts, ensuring every minute of your sweat equity counts.
                </p>

                <Card className="mt-8 border shadow-sm rounded-2xl bg-white dark:bg-slate-900">
                  <CardContent className="p-6 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" /> Why our tool is different
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 font-bold">✓</span>
                          <span><b>Two Calculation Methods:</b> Choose between Activity (MET) or precise Heart Rate formulas.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 font-bold">✓</span>
                          <span><b>Food Equivalents:</b> Instantly visualize your burn in real-world foods (e.g., Pizza, Apples).</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-500 font-bold">✓</span>
                          <span><b>Consistency Projections:</b> See how a 3-day-a-week routine translates into monthly weight loss.</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-6 rounded-xl border border-orange-100 dark:border-orange-900 text-center">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">Did you know?</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        1 pound of{" "}
                        <Link
                          href="/health/body-fat-calculator"
                          className="underline hover:text-green-700 transition-colors"
                        >
                          body fat
                        </Link>{" "}
                        equals approximately 3,500 calories!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Method 1: Activity (MET) */}
              <section>
                <Card className="not-prose shadow-sm">
                  <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <CalculatorIcon className="w-5 h-5 text-primary" />
                      Method 1: Activity Based (MET Values)
                    </CardTitle>
                    <CardDescription>
                      The gold standard for general fitness calculation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 text-sm md:text-base">
                    <p>
                      <b>MET</b> stands for <i>Metabolic Equivalent of Task</i>. It is a ratio that compares the working metabolic rate of a specific activity to your{" "}
                      <Link
                        href="/health/bmr-calculator"
                        className="font-medium underline hover:text-green-700 transition-colors"
                      >
                        resting metabolic rate
                      </Link>.
                    </p>
                    <p>
                      One MET is the energy you spend sitting quietly. Therefore, an activity with a MET value of 5 implies you are expending 5 times the energy you would sitting on the couch.
                    </p>
                    <div className="bg-muted p-4 rounded-lg mt-4 font-mono text-xs md:text-sm overflow-x-auto">
                      <strong>The Formula:</strong><br />
                      Calories = Duration (in mins) × (MET × 3.5 × Weight in kg) / 200
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Method 2: Heart Rate */}
              <section>
                <Card className="not-prose shadow-sm">
                  <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-red-500" />
                      Method 2: Heart Rate Formula (Advanced)
                    </CardTitle>
                    <CardDescription>
                      Best for those using Smartwatches or Fitness Trackers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4 text-sm md:text-base">
                    <p>
                      If you use an Apple Watch, Garmin, or WHOOP strap, you know your average heart rate during a workout. Because heart rate directly correlates with oxygen consumption (VO2), this method provides a highly customized calorie output specific to your cardiovascular effort.
                    </p>
                    <p>
                      We use the standard <i>Keytel et al. (2005)</i> formulas for calculating{" "}
                      <Link
                        href="/health/tdee-calculator"
                        className="font-medium underline hover:text-green-700 transition-colors"
                      >
                        energy expenditure
                      </Link>{" "}
                      from heart rate.
                    </p>
                    <div className="bg-muted p-4 rounded-lg mt-4 font-mono text-xs md:text-sm overflow-x-auto text-muted-foreground">
                      Male: [(-55.0969 + (0.6309 × HR) + (0.1988 × W) + (0.2017 × Age)) / 4.184] × Time<br />
                      Female: [(-20.4022 + (0.4472 × HR) - (0.1263 × W) + (0.074 × Age)) / 4.184] × Time
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Referral to Calorie Deficit Calculator */}
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-900 text-center not-prose">
                <Info className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  Are You Actually in a Calorie Deficit?
                </h2>
                <p className="text-slate-700 dark:text-slate-300 max-w-2xl mx-auto mb-6">
                  Burning calories during workouts is only part of fat loss. To lose body fat consistently, you must maintain a <b>calorie deficit</b> — meaning you burn more calories than you consume. Use our Calorie Deficit Calculator to see how your daily intake and activity levels work together.
                </p>
                <Link href="/health/calorie-deficit-calculator">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                    Calculate Your Calorie Deficit
                  </Button>
                </Link>
              </section>

              {/* Popular Activities Chart */}
              <section>
                <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white border-b pb-2">
                  Popular Activities Calorie Chart (30 Mins for 150 lbs / 68 kg person)
                </h2>
                <div className="overflow-x-auto not-prose border rounded-xl shadow-sm">
                  <table className="w-full text-sm border-collapse bg-white dark:bg-slate-900">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="border-b px-4 py-3 text-left font-semibold">Activity</th>
                        <th className="border-b px-4 py-3 text-left font-semibold">Intensity / Speed</th>
                        <th className="border-b px-4 py-3 text-left font-semibold">Est. Burn (30 mins)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3">Running</td>
                        <td className="px-4 py-3">6.0 mph (10 min mile)</td>
                        <td className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400">~330 kcal</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Cycling</td>
                        <td className="px-4 py-3">12-13.9 mph (Moderate)</td>
                        <td className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400">~270 kcal</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Swimming</td>
                        <td className="px-4 py-3">Freestyle, light to moderate</td>
                        <td className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400">~200 kcal</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Weightlifting</td>
                        <td className="px-4 py-3">Vigorous effort</td>
                        <td className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400">~205 kcal</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Walking</td>
                        <td className="px-4 py-3">Brisk pace (3.5 mph)</td>
                        <td className="px-4 py-3 font-medium text-orange-600 dark:text-orange-400">~145 kcal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

            </div>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="Burning calories is half the story"
              title="What you burn only matters next to what you eat"
              body="A session burns what it burns. Whether that turns into fat loss depends on the rest of your week, and whether the weight you lose is fat or muscle depends on protein and training. Calqulate Vitals keeps your workouts, meals and weight on one timeline."
              bullets={[
                "Track workouts, meals and weight together",
                "Find out how much protein is really in your meal",
                "Everything you log on one timeline",
                "Fat vs muscle trend (Premium)",
              ]}
              href="/signup?next=/dashboard/glp1"
              learnMoreHref="/product/glp1-progress-tracker"
              cta="Start tracking free"
            />

            <RelatedCalculators slug="calories-burned-calculator" />

            {/* Structured FAQ UI */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* Author Badge Section */}
            <MedicalReviewerSection />
            <AuthorSection />
          </div>
        </div>
      </main>

      {/* Author Schema */}
      <AuthorSchema />

      <Footer />
    </div>
  )
}