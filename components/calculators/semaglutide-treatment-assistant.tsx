"use client";

/**
 * ============================================================
 * FILE 1: SEMAGLUTIDE TREATMENT ASSISTANT
 * calqulate.net · Calqulate Vitals
 *
 * Not a calculator that outputs a number, but an assistant that
 * answers the questions people are actually asking:
 *   · Am I on the right dose?          → FDA stage comparison
 *   · When should I increase?          → Next Standard Review
 *   · Why am I nauseous?               → Stage-based side effects
 *   · How much medication is active?   → PK model + gauge
 *   · Why has my weight loss slowed?   → Insights + premium preview
 *   · When is my next injection?       → Timeline
 *
 * Flow: Hero → Wizard (5 steps) → Snapshot → Insight →
 *       "What you'll miss" → Free CTA → Dashboard preview →
 *       Premium ("See What Happens Next") → Sticky mobile CTA
 * ============================================================
 */

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Droplets,
  Dumbbell,
  Gauge,
  Lock,
  LockOpen,
  Pill,
  Scale,
  Shield,
  Sparkles,
  Syringe,
  TrendingUp,
  UserX,
} from "lucide-react";
import {
  MEDICATIONS,
  HALF_LIFE_DAYS,
  STEADY_STATE_WEEKS,
  hero,
  wizard,
  snapshot,
  insightsByPhase,
  sideEffectsByPhase,
  appetiteByPhase,
  missTimeline,
  freeCta,
  dashboardPreview,
  premium,
  type Medication,
  type MedicationId,
  type DoseStep,
} from "@/lib/semaglutide/content";

/* ================================================================== */
/* VALIDATION (Zod)                                                    */
/* ================================================================== */

const formSchema = z.object({
  medication: z.enum(["wegovy", "ozempic", "compounded"]),
  doseMg: z.number({ invalid_type_error: "Select your weekly dose" }).positive(),
  weeks: z
    .number({ invalid_type_error: "Enter your weeks on treatment" })
    .int("Whole weeks only")
    .min(1, "Minimum 1 week")
    .max(260, "Maximum 260 weeks"),
  weight: z
    .number({ invalid_type_error: "Enter your current weight" })
    .min(30, "Weight seems too low")
    .max(700, "Weight seems too high"),
  unit: z.enum(["kg", "lb"]),
  goal: z.enum(["weight-loss", "diabetes", "maintenance"]),
});

type FormValues = z.infer<typeof formSchema>;

/* ================================================================== */
/* TREATMENT LOGIC: pure, testable                                    */
/* ================================================================== */

interface Result {
  med: Medication;
  week: number;
  doseMg: number;
  weightKg: number;
  phase: DoseStep["phase"];
  fdaStageLabel: string;
  expectedDoseMg: number;
  activityPct: number; // % of steady state at current dose
  nextReviewWeek: number | null;
  weeksOnCurrentDose: number;
  sideEffects: string;
  appetite: string;
  hydrationL: number;
  proteinG: number;
  pace: string;
  muscleRisk: "Low" | "Medium" | "High";
  status: string;
  statusTone: "green" | "amber";
  insight: string;
  pkCurve: { day: number; level: number }[]; // normalised 0..1 of max
  progressPct: number; // toward maintenance week
}

function stepForWeek(med: Medication, week: number): DoseStep {
  return (
    med.schedule.find((s) => week >= s.fromWeek && (s.toWeek === null || week <= s.toWeek)) ??
    med.schedule[med.schedule.length - 1]
  );
}

