import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import RFMCalculator from "@/components/calculators/rfm-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Ruler, Calculator, CheckCircle, BarChart, Sun, Thermometer, AlertTriangle, BookOpen, Users, Brain, HeartPulse, Shield, Leaf, Target , Stethoscope, Sparkles } from "lucide-react"
import Link from "next/link"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "RFM Calculator — Estimate Body Fat % Fast (Free)",
  description: "Quickly calculate your RFM score from height & waist. Get an easy body-fat %, clear interpretation, and practical next steps — free and instant. Try it now!",
  keywords: "rfm calculator, relative fat mass, body fat percentage, body composition, ideal body weight, finding ideal weight, age weight tool, best weight calculator, perfect body weight calculator",
  alternates: {
    canonical: "https://calqulate.net/health/rfm-calculator",
  },
  openGraph: {
    title: "RFM Calculator — Estimate Body Fat % Fast (Free)",
    description: "Quickly calculate your RFM score from height & waist. Get an easy body-fat %, clear interpretation, and practical next steps — free and instant. Try it now!",
    url: "https://calqulate.net/health/rfm-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RFM Calculator — Estimate Body Fat % Fast (Free)",
    description: "Quickly calculate your RFM score from height & waist. Get an easy body-fat %, clear interpretation, and practical next steps — free and instant. Try it now!",
  },
}

// Updated FAQ data from your new content
const faqs = [
  {
    question: "How accurate is RFM compared to BMI?",
    answer: "RFM correlates better with DEXA scan results (the gold standard) than BMI for estimating body-fat percentage. It misclassifies fewer people, especially women, because it focuses on fat distribution rather than just total weight."
  },
  {
    question: "Is RFM applicable for kids?",
    answer: "No, the RFM formula was developed and validated for adults. Children and adolescents require age- and sex-specific tools like pediatric growth charts. Always consult a pediatrician for assessing a child's body composition."
  },
  {
    question: "Does age or ethnicity affect RFM?",
    answer: "The core RFM formula is independent of age and has been shown to be effective across various ethnic groups in scientific studies. However, a healthcare professional will always interpret your results in the context of your personal health profile, which includes age and other factors."
  },
  {
    question: "How can I improve my RFM score?",
    answer: "To improve your RFM score (i.e., lower your body fat percentage), focus on sustainable lifestyle changes. This typically involves a moderate calorie deficit to encourage fat loss, combined with strength training and adequate protein intake to preserve muscle mass."
  },
  {
    question: "How often should I measure my RFM?",
    answer: "If you are actively working on changing your body composition, measuring your RFM every 4 to 12 weeks is a reasonable timeframe to track meaningful progress. Measuring too frequently can be misleading due to normal daily fluctuations."
  },
  {
    question: "I searched 'how to calculate recency in RFM'. Is that related to body fat?",
    answer: "That's a common point of confusion! 'Recency, Frequency, Monetary' (RFM) is a completely different concept used in marketing to analyze customer behavior. Relative Fat Mass (RFM) for body composition does not involve 'recency' at all; it only uses your height and waist measurements."
  }
];

