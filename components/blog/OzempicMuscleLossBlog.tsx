// components/blog/OzempicMuscleLossBlog.tsx
import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/lib/blog/blogs-data";
import {
  muscleLossStudies,
  proteinTargets,
  warningSigns,
  scaleVsTruth,
  muscleLossFaqs,
  references,
} from "@/lib/blog/ozempic-muscle-loss-data";
import MuscleLossChart from "@/components/charts/MuscleLossChart";
import MuscleGuidePdfButton from "@/components/plans/MuscleGuidePdfButton";

// ── EXTERNAL / INTERNAL TOOL ROUTES ────────────────────────────────
// Free GLP-1 tracker (open to everyone) and the premium body-composition
// tracker. Centralised here so every CTA points to one source.
const GLP1_FREE_TRACKER_URL = "/health/glp-1-dose-calculator";
const GLP1_PREMIUM_TRACKER_URL = "/product/glp1-progress-tracker";

interface Props {
  blog: Blog;
}

export default function OzempicMuscleLossBlog({ blog }: Props) {
  return (
    <article className="bg-white">
      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="inline-block w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              {blog.category}
            </span>

            {/* Mom-Test H1 */}
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl lg:text-6xl">
              Don&rsquo;t just lose weight.{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-lime-600 bg-clip-text text-transparent">
                Keep your muscle.
              </span>
            </h1>

            {/* Mom-Test H2 */}
            <p className="mt-5 text-lg text-slate-600">
              Up to a third of the weight you lose on Ozempic, Wegovy, or
              Mounjaro can be muscle — not fat. Your bathroom scale can&rsquo;t
              tell the difference. We can. Track your fat, muscle, and heart
              health so every pound you drop is the right one.
            </p>

            {/* ── DUAL CTA: free tracker + premium (gold) ── */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href={GLP1_FREE_TRACKER_URL}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Try the GLP-1 Tracker Free →
              </a>
              <Link
                href={GLP1_PREMIUM_TRACKER_URL}
                className="rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 text-sm font-bold text-amber-950 shadow-lg ring-1 ring-amber-300 transition hover:from-amber-300 hover:to-yellow-400"
              >
                ★ Get the Premium Body Tracker
              </Link>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {blog.readTime} • Updated{" "}
              {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
            <Image
              src={blog.featuredImage}
              alt="Ozempic muscle loss — track your body composition to lose fat not muscle and prevent skinny fat — Calqulate"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        </div>
      </header>

      {/* ── TOFU DASHBOARD (free tracker + premium tracker) ─────────────── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
          {/* Free tracker card */}
          <a
            href={GLP1_FREE_TRACKER_URL}
            className="group bg-white p-6 text-center transition hover:bg-emerald-50"
          >
            <p className="text-3xl font-bold text-emerald-600 md:text-4xl">Free</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700">
              GLP-1 Tracker
            </p>
          </a>

          {/* Premium tracker card → /product/glp-1tracker (GOLD) */}
          <Link
            href={GLP1_PREMIUM_TRACKER_URL}
            className="group relative bg-gradient-to-br from-amber-50 to-yellow-50 p-6 text-center transition hover:from-amber-100 hover:to-yellow-100"
          >
            <span className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
              Premium
            </span>
            <p className="text-3xl font-bold text-amber-600 md:text-4xl">★ Pro</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-amber-700/80">
              Body Composition Tracker
            </p>
          </Link>

          <div className="bg-white p-6 text-center">
            <p className="text-3xl font-bold text-rose-500 md:text-4xl">~30%</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Of Weight Lost Can Be Muscle
            </p>
          </div>

          <div className="bg-white p-6 text-center">
            <p className="text-3xl font-bold text-slate-900 md:text-4xl">5</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Things to Track, Not Just Weight
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        {/* ── INTRO / THE MEDICAL REALITY ─────────────────────────────── */}
        <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            The Part Nobody Warned You About
          </h2>

          <div className="mt-6 space-y-5 text-lg leading-8 text-slate-700">
            <p>
              The GLP-1 medications — Ozempic, Wegovy, Mounjaro, and Zepbound —
              are genuinely changing lives. The pounds come off, the cravings go
              quiet, and the scale finally moves. But here&rsquo;s the medical
              reality almost no one mentions when you start:{" "}
              <strong className="text-slate-900">
                a large share of the weight you lose can be muscle, not fat.
              </strong>
            </p>
          </div>

          {/* Key stat highlight */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-6 ring-1 ring-emerald-200 sm:flex-row sm:items-center sm:gap-6">
            <div className="shrink-0 text-center">
              <span className="text-5xl font-black text-emerald-600 md:text-6xl">40%</span>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                of weight lost was lean mass
              </p>
            </div>
            <div className="h-px w-full bg-emerald-200 sm:h-16 sm:w-px" />
            <p className="text-base leading-7 text-slate-700 sm:text-lg">
              In the landmark STEP 1 trial of semaglutide, a body-composition
              analysis found that roughly <strong className="text-slate-900">40% of the weight lost came
              from lean (fat-free) mass</strong> — muscle and the tissue that
              holds you up. Across the broader family of GLP-1 trials, lean tissue
              made up somewhere between a quarter and two-fifths of total weight
              lost. That&rsquo;s normal for fast weight loss, but it&rsquo;s also
              exactly how people end up &ldquo;skinny fat&rdquo;: lighter on the
              scale, but soft, tired, and still carrying too much body fat.
            </p>
          </div>

          {/* Good news callout */}
          <div className="mt-6 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-6">
            <p className="text-base leading-7 text-slate-700 md:text-lg">
              <span className="text-lg font-bold text-emerald-700">The good news</span>{" "}
              is that muscle loss is a side effect you can{" "}
              <em className="font-semibold text-slate-900">manage</em> — not a sentence. But you can&rsquo;t fix what you
              can&rsquo;t see, and the one tool almost everyone relies on is
              lying to you. Want to see what&rsquo;s really happening to your
              body?{" "}
              <a href={GLP1_FREE_TRACKER_URL} className="font-semibold text-emerald-600 underline hover:text-emerald-700">
                Try the GLP-1 tracker free
              </a>.
            </p>
          </div>
        </div>

        {/* ── WHY THE SCALE IS LYING ─────────────────────── */}
        <h2 className="mt-12 text-2xl font-bold text-slate-900 md:text-3xl">
          Why Your Bathroom Scale Is Lying to You
        </h2>
        <p className="mt-2 text-slate-600">
          Your scale gives you one number: total body weight. It can&rsquo;t
          tell the difference between a pound of fat (the goal) and a pound of
          muscle (a problem). Here&rsquo;s the difference between what the scale
          tells you and what your body composition actually shows.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 font-semibold"> </th>
                <th className="p-4 font-semibold">🩻 The Bathroom Scale</th>
                <th className="hidden p-4 font-semibold md:table-cell">
                  ✅ Body Composition Tracking
                </th>
              </tr>
            </thead>
            <tbody>
              {scaleVsTruth.map((r, i) => (
                <tr
                  key={r.metric}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="p-4 font-bold text-slate-900">{r.metric}</td>
                  <td className="p-4 text-slate-600">{r.scale}</td>
                  <td className="hidden p-4 text-slate-700 md:table-cell">
                    {r.truth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm text-slate-700">
          <strong className="text-slate-900">The simple truth:</strong> You
          can&rsquo;t improve what you don&rsquo;t measure. If you only watch
          the scale, you have no idea whether you&rsquo;re losing the right kind
          of weight.
        </div>

        {/* ── CHART ─────────────────────────────────────────────── */}
        <div className="mt-12">
          <MuscleLossChart />
        </div>

        {/* ── MUSCLE LOSS BY STUDY ──────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          How Much Muscle Are You Really Losing?
        </h2>
        <p className="mt-2 text-slate-600">
          This isn&rsquo;t scare-mongering — it&rsquo;s what the research found,
          and what it means for you.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {muscleLossStudies.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"
              style={{ borderTop: `4px solid ${s.brandColor}` }}
            >
              <p className="text-sm font-bold text-slate-900">{s.study}</p>
              <p
                className="mt-1 text-sm font-semibold"
                style={{ color: s.brandColor }}
              >
                {s.leanShare}
              </p>
              <p className="mt-2 text-sm text-slate-600">{s.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm text-slate-700">
          <strong className="text-slate-900">Read that last card again:</strong>{" "}
          when people paired their weight loss with protein and resistance
          training, the share of weight lost as muscle dropped from around 40%
          to just a few percent. Muscle loss is preventable — but only if
          you&rsquo;re tracking it.
        </div>

        {/* ── THE FEARS (and fixes) ─────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          &ldquo;Ozempic Face,&rdquo; &ldquo;Skinny Fat,&rdquo; and the Fears
          That Are Actually Fixable
        </h2>
        <p className="mt-2 text-slate-600">
          The scariest part of GLP-1 weight loss is the stuff people whisper
          about online. Here&rsquo;s what actually causes each one — and the
          simple thing that prevents it.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {warningSigns.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl bg-white p-6 ring-1 ring-slate-200"
            >
              <h3
                className="text-lg font-bold"
                style={{ color: w.brandColor }}
              >
                {w.fear}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                <strong className="text-slate-800">Why it happens:</strong>{" "}
                {w.cause}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <strong className="text-emerald-700">The fix:</strong> {w.fix}
              </p>
            </div>
          ))}
        </div>

        {/* ── PROTEIN TARGETS ───────────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          Eat Enough Protein So You Don&rsquo;t Lose Your Hair or Your Strength
        </h2>
        <p className="mt-2 text-slate-600">
          When the medication kills your appetite, it&rsquo;s frighteningly easy
          to eat too little protein. Your body then breaks down muscle and
          starves your hair. A simple daily target fixes this. Aim for roughly{" "}
          <strong>0.7 to 1.0 grams of protein per pound of body weight</strong>,
          spread across the day.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {proteinTargets.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white p-5 text-center ring-1 ring-slate-200"
            >
              <p className="text-sm font-semibold text-slate-500">
                {p.bodyWeightLbs} lbs
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-600">
                {p.gramsLow}–{p.gramsHigh} g
              </p>
              <p className="text-xs text-slate-500">protein per day</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Easy wins: eggs, Greek yogurt, cottage cheese, chicken, fish, tofu,
          edamame, and a protein shake on the days you just can&rsquo;t face
          food. Treat protein like medicine — hit the number even when
          you&rsquo;re not hungry.
        </p>

        {/* ── 5 THINGS TO TRACK ─────────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          The 5 Things You Should Track Instead of Just Your Weight
        </h2>
        <p className="mt-2 text-slate-600">
          This is exactly what our GLP-1 body tracker is built to do — turn the
          fears above into five simple numbers you can actually watch.
        </p>

        <div className="mt-6 space-y-3">
          {[
            {
              n: "1",
              feat: "Body Composition (Muscle vs. Fat)",
              benefit:
                "See in plain numbers whether you're losing fat or muscle — so you can make sure every pound that disappears is fat, not the muscle keeping you strong.",
            },
            {
              n: "2",
              feat: "Lab Result Tracking",
              benefit:
                "Keep your blood sugar, cholesterol, and other lab numbers in one place so you and your doctor can see, at a glance, that you're getting healthier — not just lighter.",
            },
            {
              n: "3",
              feat: "Food & Protein Estimator",
              benefit:
                "Make sure you're eating enough protein so you don't lose your hair or feel exhausted while the medication is killing your appetite.",
            },
            {
              n: "4",
              feat: "Metabolism Score Tracker",
              benefit:
                "Watch a single, simple score that tells you if your body is still burning energy well — so you can catch a slowing metabolism before it stalls your progress.",
            },
            {
              n: "5",
              feat: "Heart Age Tracker",
              benefit:
                "See your \"heart age\" get younger as you lose fat the right way — real proof the weight loss is helping your heart, not just your jeans.",
            },
          ].map((row) => (
            <div
              key={row.n}
              className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {row.n}
              </span>
              <div>
                <p className="font-bold text-slate-900">{row.feat}</p>
                <p className="mt-1 text-sm text-slate-600">{row.benefit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────
          FREE TRACKER + PREMIUM TRACKER (gold)  ★ USP ★
         ─────────────────────────────────────────────── */}
      <section id="glp1-tools" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* FREE */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-8 ring-1 ring-emerald-200">
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Free Tool
              </span>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Start with the Free GLP-1 Tracker
              </h2>
              <p className="mt-2 text-slate-600">
                Log your dose, your weight, and how you feel — and get a clear
                picture of your GLP-1 journey in seconds. No signup, no
                pressure. The easiest way to stop guessing.
              </p>
              <a
                href={GLP1_FREE_TRACKER_URL}
                className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Try the GLP-1 Tracker Free →
              </a>
            </div>

            {/* PREMIUM → /product/glp-1tracker (GOLD) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-400 p-8 text-amber-950 shadow-xl ring-1 ring-amber-300">
              <span className="inline-block rounded-full bg-amber-950/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-100">
                ★ Premium Tracker
              </span>
              <h2 className="mt-4 text-2xl font-bold">
                Make Sure You Lose Fat, Not Muscle
              </h2>
              <p className="mt-2 font-medium text-amber-950/80">
                The full body tracker: muscle vs. fat, lab results, a protein
                estimator, your Metabolism Score, and your Heart Age — all in
                one place. See exactly what your GLP-1 is doing to your body, so
                you lose weight safely.
              </p>
              <Link
                href={GLP1_PREMIUM_TRACKER_URL}
                className="mt-6 inline-block rounded-xl bg-amber-950 px-6 py-3 text-sm font-bold text-amber-50 shadow-lg transition hover:bg-amber-900"
              >
                ★ Get the Premium Body Tracker →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW TO LOSE FAT NOT MUSCLE (action) ───────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Your Simple Plan to Lose Fat — Not Muscle
        </h2>
        <p className="mt-3 text-slate-600">
          You don&rsquo;t need anything complicated. Four habits protect your
          muscle while the medication does its job:
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            {
              t: "1. Slow down",
              d: "Aim for 1-2 lbs of loss per week, not crash-dieting. Faster loss means more muscle lost and a higher risk of \"Ozempic face.\"",
            },
            {
              t: "2. Eat your protein",
              d: "Hit your daily protein target every day — even when the medication makes you forget to eat. Protein is what tells your body to keep muscle.",
            },
            {
              t: "3. Lift something",
              d: "Two to three short resistance sessions a week (bands, dumbbells, or bodyweight) signal your body to hold onto muscle and burn fat instead.",
            },
            {
              t: "4. Track the right numbers",
              d: "Watch your fat, muscle, protein, Metabolism Score, and Heart Age — not just the scale — so you can correct course early.",
            },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5"
            >
              <p className="font-bold text-slate-900">{s.t}</p>
              <p className="mt-1 text-sm text-slate-700">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PDF GUIDE CTA ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-50 to-lime-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Take the muscle-protection guide with you
          </h2>
          <p className="mt-3 text-slate-600">
            Download a free, printable guide — why the scale lies, how much
            muscle you can lose, your daily protein target, and the simple plan
            to lose fat not muscle, all in one PDF.
          </p>
          <div className="mt-8 flex justify-center">
            <MuscleGuidePdfButton />
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900">
          Frequently Asked Questions
        </h2>
        <div className="mt-8 space-y-4">
          {muscleLossFaqs.map((f) => (
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

      {/* ── REFERENCES & SOURCES ──────────────────────────────── */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-slate-900">
            References &amp; Sources
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Every figure in this guide is drawn from clinical trials, official
            prescribing information, and peer-reviewed research.
          </p>
          <ol className="mt-6 space-y-3">
            {references.map((r, i) => (
              <li
                key={r.url}
                className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-semibold text-emerald-600 hover:underline"
                  >
                    {r.label}
                  </a>{" "}
                  — <span className="text-slate-500">{r.publisher}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── DISCLAIMER ────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border-l-4 border-slate-300 bg-slate-50 p-6">
          <p className="text-xs text-slate-500">
            <strong className="text-slate-700">Disclaimer:</strong> This article
            is for educational and informational purposes only and does not
            constitute medical advice. Decisions about your medication,
            nutrition, and exercise while on a GLP-1 must always be made with a
            qualified, licensed healthcare provider who knows your full medical
            history.
          </p>
        </div>
      </section>

      {/* ── BOTTOM LINE / FINAL CTA ───────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Lose the weight. Keep the muscle.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            You can&rsquo;t improve what you don&rsquo;t measure. Start tracking
            your body composition for free today — then upgrade to the full
            tracker to protect your muscle, your hair, your face, and your heart
            while the medication does its job.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={GLP1_FREE_TRACKER_URL}
              className="inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-emerald-400"
            >
              Try the GLP-1 Tracker Free →
            </a>
            <Link
              href={GLP1_PREMIUM_TRACKER_URL}
              className="inline-block rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-base font-bold text-amber-950 shadow-xl ring-1 ring-amber-300 transition hover:from-amber-300 hover:to-yellow-400"
            >
              ★ Get the Premium Body Tracker →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
