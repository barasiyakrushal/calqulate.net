"use client";

/**
 * ============================================================
 * GLP-1 DRUG ACTIVITY ASSISTANT
 * calqulate.net · Calqulate Vitals
 *
 * Not a half-life calculator. It answers what people actually ask:
 *   · Is my medication still working?   → % of peak still active
 *   · Why am I hungry today?            → Activity band + meaning
 *   · Should I inject today?            → Injection countdown
 *   · Why do I feel different on Day 6? → Weekly drug curve
 *   · I delayed my injection, is that a problem? → Catch-up window
 *
 * Flow: Hero → Wizard (5 steps) → Today's medication → Visuals →
 *       Free features → Free CTA → Dashboard preview →
 *       Premium ("See Tomorrow Before It Happens") → Daily story
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
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Dumbbell,
  Flame,
  Gauge,
  HeartPulse,
  Lock,
  LockOpen,
  Pill,
  Shield,
  Sparkles,
  Syringe,
  UserX,
  Utensils,
} from "lucide-react";
import {
  MEDICATIONS,
  WEEKDAYS,
  ACTIVITY_BANDS,
  hero,
  wizard,
  result as resultCopy,
  timing,
  freeFeatures,
  freeCta,
  dashboardPreview,
  premium,
  dailyStory,
  type ActivityBand,
  type AppetiteId,
  type Medication,
  type MedicationId,
} from "@/lib/glp1-half-life/content";

/* ================================================================== */
/* VALIDATION (Zod)                                                    */
/* ================================================================== */