// Re-using the Vertical Stepper component from your ABSI page example
const VerticalStepper = ({ steps }: { steps: { title: string; description: string }[] }) => {
  return (
    <div className="relative pl-8 pb-4 md:pb-0">
      {steps.map((step, index) => (
        <div key={index} className={`relative ${index < steps.length - 1 ? "pb-10" : "pb-0"}`}>
          {/* Vertical line */}
          {index < steps.length - 1 && (
            <div className="absolute top-2 left-[1px] w-0.5 h-full bg-gray-300 dark:bg-gray-700"></div>
          )}

          {/* Circle indicator */}
          <div className="absolute top-2 left-0 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
          
          {/* Step content */}
          <div className="pl-6">
            <h3 className="text-lg font-semibold text-primary">Step {String(index + 1).padStart(2, '0')}</h3>
            <p className="font-bold mt-1">{step.title}</p>
            <p className="text-muted-foreground mt-1">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function RFMCalculatorPage() {
  const measurementSteps = [
    { title: "Prepare Yourself", description: "Take off shoes and any heavy or bulky clothing. Measurements should be taken barefoot for accuracy." },
    { title: "Measure Your Height", description: "Stand straight against a wall with your heels together and eyes looking forward. Measure to the nearest 0.5 cm or 1/8 inch." },
    { title: "Measure Your Waist", description: "Find the top of your hip bone (iliac crest). Circle a measuring tape around your waist at this level, keeping it horizontal. Breathe out gently and take the reading without squeezing the tape against your skin." },
    { title: "Calculate Your RFM", description: "Enter the values into our calculator. It will automatically handle any unit conversions and provide your RFM score." },
    { title: "Compare and Monitor", description: "Use the interpretation table to understand your result and monitor your progress over time." },
  ];
  
  const calculatorFeatures = [
    { title: "Science-Backed Results", description: "Uses the proven RFM formula for a reliable body fat percentage score.", icon: <Calculator className="w-6 h-6 text-blue-500" /> },
    { title: "Clear Interpretation", description: "Instantly see where you fall within clear ranges (essential, athlete, average, etc.).", icon: <BarChart className="w-6 h-6 text-green-500" /> },
    { title: "Unit-Flexible", description: "Enter your measurements in metric or imperial units—we handle the conversion.", icon: <Thermometer className="w-6 h-6 text-orange-500" /> },
    { title: "Measurement Guidance", description: "In-page guides help ensure your height and waist are measured accurately for the best results.", icon: <Ruler className="w-6 h-6 text-purple-500" /> },
    { title: "Holistic View", description: "Compare RFM with BMI and Ideal Body Weight concepts for a clearer health picture.", icon: <Sun className="w-6 h-6 text-yellow-500" /> },
    { title: "Actionable Insights", description: "Get practical follow-up actions to help you reach your health goals.", icon: <Target className="w-6 h-6 text-red-500" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <CalculatorSchema
        name="RFM Calculator"
        description="Estimate your body fat percentage using the Relative Fat Mass (RFM) formula, a fast and accurate alternative to BMI."
        url="https://calqulate.net/health/rfm-calculator" // Replace with your actual URL
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
              RFM Calculator — Fast, Accurate Body-Fat Estimates
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              As a doctor and content coordinator for a top-ranked world university, I created this page specifically to give you clear, fact-based answers — NOT fuzzy numbers. Instantly figure out body fat with this RFM calculator, learn the answer's implication for you, and choose your next healthy step.
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
                Calqulate.net estimates body fat from just height and waist using the validated Relative Fat Mass formula — no calipers. You get an accurate figure that exposes hidden &lsquo;skinny-fat&rsquo;.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "RFM", label: "Body fat %" },
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
            <RFMCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-16">
              
              <section> 
                <h2 className="mb-2"><b>What is RFM?</b></h2>
                <p>Relative Fat Mass (RFM) is a simple, reliable method of estimating your percentage body fat using only your height and waist circumference. While BMI is based on total weight and can misclassify muscular individuals, RFM is specifically designed to measure fat accumulation.</p>
                <blockquote>RFM is more directly related to gold-standard DEXA scanning than BMI, making it a quick and clinically useful estimate of body fat without expensive equipment.</blockquote>
              </section>

              <section>
                  <h2 className="mb-2"><b>How is RFM Determined?</b></h2>
                  <div className="grid md:grid-cols-2 gap-8 items-start not-prose">
                      <Card>
                          <CardHeader><CardTitle>The Formulas</CardTitle></CardHeader>
                          <CardContent className="space-y-4">
                              <div>
                                  <h3 className="font-semibold">For Men:</h3>
                                  <div className="p-3 bg-muted rounded-lg text-center font-mono text-sm mt-1">RFM = 64 - 20 &times; (Height / Waist)</div>
                              </div>
                              <div>
                                  <h3 className="font-semibold">For Women:</h3>
                                  <div className="p-3 bg-muted rounded-lg text-center font-mono text-sm mt-1">RFM = 76 - 20 &times; (Height / Waist)</div>
                              </div>
                          </CardContent>
                      </Card>
                       <Card>
                          <CardHeader>
                            <CardTitle>Quick Example</CardTitle>
                            <CardDescription>A woman with Height = 170cm, Waist = 72cm</CardDescription>
                          </CardHeader>
                          <CardContent className="text-sm space-y-2">
                            <p><strong>1. Formula:</strong> 76 - 20 &times; (Height / Waist)</p>
                            <p><strong>2. Calculation:</strong> 76 - 20 &times; (170 / 72)</p>
                            <p><strong>3. Result:</strong> 76 - 20 &times; 2.36 = 28.8%</p>
                            <p className="font-bold">Her RFM is 28.8%, which is in the normal range for females.</p>
                          </CardContent>
                      </Card>
                  </div>
              </section>

              <section>
                <h2 className="mb-2"><b>What Your RFM Result Means</b></h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left">
                            <tr>
                                <th className="p-2">Category</th>
                                <th className="p-2">Men (% Fat)</th>
                                <th className="p-2">Women (% Fat)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t"><td className="p-2 font-bold">Essential Fat</td><td className="p-2">2–5%</td><td className="p-2">10–13%</td></tr>
                            <tr className="border-t bg-muted/50"><td className="p-2 font-bold">Athletes</td><td className="p-2">6–13%</td><td className="p-2">14–20%</td></tr>
                            <tr className="border-t"><td className="p-2 font-bold">Fitness</td><td className="p-2">14–17%</td><td className="p-2">21–24%</td></tr>
                            <tr className="border-t bg-muted/50"><td className="p-2 font-bold">Average</td><td className="p-2">18–24%</td><td className="p-2">25–31%</td></tr>
                            <tr className="border-t"><td className="p-2 font-bold">Obese</td><td className="p-2">≥25%</td><td className="p-2">≥32%</td></tr>
                        </tbody>
                    </table>
                </div>
                 <p className="text-sm mt-4">If your RFM is in the “obese” range, it’s a signal to discuss lifestyle changes or a clinical evaluation; small reductions in body fat (5–10%) often lead to big health improvements.</p>
                 <p className="text-sm text-muted-foreground mt-4">
                  Since RFM estimates your total body fat, you can also calculate the remaining part — your muscle, bone, and organ mass — using our{" "}
                  <Link href="/health/lean-body-mass-calculator" className="text-primary hover:underline">
                    Lean Body Mass (LBM) Calculator
                  </Link>. 
                  Knowing both RFM and LBM together gives a full view of your body composition.
                </p>
              </section>

              <section>
                  <h2 className="mb-2"><b>How to Measure for the Best RFM Outcome</b></h2>
                  <div className="grid md:grid-cols-2 gap-8 items-start not-prose">
                      <VerticalStepper steps={measurementSteps} />
                      <Card className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900">
                          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" /> Common Errors to Avoid</CardTitle></CardHeader>
                          <CardContent>
                              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                  <li>Measuring from the navel (belly button) instead of the top of the hip bone.</li>
                                  <li>Letting the tape measure sag or be uneven.</li>
                                  <li>Measuring over thick or bulky clothing.</li>
                                  <li>Holding your breath or not maintaining a normal posture.</li>
                              </ul>
                          </CardContent>
                      </Card>
                  </div>
              </section>

              <section>
                <h2 className="mb-2"><b>How Our RFM Calculator is Better</b></h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 not-prose mt-4">
                  {calculatorFeatures.map(item => (
                    <Card key={item.title}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                        {item.icon}
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-2"><b>What the RFM Score Does Not Show You</b></h2>
                <p>It's important to understand that RFM is an excellent estimation tool, not a direct diagnosis.</p>
                <Card className="not-prose mt-4 border-red-200 dark:border-red-900">
                  <CardContent className="pt-6">
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      <li>It does not differentiate between subcutaneous fat (under the skin) and visceral fat (around organs).</li>
                      <li>It may be less precise for individuals with atypical body shapes, pregnant or breastfeeding women, or those with amputations.</li>
                      <li>For competitive athletes or medical applications, advanced methods like DEXA scans provide a more detailed body composition analysis.</li>
                      <li className="text-sm mt-4">
                        While RFM tells you total body fat, it doesn’t show how that fat is distributed. For that, you can use our{" "}
                        <Link href="/health/absi-calculator" className="text-primary hover:underline">
                          ABSI Calculator
                        </Link>, 
                        which measures your waist-to-height proportions and predicts central fat–related health risks.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
              </section>

              <section>
                <h2 className="mb-2"><b>Other Useful Calculators & Concepts</b></h2>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle>Ideal Body Weight (IBW) Calculator</CardTitle>
                    <CardDescription>IBW formulas (like Devine's) offer a fast way to estimate a healthy weight range based on height. Use these as a starting point, but focus on RFM for body fat targets rather than just a number on the scale.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2">IBW Quick Formula (Devine):</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li><b>Men:</b> 50.0 kg + 2.3 kg for each inch over 5 feet</li>
                      <li><b>Women:</b> 45.5 kg + 2.3 kg for each inch over 5 feet</li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

            </div>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="An estimate today, a trend over months"
              title="Watch your body fat move in the right direction"
              body="RFM estimates your body fat from your waist and height right now. On its own that is a single dot. Calqulate Vitals keeps your waist, weight and body composition on one timeline so that dot becomes a line you can actually read."
              bullets={[
                "Log your waist and weight in seconds",
                "Everything you log on one timeline",
                "Track body composition, labs and workouts",
                "Fat vs muscle trend (Premium)",
              ]}
              href="/signup?next=/dashboard/glp1"
              learnMoreHref="/product/glp1-progress-tracker"
              cta="Start tracking free"
            />

            <RelatedCalculators slug="rfm-calculator" />

            <FAQSection faqs={faqs} />

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