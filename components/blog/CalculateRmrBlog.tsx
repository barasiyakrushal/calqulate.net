"use client";
// components/blog/CalculateRmrBlog.tsx
import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/lib/blog/blogs-data";
import {
  rmrEquations,
  activityLevels,
  rmrFactors,
  rmrHabits,
  rmrMyths,
} from "@/lib/blog/rmr-data";
import RmrFactorsChart from "@/components/charts/RmrFactorsChart";
import RmrGuidePdfButton from "@/components/plans/RmrGuidePdfButton";
import BMRCalculator from "@/components/calculators/bmr-calculator";

interface Props {
  blog: Blog;
}

export default function CalculateRmrBlog({ blog }: Props) {
  return (
    <article className="bg-white">

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-block w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              {blog.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              How to Calculate Your{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-lime-600 bg-clip-text text-transparent">
                Resting Metabolic Rate
              </span>{" "}
              (RMR)
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-slate-600">
              Your RMR is the single number that determines whether your calorie
              target is realistic or completely off. This guide explains what it
              is, how the formulas work, and how to turn your result into an
              actual eating plan.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="#bmr-calculator-widget"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Calculate My RMR Now →
              </Link>
              <span className="text-sm text-slate-500">
                {blog.readTime} • Updated{" "}
                {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
            <Image
              src={blog.featuredImage}
              alt="Resting Metabolic Rate calculator and formulas — Calqulate"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        </div>
      </header>

      {/* ── MINI DASHBOARD STATS ─────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
          {[
            { label: "RMR Equations", value: `${rmrEquations.length}` },
            { label: "Activity Levels", value: `${activityLevels.length}` },
            { label: "Factors Covered", value: `${rmrFactors.length}` },
            { label: "Calculator", value: "Free" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white p-6 text-center">
              <p className="text-3xl font-bold text-slate-900 md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">

        {/* ── INTRO ─────────────────────────────────── */}
        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-emerald-600 prose-strong:text-slate-900 prose-p:leading-relaxed prose-p:mt-4">

          <h2 className="mt-0 mb-4">What Is Resting Metabolic Rate (RMR)?</h2>

          <p>
            Your <strong>resting metabolic rate</strong> is the number of calories
            your body burns while doing absolutely nothing. Breathing, circulating
            blood, repairing cells, keeping your organs running — that all costs
            energy, and RMR is the bill your body pays every single day before you
            even get out of bed.
          </p>

          <p>
            For most adults, RMR accounts for{" "}
            <strong>60% to 75% of total daily calorie burn</strong>. That makes it
            the most important number in any weight management plan. If your calorie
            target is built on a wrong RMR estimate, every number downstream is
            wrong too.
          </p>

          <p>
            The good news is you don&rsquo;t need lab equipment to get a useful
            estimate. With four inputs — age, sex, height, and weight — a validated
            formula will land within roughly 10% of your true RMR. That&rsquo;s
            close enough for practical meal planning. Below, you&rsquo;ll find the
            formulas that actually hold up under research scrutiny, a free
            calculator, and a step-by-step breakdown of how to use your result.
          </p>

          <h3 className="mt-10 mb-4">RMR vs. BMR: What&rsquo;s the Actual Difference?</h3>

          <p>
            People use these terms interchangeably, and for everyday purposes,
            that&rsquo;s fine. But technically they measure slightly different things.
          </p>

          <p>
            <strong>BMR (Basal Metabolic Rate)</strong> is measured under strict lab
            conditions: 12 hours of fasting, a full night of sleep, complete physical
            stillness, and a controlled room temperature. It captures the absolute
            minimum your body needs to survive.
          </p>

          <p>
            <strong>RMR (Resting Metabolic Rate)</strong> is measured under more
            relaxed conditions. You&rsquo;ve rested for a few hours, but the setting
            isn&rsquo;t as tightly controlled. Because of that, RMR tends to run
            about <strong>10 to 20% higher than BMR</strong>.
          </p>

          <p>
            The predictive formulas you&rsquo;ll see below — Mifflin-St. Jeor,
            Harris-Benedict, and others — were originally validated against BMR
            measurements, but fitness tools and{" "}
            <Link href="/health/bmr-calculator">BMR calculators</Link> commonly
            apply them to estimate RMR too. The difference rarely matters unless
            you&rsquo;re in a clinical setting.
          </p>
        </div>

        {/* ── EQUATION QUICK GRID ──────────────────── */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {rmrEquations.map((e) => (
            <a
              key={e.id}
              href={`#equation-${e.id}`}
              className="group flex flex-col items-center rounded-2xl bg-white p-5 text-center ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white"
                style={{ backgroundColor: e.brandColor }}
              >
                {e.accuracy}
              </div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600">
                {e.name.split(" (")[0]}
              </p>
              <p className="text-xs text-slate-500">{e.yearPublished}</p>
            </a>
          ))}
        </div>

        {/* ── EQUATIONS DEEP DIVE ──────────────────── */}
        <div className="prose prose-slate prose-lg mt-16 max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-strong:text-slate-900 prose-p:leading-relaxed prose-p:mt-4">

          <h2 className="mb-4">The 4 RMR Equations That Actually Work</h2>

          <p>
            Researchers have spent decades refining prediction formulas. Most are
            built on the same four inputs — age, sex, height, and weight — but
            they were tested on different populations and produce meaningfully
            different results. Here&rsquo;s what each one does, and which one to
            use.
          </p>

          <h3 id="equation-mifflin" className="mt-10 mb-3">
            1. Mifflin-St. Jeor Equation (Best Choice for Most People)
          </h3>

          <p>
            Published in 1990, this is the most accurate formula for the average
            adult and is the one recommended by the Academy of Nutrition and
            Dietetics. A 2005 comparison study in the{" "}
            <em>Journal of the American Dietetic Association</em> found it
            outperformed the Harris-Benedict revision for predicting measured
            resting energy expenditure across a wide population
            <sup>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/15883556/"
                target="_blank"
                rel="noopener noreferrer"
              >
                [1]
              </a>
            </sup>
            .
          </p>

          <p>
            If you pick one formula to trust, this is it.
          </p>
        </div>

        {/* Formula card — Mifflin */}
        <div className="mt-6 rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Mifflin-St. Jeor Formula
          </p>
          <div className="mt-4 space-y-3 text-slate-800">
            <p className="text-sm leading-relaxed">
              <strong>Men:</strong>{" "}
              <code className="rounded bg-white px-2 py-1 text-sm text-emerald-700">
                (10 × weight in kg) + (6.25 × height in cm) − (5 × age) + 5
              </code>
            </p>
            <p className="text-sm leading-relaxed">
              <strong>Women:</strong>{" "}
              <code className="rounded bg-white px-2 py-1 text-sm text-emerald-700">
                (10 × weight in kg) + (6.25 × height in cm) − (5 × age) − 161
              </code>
            </p>
          </div>
          <div className="mt-5 rounded-xl bg-white p-4 ring-1 ring-emerald-100">
            <p className="text-sm font-semibold text-slate-700">Worked example</p>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              A 32-year-old woman, 65 kg, 165 cm tall:
              <br />
              (10 × 65) + (6.25 × 165) − (5 × 32) − 161 = 650 + 1,031.25 − 160 − 161 =
              <strong> 1,360 kcal/day</strong>
            </p>
          </div>
        </div>

        <div className="prose prose-slate prose-lg mt-14 max-w-none prose-headings:font-bold prose-strong:text-slate-900 prose-p:leading-relaxed prose-p:mt-4">
          <h3 id="equation-harris-benedict" className="mb-3">
            2. Harris-Benedict Equation (The Classic Formula)
          </h3>

          <p>
            This is the original metabolic formula, first published in 1919 and
            revised in 1984 by Roza and Shizgal. It held the standard for most of
            the 20th century and you&rsquo;ll still find it used in a lot of
            nutrition textbooks.
          </p>

          <p>
            The catch: it tends to overestimate RMR by about 5 to 8% in people
            who are sedentary or carry more body fat. For a 150-pound person, that
            drift can add up to 100+ phantom calories a day. Use Mifflin-St. Jeor
            unless you have a specific reason to use this one.
          </p>
        </div>

        {/* Formula card — Harris-Benedict */}
        <div className="mt-6 rounded-2xl bg-teal-50 p-6 ring-1 ring-teal-200">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
            Harris-Benedict Formula (Revised)
          </p>
          <div className="mt-4 space-y-3 text-slate-800">
            <p className="text-sm leading-relaxed">
              <strong>Men:</strong>{" "}
              <code className="rounded bg-white px-2 py-1 text-xs text-teal-700">
                88.362 + (13.397 × wt kg) + (4.799 × ht cm) − (5.677 × age)
              </code>
            </p>
            <p className="text-sm leading-relaxed">
              <strong>Women:</strong>{" "}
              <code className="rounded bg-white px-2 py-1 text-xs text-teal-700">
                447.593 + (9.247 × wt kg) + (3.098 × ht cm) − (4.330 × age)
              </code>
            </p>
          </div>
        </div>

        <div className="prose prose-slate prose-lg mt-14 max-w-none prose-headings:font-bold prose-strong:text-slate-900 prose-p:leading-relaxed prose-p:mt-4">
          <h3 id="equation-katch-mcardle" className="mb-3">
            3. Katch-McArdle Equation (Best for Athletes and Lean Individuals)
          </h3>

          <p>
            This formula skips the weight-and-height approach entirely. Instead, it
            uses <strong>lean body mass</strong> — your total weight minus your fat
            mass. Muscle tissue burns roughly three times more calories at rest than
            fat tissue, so this equation is significantly more accurate if you know
            your body-fat percentage and you&rsquo;re on the leaner side.
          </p>

          <p>
            Two people can both weigh 80 kg. If one has 20% body fat and the other
            has 30%, their RMRs will differ by roughly 150 to 200 calories per day.
            Mifflin-St. Jeor can&rsquo;t capture that gap. Katch-McArdle can.
          </p>
        </div>

        {/* Formula card — Katch */}
        <div className="mt-6 rounded-2xl bg-green-50 p-6 ring-1 ring-green-200">
          <p className="text-xs font-bold uppercase tracking-wider text-green-700">
            Katch-McArdle Formula
          </p>
          <p className="mt-4 text-sm text-slate-800 leading-relaxed">
            <strong>Both sexes:</strong>{" "}
            <code className="rounded bg-white px-2 py-1 text-sm text-green-700">
              370 + (21.6 × lean body mass in kg)
            </code>
          </p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            <strong>Calculate lean body mass:</strong> Total weight kg × (1 − body fat fraction).
            If you weigh 75 kg and have 22% body fat: 75 × (1 − 0.22) = 58.5 kg lean mass.
            RMR = 370 + (21.6 × 58.5) = <strong>1,633 kcal/day</strong>.
          </p>
        </div>

        <div className="prose prose-slate prose-lg mt-14 max-w-none prose-headings:font-bold prose-strong:text-slate-900 prose-p:leading-relaxed prose-p:mt-4">
          <h3 id="equation-cunningham" className="mb-3">
            4. Cunningham Equation (For Elite and Highly Trained Athletes)
          </h3>

          <p>
            The Cunningham equation is structurally similar to Katch-McArdle but
            produces higher estimates. It was developed specifically for elite
            athletes and tends to overestimate RMR for anyone who isn&rsquo;t in
            serious competitive training. Most people don&rsquo;t need this one.
            If you&rsquo;re a recreational gym-goer using Cunningham, you&rsquo;ll
            likely overestimate your burn by 100 to 200 calories a day.
          </p>

          <h3 className="mt-10 mb-3">Three Real-World Examples</h3>

          <p>
            Numbers without context are hard to use. Here&rsquo;s what the
            Mifflin-St. Jeor formula produces for three different people, and what
            it means practically.
          </p>

          <ul className="mt-2 space-y-3">
            <li>
              <strong>Priya, 28, woman, 60 kg, 162 cm, lightly active.</strong>{" "}
              RMR = 1,326 kcal. Multiply by 1.375 for light activity = TDEE of about
              1,823 kcal/day. A realistic fat loss target: 1,450 to 1,550 kcal.
            </li>
            <li>
              <strong>Rohan, 35, man, 78 kg, 178 cm, moderately active.</strong>{" "}
              RMR = 1,733 kcal. Multiply by 1.55 = TDEE of about 2,686 kcal/day.
              Maintenance eating sits around 2,650 to 2,700 kcal.
            </li>
            <li>
              <strong>Susan, 52, woman, 70 kg, 165 cm, sedentary.</strong> RMR =
              1,360 kcal. Multiply by 1.2 = TDEE of about 1,632 kcal/day. A 250-calorie
              daily deficit produces steady fat loss without crashing energy levels.
            </li>
          </ul>

          <p>
            Even when two people are similar in weight, their RMRs can differ
            significantly once age and sex enter the equation. A generic 2,000-calorie
            target underfeeds some people and overfeeds others — and now you can see
            exactly why.
          </p>

          <h3 className="mt-10 mb-3">When a Formula Isn&rsquo;t Enough</h3>

          <p>
            For most people, a predictive formula is a solid starting point.
            But if precision matters — for athletic performance, medical nutrition
            therapy, or post-surgical recovery — the gold standard is{" "}
            <strong>indirect calorimetry</strong>. You breathe into a measurement
            hood for 10 to 20 minutes, and the machine calculates your actual
            oxygen-to-carbon-dioxide exchange. It costs $100 to $300 at a sports
            lab or metabolic clinic, but it removes the guesswork entirely.
          </p>
        </div>

        {/* ── EQUATION ACCURACY CHART ─────────────── */}
        <div className="mt-16">
          <RmrFactorsChart />
        </div>

        {/* ── EMBEDDED CALCULATOR WIDGET ─────────── */}
        <section id="bmr-calculator-widget" className="mt-20 scroll-mt-20">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-2 ring-1 ring-emerald-200">
            <div className="rounded-[1.4rem] bg-white p-6 md:p-8">
              <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Free Tool
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
                    Calculate Your RMR and TDEE
                  </h2>
                  <p className="mt-2 text-slate-600 leading-relaxed">
                    Enter your age, sex, height, and weight. The calculator runs
                    all four formulas and shows you your TDEE at every activity
                    level in seconds.
                  </p>
                </div>
                <Link
                  href="/health/bmr-calculator"
                  className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open full page ↗
                </Link>
              </div>
              <BMRCalculator />
            </div>
          </div>
        </section>

        {/* ── TDEE EXPLANATION ─────────────────────── */}
        <div className="prose prose-slate prose-lg mt-20 max-w-none prose-headings:font-bold prose-strong:text-slate-900 prose-p:leading-relaxed prose-p:mt-4">
          <h2 className="mb-4">From RMR to TDEE: Your Real Daily Calorie Number</h2>

          <p>
            RMR tells you how many calories your body burns at rest. But you
            don&rsquo;t spend your whole day at rest. Total Daily Energy Expenditure
            (TDEE) accounts for everything: walking, working, working out, and even
            the energy cost of digesting food.
          </p>

          <p>
            The formula is: <strong>TDEE = RMR × Activity Multiplier.</strong>
          </p>

          <p>
            Once you have your TDEE, setting a calorie target becomes straightforward:
          </p>

          <ul className="mt-2 space-y-1">
            <li>
              <strong>Fat loss:</strong> eat 10 to 20% below TDEE. A 500-calorie daily
              deficit produces about 0.5 kg of fat loss per week in most people.
            </li>
            <li>
              <strong>Maintenance:</strong> eat at TDEE.
            </li>
            <li>
              <strong>Muscle gain:</strong> eat 10 to 15% above TDEE with adequate protein.
            </li>
          </ul>

          <p>
            Quick example: your RMR is 1,500 kcal, and you train three times a week.
            Use the moderately active multiplier of 1.55. Your TDEE is 2,325 kcal.
            For fat loss, target 1,850 to 1,950 kcal. For lean muscle gain, target
            2,550 to 2,700 kcal. Every popular diet plan you&rsquo;ve seen is just
            this calculation with a different deficit or surplus number attached.
          </p>
        </div>

        {/* Activity multiplier table */}
        <div className="mt-8 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="p-4 text-left font-semibold">Activity Level</th>
                <th className="p-4 text-left font-semibold">Multiplier</th>
                <th className="p-4 text-left font-semibold">Who It Fits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {activityLevels.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-emerald-700">
                    <span className="mr-2" aria-hidden>
                      {a.emoji}
                    </span>
                    {a.label}
                  </td>
                  <td className="p-4 font-mono text-slate-700">×{a.multiplier}</td>
                  <td className="p-4 text-slate-700 leading-relaxed">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FACTORS AFFECTING RMR ────────────────── */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            What Affects Your Resting Metabolic Rate
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Two people at the same height and weight can have RMRs that differ by 300
            to 500 calories a day. That&rsquo;s not a small gap — it&rsquo;s the
            difference between a diet that works and one that stalls. These are
            the main factors driving that variance.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {rmrFactors.map((f) => {
            const dot =
              f.impact === "high"
                ? "bg-emerald-500"
                : f.impact === "medium"
                ? "bg-lime-500"
                : "bg-slate-400";
            return (
              <div
                key={f.name}
                className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200"
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`}
                  aria-label={`${f.impact} impact`}
                />
                <div>
                  <p className="font-bold text-slate-900">
                    {f.name}{" "}
                    <span className="ml-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                      {f.impact} impact
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{f.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── AGE & METABOLISM CALLOUT ─────────────── */}
        <div className="mt-10 rounded-2xl bg-amber-50 p-6 ring-1 ring-amber-200">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-700">
            Common Question
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            Does metabolism really slow down with age?
          </h3>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            Less than most people assume. A 2021 study published in{" "}
            <em>Science</em> tracking over 6,400 people found that RMR stays
            remarkably stable from age 20 to 60. The slowdown most people
            experience in their 30s and 40s comes mainly from losing muscle mass
            and moving less, not from some fundamental change in metabolism
            itself.{" "}
            <sup>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/34385400/"
                target="_blank"
                rel="noopener noreferrer"
              >
                [2]
              </a>
            </sup>{" "}
            Resistance training two to three times a week preserves muscle and
            keeps your RMR from dropping.
          </p>
        </div>
      </div>

      {/* ── HOW TO INCREASE RMR ─────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Can You Actually Raise Your RMR?
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Yes, and the research is fairly clear on how. Building lean muscle through
            resistance training is the most reliable method. Each pound of muscle
            added burns roughly 6 to 10 extra calories per day at rest. That sounds
            small, but six months of consistent lifting can add enough muscle to
            raise your daily burn by 50 to 100 calories — meaningful over time.
          </p>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Below are the habits that help and the ones that quietly work against you.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {rmrHabits.map((h) => {
              const isLove = h.verdict === "love";
              return (
                <div
                  key={h.name}
                  className={`flex items-start gap-3 rounded-xl p-4 ring-1 ${
                    isLove
                      ? "bg-emerald-50 ring-emerald-200"
                      : "bg-rose-50 ring-rose-200"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                      isLove ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    aria-label={isLove ? "Recommended" : "Avoid"}
                  >
                    {isLove ? "✓" : "✕"}
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{h.name}</p>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{h.note}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PROTEIN & SLEEP CALLOUT ─────────────── */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                Protein Matters More Than People Think
              </p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                Protein has a thermic effect of about 20 to 30% — meaning your body
                burns roughly a quarter of protein calories just to digest it. Fat and
                carbohydrates are closer to 5 to 10%. Eating 150g of protein per day
                instead of 75g can add 75 to 100 calories of daily calorie burn just
                through digestion, without changing anything else.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
                Sleep Deprivation Lowers RMR
              </p>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                A 2012 study in the <em>American Journal of Clinical Nutrition</em>{" "}
                found that sleeping just 5.5 hours instead of 8.5 hours reduced RMR
                by about 5% and also increased appetite hormones.{" "}
                <sup>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/22357722/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    [3]
                  </a>
                </sup>{" "}
                Poor sleep doesn&rsquo;t just make you tired. It directly reduces the
                calories your body burns at rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MYTHS ────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          5 Metabolism Myths That Keep Getting Repeated
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          A lot of advice about metabolism sounds credible because it gets repeated
          confidently. Most of it doesn&rsquo;t hold up under research. Here are the
          ones worth ignoring.
        </p>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {rmrMyths.map((m) => (
            <li
              key={m}
              className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200"
            >
              <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                ✕
              </span>
              <span className="text-sm text-slate-700 leading-relaxed">{m}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── RMR TESTING OPTIONS SECTION ──────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-3xl font-bold text-slate-900">
          How to Get Your RMR Tested Professionally
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          If you want a precise measurement rather than an estimate, a few options are available.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Indirect Calorimetry",
              cost: "$100–$300",
              where: "Sports labs, metabolic clinics, some hospitals",
              note:
                "Gold standard. You breathe into a sealed hood or mask for 15–20 minutes. Accuracy is within 1–2% of true RMR.",
            },
            {
              title: "DEXA Scan + Katch-McArdle",
              cost: "$50–$150 for DEXA",
              where: "Imaging centers, university labs",
              note:
                "DEXA measures your exact body-fat percentage. Feed that into Katch-McArdle and you get a highly accurate RMR estimate without indirect calorimetry.",
            },
            {
              title: "Predictive Formula",
              cost: "Free",
              where: "This page",
              note:
                "Accurate within 10% for healthy adults. Good enough for meal planning and weight management decisions for most people.",
            },
          ].map((opt) => (
            <div
              key={opt.title}
              className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"
            >
              <p className="font-bold text-slate-900">{opt.title}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                {opt.cost}
              </p>
              <p className="mt-1 text-xs text-slate-500">{opt.where}</p>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">{opt.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DISCLAIMER ───────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-6">
          <h3 className="text-base font-bold text-slate-900">
            Important Disclaimer
          </h3>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            The calculator and content on this page are for <strong>general
            informational purposes only</strong>. They do not constitute and are
            not intended as medical advice, diagnosis, or treatment. All
            predictive RMR formulas carry an inherent margin of error of
            approximately ±10%. Certain health conditions — including
            hypothyroidism, PCOS, type 2 diabetes, chronic kidney disease, and
            recovery from surgery or illness — can alter your actual resting
            metabolic rate significantly. Before making substantial changes to
            your diet or calorie intake, speak with a registered dietitian (RD)
            or your primary care physician. This is especially important if you
            have an existing health condition or are taking prescription
            medications that affect metabolism or appetite.
          </p>
        </div>
      </section>

      {/* ── REFERENCES ───────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <h2 className="text-2xl font-bold text-slate-900">References</h2>
        <p className="mt-2 text-sm text-slate-500">
          Scientific sources used in this article.
        </p>
        <ol className="mt-5 space-y-3 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600 shrink-0">[1]</span>
            <span className="leading-relaxed">
              Frankenfield D, Roth-Yousey L, Compher C. Comparison of predictive
              equations for resting metabolic rate in healthy nonobese and obese
              adults: a systematic review.{" "}
              <em>Journal of the American Dietetic Association.</em> 2005;105(5):775-789.{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/15883556/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                PubMed: 15883556
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600 shrink-0">[2]</span>
            <span className="leading-relaxed">
              Pontzer H, et al. Daily energy expenditure through the human life course.{" "}
              <em>Science.</em> 2021;373(6556):808-812.{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/34385400/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                PubMed: 34385400
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600 shrink-0">[3]</span>
            <span className="leading-relaxed">
              Nedeltcheva AV, Kilkus JM, Imperial J, et al. Insufficient sleep undermines
              dietary efforts to reduce adiposity.{" "}
              <em>Annals of Internal Medicine.</em> 2010;153(7):435-441.{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/20921542/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                PubMed: 20921542
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600 shrink-0">[4]</span>
            <span className="leading-relaxed">
              Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation for
              resting energy expenditure in healthy individuals.{" "}
              <em>American Journal of Clinical Nutrition.</em> 1990;51(2):241-247.{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/2305711/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                PubMed: 2305711
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600 shrink-0">[5]</span>
            <span className="leading-relaxed">
              Academy of Nutrition and Dietetics. Evidence-Based Nutrition Practice
              Guidelines.{" "}
              <a
                href="https://www.eatrightpro.org/practice/practice-resources/evidence-based-nutrition-practice-guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                eatrightpro.org
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-emerald-600 shrink-0">[6]</span>
            <span className="leading-relaxed">
              Roza AM, Shizgal HM. The Harris Benedict equation reevaluated: resting
              energy requirements and the body cell mass.{" "}
              <em>American Journal of Clinical Nutrition.</em> 1984;40(1):168-182.{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/6741850/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                PubMed: 6741850
              </a>
            </span>
          </li>
        </ol>
      </section>

      {/* ── PDF GUIDE CTA ───────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-50 to-lime-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Save this for later
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Download a free printable reference guide with every formula, activity
            multiplier, and factor on one page.
          </p>
          <div className="mt-8 flex justify-center">
            <RmrGuidePdfButton />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          Questions pulled from Reddit, Quora, and Google searches around RMR and
          BMR. These are the ones that actually come up most often.
        </p>
        <div className="mt-8 space-y-3">
          {[
            {
              q: "What is the difference between BMR and RMR?",
              a: "BMR is measured under strict lab conditions after fasting and complete rest — it captures the absolute minimum calories your body needs to function. RMR is measured under slightly relaxed conditions and typically runs 10 to 20% higher. For practical purposes like setting a calorie target, the difference doesn't matter. Both numbers get used interchangeably in most fitness calculators.",
            },
            {
              q: "Which formula is the most accurate for calculating RMR?",
              a: "For most adults who don't know their body-fat percentage, the Mifflin-St. Jeor equation is the most accurate option. It's endorsed by the Academy of Nutrition and Dietetics and outperformed other formulas in a large systematic review. If you're lean and know your body-fat percentage, use Katch-McArdle instead — it accounts for the muscle-to-fat ratio that Mifflin-St. Jeor ignores.",
            },
            {
              q: "What is a normal RMR?",
              a: "There's no universal 'normal' — it depends on your age, sex, height, weight, and muscle mass. As a rough reference: most adult women fall between 1,200 and 1,600 kcal/day, and most adult men fall between 1,500 and 1,900 kcal/day. Athletes or taller individuals can be above 2,000 kcal/day. Use the calculator on this page to get your personal number.",
            },
            {
              q: "How do I calculate TDEE from my RMR?",
              a: "Multiply your RMR by an activity factor: 1.2 for sedentary (desk job, little exercise), 1.375 for lightly active (light exercise 1 to 3 days per week), 1.55 for moderately active (moderate exercise 3 to 5 days), 1.725 for very active (hard training 6 to 7 days), and 1.9 for extremely active (physical job plus daily training). The result is your TDEE.",
            },
            {
              q: "Why is my RMR so low?",
              a: "The most common reasons are having lower muscle mass, being older, being shorter, being female, or having dieted aggressively in the past. Crash dieting — eating well below your RMR for extended periods — can suppress metabolic rate through a process called adaptive thermogenesis. Building muscle and eating at or near maintenance for a period helps restore it over time.",
            },
            {
              q: "Can I increase my resting metabolic rate?",
              a: "Yes, mostly by building lean muscle through resistance training. Muscle tissue is metabolically active and burns more calories at rest than fat tissue. Eating adequate protein, sleeping 7 to 9 hours, and avoiding very low-calorie diets all protect your existing RMR. Supplements marketed as metabolism boosters have minimal long-term effect based on current evidence.",
            },
            {
              q: "How accurate is an online RMR calculator?",
              a: "Predictive formulas are typically accurate within 10% for healthy adults with no major medical conditions. That margin is small enough to build a workable calorie target from. For precision — in athletic performance, clinical settings, or when medical conditions affect metabolism — indirect calorimetry at a sports lab or clinic gives a direct measurement.",
            },
            {
              q: "Does eating small meals frequently boost metabolism?",
              a: "No. Meal frequency has no meaningful impact on RMR or total daily calorie burn. What matters is your total daily intake and the composition of your diet. Eating six small meals versus three larger ones produces the same metabolic outcome when total calories and protein are matched. Choose the eating pattern that fits your schedule and keeps you satisfied.",
            },
          ].map((f) => (
            <details
              key={f.q}
              className="group rounded-xl bg-white p-5 ring-1 ring-slate-200 open:bg-slate-50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
                {f.q}
                <span className="ml-4 shrink-0 text-emerald-600 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-slate-700 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Get your number and build a plan around it
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            The calculator above gives you RMR, BMR, and TDEE across every activity
            level. Use those numbers to set a calorie target that&rsquo;s grounded
            in your actual biology, not a generic estimate.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/health/bmr-calculator"
              className="inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-emerald-400"
            >
              Open Full Calculator →
            </Link>
            <Link
              href="/health/tdee-calculator"
              className="inline-block rounded-xl bg-white/10 px-8 py-4 text-base font-bold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              TDEE Calculator →
            </Link>
          </div>
        </div>
      </section>

    </article>
  );
}