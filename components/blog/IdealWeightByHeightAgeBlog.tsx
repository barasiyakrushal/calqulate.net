// components/blog/IdealWeightByHeightAgeBlog.tsx
import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/lib/blog/blogs-data";
import {
  heightWeightChart,
  ibwFormulas,
  ageBands,
  bmiCategories,
  frameNotes,
  idealWeightFaqs,
} from "@/lib/blog/ideal-weight-data";
import IdealWeightChart from "@/components/charts/IdealWeightChart";
import IdealWeightGuidePdfButton from "@/components/plans/IdealWeightGuidePdfButton";

// ── EMBEDDED CALCULATOR ────────────────────────────────────────────
// Direct widget. Same component your
// /health/ideal-body-weight-calculator page uses. If your reusable export
// lives at a different path, adjust this one import line.
import IdealWeightExperience from "@/components/ideal-weight/IdealWeightExperience";

const CALC_HREF = "/health/ideal-body-weight-calculator";

interface Props {
  blog: Blog;
}

export default function IdealWeightByHeightAgeBlog({ blog }: Props) {
  // FAQ rich-result schema. Matches the visible FAQ word for word, which is
  // what Google requires for the FAQ snippet to be eligible.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: idealWeightFaqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <article className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-block w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              {blog.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              Ideal Weight by{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-lime-600 bg-clip-text text-transparent">
                Height &amp; Age
              </span>{" "}
              (Chart)
            </h1>
            <p className="mt-5 text-lg text-slate-600">{blog.description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="#ideal-weight-calculator-widget"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Find My Ideal Weight →
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
              alt="Ideal weight by height and age chart for men and women, by Calqulate"
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
            { label: "Heights Charted", value: `${heightWeightChart.length}` },
            { label: "IBW Formulas", value: `${ibwFormulas.length}` },
            { label: "Age Bands", value: `${ageBands.length}` },
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
        <div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-lime-500" />
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              What Counts as an Ideal Weight for Your Height?
            </h2>
          </div>

          {/* Key insight callout */}
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                🎯
              </span>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Most people want one number. The honest answer is a small range.
                </p>
                <p className="mt-2 text-slate-600">
                  Your ideal weight is set mostly by your height and sex, with
                  age and body type fine-tuning where you land inside it. A
                  5&apos;6&quot; woman and a 5&apos;6&quot; man do not share a
                  target, and neither should be compared to a friend who is three
                  inches taller.
                </p>
              </div>
            </div>
          </div>

          {/* Two tools side by side */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                  📏
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Healthy Weight Range
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Built from BMI, this gives the lowest and highest weight that is
                generally healthy for your height. Think of it as your{" "}
                <strong className="text-slate-900">allowed zone</strong> — the
                floor and ceiling where most adults can maintain good health.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime-100 text-lg">
                  🎯
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Ideal Body Weight
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                A single target doctors calculate with the Devine formula for
                drug dosing and clinical assessment. It is your{" "}
                <strong className="text-slate-900">bullseye</strong> — a precise
                number to aim for inside the healthy range.
              </p>
            </div>
          </div>

          {/* CTA + roadmap */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <p className="text-sm leading-relaxed text-slate-300">
              The chart below gives you both for every height from 4&apos;10&quot;
              to 6&apos;6&quot;, and the{" "}
              <Link
                href={CALC_HREF}
                className="font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
              >
                ideal body weight calculator
              </Link>{" "}
              runs the math for your exact height in seconds.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Height & weight chart",
                "Visual graph",
                "Age effects",
                "4 IBW formulas",
                "Key factors",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── THE MASTER TABLE ──────────────────────── */}
        <h2 className="mt-14 text-2xl font-bold text-slate-900 md:text-3xl">
          Ideal Weight Chart by Height (Women &amp; Men)
        </h2>
        <p className="mt-2 text-slate-600">
          Ideal target uses the Devine formula. The healthy range uses the CDC
          BMI window of 18.5 to 24.9. Pounds are listed first for a US reader,
          with kilograms in parentheses.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-4 py-3 font-semibold">Height</th>
                <th className="px-4 py-3 font-semibold">Women ideal</th>
                <th className="px-4 py-3 font-semibold">Men ideal</th>
                <th className="px-4 py-3 font-semibold">Healthy range</th>
              </tr>
            </thead>
            <tbody>
              {heightWeightChart.map((r, i) => (
                <tr
                  key={r.inches}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">
                    {r.ftIn}{" "}
                    <span className="font-normal text-slate-400">
                      ({r.cm} cm)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {r.womenIdealLb} lb{" "}
                    <span className="text-slate-400">
                      ({r.womenIdealKg} kg)
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {r.menIdealLb} lb{" "}
                    <span className="text-slate-400">({r.menIdealKg} kg)</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                      {r.healthyLb} lb
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Scroll the table sideways on mobile. Values are rounded. Your own
          healthy number depends on frame size, muscle, and age, covered further
          down.
        </p>

        {/* ── CHART ─────────────────────────────────── */}
        <div className="mt-14">
          <IdealWeightChart />
        </div>

        {/* ───────────────────────────────────────────────
            EMBEDDED CALCULATOR WIDGET   ★ USP ★
            Live, interactive. Uses your /health/ideal-body-weight-calculator engine.
           ─────────────────────────────────────────────── */}
        <section id="ideal-weight-calculator-widget" className="mt-16 scroll-mt-20">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-2 ring-1 ring-emerald-200">
            <div className="rounded-[1.4rem] bg-white p-6 md:p-8">
              <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Free Tool
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
                    Skip the Chart. Get Your Exact Number
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Enter your height, sex, and age. The calculator returns your
                    ideal body weight in pounds and kilograms, plus a healthy
                    range, using the same formulas doctors rely on.
                  </p>
                </div>
                <Link
                  href={CALC_HREF}
                  className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open full page ↗
                </Link>
              </div>

              {/* ▼▼▼  GUIDED IDEAL-WEIGHT ASSESSMENT  ▼▼▼ */}
              <IdealWeightExperience />
              {/* ▲▲▲  END  ▲▲▲ */}
            </div>
          </div>
        </section>

        {/* ── WORKED EXAMPLES ─────────────────────────── */}
        <div className="prose prose-slate prose-lg mt-16 max-w-none prose-headings:font-bold prose-strong:text-slate-900">
          <h2>Two Worked Examples</h2>
          <p>
            The chart is faster than math, but it helps to see how a single
            target is built. The Devine formula starts at a base weight for
            5&apos;0&quot; and adds 2.3 kg for every inch above that.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Example 1
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">
              5&apos;6&quot; woman
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Six inches over 5 ft. Start at 45.5 kg, add 6 × 2.3 = 13.8 kg.
              Ideal weight comes to <strong>59.3 kg, about 131 lbs</strong>. The
              healthy range for that height is roughly 115 to 154 lbs.
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-6 ring-1 ring-emerald-200">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Example 2
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">
              6&apos;0&quot; man
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Twelve inches over 5 ft. Start at 50 kg, add 12 × 2.3 = 27.6 kg.
              Ideal weight comes to <strong>77.6 kg, about 171 lbs</strong>. The
              healthy range for that height is roughly 136 to 184 lbs.
            </p>
          </div>
        </div>

        {/* ── FORMULAS ──────────────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          The Four Formulas Doctors Use
        </h2>
        <p className="mt-2 text-slate-600">
          There is no single agreed formula, so clinicians compare a few and read
          the spread as a range. Devine is the most common. Here is how each one
          works and where it gets used.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {ibwFormulas.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"
              style={{ borderTop: `4px solid ${f.brandColor}` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{ backgroundColor: f.brandColor }}
                >
                  {f.year}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {f.name} Formula
                </h3>
              </div>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-slate-500">
                    Men
                  </dt>
                  <dd className="text-slate-700">{f.men}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold text-slate-500">
                    Women
                  </dt>
                  <dd className="text-slate-700">{f.women}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-slate-600">{f.context}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── AGE SECTION ────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Does Your Ideal Weight Change With Age?
          </h2>
          <p className="mt-3 text-slate-600">
            The formula itself does not. A 25 and a 65 year old at the same height
            get the same Devine number. What changes is body composition and the
            healthy band that research links to the best outcomes. The biggest
            shift comes after 60.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ageBands.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"
                style={{ borderTop: `4px solid ${a.brandColor}` }}
              >
                <span
                  className="inline-block rounded-lg px-3 py-1 text-sm font-bold text-white"
                  style={{ backgroundColor: a.brandColor }}
                >
                  {a.range}
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{a.detail}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {a.bmiTarget}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5 text-sm text-slate-700">
            For adults over 65, being slightly above the standard range often
            beats being underweight. Muscle loss and unplanned weight loss carry
            real risk at that age, so a senior who drifts below their range should
            treat that as a flag, not a win.
          </div>
        </div>
      </section>

      {/* ── BMI VS IBW ─────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Ideal Weight vs BMI: Which Number Do You Need?
        </h2>
        <p className="mt-3 text-slate-600">
          They answer different questions. Ideal body weight gives you a target to
          aim for and is adjusted for sex. BMI sorts your current weight into a
          category and is not. Most people benefit from running both.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {bmiCategories.map((c) => {
            const tone =
              c.tone === "ok"
                ? "bg-emerald-50 ring-emerald-200"
                : c.tone === "warn"
                ? "bg-amber-50 ring-amber-200"
                : c.tone === "high"
                ? "bg-rose-50 ring-rose-200"
                : "bg-slate-50 ring-slate-200";
            const dot =
              c.tone === "ok"
                ? "bg-emerald-500"
                : c.tone === "warn"
                ? "bg-amber-500"
                : c.tone === "high"
                ? "bg-rose-500"
                : "bg-slate-400";
            return (
              <div key={c.label} className={`rounded-2xl p-5 ring-1 ${tone}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                  <p className="font-bold text-slate-900">{c.label}</p>
                  <span className="ml-auto text-sm font-semibold text-slate-500">
                    BMI {c.range}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{c.meaning}</p>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Want your BMI category alongside your target weight? The{" "}
          <Link href={CALC_HREF} className="font-semibold text-emerald-600">
            ideal body weight calculator
          </Link>{" "}
          shows your healthy range, and you can pair it with the BMI tool for the
          full picture.
        </p>
      </section>

      {/* ── WHAT MOVES YOUR NUMBER ─────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            Four Things That Move Your Healthy Number
          </h2>
          <p className="mt-3 text-slate-600">
            A chart cannot see your body. These four factors explain why two
            people at the same height can both be healthy 15 lbs apart.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {frameNotes.map((f) => (
              <div
                key={f.frame}
                className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {f.emoji}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{f.frame}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-700">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISCLAIMER ─────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">
            A Note on Using These Numbers
          </h3>
          <p className="mt-2 text-sm text-slate-700">
            An ideal weight chart is a screening guide, not a diagnosis. It does
            not account for athletes carrying heavy muscle, pregnancy, growing
            teens, or chronic conditions and the medications that come with them.
            If you are planning a major change in your weight, or you fall into
            one of those groups, treat the chart as a starting point and confirm
            your target with a doctor or registered dietitian.
          </p>
        </div>
      </section>

      {/* ── PDF GUIDE CTA ─────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-50 to-lime-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Take the chart with you
          </h2>
          <p className="mt-3 text-slate-600">
            Download a free, printable ideal weight chart. Height and weight for
            women and men, the formulas, and the healthy ranges in one PDF.
          </p>
          <div className="mt-8 flex justify-center">
            <IdealWeightGuidePdfButton />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-4">
          {idealWeightFaqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl bg-white p-5 ring-1 ring-slate-200 open:bg-slate-50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
                {f.q}
                <span className="ml-4 text-emerald-600 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-slate-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── BOTTOM LINE / FINAL CTA ────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            The Bottom Line
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Your ideal weight is a short range set by height and sex, with age
            and body type deciding where you sit inside it. Use the chart to find
            your window, the calculator to get your exact target, and your own
            common sense about frame and muscle to read it well. A healthy number
            is one you can hold without fighting your body.
          </p>
          <Link
            href={CALC_HREF}
            className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-emerald-400"
          >
            Open the Ideal Body Weight Calculator →
          </Link>
        </div>
      </section>
    </article>
  );
}
