// components/blog/MensBodyShapeBlog.tsx
import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/lib/blog/blogs-data";
import {
  maleShapes,
  measureSteps,
  shapePresets,
  maleShapeFaqs,
} from "@/lib/blog/male-body-shape-data";
import MaleBodyShapeChart from "@/components/charts/MaleBodyShapeChart";
import MensBodyShapeGuidePdfButton from "@/components/plans/MensBodyShapeGuidePdfButton";

// The premium 3D body-shape experience (measure -> morph -> analysis), shared
// with the standalone /health/body-shape-calculator page.
import BodyShapeExperience from "@/components/body-shape/BodyShapeExperience";

const CALC_HREF = "/health/body-shape-calculator";

interface Props {
  blog: Blog;
}

/* tiny 2D silhouette glyph per shape, built from the preset measurements */
function ShapeGlyph({ shapeId, color }: { shapeId: keyof typeof shapePresets; color: string }) {
  const p = shapePresets[shapeId];
  const cx = 32;
  const k = 0.62;
  const sh = Math.min(28, p.shoulders * k);
  const wa = Math.min(28, p.waist * k);
  const hp = Math.min(28, p.hips * k);
  const pts = [
    [cx - 5, 8],
    [cx + 5, 8],
    [cx + sh, 18],
    [cx + wa, 44],
    [cx + hp, 60],
    [cx - hp, 60],
    [cx - wa, 44],
    [cx - sh, 18],
  ]
    .map((pt) => pt.map((n) => n.toFixed(1)).join(","))
    .join(" ");
  return (
    <svg viewBox="0 0 64 72" className="h-16 w-16" aria-hidden>
      <circle cx={cx} cy={6} r={5} fill={color} />
      <polygon points={pts} fill={color} />
    </svg>
  );
}