function computeResult(values: FormValues): Result {
  const med = MEDICATIONS.find((m) => m.id === values.medication)!;
  const week = values.weeks;
  const weightKg = values.unit === "kg" ? values.weight : values.weight * 0.4536;

  const expectedStep = stepForWeek(med, week);
  const phase = expectedStep.phase;

  // Weeks the user has been on their *current* dose (per schedule, best estimate)
  const doseStep = med.schedule.find((s) => s.doseMg === values.doseMg);
  const weeksOnCurrentDose = doseStep
    ? Math.max(1, week - doseStep.fromWeek + 1)
    : Math.min(week, STEADY_STATE_WEEKS);

  // Drug activity: accumulation toward steady state with t½ ≈ 7 days.
  // Fraction of steady state after n weekly doses = 1 − (1/2)^n
  const activityPct = Math.min(99, Math.round((1 - Math.pow(0.5, weeksOnCurrentDose)) * 100));

  // Next standard review = start of the next FDA schedule step
  const nextStep = med.schedule.find((s) => s.fromWeek > week);
  const nextReviewWeek = nextStep ? nextStep.fromWeek : null;

  // On-track status: compare actual dose to FDA-typical dose for this week
  const expectedDoseMg = expectedStep.doseMg;
  let status: string = snapshot.statusOnTrack;
  let statusTone: "green" | "amber" = "green";
  if (phase === "maintenance" && values.doseMg >= Math.min(...med.maintenanceDoseMg)) {
    status = snapshot.statusMaintenance;
  } else if (values.doseMg > expectedDoseMg) {
    status = snapshot.statusAhead;
    statusTone = "amber";
  } else if (values.doseMg < expectedDoseMg) {
    status = snapshot.statusBehind;
    statusTone = "amber";
  }

  // Personalised targets
  const proteinG = Math.round(weightKg * 1.4); // 1.2–1.6 g/kg midpoint
  const hydrationL = Math.round(weightKg * 0.033 * 10) / 10; // 33 ml/kg

  // Pace + muscle risk heuristics (educational)
  const pace =
    values.goal === "diabetes"
      ? "Gradual (glycemic focus)"
      : phase === "initiation"
        ? "Slow, expected at starting dose"
        : phase === "escalation"
          ? "Healthy (0.5–1% body weight/week typical)"
          : "Stabilising, plateau is normal";
  const muscleRisk: Result["muscleRisk"] =
    values.goal === "weight-loss" && phase === "escalation"
      ? "Medium"
      : values.goal === "weight-loss" && phase === "maintenance"
        ? "Medium"
        : "Low";

  // PK curve: superposition of weekly doses with exponential decay (t½ = 7 d)
  const k = Math.LN2 / HALF_LIFE_DAYS;
  const days = Math.min(week, 26) * 7 + 14; // cap chart at ~6 months + lookahead
  const startDay = Math.max(0, week * 7 - days);
  const pkCurve: { day: number; level: number }[] = [];
  let maxLevel = 0;
  const levels: number[] = [];
  for (let d = 0; d <= days; d++) {
    const absDay = startDay + d;
    let level = 0;
    for (let injWeek = 0; injWeek * 7 <= absDay && injWeek < week; injWeek++) {
      const injStep = stepForWeek(med, injWeek + 1);
      const dose = Math.min(injStep.doseMg, values.doseMg); // never above user's dose
      level += dose * Math.exp(-k * (absDay - injWeek * 7));
    }
    levels.push(level);
    if (level > maxLevel) maxLevel = level;
  }
  for (let d = 0; d <= days; d++) {
    pkCurve.push({ day: startDay + d, level: maxLevel > 0 ? levels[d] / maxLevel : 0 });
  }

  const maintenanceWeek = med.schedule[med.schedule.length - 1].fromWeek;
  const progressPct = Math.min(100, Math.round((week / maintenanceWeek) * 100));

  return {
    med,
    week,
    doseMg: values.doseMg,
    weightKg,
    phase,
    fdaStageLabel:
      phase === "initiation" ? "Treatment initiation" : phase === "escalation" ? "Dose escalation" : "Maintenance",
    expectedDoseMg,
    activityPct,
    nextReviewWeek,
    weeksOnCurrentDose,
    sideEffects: sideEffectsByPhase[phase],
    appetite: appetiteByPhase[phase],
    hydrationL,
    proteinG,
    pace,
    muscleRisk,
    status,
    statusTone,
    insight: insightsByPhase[phase](week),
    pkCurve,
    progressPct,
  };
}

