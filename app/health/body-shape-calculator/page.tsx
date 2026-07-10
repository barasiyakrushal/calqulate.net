import type { Metadata } from "next"
import Image from "next/image"
import { ClickableImage } from "@/components/ui/image-lightbox"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import BodyShapeExperience from "@/components/body-shape/BodyShapeExperience"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Ruler, HeartPulse, UserCheck, Shield, BookOpen, Calculator as CalculatorIcon } from "lucide-react"
import { Sparkles, Activity, Shirt, Dumbbell, Smile } from "lucide-react";
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Body Shape Calculator (Female & Male) - Find Your Body Type Free",
  description:
    "Instantly discover your body shape (Hourglass, Pear, Apple, Rectangle, etc.) with our free accurate calculator for women and men. Get personalized styling tips that actually work.",
  keywords:
    "body shape calculator, female body shape calculator, body type calculator, what is my body shape, body measurements, body shape calculator 3d, hourglass body shape, pear shape, apple body shape, rectangle body shape, inverted triangle body shape, male body type chart, what is my body shape calculator, what body shape am i calculator, what is your body shape calculator",
  alternates: {
    canonical: "https://calqulate.net/health/body-shape-calculator",
  },
  openGraph: {
    title: "Body Shape Calculator (Female & Male) - Find Your Body Type Free",
    description: "Instantly discover your body shape (Hourglass, Pear, Apple, Rectangle, etc.) with our free accurate calculator for women and men. Get personalized styling tips that actually work.",
    url: "https://calqulate.net/health/body-shape-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Body Shape Calculator (Female & Male) - Find Your Body Type Free",
    description: "Instantly discover your body shape (Hourglass, Pear, Apple, Rectangle, etc.) with our free accurate calculator for women and men. Get personalized styling tips that actually work.",
  },
}

const faqs = [
  {
    question: "How do I use this calculator to find out my body shape?",
    answer:
      'Simply input your bust, waist, and hip measurements into our Body Shape Calculator to find your body shape. It instantly analyzes your proportions and classifies your body as hourglass, pear, apple, rectangle, or inverted triangle. It\'s the easiest and most accurate way to answer "What is my body shape?" without guesswork.',
  },
  {
    question: "What are the measurements required for the body shape type calculator?",
    answer:
      "You will need your bust, waist, and hip measurements. If you want more detailed results, you can also add your shoulder or high hip measurements. Our female body shape calculator allows both inches and centimeters, so you can use any unit you like.",
  },
  {
    question: "Can men use this body shape calculator too?",
    answer:
      "Yes! Though it's designed primarily as a female body shape calculator, men can also use it to identify their body type and understand fat distribution. This helps in choosing the right workouts, clothes, and diet plans suited to men's body types.",
  },
  {
    question: "What is the difference between body type and body shape?",
    answer:
      '“Body type” typically refers to your body build, or somatotype—ectomorph, mesomorph, or endomorph—describing the way your body is genetically predisposed to store fat and build muscle. “Body shape” is all about your visible proportions, such as hourglass or pear. Our body type calculator and body shape calculator 3D put both concepts together to provide you with a fuller understanding of your body.',
  },
  {
    question: "How accurate is the body shape calculator?",
    answer:
      "Our Body Calculator Shape uses scientifically validated measurement ratios to calculate your shape. Accuracy depends on correct measurements — keep the tape snug, not tight, and measure over light clothing or directly on the body. Results are educational, not diagnostic, but very reliable for fashion, fitness, and wellness guidance.",
  },
  {
    question: "What can I do once I know my body shape?",
    answer:
      "When you find your shape using our what body shape am I calculator, you can: choose clothes that flatter your proportions, create a fitness routine tailored to your body type, understand where your body stores fat or muscle, and boost your confidence and self-awareness. This knowledge helps you look and feel your best — inside and out.",
  },
  {
    question: "Does my body shape change over time?",
    answer:
      "Yes, your body shape can change due to factors like aging, hormones, weight gain/loss, or pregnancy. For instance, a pear shape may turn into an apple shape when one's metabolism slows down. Regular use of our what is your body shape calculator helps you track changes and adapt your fitness and nutrition plans accordingly.",
  },
]

