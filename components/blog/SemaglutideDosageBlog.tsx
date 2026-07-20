// components/blog/SemaglutideDosageBlog.tsx
import Link from "next/link";
import Image from "next/image";
import type { Blog } from "@/lib/blog/blogs-data";
import {
  titrationSchedule,
  wegovyVsOzempic,
  compoundingDoses,
  clickDoses,
  storageRules,
  semaglutideFaqs,
  references,
} from "@/lib/blog/semaglutide-dosage-data";
import SemaglutideDosageChart from "@/components/charts/SemaglutideDosageChart";
import SemaglutideGuidePdfButton from "@/components/plans/SemaglutideGuidePdfButton";

// ── EXTERNAL / INTERNAL TOOL ROUTES ────────────────────────────────
// Free GLP-1 dose calculator (open to everyone) and the premium advanced
// tracking service. Centralised here so every CTA points to one source.
const GLP1_CALCULATOR_URL = "/health/glp-1-dose-calculator";
const GLP1_TRACKER_URL = "/product/glp1-progress-tracker";

interface Props {
  blog: Blog;
}

export default function SemaglutideDosageBlog({ blog }: Props) {
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
              Semaglutide Dosage Chart &amp;{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-lime-600 bg-clip-text text-transparent">
                Titration Schedule
              </span>
            </h1>
            <p className="mt-5 text-lg text-slate-600">{blog.description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a
                href={GLP1_CALCULATOR_URL}
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Free GLP-1 Dose Check →
              </a>
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
              alt="Semaglutide dosage chart and titration schedule for Wegovy and Ozempic — Calqulate"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        </div>
      </header>

      {/* ── TOFU DASHBOARD (free tool + premium tracker) ─────────────── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
          {/* Free calculator card */}
          <a
            href={GLP1_CALCULATOR_URL}
            className="group bg-white p-6 text-center transition hover:bg-emerald-50"
          >
            <p className="text-3xl font-bold text-emerald-600 md:text-4xl">Free</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-emerald-700">
              GLP-1 Dose Calculator
            </p>
          </a>

          {/* Premium tracker card → /product/glp-1-traker */}
          <Link
            href={GLP1_TRACKER_URL}
            className="group relative bg-white p-6 text-center transition hover:bg-lime-50"
          >
            <span className="absolute right-2 top-2 rounded-full bg-lime-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Premium
            </span>
            <p className="text-3xl font-bold text-slate-900 md:text-4xl">Pro</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-lime-700">
              Advanced GLP-1 Tracker
            </p>
          </Link>

          <div className="bg-white p-6 text-center">
            <p className="text-3xl font-bold text-slate-900 md:text-4xl">
              {titrationSchedule.length}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dose Phases
            </p>
          </div>

          <div className="bg-white p-6 text-center">
            <p className="text-3xl font-bold text-slate-900 md:text-4xl">2.4 mg</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Max Weight-Loss Dose
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        {/* ── INTRO / STARTING DOSE ─────────────────────────────── */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-8 md:p-10 ring-1 ring-emerald-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-lime-500" />
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Understanding the Semaglutide Starting Dose for Weight Loss</h2>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">The Golden Rule</p>
            <p className="mt-2 text-lg leading-relaxed">
              &ldquo;Start low and go slow.&rdquo; The universal semaglutide starting dose for weight loss is{" "}
              <strong className="text-emerald-300">0.25 mg injected once weekly for the first four weeks</strong>.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg">😣</span>
                <p className="font-bold text-slate-900">Why the frustration is normal</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Many patients feel frustrated when they don&rsquo;t see an immediate
                weight drop at this stage, but it&rsquo;s vital to understand that
                0.25 mg is not a therapeutic weight-loss dose.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">🛡️</span>
                <p className="font-bold text-slate-900">Strictly for tolerance</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                This initial phase is strictly for tolerance. Semaglutide mimics a
                hormone (GLP-1) that slows gastric emptying and signals the brain
                that you are full. Shocking your system with a high dose immediately
                can lead to severe gastrointestinal distress, including extreme
                nausea, vomiting, and dehydration.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border-l-4 border-emerald-500 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Why tolerance matters</p>
                <p className="mt-1 text-sm text-slate-700">
                  Completing the 4-week starter cycle lets the medication build safely in your bloodstream. Want a
                  personalised step-up plan? Run your numbers through our free{" "}
                  <a href={GLP1_CALCULATOR_URL} className="font-semibold text-emerald-600 underline underline-offset-2 hover:text-emerald-700">GLP-1 dose calculator</a> first.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── OFFICIAL DOSAGE CHART (table) ─────────────────────── */}
        <h2 className="mt-12 text-2xl font-bold text-slate-900 md:text-3xl">
          The Official Semaglutide Weight Loss Dosage Chart
        </h2>
        <p className="mt-2 text-slate-600">
          Use the standard FDA-approved titration schedule for Wegovy (approved
          specifically for weight management). Print it and circle the date you
          step up to each new dose.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 font-semibold">Treatment Phase</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Weekly Dose</th>
                <th className="hidden p-4 font-semibold md:table-cell">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {titrationSchedule.map((s, i) => (
                <tr
                  key={s.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="p-4 font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: s.brandColor }}
                      />
                      {s.phase}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700">{s.weeks}</td>
                  <td className="p-4">
                    <span
                      className="rounded-lg px-2.5 py-1 text-sm font-bold text-white"
                      style={{ backgroundColor: s.brandColor }}
                    >
                      {s.doseMg} mg
                    </span>
                  </td>
                  <td className="hidden p-4 text-slate-600 md:table-cell">
                    {s.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm text-slate-700">
          <strong className="text-slate-900">Tip from Calqulate.net:</strong>{" "}
          Print this chart and tape it to your refrigerator near your
          medication. Circle the date you step up to a new dose.
        </div>

        {/* ── CHART ─────────────────────────────────────────────── */}
        <div className="mt-12">
          <SemaglutideDosageChart />
        </div>

        {/* ── WEGOVY vs OZEMPIC COMPARISON ──────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          Wegovy vs Ozempic: Same Drug, Different Rules
        </h2>
        <p className="mt-2 text-slate-600">
          Both contain the identical active ingredient — semaglutide — but they
          are approved for different uses and follow different dosing ceilings.
          Here&rsquo;s the side-by-side.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-900">
                <th className="p-4 font-semibold">Feature</th>
                <th className="p-4 font-semibold text-emerald-700">Wegovy</th>
                <th className="p-4 font-semibold text-teal-700">Ozempic</th>
              </tr>
            </thead>
            <tbody>
              {wegovyVsOzempic.map((r, i) => (
                <tr
                  key={r.feature}
                  className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="p-4 font-semibold text-slate-900">
                    {r.feature}
                  </td>
                  <td className="p-4 text-slate-700">{r.wegovy}</td>
                  <td className="p-4 text-slate-700">{r.ozempic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── NON-DIABETIC ──────────────────────────────────────── */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-8 md:p-10 ring-1 ring-sky-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500" />
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Semaglutide for Weight Loss in Non-Diabetics</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-emerald-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">W</span>
                <div>
                  <p className="font-bold text-slate-900">Wegovy (FDA-approved for weight)</p>
                  <p className="text-xs text-slate-500">For non-diabetics</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                If you do not have type 2 diabetes, the FDA-approved medication is{" "}
                <strong className="text-slate-900">Wegovy</strong>. The schedule for non-diabetics follows the
                chart above, culminating in a 2.4 mg weekly maintenance dose. It is
                indicated for adults with a Body Mass Index (BMI) of 30 or higher,
                or a BMI of 27 or higher with at least one weight-related condition
                such as hypertension or high cholesterol.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 ring-1 ring-teal-200 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700">O</span>
                <div>
                  <p className="font-bold text-slate-900">Ozempic (off-label for weight)</p>
                  <p className="text-xs text-slate-500">For type 2 diabetes</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Ozempic contains the same active ingredient but is FDA-approved for
                type 2 diabetes, so doctors prescribe it &ldquo;off-label&rdquo; for
                weight loss. On Ozempic, your maintenance dose might stop at 0.5 mg,
                1.0 mg, or 2.0 mg depending on your response and your physician&rsquo;s
                recommendation.
              </p>
            </div>
          </div>
        </div>

        {/* ── WHY INCREASE ───────────────────────────────────────── */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 md:p-10 ring-1 ring-amber-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Why Increase the Dose of Semaglutide for Weight Loss?</h2>
          </div>

          <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Weight-loss plateau looming</p>
                <p className="mt-1 text-sm text-slate-700">
                  The body is remarkably adaptable. Over time it builds tolerance to
                  the delayed gastric emptying and brain-signalling effects of your
                  current dose. That can lead to the dreaded <strong className="text-slate-900">weight-loss
                  plateau</strong>, where hunger returns and the scale stalls.
                  Stepping up keeps the medication ahead of your body&rsquo;s
                  adaptation curve.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">✅</span>
              <p className="font-bold text-slate-900">The flip side: you may not need to increase</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              That said, you don&rsquo;t <em>have</em> to increase if you&rsquo;re
              consistently losing 1–2 lbs a week and feeling well. Many clinicians
              prefer to keep patients on the lowest effective dose for as long as
              possible to minimise side effects. Dose escalation should always be
              a shared decision with your provider.
            </p>
          </div>
        </div>

        {/* ── MAX DOSE ───────────────────────────────────────────── */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-8 md:p-10 ring-1 ring-emerald-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-lime-500" />
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">What Is the Maximum Dose of Semaglutide for Weight Loss?</h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Wegovy — Weight Management</p>
              <p className="mt-2 text-4xl font-bold text-emerald-300">2.4 mg</p>
              <p className="mt-1 text-sm text-slate-300">per week — maximum approved dose</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                The maximum dose of semaglutide for weight loss is{" "}
                <strong className="text-white">2.4 mg per week</strong> (via Wegovy).
              </p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Ozempic — Blood Sugar Control</p>
              <p className="mt-2 text-4xl font-bold text-teal-300">2.0 mg</p>
              <p className="mt-1 text-sm text-slate-300">per week — maximum FDA-approved dose</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border-l-4 border-lime-500 bg-lime-50 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-xl">📊</span>
              <div>
                <p className="text-sm font-semibold text-slate-900">What the STEP trial proved</p>
                <p className="mt-1 text-sm text-slate-700">
                  The STEP (Semaglutide Treatment Effect in People with obesity) trials showed this dose
                  produced the most significant, sustained weight loss — participants
                  lost an average of roughly <strong className="text-slate-900">15% of body weight over 68
                  weeks</strong>. For Ozempic, the maximum FDA-approved dose for blood
                  sugar control is 2.0 mg per week. Exceeding these limits does not
                  speed up weight loss; it only increases the risk of severe side
                  effects such as pancreatitis and acute kidney injury.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── COMPOUNDING MATH ──────────────────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          Compounding Pharmacy Math: 5 mg/mL &amp; 10 mg Vials
        </h2>
        <div className="mt-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-4 text-sm text-slate-700">
          Compounded semaglutide is not FDA-regulated for safety or efficacy the
          same way branded pens are. Only use state-licensed compounding
          pharmacies and verify every calculation with your prescriber.
        </div>

        <p className="mt-6 font-semibold text-slate-900">
          If your vial is concentrated at 5 mg/mL (1 unit = 0.01 mL):
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {compoundingDoses.map((c) => (
            <div
              key={c.doseMg}
              className="rounded-2xl bg-white p-5 text-center ring-1 ring-slate-200"
            >
              <p className="text-lg font-bold text-emerald-600">{c.doseMg} mg</p>
              <p className="mt-1 text-sm text-slate-700">
                Draw <strong>{c.volumeMl} mL</strong>
              </p>
              <p className="text-xs text-slate-500">{c.units} units on syringe</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-violet-50 to-white p-6 ring-1 ring-violet-200">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">10</span>
            <div>
              <p className="text-lg font-bold text-slate-900">The &ldquo;10 mg Vial&rdquo; Explained</p>
              <p className="text-xs text-slate-500">How long a vial lasts depends on your weekly dose</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">On 0.25 mg starter</p>
              <p className="mt-1 text-lg font-bold text-amber-600">40 doses</p>
              <p className="mt-0.5 text-xs text-slate-500">technically, but vial expires after 28 days</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">On 2.4 mg maintenance</p>
              <p className="mt-1 text-lg font-bold text-emerald-600">~4 weeks</p>
              <p className="mt-0.5 text-xs text-slate-500">about 4.16 doses per vial</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            A &ldquo;10 mg vial&rdquo; refers to the total semaglutide in the
            bottle — how long it lasts depends on your weekly dose. On the
            0.25 mg starter dose a 10 mg vial technically contains 40 doses, but{" "}
            <strong className="text-slate-900">punctured vials generally must be discarded after 28 days</strong>{" "}
            to prevent bacterial contamination, so a large vial used for a starter
            dose often means wasted medication. On a 2.4 mg maintenance dose, a
            10 mg vial lasts roughly 4 weeks (about 4.16 doses).
          </p>
        </div>

        {/* ── REDDIT CLICK CHART ────────────────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          Dose Splitting &amp; the &ldquo;Click Chart&rdquo; Reddit Trend
        </h2>
        <p className="mt-2 text-slate-600">
          Online forums are full of &ldquo;click-counting&rdquo; threads — users
          extracting smaller doses from a 1 mg Ozempic pen (which delivers its
          full dose in ~74 clicks) to stretch a pen or mitigate nausea.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {clickDoses.map((c) => (
            <div
              key={c.doseMg}
              className="rounded-2xl bg-slate-50 p-5 text-center ring-1 ring-slate-200"
            >
              <p className="text-lg font-bold text-slate-900">{c.doseMg} mg</p>
              <p className="mt-1 text-sm text-slate-600">
                ≈ <strong>{c.clicks} clicks</strong>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border-l-4 border-rose-400 bg-rose-50 p-4 text-sm text-slate-700">
          <strong className="text-slate-900">The medical reality:</strong> The
          manufacturer does not endorse click-counting, and getting it wrong
          leads to dangerous under- or over-dosing. An Ozempic pen is only safe
          for 56 days after first puncture — stretching a 1 mg pen across 16
          weeks of 0.25 mg doses risks bacterial contamination and skin
          infections. Never attempt this without explicit medical supervision.
        </div>

        {/* ── STORAGE ───────────────────────────────────────────── */}
        <h2 className="mt-16 text-2xl font-bold text-slate-900 md:text-3xl">
          Storage Rules That Actually Matter
        </h2>
        <p className="mt-2 text-slate-600">
          Improper storage destroys your medication and makes precise dosing
          pointless.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {storageRules.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"
              style={{ borderTop: `4px solid ${s.brandColor}` }}
            >
              <p className="text-sm font-bold text-slate-900">{s.product}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {s.state}
              </p>
              <p className="mt-2 text-sm text-slate-600">{s.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────────────────
          FREE CALCULATOR + PREMIUM TRACKER  ★ USP ★
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
                GLP-1 Dose Calculator
              </h2>
              <p className="mt-2 text-slate-600">
                Enter your medication, vial concentration, and target dose. Get
                your exact draw volume, syringe units, and titration timeline in
                seconds — no signup.
              </p>
              <a
                href={GLP1_CALCULATOR_URL}
                className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Run a Free Dose Check →
              </a>
            </div>

            {/* PREMIUM → /product/glp-1-traker */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white ring-1 ring-slate-700">
              <span className="inline-block rounded-full bg-lime-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Premium Service
              </span>
              <h2 className="mt-4 text-2xl font-bold">Advanced GLP-1 Tracker</h2>
              <p className="mt-2 text-slate-300">
                Log every injection, auto-schedule your titration step-ups, track
                weight and side effects over time, and get refill reminders before
                your pen expires. Built for the long haul.
              </p>
              <Link
                href={GLP1_TRACKER_URL}
                className="mt-6 inline-block rounded-xl bg-lime-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-lime-400"
              >
                Explore the Premium Tracker →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAFETY / BLACK BOX ────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-rose-500 to-red-500" />
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Safety, Warnings &amp; the Limits of This Guide
          </h2>
        </div>
        <div className="mt-6 rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-lg">⚠️</span>
            <div>
              <span className="inline-block rounded-full bg-rose-200 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-rose-800">Boxed Warning</span>
              <p className="mt-1 text-sm font-semibold text-rose-900">FDA highest safety alert</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">
            Semaglutide carries a{" "}
            <strong className="text-slate-900">boxed warning</strong> for a potential risk of thyroid
            C-cell tumors (based on rodent studies). It is contraindicated for
            anyone with a personal or family history of Medullary Thyroid
            Carcinoma (MTC) or Multiple Endocrine Neoplasia syndrome type 2
            (MEN 2). Alert your provider immediately if you develop severe
            abdominal pain radiating to your back (a sign of pancreatitis),
            vision changes, or an unusual lump in your neck.
          </p>
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-5 ring-1 ring-slate-200">
          <span className="mt-0.5 text-xl">💊</span>
          <p className="text-sm leading-relaxed text-slate-600">
            Finding the correct dose is a balance between maximum benefit and
            tolerable side effects. Let this guide serve as your roadmap — but
            your body sets the final pace, and your prescriber has the final word.
          </p>
        </div>
      </section>

      {/* ── PDF GUIDE CTA ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-50 to-lime-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Take the dosage guide with you
          </h2>
          <p className="mt-3 text-slate-600">
            Download a free, printable semaglutide dosage guide — full titration
            schedule, Wegovy-vs-Ozempic comparison, compounding math, storage,
            and sources in one PDF.
          </p>
          <div className="mt-8 flex justify-center">
            <SemaglutideGuidePdfButton />
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: semaglutideFaqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            }),
          }}
        />
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-lime-500" />
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          {semaglutideFaqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm open:border-emerald-200 open:bg-emerald-50/50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
                <span className="pr-4">{f.q}</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-600 transition group-open:rotate-45 group-open:bg-emerald-200">
                  +
                </span>
              </summary>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-700">{f.a}</p>
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
            Every dosage figure in this guide is drawn from official prescribing
            information and peer-reviewed research.
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
            constitute medical advice. Prescription decisions, dose adjustments,
            and the use of compounding pharmacies must always be managed by a
            qualified, licensed healthcare provider who knows your full medical
            history.
          </p>
        </div>
      </section>

      {/* ── BOTTOM LINE / FINAL CTA ───────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            The Bottom Line
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Semaglutide works best when you respect the ladder: start at
            0.25 mg, step up every four weeks only as tolerated, and let your
            prescriber set the ceiling. Check your exact dose for free, then keep
            every injection on schedule with advanced tracking.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={GLP1_CALCULATOR_URL}
              className="inline-block rounded-xl bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:bg-emerald-400"
            >
              Free GLP-1 Dose Calculator →
            </a>
            <Link
              href={GLP1_TRACKER_URL}
              className="inline-block rounded-xl bg-lime-500 px-8 py-4 text-base font-bold text-slate-900 shadow-xl transition hover:bg-lime-400"
            >
              Get the Premium Tracker →
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