export default function MensBodyShapeBlog({ blog }: Props) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: maleShapeFaqs.map((f) => ({
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
              Body Shape Calculator for Men:{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-lime-600 bg-clip-text text-transparent">
                How to Measure Your Body Shape
              </span>
            </h1>
            <p className="mt-5 text-lg text-slate-600">{blog.description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="#male-3d-visualizer"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Try the 3D Shape Tool →
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
              alt="Male body shape calculator showing the five men's body types, by Calqulate"
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
            { label: "Male Shapes", value: `${maleShapes.length}` },
            { label: "Measurements", value: "4" },
            { label: "Time Needed", value: "2 min" },
            { label: "3D Tool", value: "Free" },
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
              Why Your Body Shape Decides How Clothes Fit
            </h2>
          </div>

          {/* The problem vs the solution */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-lg">
                  ❌
                </span>
                <h3 className="text-lg font-bold text-slate-900">The Problem</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Most men shop by a single label — medium or large — and hope for
                the best. A size only describes volume, not how your frame carries
                it. Two men can both wear a large and look completely different in
                the same jacket, because one has broad shoulders and a narrow
                waist while the other runs straight up and down.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm">
                <span className="font-semibold text-rose-700">Guesswork</span>
                <span className="text-rose-500">→ baggy shoulders or tight chest</span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                  ✅
                </span>
                <h3 className="text-lg font-bold text-slate-900">The Solution</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Your body shape is the ratio between <strong className="text-slate-900">four measurements</strong>: shoulders,
                chest, waist, and hips. Get those ratios right and you can predict
                which cuts will fit, which need a tailor, and which to skip. The
                same ratios tell you which training balances your frame.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 text-sm">
                <span className="font-semibold text-emerald-800">Know your numbers</span>
                <span className="text-emerald-600">→ clothes that actually fit</span>
              </div>
            </div>
          </div>

          {/* What you'll get */}
          <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <p className="text-sm leading-relaxed text-slate-300">
              Below you can spin a 3D figure that morphs to your numbers, learn to
              measure in two minutes, and read what each of the five shapes means
              for clothing and the gym. When you want a saved result, the{" "}
              <Link
                href={CALC_HREF}
                className="font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
              >
                body shape calculator
              </Link>{" "}
              stores it for you.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "3D visualizer",
                "4-step measuring guide",
                "5 shape deep-dives",
                "Style tips per shape",
                "Training advice",
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

        {/* ───────────────────────────────────────────────
            3D VISUALIZER   ★ USP ★
           ─────────────────────────────────────────────── */}
        <section id="male-3d-visualizer" className="mt-10 scroll-mt-20">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              Interactive 3D Tool
            </span>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
              See Your Shape in 3D
            </h2>
            <p className="mt-2 text-slate-600">
              Switch to Male, enter your four measurements, and watch a neutral 3D
              body morph into your real silhouette. Rotate it, zoom in, and read
              your shape and waist-to-hip ratio below.
            </p>
          </div>
          <BodyShapeExperience />
        </section>

        {/* ── HOW TO MEASURE ────────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          How to Measure Your Body Shape (4 Steps)
        </h2>
        <p className="mt-2 text-slate-600">
          You need a soft tape, a mirror, and a relaxed stance. Keep the tape
          level with the floor, snug but not tight, and do not flex. Measure each
          spot twice and take the average.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {measureSteps.map((s, i) => (
            <div
              key={s.id}
              className="flex items-start gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-slate-900">{s.part}</p>
                <p className="text-sm text-slate-600">{s.how}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── THE FIVE SHAPES ───────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          The Five Male Body Shapes
        </h2>
        <p className="mt-2 text-slate-600">
          Every man lands in one of these five, set by how his shoulders compare
          to his waist and hips. Here is how to spot each one and what to do with
          it.
        </p>
        <div className="mt-6 space-y-4">
          {maleShapes.map((s) => (
            <div
              key={s.id}
              className={`rounded-2xl p-6 ring-1 ${s.accent}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex shrink-0 items-center gap-4">
                  <div className="rounded-2xl bg-white p-2 ring-1 ring-slate-200">
                    <ShapeGlyph shapeId={s.id} color={s.brandColor} />
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{s.name}</h3>
                    <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                      {s.tagline}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{s.description}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    How to spot it
                  </p>
                  <p className="text-sm text-slate-600">{s.rule}</p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Dress it
                      </p>
                      <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {s.styleTips.map((t) => (
                          <li key={t} className="flex items-start gap-2">
                            <span className="mt-0.5 text-emerald-500">✓</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Train it
                      </p>
                      <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {s.trainingTips.map((t) => (
                          <li key={t} className="flex items-start gap-2">
                            <span className="mt-0.5 text-emerald-500">•</span>
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── CHART ─────────────────────────────────── */}
        <div className="mt-16">
          <MaleBodyShapeChart />
        </div>

        {/* ───────────────────────────────────────────────
            EMBEDDED CALCULATOR WIDGET
           ─────────────────────────────────────────────── */}
        <section id="body-shape-calculator-widget" className="mt-16 scroll-mt-20">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-2 ring-1 ring-emerald-200">
            <div className="rounded-[1.4rem] bg-white p-6 md:p-8">
              <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Free Tool
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
                    Want a saved, shareable result?
                  </h2>
                  <p className="mt-2 text-slate-600">
                    You just measured your shape in 3D above. Open the full Body Shape
                    Calculator to compare shapes, download a report, and see your GLP-1
                    fat-vs-muscle context.
                  </p>
                </div>
                <Link
                  href={CALC_HREF}
                  className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open full page ↗
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── SHAPE VS SOMATOTYPE ───────────────────── */}
        <div className="mt-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-lime-500" />
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Body Shape Is Not the Same as Body Type
            </h2>
          </div>
          <p className="mt-3 text-slate-600">
            People mix these up all the time. Here is the difference at a glance.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white">
                  Shape
                </span>
                <div>
                  <p className="text-lg font-bold text-slate-900">Body Shape</p>
                  <p className="text-sm text-slate-500">Your silhouette</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Describes your proportions from four measurements — shoulders,
                chest, waist, hips. Inverted triangle, trapezoid, rectangle,
                triangle, or oval. For clothing and training focus,{" "}
                <strong className="text-slate-900">shape is the number</strong>{" "}
                that helps.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Inverted Triangle", "Trapezoid", "Rectangle", "Triangle", "Oval"].map(
                  (s) => (
                    <span
                      key={s}
                      className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                    >
                      {s}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-sm font-bold text-white">
                  Type
                </span>
                <div>
                  <p className="text-lg font-bold text-slate-900">Somatotype</p>
                  <p className="text-sm text-slate-500">Your body's response</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                The ectomorph, mesomorph, and endomorph framework describes how
                your body responds to food and training — how easily you gain
                muscle or store fat. For nutrition and building speed,{" "}
                <strong className="text-slate-900">somatotype is the lens</strong>{" "}
                that helps.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Ectomorph", "Mesomorph", "Endomorph"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5 text-sm text-slate-700">
            <strong className="text-slate-900">The key insight:</strong> You can
            be a lean rectangle <em>or</em> a muscular rectangle. One is about
            proportions, the other is about how you build and store. Most men
            benefit from knowing both — and neither is a fixed label.
          </div>
        </div>
      </div>

      {/* ── DISCLAIMER ─────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 pb-16">
        <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-6">
          <h3 className="text-lg font-bold text-slate-900">
            A Note on Reading Your Result
          </h3>
          <p className="mt-2 text-sm text-slate-700">
            A body shape result is a styling and training guide, not a health
            verdict. It reads your ratios, so it does not see your height,
            posture, or limb length, all of which change how clothes hang. Where
            you store fat can carry health signals, but for that, a waist-to-hip
            ratio or a doctor's input matters more than a shape label. Use this as
            a starting point and adjust from your own mirror.
          </p>
        </div>
      </section>

      {/* ── PDF GUIDE CTA ─────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-50 to-lime-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Take the guide with you
          </h2>
          <p className="mt-3 text-slate-600">
            Download a free, printable men's body shape guide. The five shapes,
            how to measure, and the style and training notes in one PDF.
          </p>
          <div className="mt-8 flex justify-center">
            <MensBodyShapeGuidePdfButton />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-4">
          {maleShapeFaqs.map((f) => (
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
            Four measurements tell you your body shape, and your shape tells you
            how to dress and where to train. Measure carefully, find your spot on
            the spectrum, and use it as a practical guide rather than a label.
            When you want your exact result saved, run the free calculator.
          </p>
          <Link
            href={CALC_HREF}
            className="mt-8 inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-emerald-400"
          >
            Open the Body Shape Calculator →
          </Link>
        </div>
      </section>
    </article>
  );
}