export default function BodyShapeCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CalculatorSchema
        name="Body Shape Calculator"
        description="Discover your real body shape in seconds! Learn if you’re pear, apple, hourglass, or rectangle—and get personalized styling and fitness tips instantly."
        url="https://calqulate.net/health/body-shape-calculator"
      />
      <FAQSchema faqs={faqs} />
      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              Interactive 3D · AI body match · 100% private
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Body Shape Calculator: Find Your Body Type (Female & Male)
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              A body shape calculator identifies your body type by comparing your bust (or chest), waist and hip measurements. Enter your measurements above and you'll instantly see whether you're an hourglass, pear (triangle), apple (round), rectangle or inverted triangle — plus what the result means and how to dress for it. The main female body shapes are hourglass, pear, apple, rectangle and inverted triangle; common male body types are rectangle, triangle, inverted triangle, oval and trapezoid. Your shape is decided by the ratio between your shoulders/bust, waist and hips — not your weight.
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
                Calqulate.net identifies your body shape from bust, waist and hip measurements using precise ratio math. You get your exact shape plus styling guidance that turns numbers into decisions.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "9", label: "Body shapes", sub: "Female & male" },
              { value: "3D", label: "Body model", sub: "Real-time view" },
              { value: "360°", label: "Rotate", sub: "All angles" },
              { value: "AI", label: "Body match", sub: "Instant results" },
              { value: "100%", label: "Private", sub: "Browser only" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CALCULATOR — measure, watch your body morph in 3D, read your shape */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-6xl px-3 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">See your body shape in 3D</h2>
              <p className="mt-2 text-slate-600">
                Enter your measurements and watch a neutral 3D body morph into your real silhouette. No account, nothing
                uploaded.
              </p>
            </div>
            <BodyShapeExperience />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-16">
              {/* What is a body shape calculator? */}
           <section className="py-8">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
              What is a Body Shape Calculator?
            </h2>

            <p className="mb-3 text-gray-700 leading-relaxed">
              A Body Shape Calculator, also known as a body type calculator, helps you understand your natural
              silhouette using bust, waist, and hip measurements. This free tool analyzes your proportions to
              determine which body type you belong to — helping you make smarter decisions for fashion,
              fitness, and health.
            </p>

            <p className="mb-3 text-gray-700 leading-relaxed">
              What makes this calculator different is its scientific foundation — it uses a ratio-based algorithm
              developed from modern anthropometric research to provide accurate, data-driven shape classification.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Designed for both women and men, it’s especially useful as a female body shape calculator for
              improving styling, wellness, and confidence.
            </p>

                          <Card className="mt-8 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-800">
                      <CalculatorIcon className="w-5 h-5 text-blue-500" />
                      Find Your Real Body Shape for Female (Hourglass, Pear, Athletic & More) - Stop Guessing and Start Dressing & Training Right
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Here’s a quick look at how these body type female image help you better understand your shape and make smarter style, fitness, and health choices
                    </CardDescription>
                  </CardHeader>

                  {/* ✅ FIXED HERE */}
                  <CardContent className="flex flex-col gap-8 pt-4">

                    {/* Female Body Shapes */}
                    <div className="flex flex-col items-center gap-3">
                      <ClickableImage
                        src="/body-shape-female.webp"
                        alt="Female body shapes chart showing apple pear hourglass rectangle and diamond body types"
                        width={800}
                        height={500}
                        className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white object-contain"
                      />

                      <p className="text-gray-500 text-sm text-center">
                        Female body shapes including apple, pear, hourglass, rectangle and diamond.
                      </p>
                    </div>

                    {/* Male Body Shapes */}
                    <div className="flex flex-col items-center gap-3">
                      <ClickableImage
                        src="/male-body-shapes.webp"
                        alt="Male body shapes chart showing rectangle triangle inverted triangle oval and trapezoid"
                        width={800}
                        height={500}
                        className="w-full max-w-4xl rounded-xl border border-gray-200 bg-white object-contain"
                      />

                      <p className="text-gray-500 text-sm text-center">
                        Common male body types such as rectangle, triangle, inverted triangle, oval and trapezoid.
                      </p>
                    </div>

                  </CardContent>
                </Card>
              </section>


              {/* Why Knowing Your Body Shape Matters */}
              <section>
                <h2 className="mb-2 font-semibold">
                  <b>Why Knowing Your Body Shape Matters</b>
                </h2>
                <p className="mb-2">
                  Your body shape is more than just appearance — it's a blueprint to your <b>health</b>,
                  <b> confidence</b>, and <b> lifestyle</b>. Understanding your shape helps you make smarter
                  choices for fitness, fashion, and well-being.
                </p>
                <p className="mb-2">
                  Here’s what you can discover by using our <b>Body Shape Calculator</b>:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Understand how your body stores fat and muscle.</li>
                  <li>Learn which fashion styles complement your body shape.</li>
                  <li>Identify fitness routines suited to your proportions.</li>
                  <li>Discover potential health risks tied to fat distribution.</li>
                  <li>Build confidence through better body understanding.</li>
                </ul>
                <p className="mt-3">
                  Unlike traditional tools, our <b>Body Shape Type Calculator</b> connects your
                  measurements with personalized lifestyle insights — helping you look and feel your best.
                </p>
              </section>



              {/* Female Body Shape Measurement Chart */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle>Female Body Shape Measurement Chart</CardTitle>
                    <CardDescription>
                      Use this chart as a guideline to understand how your bust, waist, and hip
                      measurements relate to common female body shapes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="border px-2 py-2 text-left">Body Shape Type</th>
                            <th className="border px-2 py-2 text-left">Bust (inches/cm)</th>
                            <th className="border px-2 py-2 text-left">Waist (inches/cm)</th>
                            <th className="border px-2 py-2 text-left">Hips (inches/cm)</th>
                            <th className="border px-2 py-2 text-left">Body Characteristics / Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-2 py-2">Hourglass</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">24–28 in (61–71 cm)</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">
                              Balanced bust and hips with a clearly defined narrow waist. Classic curvy
                              figure.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Top Hourglass</td>
                            <td className="border px-2 py-2">38–42 in (96–107 cm)</td>
                            <td className="border px-2 py-2">26–30 in (66–76 cm)</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">
                              Bust slightly larger than hips, but waist still well-defined.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Bottom (Down) Hourglass</td>
                            <td className="border px-2 py-2">36–38 in (91–96 cm)</td>
                            <td className="border px-2 py-2">25–28 in (63–71 cm)</td>
                            <td className="border px-2 py-2">38–42 in (96–107 cm)</td>
                            <td className="border px-2 py-2">
                              Hips slightly larger than bust, maintaining hourglass proportions.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Pear (Triangle)</td>
                            <td className="border px-2 py-2">32–36 in (81–91 cm)</td>
                            <td className="border px-2 py-2">26–30 in (66–76 cm)</td>
                            <td className="border px-2 py-2">38–44 in (96–112 cm)</td>
                            <td className="border px-2 py-2">
                              Wider hips than bust and shoulders; fat stored around hips/thighs.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Round / Apple</td>
                            <td className="border px-2 py-2">38–44 in (96–112 cm)</td>
                            <td className="border px-2 py-2">32–38 in (81–96 cm)</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">
                              Fuller bust and midsection, narrower hips, little waist definition.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Inverted Triangle</td>
                            <td className="border px-2 py-2">38–44 in (96–112 cm)</td>
                            <td className="border px-2 py-2">28–32 in (71–81 cm)</td>
                            <td className="border px-2 py-2">34–38 in (86–96 cm)</td>
                            <td className="border px-2 py-2">
                              Broader shoulders and bust with slimmer hips and waist. Athletic look.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Rectangle (Athletic / Straight)</td>
                            <td className="border px-2 py-2">34–38 in (86–96 cm)</td>
                            <td className="border px-2 py-2">27–31 in (69–79 cm)</td>
                            <td className="border px-2 py-2">34–38 in (86–96 cm)</td>
                            <td className="border px-2 py-2">
                              Similar bust, waist, and hip measurements; minimal waist definition.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Banana (Straight)</td>
                            <td className="border px-2 py-2">32–36 in (81–91 cm)</td>
                            <td className="border px-2 py-2">28–32 in (71–81 cm)</td>
                            <td className="border px-2 py-2">32–36 in (81–91 cm)</td>
                            <td className="border px-2 py-2">
                              Lean and evenly distributed proportions; waist less than 9 in smaller than
                              hips/bust.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Spoon</td>
                            <td className="border px-2 py-2">34–38 in (86–96 cm)</td>
                            <td className="border px-2 py-2">26–30 in (66–76 cm)</td>
                            <td className="border px-2 py-2">40–46 in (102–117 cm)</td>
                            <td className="border px-2 py-2">
                              Hips are much larger than bust, with a shelf-like appearance and defined
                              waist.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                <Card className="not-prose mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      🩱 How to Interpret This Chart
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <p>
                      Measurements represent average proportional ranges — your exact numbers may vary
                      slightly.
                    </p>
                    <p>Focus on ratios, not just size — for example:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Hourglass: hips ≈ bust, waist 8–10 in smaller.</li>
                      <li>Pear: hips &gt; bust by 3–5 in.</li>
                      <li>Apple: waist ≈ bust, hips smaller.</li>
                      <li>Rectangle: hips, bust, waist nearly same.</li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Example U.S. Dress Size Conversion */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle>🧵 Example U.S. Dress Size Conversion</CardTitle>
                    <CardDescription>
                      Use this as a quick reference between your measurements and common U.S. dress sizes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="border px-2 py-2 text-left">U.S. Size</th>
                            <th className="border px-2 py-2 text-left">Bust (in)</th>
                            <th className="border px-2 py-2 text-left">Waist (in)</th>
                            <th className="border px-2 py-2 text-left">Hips (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-2 py-2">XS (2–4)</td>
                            <td className="border px-2 py-2">30–32</td>
                            <td className="border px-2 py-2">20–22</td>
                            <td className="border px-2 py-2">30–32</td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">S (6–8)</td>
                            <td className="border px-2 py-2">32–34</td>
                            <td className="border px-2 py-2">22–25</td>
                            <td className="border px-2 py-2">32–35</td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">M (10–12)</td>
                            <td className="border px-2 py-2">36–38</td>
                            <td className="border px-2 py-2">26–29</td>
                            <td className="border px-2 py-2">36–39</td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">L (14–16)</td>
                            <td className="border px-2 py-2">39–41</td>
                            <td className="border px-2 py-2">30–33</td>
                            <td className="border px-2 py-2">40–43</td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">XL (18–20)</td>
                            <td className="border px-2 py-2">42–44</td>
                            <td className="border px-2 py-2">34–36</td>
                            <td className="border px-2 py-2">44–46</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Male Body Shape Calculator Section */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  How to Use a Body Shape Calculator Male Calculator
                </h2>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  Most men shop for clothes using general sizing labels like medium or large. These tags only account for volume, ignoring how your bones and muscles distribute that weight. A body shape calculator male tool solves this by analyzing the specific proportions of your torso.
                </p>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  A male body shape calculator compares your shoulders, chest, waist, and hips to group your frame into one of five geometric categories. It doesn&apos;t focus on your weight or body mass index. Instead, it looks at the ratios between your upper and lower body to explain why some garments fit while others pull or billow.
                </p>

                <h3 className="text-xl font-medium text-gray-800 mt-6 mb-2">Why Your Proportions Matter</h3>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  Standard retail clothing is built using a single pattern template. Designers usually draft this baseline around a balanced trapezoid frame, which features broad shoulders and a slightly tapered waist. When your physical proportions deviate from this pattern, off-the-rack garments fit poorly.
                </p>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  A man with wide shoulders might buy an extra-large jacket to prevent binding across his back. That same jacket will often have sleeves that are too long and a waist that requires heavy tailoring. Recognizing your specific shape lets you target brands that match your build, which saves money and prevents frustrating fitting room experiences.
                </p>

                <h3 className="text-xl font-medium text-gray-800 mt-6 mb-2">How to Take Your Measurements</h3>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  You&apos;ll need a flexible measuring tape and a mirror to gather your metrics. Stand with a relaxed, upright posture. Keep the tape parallel to the floor and snug against your skin without pulling it tight enough to compress your flesh.
                </p>
                <ul className="list-disc pl-5 mb-3 text-gray-700 space-y-1">
                  <li><strong>Shoulders:</strong> Wrap the tape around the absolute widest point of your upper arms and shoulders.</li>
                  <li><strong>Chest:</strong> Measure the widest part of your chest by placing the tape directly under your armpits.</li>
                  <li><strong>Waist:</strong> Wrap the tape around your natural waistline, which usually aligns with your belly button.</li>
                  <li><strong>Hips:</strong> Place your feet together and measure around the widest part of your hips and buttocks.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Entering these four numbers into a male body shape calculator reveals your geometric profile.
                </p>

                <h3 className="text-xl font-medium text-gray-800 mt-6 mb-2">The Five Male Body Shapes</h3>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Men fit into one of five distinct categories based on their torso ratios. Each shape requires different clothing strategies to create balanced proportions.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <Card className="not-prose">
                    <CardHeader>
                      <CardTitle>The Trapezoid</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        A trapezoid shape features broad shoulders and a chest that tapers down to a moderately narrower waist and hips. Most clothing brands design their standard sizes for this build, making off-the-rack shopping relatively straightforward.
                      </p>
                      <p>
                        <strong>Styling Tip:</strong> Choose slim-cut garments that highlight your natural symmetry without clinging too tightly.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="not-prose">
                    <CardHeader>
                      <CardTitle>The Rectangle</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        Men with a rectangle shape have shoulders, chest, waist, and hips that are roughly the same width. This flat profile can make you look shorter or boxier than you are.
                      </p>
                      <p>
                        <strong>Styling Tip:</strong> Use structured jackets with padded shoulders to create a wider upper line, then pair them with tapered trousers to narrow your lower half.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="not-prose">
                    <CardHeader>
                      <CardTitle>The Inverted Triangle</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        An inverted triangle frame is common among athletes and weightlifters. The shoulders and chest are significantly wider than the waist and hips. Finding shirts that fit your shoulders without billowing at the waist is difficult.
                      </p>
                      <p>
                        <strong>Styling Tip:</strong> Focus on slim-fit shirts made with elastane blends, or plan to have your shirts taken in at the waist by a tailor.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="not-prose">
                    <CardHeader>
                      <CardTitle>The Triangle</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        The triangle shape features a lower torso and hips that are wider than the shoulders and chest. This shape often occurs naturally with age or reduced physical activity.
                      </p>
                      <p>
                        <strong>Styling Tip:</strong> Avoid raglan sleeves, which make your shoulders look narrower. Choose structured blazers with strong shoulder lines to widen your upper body.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="not-prose md:col-span-2">
                    <CardHeader>
                      <CardTitle>The Oval</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        An oval frame carries the majority of its visual weight in the center of the torso. The midsection is wider than both the shoulders and the hips.
                      </p>
                      <p>
                        <strong>Styling Tip:</strong> You can create a longer, leaner line by wearing monochromatic outfits and vertical patterns. Avoid tight, clingy knits and boxy, oversized fits that add unnecessary bulk.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <h3 className="text-xl font-medium text-gray-800 mt-6 mb-2">Understanding Calculator Limitations</h3>
                <p className="text-gray-700 leading-relaxed">
                  A body shape calculator provides a helpful baseline, but it cannot account for all physical realities. It does not measure your height, limb length, or posture, which also influence how clothing sits on your body. Use your calculator results as a starting guide rather than an absolute rule for your wardrobe.
                </p>
              </section>

              {/* Male Body Type Measurement & Shape Chart */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle>Male Body Type Measurement &amp; Shape Chart</CardTitle>
                    <CardDescription>
                      Compare your shoulder, chest, waist, and hip measurements to these typical male body
                      shapes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="border px-2 py-2 text-left">Body Type / Shape</th>
                            <th className="border px-2 py-2 text-left">Shoulders (in/cm)</th>
                            <th className="border px-2 py-2 text-left">Chest (in/cm)</th>
                            <th className="border px-2 py-2 text-left">Waist (in/cm)</th>
                            <th className="border px-2 py-2 text-left">Hips (in/cm)</th>
                            <th className="border px-2 py-2 text-left">Physical Characteristics</th>
                            <th className="border px-2 py-2 text-left">Fitness &amp; Health Tips</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-2 py-2">Rectangle (Straight)</td>
                            <td className="border px-2 py-2">38–42 in (96–107 cm)</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">32–36 in (81–91 cm)</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">
                              Balanced shoulders and hips, straight torso, minimal waist taper. Common in
                              lean builds.
                            </td>
                            <td className="border px-2 py-2">
                              Focus on core and upper-body workouts (bench press, pull-ups) to add V-taper
                              look.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Oval (Round)</td>
                            <td className="border px-2 py-2">40–46 in (102–117 cm)</td>
                            <td className="border px-2 py-2">42–48 in (107–122 cm)</td>
                            <td className="border px-2 py-2">38–44 in (96–112 cm)</td>
                            <td className="border px-2 py-2">40–46 in (102–117 cm)</td>
                            <td className="border px-2 py-2">
                              Fuller midsection, broad chest, narrow shoulders or hips. Often carries weight
                              around abdomen.
                            </td>
                            <td className="border px-2 py-2">
                              Prioritize fat-burning cardio + strength training; focus on core stability and
                              posture.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Triangle (Pear)</td>
                            <td className="border px-2 py-2">38–42 in (96–107 cm)</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">34–38 in (86–96 cm)</td>
                            <td className="border px-2 py-2">40–44 in (102–112 cm)</td>
                            <td className="border px-2 py-2">
                              Wider hips and thighs with narrower shoulders; weight stored in lower body.
                            </td>
                            <td className="border px-2 py-2">
                              Emphasize upper-body strength (shoulders, chest, arms) for balanced
                              proportions.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Inverted Triangle</td>
                            <td className="border px-2 py-2">44–50 in (112–127 cm)</td>
                            <td className="border px-2 py-2">42–48 in (107–122 cm)</td>
                            <td className="border px-2 py-2">30–34 in (76–86 cm)</td>
                            <td className="border px-2 py-2">36–40 in (91–102 cm)</td>
                            <td className="border px-2 py-2">
                              Classic “V-shape” — broad shoulders, wide chest, narrow waist. Athletic
                              appearance.
                            </td>
                            <td className="border px-2 py-2">
                              Maintain balance with leg workouts and flexibility training; avoid muscle
                              imbalance.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Trapezoid (Average Athletic)</td>
                            <td className="border px-2 py-2">43–48 in (109–122 cm)</td>
                            <td className="border px-2 py-2">40–46 in (102–117 cm)</td>
                            <td className="border px-2 py-2">32–36 in (81–91 cm)</td>
                            <td className="border px-2 py-2">38–42 in (96–107 cm)</td>
                            <td className="border px-2 py-2">
                              Proportionate shoulders, chest, and hips with a slightly narrow waist. Ideal
                              aesthetic shape.
                            </td>
                            <td className="border px-2 py-2">
                              Continue balanced training; mix resistance, HIIT, and flexibility workouts.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Ectomorph</td>
                            <td className="border px-2 py-2">38–42 in (96–107 cm)</td>
                            <td className="border px-2 py-2">34–38 in (86–96 cm)</td>
                            <td className="border px-2 py-2">28–32 in (71–81 cm)</td>
                            <td className="border px-2 py-2">34–38 in (86–96 cm)</td>
                            <td className="border px-2 py-2">
                              Slim, long limbs, low body fat, fast metabolism. Finds it hard to gain
                              muscle.
                            </td>
                            <td className="border px-2 py-2">
                              Focus on calorie-dense foods and strength training; limit excessive cardio.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Mesomorph</td>
                            <td className="border px-2 py-2">44–48 in (112–122 cm)</td>
                            <td className="border px-2 py-2">40–46 in (102–117 cm)</td>
                            <td className="border px-2 py-2">32–36 in (81–91 cm)</td>
                            <td className="border px-2 py-2">38–42 in (96–107 cm)</td>
                            <td className="border px-2 py-2">
                              Naturally muscular, broad shoulders, narrow waist, and low fat. Gains muscle
                              easily.
                            </td>
                            <td className="border px-2 py-2">
                              Maintain balanced workout; ideal for strength, bodybuilding, or athletic
                              training.
                            </td>
                          </tr>
                          <tr>
                            <td className="border px-2 py-2">Endomorph</td>
                            <td className="border px-2 py-2">42–50 in (107–127 cm)</td>
                            <td className="border px-2 py-2">44–50 in (112–127 cm)</td>
                            <td className="border px-2 py-2">36–42 in (91–107 cm)</td>
                            <td className="border px-2 py-2">40–46 in (102–117 cm)</td>
                            <td className="border px-2 py-2">
                              Rounder, stockier build, slower metabolism, and easy fat gain.
                            </td>
                            <td className="border px-2 py-2">
                              Combine strength training with cardio and calorie control to manage weight
                              effectively.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* How to Determine Your Body Type */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="w-5 h-5" />
                      How to Determine Your Body Type
                    </CardTitle>
                    <CardDescription>
                      No professional fitting sessions are required, just a soft tape measure and 2
                      minutes of your time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p>Follow these simple steps:</p>
                    <div>
                      <h3 className="font-semibold">Bust Measurement</h3>
                      <p>
                        Standing straight, measure around the fullest part of the bust with the tape.
                        Keep the tape snug but not tight.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Waist Measurement</h3>
                      <p>
                        Find your natural waist, usually the narrowest part above your belly button.
                        Measure around it.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Hip Measurement</h3>
                      <p>
                        Stand with your feet together. Measure around the widest part of your hips and
                        buttocks.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Shoulders or High Hip</h3>
                      <p>For more accurate results, include your shoulder or high-hip measurement.</p>
                    </div>
                    <p>
                      Click &quot;Calculate&quot; - and in a matter of seconds, our body calculator shape
                      tool will let you know what your body type is.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* What Body Shape Are You? */}
              <section>
                <h2 className="mb-2">
                  <b>What Body Shape Are You?</b>
                </h2>
                <p>
                  Once you fill in your measurements, the What Is My Body Shape Calculator will categorize
                  you into one of the five main shapes:
                </p>

                <div className="grid md:grid-cols-2 gap-6 not-prose mt-4">
                  {/* Hourglass */}
                  <Card>
                    <CardHeader>
                      <CardTitle>1. Hourglass</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>
                        Bust and hips are roughly of the same width, with a narrow, clearly defined waist.
                      </p>
                      <p>Balanced, curvy, and proportional.</p>
                      <p>
                        <b>Best workouts:</b> mix of strength and cardio.
                      </p>
                      <p>
                        <b>Best outfits:</b> wrap dresses, fitted tops, high-waisted jeans.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Pear */}
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Pear (Triangle)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>Hips are wider than your bust and shoulders.</p>
                      <p>Lower body is dominant: classic feminine shape.</p>
                      <p>
                        <b>Ideal workouts:</b> upper body strength and core.
                      </p>
                      <p>
                        <b>Best outfits:</b> A-line skirts, boat-neck tops.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Apple */}
                  <Card>
                    <CardHeader>
                      <CardTitle>3. Apple (Round or Inverted Triangle)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>Broader shoulders and bust with slim hips or waist.</p>
                      <p>Upper body carries more volume.</p>
                      <p>Ideal workouts are cardio and core training.</p>
                      <p>
                        <b>Best outfits:</b> empire-waist dresses, V-necklines.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Rectangle */}
                  <Card>
                    <CardHeader>
                      <CardTitle>4. Rectangle (Athletic or Straight)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>Bust, waist, and hips all have similar measurements.</p>
                      <p>Even proportions, sporty frame.</p>
                      <p>Ideal workouts: glute and waist sculpting.</p>
                      <p>
                        <b>Best outfits:</b> belts, peplum tops, layers.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Inverted Triangle */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>5. Inverted Triangle</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p>Wide shoulders and bust, tapering down to narrower hips.</p>
                      <p>Strong upper frame-powerful silhouette.</p>
                      <p>Ideal workouts: lower-body strength training.</p>
                      <p>
                        <b>Best outfits:</b> flared pants, full skirts, scoop-neck tops.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <p className="mt-4">
                  Our Body Shape Calculator 3D Visualization — soon to be released — lets you visualize your
                  correct body outline digitally, a feature that not many platforms can boast.
                </p>
              </section>

              {/* What Your Body Shape Can Reveal About Health */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5" />
                      What Your Body Shape Can Reveal About Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <p>
                      After all, body shape is not just about your looks; it can tell you where your body
                      tends to store fat and which areas may require extra care.
                    </p>
                    <p>
                      Apple-shaped body types do store fat centrally and can be more at risk for
                      cardiovascular concerns.
                    </p>
                    <p>
                      The pear-shaped body carries less metabolic risk but may deal with hip-joint strain.
                    </p>
                    <p>
                      Rectangular or hourglass shapes tend to balance fat distribution rather equally and
                      can support a balanced metabolism.
                    </p>
                    <p>
                      Remember, no body type is &quot;better&quot; than another; every shape is normal and
                      beautiful. The key is learning how to take care of your unique structure with the
                      right diet, exercise, and lifestyle.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Features */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle>Features of Our Body Shape Calculator</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc pl-4 space-y-2">
                      <li>
                        <b>Fast &amp; Accurate Results:</b> Instantly get the shape of your body with accurate
                        calculations.
                      </li>
                      <li>
                        <b>User-Friendly Interface:</b> Designed to be simple and doesn't require any complex
                        charts.
                      </li>
                      <li>
                        <b>Works for All Genders –</b> Whether you need a women’s body shape calculator or a
                        men’s body type classification, it adapts to you.
                      </li>
                      <li>
                        <b>Smart Recommendations –</b> Personalized fitness and styling suggestions.
                      </li>
                      <li>
                        <b>3D Body Shape Preview -</b> See your measurements in real-time, brought to life.
                      </li>
                      <li>
                        <b>Safe &amp; Private –</b> No data stored — your privacy matters.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* Benefits */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="w-5 h-5" />
                      Benefits of Using Our Body Shape Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>
                      <b>Find Your True Shape:</b>
                      <br />
                      No guessing, no mirror confusion-just find out exactly what body shape you are.
                    </p>
                    <p>
                      <b>Dress with Confidence:</b>
                      <br />
                      Learn what colours, patterns, and silhouettes work for your body type.
                    </p>
                    <p>
                      <b>Get Health Insights:</b>
                      <br />
                      Understand how your fat distribution affects your health and metabolism.
                    </p>
                    <p>
                      <b>Personalized Fitness Planning:</b>
                      <br />
                      Modify your exercises to improve balance, strength, and posture.
                    </p>
                    <p>
                      <b>Boost Self-Esteem:</b>
                      <br />
                      Dwell less on comparing to unrealistic ideals, and celebrate your natural proportions.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* What's unique */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      What's unique about our calculator?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <p>Most of the websites classify shapes only. We go beyond that.</p>
                    <p>
                      Our Body Shape Calculator is designed for real users, not models, and it offers:
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Lifestyle tips tailor-made for every body type.</li>
                      <li>Educational explanations regarding waist-to-hip ratio and metabolism.</li>
                      <li>
                        Integration with other tools like BMI and Calorie Calculators for holistic analysis.
                      </li>
                    </ul>
                    <p>
                      No other body measurement simulator puts style, fitness, and health insights in one
                      place, thus making our body shape calculator one of the most helpful tools available
                      online.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* How to Use Effectively */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle>How to Use Our Body Shape Calculator Effectively</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Take measurements in inches or cm — either works.</li>
                      <li>Enter them carefully into the input boxes.</li>
                      <li>Click “Calculate Body Shape.”</li>
                      <li>
                        Instantly see your shape type and personalized insights.
                      </li>
                      <li>
                        (Optional) Take a look at our selection of suggested calculators for fitness and
                        diet.
                      </li>
                    </ul>
                    <p>
                      You'll get accurate results within seconds, ready for use in fashion, fitness, or
                      just self-awareness.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Embrace Your Shape */}
              <section>
                <h2 className="mb-2">
                  <b>Embrace Your Shape – Every Body Is Beautiful</b>
                </h2>
                <p>
                  It's easy to get caught up in comparing yourself with another, but your body shape is a
                  reflection of genetics, lifestyle, and strength.
                </p>
                <p>
                  Our mission is to help you understand and appreciate your figure, not change it.
                </p>
                <p>
                  Whether you are looking for &quot;how to find your body type&quot; or &quot;what body
                  shape am I calculator&quot;, our tool helps make sure that you can feel confident and
                  informed in your choices of health and style.
                </p>
              </section>

        

            </div>

            <RelatedCalculators slug="body-shape-calculator" />

            {/* Structured FAQ UI */}
            <div className="mt-12">
              <FAQSection faqs={faqs} />
            </div>

            {/* Author Badge Section */}
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