const formSchema = z.object({
  medication: z.enum(["semaglutide", "tirzepatide", "ozempic", "wegovy", "mounjaro", "zepbound"]),
  doseMg: z.number({ invalid_type_error: "Select your weekly dose" }).positive(),
  weight: z
    .number({ invalid_type_error: "Enter your current weight" })
    .min(30, "Weight seems too low")
    .max(700, "Weight seems too high"),
  unit: z.enum(["kg", "lb"]),
  injectionDate: z.string().min(1, "Pick the date of your last injection"),
  injectionTime: z.string().min(1, "Pick roughly what time you injected"),
  typicalDay: z.number().int().min(0).max(6),
  appetite: z.enum(["very-hungry", "normal", "low"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

/* ================================================================== */
/* DRUG ACTIVITY LOGIC: pure, testable                                 */
/* ================================================================== */

const HOUR_MS = 3600_000;
const DAY_MS = 24 * HOUR_MS;

interface Result {
  med: Medication;
  doseMg: number;
  weightKg: number;
  daysSince: number;
  activePct: number; // % of peak level still present
  band: ActivityBand;
  troughPct: number; // % of peak remaining at the end of a 7-day interval
  nextInjectionAt: Date;
  hoursToNext: number; // negative when overdue
  countdownLabel: string;
  status: string;
  statusTone: "green" | "amber";
  scheduleNote: string;
  proteinG: number;
  hydrationL: number;
  appetiteMismatch: string | null;
  curve: { day: number; level: number }[]; // 0 to 8 days after injection
}

/** Next dose lands on the usual injection weekday, at least 3 days after the last shot. */
function nextInjectionDate(lastInjection: Date, typicalDay: number): Date {
  const next = new Date(lastInjection.getTime());
  let daysAhead = (typicalDay - lastInjection.getDay() + 7) % 7;
  if (daysAhead === 0) daysAhead = 7; // injected on the usual day, so next week
  next.setDate(next.getDate() + daysAhead);
  // Consecutive doses must stay at least 3 days apart.
  if (next.getTime() - lastInjection.getTime() < 3 * DAY_MS) {
    next.setDate(next.getDate() + 7);
  }
  return next;
}

function computeResult(values: FormValues, now: Date): Result {
  const med = MEDICATIONS.find((m) => m.id === values.medication)!;
  const weightKg = values.unit === "kg" ? values.weight : values.weight * 0.4536;

  const lastInjection = new Date(`${values.injectionDate}T${values.injectionTime}`);
  const daysSince = Math.max(0, (now.getTime() - lastInjection.getTime()) / DAY_MS);

  // At steady state, the level relative to the weekly peak decays exponentially.
  const k = Math.LN2 / med.halfLifeDays;
  const activePct = Math.round(Math.exp(-k * daysSince) * 100);
  const troughPct = Math.round(Math.exp(-k * 7) * 100);
  const band = ACTIVITY_BANDS.find((b) => activePct >= b.min) ?? ACTIVITY_BANDS[ACTIVITY_BANDS.length - 1];

  const nextInjectionAt = nextInjectionDate(lastInjection, values.typicalDay);
  const hoursToNext = (nextInjectionAt.getTime() - now.getTime()) / HOUR_MS;

  let countdownLabel: string;
  let status: string;
  let statusTone: "green" | "amber" = "green";
  if (hoursToNext >= 24) {
    countdownLabel = timing.dueIn(Math.floor(hoursToNext / 24), Math.round(hoursToNext % 24));
    status = timing.statusOnTrack;
  } else if (hoursToNext >= 0) {
    countdownLabel = timing.dueIn(0, Math.max(1, Math.round(hoursToNext)));
    status = timing.statusDueToday;
  } else {
    const overdueDays = Math.floor(-hoursToNext / 24);
    countdownLabel = overdueDays < 1 ? timing.dueNow : timing.overdue(overdueDays);
    statusTone = "amber";
    status =
      overdueDays <= med.missedDoseWindowDays ? timing.statusOverdueInWindow : timing.statusOverdueOutsideWindow;
  }

  const injectedOnUsualDay = lastInjection.getDay() === values.typicalDay;

  // If reported appetite contradicts the modelled drug level, say so plainly.
  let appetiteMismatch: string | null = null;
  if (values.appetite === "very-hungry" && activePct >= 75) {
    appetiteMismatch =
      "You reported strong hunger while your estimated drug level is still high. That combination usually points at food rather than medication: under-eating protein, or too few calories overall earlier in the week, both bring hunger back even at a high drug level. If it persists across several weeks at this point in your cycle, mention it to your prescriber.";
  } else if (values.appetite === "low" && activePct < 45) {
    appetiteMismatch =
      "Your appetite is still low even though your estimated drug level is near its weekly trough, which is a good sign that your current dose is working well for you. It is also worth checking that low appetite is not costing you protein, because that is what protects muscle while you lose fat.";
  }

  const proteinG = Math.round(weightKg * 1.4); // 1.2 to 1.6 g/kg midpoint
  const hydrationL = Math.round(weightKg * 0.033 * 10) / 10; // 33 ml/kg

  const curve = Array.from({ length: 33 }, (_, i) => {
    const day = i / 4; // quarter-day resolution across 8 days
    return { day, level: Math.exp(-k * day) };
  });

  return {
    med,
    doseMg: values.doseMg,
    weightKg,
    daysSince,
    activePct,
    band,
    troughPct,
    nextInjectionAt,
    hoursToNext,
    countdownLabel,
    status,
    statusTone,
    scheduleNote: injectedOnUsualDay ? timing.onTrackNote : timing.offDayNote,
    proteinG,
    hydrationL,
    appetiteMismatch,
    curve,
  };
}

/* ================================================================== */
/* SMALL UI PRIMITIVES                                                 */
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

function GhostButton({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "min-h-[44px] rounded-full px-6 py-2.5 text-base font-medium text-ink-500 hover:text-ink-800",
        className,
      )}
    >
      {children}
    </button>
  );
}

const trustIcons = { check: Check, shield: Shield, "user-x": UserX, lock: Lock } as const;

/* ================================================================== */
/* VISUALS                                                             */
/* ================================================================== */

/** Weekly drug level curve with a "you are here" marker. */
function DrugCurve({ result, reduce }: { result: Result; reduce: boolean }) {
  const W = 640;
  const H = 200;
  const padX = 10;
  const padY = 14;
  const MAX_DAYS = 8;

  const x = (day: number) => padX + (day / MAX_DAYS) * (W - padX * 2);
  const y = (level: number) => H - padY - level * (H - padY * 2);

  const d = useMemo(
    () => result.curve.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.day).toFixed(1)},${y(p.level).toFixed(1)}`).join(" "),
    [result.curve],
  );

  const todayX = x(Math.min(result.daysSince, MAX_DAYS));
  const todayY = y(result.activePct / 100);

  return (
    <figure aria-label={`Estimated ${result.med.name} level across your injection week`} role="img">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <defs>
          <linearGradient id="hlFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a9a63" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2a9a63" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Day 7: when the next dose is due */}
        <line x1={x(7)} y1={padY} x2={x(7)} y2={H - padY} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />
        <text x={x(7) - 4} y={padY + 10} textAnchor="end" className="fill-ink-400 text-[10px]">
          next dose due
        </text>

        <path d={`${d} L ${x(MAX_DAYS)},${H - padY} L ${padX},${H - padY} Z`} fill="url(#hlFill)" />
        <motion.path
          d={d}
          fill="none"
          stroke="#1c7c4f"
          strokeWidth={3}
          strokeLinecap="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* You are here */}
        <motion.g
          initial={{ opacity: reduce ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 1 }}
        >
          <line x1={todayX} y1={todayY} x2={todayX} y2={H - padY} stroke="#0f172a" strokeWidth={1.5} />
          <circle cx={todayX} cy={todayY} r={6} fill="#0f172a" />
          <circle cx={todayX} cy={todayY} r={11} fill="#0f172a" fillOpacity={0.12} />
        </motion.g>
      </svg>

      <div className="mt-1 flex justify-between text-xs text-ink-400">
        <span>Injection day</span>
        <span>Day 4</span>
        <span>Day 8</span>
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-ink-500">
        Estimated level as a share of your weekly peak (t½ ≈ {result.med.halfLifeDays} days). The dot is where you are
        right now. By day 7, about {result.troughPct}% of the peak remains, which is the weekly low point your next
        injection resets.
      </figcaption>
    </figure>
  );
}

/** Circular ring: today's medication as a percentage of peak. */
function ActivityRing({ pct, reduce }: { pct: number; reduce: boolean }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center" role="img" aria-label={`Estimated active medication ${pct}%`}>
      <svg viewBox="0 0 128 128" className="h-32 w-32">
        <circle cx="64" cy="64" r={R} fill="none" stroke="#eceef0" strokeWidth="11" />
        <motion.circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          stroke="#2a9a63"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={C}
          transform="rotate(-90 64 64)"
          initial={{ strokeDashoffset: reduce ? C * (1 - pct / 100) : C }}
          animate={{ strokeDashoffset: C * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text x="64" y="62" textAnchor="middle" className="fill-ink-900 text-[26px] font-bold">
          {pct}%
        </text>
        <text x="64" y="80" textAnchor="middle" className="fill-ink-400 text-[10px]">
          of peak
        </text>
      </svg>
      <span className="mt-1 text-xs font-medium text-ink-500">Estimated Active Medication</span>
    </div>
  );
}

/** Injection → peak → decline → next injection. */
function ActivityTimeline({ result }: { result: Result }) {
  const stages = [
    { icon: Syringe, label: "Injection", note: "Dose goes in" },
    { icon: Flame, label: "Peak", note: "Day 1 to 2, strongest effect" },
    { icon: Activity, label: "Decline", note: "Day 3 to 6, effect eases" },
    { icon: CalendarClock, label: "Next Injection", note: result.countdownLabel },
  ];

  // Which stage you are in right now.
  const current = result.hoursToNext <= 0 ? 3 : result.daysSince < 2 ? 1 : result.daysSince < 6 ? 2 : 3;

  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {stages.map((s, i) => {
        const active = i === current;
        return (
          <li
            key={s.label}
            className={clsx(
              "rounded-2xl border-2 p-4 transition-colors",
              active ? "border-vital-500 bg-vital-50" : "border-ink-100 bg-white",
            )}
            aria-current={active ? "step" : undefined}
          >
            <s.icon
              className={clsx("h-5 w-5", active ? "text-vital-600" : "text-ink-400")}
              aria-hidden="true"
            />
            <p className={clsx("mt-2 text-sm font-semibold", active ? "text-vital-800" : "text-ink-700")}>{s.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{s.note}</p>
          </li>
        );
      })}
    </ol>
  );
}

/* ================================================================== */
/* MAIN COMPONENT                                                      */
/* ================================================================== */

const TOTAL_STEPS = 5;

export default function Glp1DrugActivityAssistant() {
  const reduce = useReducedMotion() ?? false;
  const [step, setStep] = useState(0); // 0 = not started
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
    defaultValues: { medication: "semaglutide", unit: "lb", injectionTime: "09:00", typicalDay: 1 },
    mode: "onTouched",
  });

  const medication = watch("medication");
  const doseMg = watch("doseMg");
  const unit = watch("unit");
  const typicalDay = watch("typicalDay");
  const appetite = watch("appetite");
  const med = MEDICATIONS.find((m) => m.id === medication)!;

  const fieldsPerStep: (keyof FormValues)[][] = [
    ["medication"],
    ["doseMg", "weight"],
    ["injectionDate", "injectionTime"],
    ["typicalDay"],
    ["appetite"],
  ];

  async function next() {
    const valid = await trigger(fieldsPerStep[step - 1]);
    if (!valid) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  const onSubmit = handleSubmit((values) => {
    // `new Date()` runs in an event handler, so it never reaches the server render.
    setResult(computeResult(values, new Date()));
    requestAnimationFrame(() =>
      resultRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }),
    );
  });

  function start() {
    setStep(1);
    requestAnimationFrame(() =>
      wizardRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }),
    );
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

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mt-8"
        >
          <PrimaryButton onClick={start}>
            {hero.cta}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </PrimaryButton>
        </motion.div>
      </section>

      {/* ========================== WIZARD ============================ */}
      <section ref={wizardRef} aria-label="GLP-1 half-life calculator" className="mx-auto max-w-xl px-4 pb-16">
        <Card className="p-6 sm:p-8">
          {step === 0 && (
            <div className="py-6 text-center">
              <Syringe className="mx-auto h-10 w-10 text-vital-500" aria-hidden="true" />
              <p className="mt-4 text-lg font-medium text-ink-800">Ready when you are</p>
              <p className="mt-1 text-sm text-ink-500">5 quick questions · instant answer · nothing stored</p>
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
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                            <span className="block text-xs text-ink-500">t½ ≈ {m.halfLifeDays} days</span>
                          </span>
                          {medication === m.id && <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}

                {/* Q2: Dose and weight */}
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
                            doseMg === d
                              ? "border-vital-500 bg-vital-50 text-vital-800"
                              : "border-ink-100 bg-white text-ink-700 hover:border-vital-200",
                          )}
                          aria-pressed={doseMg === d}
                        >
                          {d} mg
                        </button>
                      ))}
                    </div>
                    {errors.doseMg && (
                      <p role="alert" className="mt-3 text-sm text-red-600">
                        {errors.doseMg.message}
                      </p>
                    )}

                    <label htmlFor="weight" className="mt-7 block text-sm font-semibold text-ink-800">
                      Your current weight
                    </label>
                    <div className="mt-2 flex items-center gap-3">
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
                      <div
                        role="group"
                        aria-label="Weight unit"
                        className="flex overflow-hidden rounded-full border border-ink-200"
                      >
                        {(["lb", "kg"] as const).map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setValue("unit", u)}
                            aria-pressed={unit === u}
                            className={clsx(
                              "px-4 py-2 text-sm font-semibold",
                              unit === u ? "bg-vital-600 text-white" : "bg-white text-ink-500",
                            )}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                    {errors.weight && (
                      <p id="weight-error" role="alert" className="mt-3 text-sm text-red-600">
                        {errors.weight.message}
                      </p>
                    )}
                  </motion.fieldset>
                )}

                {/* Q3: Last injection */}
                {step === 3 && (
                  <motion.fieldset key="q3" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[2].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[2].helper}</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="injectionDate" className="block text-sm font-semibold text-ink-800">
                          Date
                        </label>
                        <input
                          id="injectionDate"
                          type="date"
                          {...register("injectionDate")}
                          className="mt-2 w-full rounded-2xl border-2 border-ink-100 bg-white px-4 py-3 text-base font-semibold text-ink-900 focus:border-vital-500"
                          aria-invalid={!!errors.injectionDate}
                        />
                        {errors.injectionDate && (
                          <p role="alert" className="mt-2 text-sm text-red-600">
                            {errors.injectionDate.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="injectionTime" className="block text-sm font-semibold text-ink-800">
                          Time
                        </label>
                        <input
                          id="injectionTime"
                          type="time"
                          {...register("injectionTime")}
                          className="mt-2 w-full rounded-2xl border-2 border-ink-100 bg-white px-4 py-3 text-base font-semibold text-ink-900 focus:border-vital-500"
                          aria-invalid={!!errors.injectionTime}
                        />
                        {errors.injectionTime && (
                          <p role="alert" className="mt-2 text-sm text-red-600">
                            {errors.injectionTime.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.fieldset>
                )}

                {/* Q4: Typical injection day */}
                {step === 4 && (
                  <motion.fieldset key="q4" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[3].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[3].helper}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {WEEKDAYS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setValue("typicalDay", d.id, { shouldValidate: true })}
                          className={clsx(
                            "rounded-2xl border-2 px-4 py-3 text-center font-semibold transition-colors",
                            typicalDay === d.id
                              ? "border-vital-500 bg-vital-50 text-vital-800"
                              : "border-ink-100 bg-white text-ink-700 hover:border-vital-200",
                          )}
                          aria-pressed={typicalDay === d.id}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}

                {/* Q5: Appetite (optional) */}
                {step === 5 && (
                  <motion.fieldset key="q5" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[4].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[4].helper}</p>
                    <div className="mt-5 grid gap-3">
                      {wizard.appetites.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setValue("appetite", a.id as AppetiteId, { shouldValidate: true })}
                          className={clsx(
                            "flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            appetite === a.id
                              ? "border-vital-500 bg-vital-50"
                              : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={appetite === a.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{a.label}</span>
                            <span className="block text-sm text-ink-500">{a.desc}</span>
                          </span>
                          {appetite === a.id && <Check className="h-5 w-5 text-vital-600" aria-hidden="true" />}
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
              <p className="mt-3 font-medium text-ink-800">Result ready, see below</p>
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

      {/* ==================== YOUR MEDICATION TODAY =================== */}
      {result && (
        <div ref={resultRef}>
          <section aria-labelledby="today-title" className="mx-auto max-w-5xl scroll-mt-6 px-4 pb-16">
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 id="today-title" className="text-center text-3xl font-bold tracking-tight text-ink-900">
                {resultCopy.title}
              </h2>
              <p className="mt-2 text-center text-ink-500">{resultCopy.subtitle}</p>

              <div
                className={clsx(
                  "mx-auto mt-6 w-fit rounded-full px-5 py-2 text-sm font-semibold",
                  result.statusTone === "green" ? "bg-vital-50 text-vital-800" : "bg-gold-50 text-gold-800",
                )}
              >
                {resultCopy.labels.status}: {result.status}
              </div>

              {/* Headline visuals */}
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <Card className="flex flex-col items-center justify-center gap-2 p-6">
                  <ActivityRing pct={result.activePct} reduce={reduce} />
                  <span className="rounded-full bg-vital-50 px-3 py-1 text-sm font-semibold text-vital-800">
                    {result.band.label}
                  </span>
                </Card>
                <Card className="p-6 lg:col-span-2">
                  <h3 className="mb-3 text-sm font-semibold text-ink-800">Drug Level Across Your Week</h3>
                  <DrugCurve result={result} reduce={reduce} />
                </Card>
              </div>

              {/* Metric grid */}
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  { icon: Pill, label: resultCopy.labels.medication, value: result.med.name },
                  { icon: Clock, label: resultCopy.labels.daysSince, value: `${result.daysSince.toFixed(1)} days` },
                  { icon: Gauge, label: resultCopy.labels.active, value: `${result.activePct}%` },
                  { icon: Activity, label: resultCopy.labels.activity, value: result.band.label },
                  { icon: Utensils, label: resultCopy.labels.appetite, value: result.band.appetite },
                  { icon: Flame, label: resultCopy.labels.cravings, value: result.band.cravings },
                  { icon: HeartPulse, label: resultCopy.labels.sideEffects, value: result.band.sideEffects },
                  { icon: CalendarClock, label: resultCopy.labels.nextInjection, value: result.countdownLabel },
                  { icon: Dumbbell, label: resultCopy.labels.protein, value: `${result.proteinG} g/day` },
                  { icon: Droplets, label: resultCopy.labels.hydration, value: `${result.hydrationL} L/day` },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.05 * i }}
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

              {/* What this actually means */}
              <Card className="mt-6 border-l-4 border-l-vital-500 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-vital-700">What this means</h3>
                <p className="mt-2 leading-relaxed text-ink-700">{result.band.meaning}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{result.scheduleNote}</p>
              </Card>

              {result.appetiteMismatch && (
                <Card className="mt-4 border-l-4 border-l-gold-600 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gold-700">
                    About the appetite you reported
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-700">{result.appetiteMismatch}</p>
                </Card>
              )}

              {/* Timeline */}
              <Card className="mt-4 p-6">
                <h3 className="mb-4 text-sm font-semibold text-ink-800">Drug Activity Timeline</h3>
                <ActivityTimeline result={result} />
              </Card>

              <p className="mt-6 text-center text-xs leading-relaxed text-ink-400">{resultCopy.disclaimer}</p>
            </motion.div>
          </section>

          {/* ==================== FREE FEATURES ========================== */}
          <section aria-labelledby="free-features-title" className="mx-auto max-w-3xl px-4 pb-14">
            <Card className="p-6 sm:p-8">
              <h2 id="free-features-title" className="text-center text-2xl font-bold text-ink-900">
                {freeFeatures.headline}
              </h2>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {freeFeatures.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-ink-700">
                    <Check className="h-4 w-4 shrink-0 text-vital-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* ==================== FREE SIGN-UP CTA ======================= */}
          <section aria-labelledby="free-cta-title" className="mx-auto max-w-2xl px-4 pb-14">
            <Card className="p-6 text-center sm:p-8">
              <h2 id="free-cta-title" className="text-2xl font-bold text-ink-900">
                {freeCta.headline}
              </h2>
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
                <span className="mt-1 rounded-full bg-vital-50 px-3 py-1 text-xs font-semibold text-vital-700">
                  {freeCta.badge}
                </span>
              </div>
            </Card>
          </section>

          {/* =================== DASHBOARD PREVIEW ====================== */}
          <section aria-labelledby="dash-title" className="mx-auto max-w-4xl px-4 pb-14">
            <h2 id="dash-title" className="text-center text-2xl font-bold text-ink-900">
              {dashboardPreview.title}
            </h2>
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

          {/* ============ PREMIUM: SEE TOMORROW BEFORE IT HAPPENS ======= */}
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
                    transition={{ delay: reduce ? 0 : i * 0.05 }}
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

          {/* ====== YOUR MEDICATION CHANGES EVERY DAY (differentiator) === */}
          <section aria-labelledby="daily-title" className="mx-auto max-w-4xl px-4 pb-20">
            <div className="rounded-card bg-ink-900 p-8 text-center sm:p-12">
              <h2 id="daily-title" className="text-3xl font-bold tracking-tight text-white">
                {dailyStory.headline}
              </h2>
              {dailyStory.paragraphs.map((p) => (
                <p key={p} className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-200">
                  {p}
                </p>
              ))}
              <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
                {dailyStory.unlocks.map((u, i) => (
                  <motion.li
                    key={u}
                    initial={{ opacity: 0, y: reduce ? 0 : 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: reduce ? 0 : i * 0.06 }}
                    className="flex items-center gap-2.5 rounded-2xl bg-white/5 px-4 py-3 font-medium text-white"
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-vital-500" aria-hidden="true" />
                    {u}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-9">
                <PrimaryButton onClick={() => (window.location.href = "/signup")}>{dailyStory.cta}</PrimaryButton>
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