/* ================================================================== */
/* SMALL UI PRIMITIVES (shadcn-style, self-contained)                  */
/* ================================================================== */

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx("glass-card", className)}>{children}</div>;
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
  gold = false,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  gold?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      className={clsx(
        "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-7 py-3 text-base font-semibold text-white shadow-lift transition-colors",
        gold ? "bg-gold-600 hover:bg-gold-700" : "bg-vital-600 hover:bg-vital-700",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function GhostButton({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx("min-h-[44px] rounded-full px-6 py-2.5 text-base font-medium text-ink-500 hover:text-ink-800", className)}
    >
      {children}
    </button>
  );
}

const trustIcons = { check: Check, shield: Shield, "user-x": UserX, lock: Lock } as const;

/* ================================================================== */
/* VISUALS                                                             */
/* ================================================================== */

/** Animated PK curve: estimated medication activity over time. */
function PkCurve({ curve, reduce }: { curve: Result["pkCurve"]; reduce: boolean }) {
  const W = 640;
  const H = 180;
  const pad = 8;
  const d = useMemo(() => {
    if (curve.length < 2) return "";
    const x = (i: number) => pad + (i / (curve.length - 1)) * (W - pad * 2);
    const y = (v: number) => H - pad - v * (H - pad * 2);
    return curve.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.level).toFixed(1)}`).join(" ");
  }, [curve]);

  return (
    <figure aria-label="Estimated semaglutide blood level over time" role="img">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <defs>
          <linearGradient id="pkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a9a63" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2a9a63" stopOpacity="0" />
          </linearGradient>
        </defs>
        {d && (
          <>
            <path d={`${d} L ${W - pad},${H - pad} L ${pad},${H - pad} Z`} fill="url(#pkFill)" />
            <motion.path
              d={d}
              fill="none"
              stroke="#1c7c4f"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </>
        )}
      </svg>
      <figcaption className="mt-1 text-xs text-ink-400">
        Estimated relative drug level (t½ ≈ 7 days). Weekly saw-tooth peaks are injection days.
      </figcaption>
    </figure>
  );
}

/** Progress ring: how far through titration toward maintenance. */
function ProgressRing({ pct, label, reduce }: { pct: number; label: string; reduce: boolean }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label}: ${pct}%`}>
      <svg viewBox="0 0 128 128" className="h-28 w-28">
        <circle cx="64" cy="64" r={R} fill="none" stroke="#eceef0" strokeWidth="10" />
        <motion.circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          stroke="#2a9a63"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          transform="rotate(-90 64 64)"
          initial={{ strokeDashoffset: reduce ? C * (1 - pct / 100) : C }}
          animate={{ strokeDashoffset: C * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text x="64" y="60" textAnchor="middle" className="fill-ink-900 text-[22px] font-bold">
          {pct}%
        </text>
        <text x="64" y="80" textAnchor="middle" className="fill-ink-400 text-[10px]">
          to maintenance
        </text>
      </svg>
      <span className="mt-1 text-xs font-medium text-ink-500">{label}</span>
    </div>
  );
}

/** Semicircular gauge: current estimated drug activity. */
function ActivityGauge({ pct, reduce }: { pct: number; reduce: boolean }) {
  const R = 56;
  const C = Math.PI * R; // half circumference
  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Estimated drug activity ${pct}%`}>
      <svg viewBox="0 0 140 84" className="h-24 w-40">
        <path d="M 14 76 A 56 56 0 0 1 126 76" fill="none" stroke="#eceef0" strokeWidth="12" strokeLinecap="round" />
        <motion.path
          d="M 14 76 A 56 56 0 0 1 126 76"
          fill="none"
          stroke="#e5b437"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: reduce ? C * (1 - pct / 100) : C }}
          animate={{ strokeDashoffset: C * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text x="70" y="66" textAnchor="middle" className="fill-ink-900 text-[24px] font-bold">
          {pct}%
        </text>
      </svg>
      <span className="mt-1 text-xs font-medium text-ink-500">Estimated Drug Activity</span>
    </div>
  );
}

/** Interactive dose timeline: Week 1 to 68, current position marked. */
function DoseTimeline({ result }: { result: Result }) {
  const TOTAL_WEEKS = 68;
  return (
    <div aria-label="Dose escalation timeline, week 1 to week 68">
      <div className="mb-2 flex justify-between text-xs text-ink-400">
        <span>Week 1</span>
        <span>Week 68</span>
      </div>
      <div className="relative flex h-10 w-full overflow-hidden rounded-full">
        {result.med.schedule.map((step, i) => {
          const from = step.fromWeek;
          const to = step.toWeek ?? TOTAL_WEEKS;
          const widthPct = ((to - from + 1) / TOTAL_WEEKS) * 100;
          const active = result.week >= from && result.week <= to;
          return (
            <div
              key={i}
              style={{ width: `${widthPct}%` }}
              className={clsx(
                "flex items-center justify-center border-r border-white/70 text-[10px] font-semibold sm:text-xs",
                active ? "bg-vital-500 text-white" : "bg-vital-100 text-vital-800",
              )}
              title={`${step.label}: ${step.doseMg} mg`}
            >
              {step.doseMg} mg
            </div>
          );
        })}
        {/* Current week marker */}
        <motion.div
          className="absolute top-0 h-full w-0.5 bg-ink-900"
          initial={{ left: 0 }}
          animate={{ left: `${Math.min((result.week / TOTAL_WEEKS) * 100, 99)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-xs text-ink-500">
        You are at <strong className="text-ink-800">week {result.week}</strong>. The marker shows your position on the{" "}
        {result.med.name} schedule.
      </p>
    </div>
  );
}

/* ================================================================== */
/* MAIN COMPONENT                                                      */
/* ================================================================== */

const TOTAL_STEPS = 5;

export default function TreatmentAssistant() {
  const reduce = useReducedMotion() ?? false;
  const [step, setStep] = useState(0); // 0 = hero not started
  const [result, setResult] = useState<Result | null>(null);
  const wizardRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const {
    register,
    setValue,
    watch,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { medication: "wegovy", unit: "lb", goal: "weight-loss" },
    mode: "onTouched",
  });

  const medication = watch("medication");
  const doseMg = watch("doseMg");
  const goal = watch("goal");
  const unit = watch("unit");
  const med = MEDICATIONS.find((m) => m.id === medication)!;

  const fieldsPerStep: (keyof FormValues)[][] = [["medication"], ["doseMg"], ["weeks"], ["weight"], ["goal"]];

  async function next() {
    const valid = await trigger(fieldsPerStep[step - 1]);
    if (!valid) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  const onSubmit = handleSubmit((values) => {
    setResult(computeResult(values));
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  });

  function start() {
    setStep(1);
    requestAnimationFrame(() => wizardRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }));
  }

  const slide = {
    initial: { opacity: 0, x: reduce ? 0 : 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduce ? 0 : -32 },
    transition: { duration: 0.28, ease: "easeOut" as const },
  };

  return (
    <div className="relative">
      {/* ============================ HERO ============================ */}
      <section className="mx-auto max-w-5xl px-4 pb-10 pt-12 text-center sm:pt-20">
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-vital-50 px-4 py-1.5 text-sm font-medium text-vital-700"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {hero.eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl"
        >
          {hero.headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-500"
        >
          {hero.subheadline}
        </motion.p>

        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-600"
        >
          {hero.trustBadges.map((b) => {
            const Icon = trustIcons[b.icon as keyof typeof trustIcons];
            return (
              <li key={b.text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-vital-600" aria-hidden="true" />
                {b.text}
              </li>
            );
          })}
        </motion.ul>

        <motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-8">
          <PrimaryButton onClick={start}>
            {hero.cta}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </PrimaryButton>
        </motion.div>
      </section>

      {/* ========================== WIZARD ============================ */}
      <section ref={wizardRef} aria-label="Semaglutide dose calculator" className="mx-auto max-w-xl px-4 pb-16">
        <Card className="p-6 sm:p-8">
          {step === 0 && (
            <div className="py-6 text-center">
              <Syringe className="mx-auto h-10 w-10 text-vital-500" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-ink-800">Ready when you are</p>
              <p className="mt-1 text-sm text-ink-500">5 quick questions · instant snapshot · nothing stored</p>
              <PrimaryButton onClick={start} className="mt-6">
                {hero.cta}
              </PrimaryButton>
            </div>
          )}

          {step > 0 && !result && (
            <form onSubmit={onSubmit} noValidate>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-vital-700">{wizard.stepLabel(step, TOTAL_STEPS)}</span>
                  <span className="text-ink-400">{wizard.steps[step - 1].id}</span>
                </div>
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100"
                  role="progressbar"
                  aria-valuenow={step}
                  aria-valuemin={1}
                  aria-valuemax={TOTAL_STEPS}
                  aria-label={`Question ${step} of ${TOTAL_STEPS}`}
                >
                  <motion.div
                    className="h-full rounded-full bg-vital-500"
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* Q1: Medication */}
                {step === 1 && (
                  <motion.fieldset key="q1" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[0].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[0].helper}</p>
                    <div className="mt-5 grid gap-3">
                      {MEDICATIONS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setValue("medication", m.id as MedicationId, { shouldValidate: true });
                            setValue("doseMg", undefined as unknown as number);
                          }}
                          className={clsx(
                            "flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            medication === m.id
                              ? "border-vital-500 bg-vital-50"
                              : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={medication === m.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{m.name}</span>
                            <span className="block text-sm text-ink-500">{m.genericLabel}</span>
                          </span>
                          {medication === m.id && <Check className="h-5 w-5 text-vital-600" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}

                {/* Q2: Dose */}
                {step === 2 && (
                  <motion.fieldset key="q2" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[1].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[1].helper}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {med.doses.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setValue("doseMg", d, { shouldValidate: true })}
                          className={clsx(
                            "rounded-2xl border-2 px-4 py-4 text-center font-semibold transition-colors",
                            doseMg === d ? "border-vital-500 bg-vital-50 text-vital-800" : "border-ink-100 bg-white text-ink-700 hover:border-vital-200",
                          )}
                          aria-pressed={doseMg === d}
                        >
                          {d} mg
                        </button>
                      ))}
                    </div>
                    {errors.doseMg && <p role="alert" className="mt-3 text-sm text-red-600">{errors.doseMg.message}</p>}
                  </motion.fieldset>
                )}

                {/* Q3: Weeks */}
                {step === 3 && (
                  <motion.div key="q3" {...slide}>
                    <label htmlFor="weeks" className="text-xl font-semibold text-ink-900">
                      {wizard.steps[2].question}
                    </label>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[2].helper}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <input
                        id="weeks"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={260}
                        placeholder="e.g. 7"
                        {...register("weeks", { valueAsNumber: true })}
                        className="w-36 rounded-2xl border-2 border-ink-100 bg-white px-4 py-3 text-lg font-semibold text-ink-900 focus:border-vital-500"
                        aria-invalid={!!errors.weeks}
                        aria-describedby={errors.weeks ? "weeks-error" : undefined}
                      />
                      <span className="text-ink-500">weeks</span>
                    </div>
                    {errors.weeks && <p id="weeks-error" role="alert" className="mt-3 text-sm text-red-600">{errors.weeks.message}</p>}
                  </motion.div>
                )}

                {/* Q4: Weight */}
                {step === 4 && (
                  <motion.div key="q4" {...slide}>
                    <label htmlFor="weight" className="text-xl font-semibold text-ink-900">
                      {wizard.steps[3].question}
                    </label>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[3].helper}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <input
                        id="weight"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        placeholder={unit === "kg" ? "e.g. 84" : "e.g. 185"}
                        {...register("weight", { valueAsNumber: true })}
                        className="w-36 rounded-2xl border-2 border-ink-100 bg-white px-4 py-3 text-lg font-semibold text-ink-900 focus:border-vital-500"
                        aria-invalid={!!errors.weight}
                        aria-describedby={errors.weight ? "weight-error" : undefined}
                      />
                      <div role="group" aria-label="Weight unit" className="flex overflow-hidden rounded-full border border-ink-200">
                        {(["lb", "kg"] as const).map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setValue("unit", u)}
                            aria-pressed={unit === u}
                            className={clsx("px-4 py-2 text-sm font-semibold", unit === u ? "bg-vital-600 text-white" : "bg-white text-ink-500")}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    {errors.weight && <p id="weight-error" role="alert" className="mt-3 text-sm text-red-600">{errors.weight.message}</p>}
                  </motion.div>
                )}

                {/* Q5: Goal */}
                {step === 5 && (
                  <motion.fieldset key="q5" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[4].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[4].helper}</p>
                    <div className="mt-5 grid gap-3">
                      {wizard.goals.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setValue("goal", g.id as FormValues["goal"], { shouldValidate: true })}
                          className={clsx(
                            "flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            goal === g.id ? "border-vital-500 bg-vital-50" : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={goal === g.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{g.label}</span>
                            <span className="block text-sm text-ink-500">{g.desc}</span>
                          </span>
                          {goal === g.id && <Check className="h-5 w-5 text-vital-600" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}
              </AnimatePresence>

              {/* Nav */}
              <div className="mt-8 flex items-center justify-between">
                <GhostButton onClick={() => setStep(Math.max(1, step - 1))} className={clsx(step === 1 && "invisible")}>
                  <span className="inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {wizard.back}
                  </span>
                </GhostButton>
                {step < TOTAL_STEPS ? (
                  <PrimaryButton onClick={next}>
                    {wizard.next} <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </PrimaryButton>
                ) : (
                  <PrimaryButton type="submit">{wizard.finish}</PrimaryButton>
                )}
              </div>
            </form>
          )}

          {result && (
            <div className="py-4 text-center">
              <Check className="mx-auto h-8 w-8 rounded-full bg-vital-100 p-1.5 text-vital-700" aria-hidden="true" />
              <p className="mt-3 font-medium text-ink-800">Snapshot ready, see below</p>
              <GhostButton
                onClick={() => {
                  setResult(null);
                  setStep(1);
                }}
              >
                Recalculate
              </GhostButton>
            </div>
          )}
        </Card>
      </section>

      {/* ====================== RESULT SNAPSHOT ======================= */}
      {result && (
        <div ref={resultRef}>
          <section aria-labelledby="snapshot-title" className="mx-auto max-w-5xl scroll-mt-6 px-4 pb-16">
            <motion.div initial={{ opacity: 0, y: reduce ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 id="snapshot-title" className="text-center text-3xl font-bold tracking-tight text-ink-900">
                {snapshot.title}
              </h2>
              <p className="mt-2 text-center text-ink-500">{snapshot.subtitle}</p>

              {/* Status banner */}
              <div
                className={clsx(
                  "mx-auto mt-6 w-fit rounded-full px-5 py-2 text-sm font-semibold",
                  result.statusTone === "green" ? "bg-vital-50 text-vital-800" : "bg-gold-50 text-gold-800",
                )}
              >
                {snapshot.labels.status}: {result.status}
              </div>

              {/* Metric grid */}
              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { icon: Activity, label: snapshot.labels.stage, value: `Week ${result.week}` },
                  { icon: Pill, label: snapshot.labels.dose, value: `${result.doseMg} mg` },
                  { icon: Shield, label: snapshot.labels.fdaStage, value: result.fdaStageLabel },
                  { icon: Gauge, label: snapshot.labels.activity, value: `${result.activityPct}%` },
                  {
                    icon: TrendingUp,
                    label: snapshot.labels.nextReview,
                    value: result.nextReviewWeek ? `Week ${result.nextReviewWeek}` : "At maintenance",
                  },
                  { icon: Syringe, label: snapshot.labels.sideEffects, value: result.sideEffects },
                  { icon: Scale, label: snapshot.labels.appetite, value: result.appetite },
                  { icon: Droplets, label: snapshot.labels.hydration, value: `${result.hydrationL} L/day` },
                  { icon: Dumbbell, label: snapshot.labels.protein, value: `${result.proteinG} g/day` },
                  { icon: TrendingUp, label: snapshot.labels.pace, value: result.pace },
                  { icon: Dumbbell, label: snapshot.labels.muscleRisk, value: result.muscleRisk },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.06 * i }}
                    className="glass-card p-4"
                  >
                    <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
                      <m.icon className="h-3.5 w-3.5 text-vital-600" aria-hidden="true" />
                      {m.label}
                    </dt>
                    <dd className="mt-1.5 text-base font-semibold leading-snug text-ink-900">{m.value}</dd>
                  </motion.div>
                ))}
              </dl>

              {/* Insight: explain WHY, not just the result */}
              <Card className="mt-6 border-l-4 border-l-vital-500 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-vital-700">What this means</h3>
                <p className="mt-2 leading-relaxed text-ink-700">{result.insight}</p>
              </Card>

              {/* Visuals */}
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                  <h3 className="mb-4 text-sm font-semibold text-ink-800">Medication Activity (PK curve)</h3>
                  <PkCurve curve={result.pkCurve} reduce={reduce} />
                </Card>
                <Card className="flex flex-col items-center justify-center gap-6 p-6">
                  <ProgressRing pct={result.progressPct} label="Treatment Stage" reduce={reduce} />
                  <ActivityGauge pct={result.activityPct} reduce={reduce} />
                </Card>
              </div>

              <Card className="mt-4 p-6">
                <h3 className="mb-4 text-sm font-semibold text-ink-800">Dose Timeline: {result.med.name}</h3>
                <DoseTimeline result={result} />
              </Card>

              <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">{snapshot.disclaimer}</p>
            </motion.div>
          </section>

          {/* ============ "WHAT YOU'LL MISS" (differentiator) ============ */}
          <section aria-labelledby="miss-title" className="mx-auto max-w-2xl px-4 pb-14">
            <Card className="p-6 sm:p-8">
              <h2 id="miss-title" className="text-center text-2xl font-bold text-ink-900">
                {missTimeline.headline}
              </h2>
              <ul className="mt-6 space-y-3">
                {missTimeline.rows.map((row, i) => (
                  <motion.li
                    key={row.week}
                    initial={{ opacity: 0, x: reduce ? 0 : -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: reduce ? 0 : i * 0.08 }}
                    className={clsx(
                      "flex items-center gap-3 rounded-2xl px-4 py-3",
                      row.unlocked ? "bg-vital-50" : "bg-ink-50",
                    )}
                  >
                    {row.unlocked ? (
                      <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />
                    ) : (
                      <Lock className="h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                    )}
                    <span className="w-16 shrink-0 text-sm font-semibold text-ink-500">{row.week}</span>
                    <span className={clsx("font-medium", row.unlocked ? "text-ink-800" : "text-ink-500")}>{row.text}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-7 text-center">
                <PrimaryButton onClick={() => (window.location.href = "/signup")}>{missTimeline.cta}</PrimaryButton>
              </div>
            </Card>
          </section>

          {/* ==================== FREE SIGN-UP CTA ======================= */}
          <section aria-labelledby="free-cta-title" className="mx-auto max-w-2xl px-4 pb-14">
            <Card className="p-6 text-center sm:p-8">
              <h2 id="free-cta-title" className="text-2xl font-bold text-ink-900">{freeCta.headline}</h2>
              <p className="mt-2 text-ink-500">{freeCta.body}</p>
              <ul className="mx-auto mt-5 max-w-md space-y-2 text-left">
                {freeCta.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-ink-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-col items-center gap-2">
                <PrimaryButton onClick={() => (window.location.href = "/signup")}>{freeCta.primary}</PrimaryButton>
                <GhostButton onClick={() => resultRef.current?.scrollIntoView({ behavior: "smooth" })}>
                  {freeCta.secondary}
                </GhostButton>
                <span className="mt-1 rounded-full bg-vital-50 px-3 py-1 text-xs font-semibold text-vital-700">{freeCta.badge}</span>
              </div>
            </Card>
          </section>

          {/* =================== DASHBOARD PREVIEW ====================== */}
          <section aria-labelledby="dash-title" className="mx-auto max-w-4xl px-4 pb-14">
            <h2 id="dash-title" className="text-center text-2xl font-bold text-ink-900">{dashboardPreview.title}</h2>
            <div className="relative mt-6">
              <div aria-hidden="true" className="grid select-none grid-cols-2 gap-3 blur-[6px] sm:grid-cols-4">
                {dashboardPreview.tiles.map((tile) => (
                  <div key={tile} className="glass-card flex h-28 flex-col justify-between p-4">
                    <span className="text-xs font-medium text-ink-400">{tile}</span>
                    <div className="h-8 rounded-lg bg-gradient-to-r from-vital-100 to-vital-200" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="rounded-full bg-vital-600 px-3 py-1 text-xs font-semibold text-white shadow-lift">
                  {dashboardPreview.badge}
                </span>
                <PrimaryButton onClick={() => (window.location.href = "/signup")}>
                  {dashboardPreview.cta} <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </PrimaryButton>
              </div>
            </div>
          </section>

          {/* ================= PREMIUM: SEE WHAT'S NEXT ================= */}
          <section aria-labelledby="premium-title" className="mx-auto max-w-5xl px-4 pb-16">
            <div className="rounded-card bg-gradient-to-b from-gold-50 to-white p-6 shadow-soft sm:p-10">
              <h2 id="premium-title" className="text-center text-3xl font-bold tracking-tight text-ink-900">
                {premium.headline}
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-center leading-relaxed text-ink-600">{premium.body}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {premium.cards.map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: reduce ? 0 : i * 0.06 }}
                    className="glass-card flex flex-col p-5"
                  >
                    <LockOpen className="h-5 w-5 text-gold-600" aria-hidden="true" />
                    <h3 className="mt-3 font-semibold text-ink-900">{card.title}</h3>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-500">{card.desc}</p>
                    {card.cta && (
                      <button
                        type="button"
                        onClick={() => (window.location.href = "/vitals")}
                        className="mt-4 text-left text-sm font-semibold text-gold-700 hover:text-gold-800"
                      >
                        {card.cta} →
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <PrimaryButton gold onClick={() => (window.location.href = "/vitals")}>
                  {premium.primary}
                </PrimaryButton>
                <GhostButton onClick={() => (window.location.href = "/vitals")}>{premium.secondary}</GhostButton>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ==================== STICKY MOBILE CTA ======================== */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ y: reduce ? 0 : 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/90 p-3 backdrop-blur-glass sm:hidden"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <PrimaryButton onClick={() => (window.location.href = "/signup")} className="w-full">
              {freeCta.primary}
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
