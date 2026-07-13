"use client";

/**
 * ============================================================
 * GLP-1 INJECTION DAY ASSISTANT
 * calqulate.net · Calqulate Vitals
 *
 * Not a date calculator. It answers what people actually ask:
 *   · When should I inject next?        → Countdown to the exact date
 *   · Can I change my injection day?    → Planner, gap-checked per drug
 *   · I missed a dose, now what?        → Take it or skip it, no hedging
 *   · Which day is best?                → Puts side effects where you can afford them
 *
 * The scheduling itself lives in lib/glp1-injection-day/schedule.ts,
 * where it is unit tested. This file only renders it.
 * ============================================================
 */

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  Lock,
  LockOpen,
  Pill,
  Plane,
  Shield,
  ShieldAlert,
  Sparkles,
  Syringe,
  Timer,
  UserX,
} from "lucide-react";
import {
  MEDICATIONS,
  WEEKDAYS,
  hero,
  wizard,
  result as resultCopy,
  dayChange,
  bestDay,
  travel,
  freeFeatures,
  freeCta,
  dashboardPreview,
  premium,
  consistencyStory,
  type Intent,
  type MedicationId,
  type RoughWindow,
} from "@/lib/glp1-injection-day/content";
import { computeSchedule, type ScheduleResult } from "@/lib/glp1-injection-day/schedule";

/* ================================================================== */
/* VALIDATION (Zod)                                                    */
/* ================================================================== */

const formSchema = z.object({
  medication: z.enum(["semaglutide", "tirzepatide", "ozempic", "wegovy", "mounjaro", "zepbound"]),
  injectionDate: z.string().min(1, "Pick the date of your last injection"),
  injectionTime: z.string().min(1, "Pick roughly what time you injected"),
  typicalDay: z.number().int().min(0).max(6),
  intent: z.enum(["next-dose", "change-day", "missed-dose", "travel"]),
  roughWindow: z.enum(["weekend", "weekdays", "any"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

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

/** Countdown ring: how far through the week you are, from last dose to next. */
function CountdownRing({ result, reduce }: { result: ScheduleResult; reduce: boolean }) {
  const total = result.nextInjection.getTime() - result.lastInjection.getTime();
  const elapsed = total - result.hoursToNext * 3_600_000;
  const pct = Math.max(0, Math.min(100, Math.round((elapsed / total) * 100)));

  const R = 54;
  const C = 2 * Math.PI * R;
  const overdue = result.hoursToNext < 0;

  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${pct}% through your dosing week`}>
      <svg viewBox="0 0 128 128" className="h-32 w-32">
        <circle cx="64" cy="64" r={R} fill="none" stroke="#eceef0" strokeWidth="11" />
        <motion.circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          stroke={overdue ? "#e5b437" : "#2a9a63"}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={C}
          transform="rotate(-90 64 64)"
          initial={{ strokeDashoffset: reduce ? C * (1 - pct / 100) : C }}
          animate={{ strokeDashoffset: C * (1 - pct / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <text x="64" y="62" textAnchor="middle" className="fill-ink-900 text-[24px] font-bold">
          {pct}%
        </text>
        <text x="64" y="80" textAnchor="middle" className="fill-ink-400 text-[10px]">
          through the week
        </text>
      </svg>
      <span className="mt-1 text-xs font-medium text-ink-500">Since your last injection</span>
    </div>
  );
}

/**
 * The day planner: every weekday, with the gap it would leave since the last
 * injection. Amber days are inside the minimum gap for this specific drug.
 */
function DayPlanner({ result }: { result: ScheduleResult }) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {result.dayOptions.map((d) => {
          const short = WEEKDAYS[d.weekday].short;
          return (
            <div
              key={d.weekday}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-xl border-2 px-1 py-3 text-center",
                d.verdict === "current" && "border-vital-500 bg-vital-50",
                d.verdict === "safe" && "border-ink-100 bg-white",
                d.verdict === "too-soon" && "border-gold-600/30 bg-gold-50",
              )}
              title={`${d.label}: ${d.gapHours} hours after your last injection`}
            >
              <span
                className={clsx(
                  "text-xs font-bold",
                  d.verdict === "too-soon" ? "text-gold-800" : "text-ink-800",
                )}
              >
                {short}
              </span>
              {d.verdict === "too-soon" ? (
                <AlertTriangle className="h-4 w-4 text-gold-600" aria-hidden="true" />
              ) : d.verdict === "current" ? (
                <Syringe className="h-4 w-4 text-vital-600" aria-hidden="true" />
              ) : (
                <Check className="h-4 w-4 text-vital-500" aria-hidden="true" />
              )}
              <span className={clsx("text-[10px]", d.verdict === "too-soon" ? "text-gold-700" : "text-ink-400")}>
                {d.gapHours}h
              </span>
            </div>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-500">
        <li className="flex items-center gap-1.5">
          <Syringe className="h-3.5 w-3.5 text-vital-600" aria-hidden="true" />
          {dayChange.legend.current}
        </li>
        <li className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-vital-500" aria-hidden="true" />
          {dayChange.legend.safe}
        </li>
        <li className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-gold-600" aria-hidden="true" />
          {dayChange.legend["too-soon"]}
        </li>
      </ul>

      <p className="mt-4 text-sm leading-relaxed text-ink-500">
        Hours are counted from your last injection. {result.med.name} needs at least{" "}
        <strong className="text-ink-800">{result.med.minGapHours} hours</strong> between doses, so any day below that is
        flagged. {dayChange.note}
      </p>
    </div>
  );
}

/* ================================================================== */
/* MAIN COMPONENT                                                      */
/* ================================================================== */

const TOTAL_STEPS = 5;

export default function Glp1InjectionDayAssistant() {
  const reduce = useReducedMotion() ?? false;
  const [step, setStep] = useState(0); // 0 = not started
  const [result, setResult] = useState<ScheduleResult | null>(null);
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
    defaultValues: { medication: "semaglutide", injectionTime: "09:00", typicalDay: 1, intent: "next-dose" },
    mode: "onTouched",
  });

  const medication = watch("medication");
  const typicalDay = watch("typicalDay");
  const intent = watch("intent");
  const roughWindow = watch("roughWindow");

  const fieldsPerStep: (keyof FormValues)[][] = [
    ["medication"],
    ["injectionDate", "injectionTime"],
    ["typicalDay"],
    ["intent"],
    ["roughWindow"],
  ];

  async function next() {
    const valid = await trigger(fieldsPerStep[step - 1]);
    if (!valid) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  const onSubmit = handleSubmit((values) => {
    // `new Date()` runs in an event handler, so it never reaches the server render.
    setResult(
      computeSchedule(
        {
          medication: values.medication,
          lastInjection: new Date(`${values.injectionDate}T${values.injectionTime}`),
          typicalDay: values.typicalDay,
          intent: values.intent,
          roughWindow: values.roughWindow,
        },
        new Date(),
      ),
    );
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

  const recommendation =
    result?.recommendedDay != null && roughWindow ? bestDay[roughWindow as RoughWindow] : null;

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
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <PrimaryButton onClick={start}>
            {hero.cta}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </PrimaryButton>
          <a
            href={hero.secondaryCtaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-full px-6 py-3 text-base font-medium text-ink-600 hover:text-ink-900"
          >
            {hero.secondaryCta}
          </a>
        </motion.div>
      </section>

      {/* ========================== WIZARD ============================ */}
      <section ref={wizardRef} aria-label="GLP-1 injection day calculator" className="mx-auto max-w-xl px-4 pb-16">
        <Card className="p-6 sm:p-8">
          {step === 0 && (
            <div className="py-6 text-center">
              <CalendarClock className="mx-auto h-10 w-10 text-vital-500" aria-hidden="true" />
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
                          onClick={() => setValue("medication", m.id as MedicationId, { shouldValidate: true })}
                          className={clsx(
                            "flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            medication === m.id
                              ? "border-vital-500 bg-vital-50"
                              : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={medication === m.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{m.name}</span>
                            <span className="block text-xs text-ink-500">{m.minGapHours}h minimum gap</span>
                          </span>
                          {medication === m.id && (
                            <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}

                {/* Q2: Last injection */}
                {step === 2 && (
                  <motion.fieldset key="q2" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[1].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[1].helper}</p>
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

                {/* Q3: Usual day */}
                {step === 3 && (
                  <motion.fieldset key="q3" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[2].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[2].helper}</p>
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

                {/* Q4: Intent */}
                {step === 4 && (
                  <motion.fieldset key="q4" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[3].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[3].helper}</p>
                    <div className="mt-5 grid gap-3">
                      {wizard.intents.map((i) => (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => setValue("intent", i.id as Intent, { shouldValidate: true })}
                          className={clsx(
                            "flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            intent === i.id
                              ? "border-vital-500 bg-vital-50"
                              : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={intent === i.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{i.label}</span>
                            <span className="block text-sm text-ink-500">{i.desc}</span>
                          </span>
                          {intent === i.id && <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}

                {/* Q5: Rough window (optional) */}
                {step === 5 && (
                  <motion.fieldset key="q5" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[4].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[4].helper}</p>
                    <div className="mt-5 grid gap-3">
                      {wizard.roughWindows.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setValue("roughWindow", r.id as RoughWindow, { shouldValidate: true })}
                          className={clsx(
                            "flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            roughWindow === r.id
                              ? "border-vital-500 bg-vital-50"
                              : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={roughWindow === r.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{r.label}</span>
                            <span className="block text-sm text-ink-500">{r.desc}</span>
                          </span>
                          {roughWindow === r.id && (
                            <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />
                          )}
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
              <p className="mt-3 font-medium text-ink-800">Plan ready, see below</p>
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

      {/* ===================== YOUR INJECTION PLAN ==================== */}
      {result && (
        <div ref={resultRef}>
          <section aria-labelledby="plan-title" className="mx-auto max-w-5xl scroll-mt-6 px-4 pb-16">
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 id="plan-title" className="text-center text-3xl font-bold tracking-tight text-ink-900">
                {resultCopy.title}
              </h2>
              <p className="mt-2 text-center text-ink-500">{resultCopy.subtitle}</p>

              <div
                className={clsx(
                  "mx-auto mt-6 w-fit rounded-full px-5 py-2 text-sm font-semibold",
                  result.statusTone === "green" && "bg-vital-50 text-vital-800",
                  result.statusTone === "amber" && "bg-gold-50 text-gold-800",
                  result.statusTone === "red" && "bg-red-50 text-red-700",
                )}
              >
                {resultCopy.labels.status}: {result.statusLabel}
              </div>

              {/* The date, big */}
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <Card className="flex flex-col items-center justify-center p-6 lg:col-span-2">
                  <p className="text-sm font-medium uppercase tracking-wide text-ink-400">
                    {resultCopy.labels.nextInjection}
                  </p>
                  <motion.p
                    initial={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mt-2 text-center text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl"
                  >
                    {result.nextInjectionLabel}
                  </motion.p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-4 py-1.5 text-sm font-semibold text-ink-700">
                    <Timer className="h-4 w-4 text-vital-600" aria-hidden="true" />
                    {result.countdownLabel}
                  </p>
                </Card>
                <Card className="flex items-center justify-center p-6">
                  <CountdownRing result={result} reduce={reduce} />
                </Card>
              </div>

              {/* Too soon: the only genuinely unsafe state */}
              {!result.canInjectNow && (
                <Card className="mt-4 border-l-4 border-l-red-500 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-700">
                    <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                    Do not inject yet
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-700">
                    {result.med.name} needs at least {result.med.minGapHours} hours between doses. Injecting now would
                    stack this dose on top of the last one, which is what turns manageable nausea into a very bad day.
                    The earliest you could safely inject is{" "}
                    <strong className="text-ink-900">
                      {result.earliestSafe.toLocaleString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                    .
                  </p>
                </Card>
              )}

              {/* Missed dose: take it or skip it, no hedging */}
              {result.missedDose && (
                <Card className="mt-4 border-l-4 border-l-gold-600 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-700">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    {result.missedDose.withinWindow ? "Take it now" : "Skip this dose"}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-700">{result.missedDose.verdict}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{result.med.missedDoseRule}</p>
                </Card>
              )}

              {/* Off-schedule note */}
              {result.offSchedule && (
                <Card className="mt-4 border-l-4 border-l-vital-500 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-vital-700">
                    Getting back to your usual day
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-700">
                    Your last injection was not on a {result.typicalDayLabel}, which is your usual day. Your next dose
                    is calculated as the next {result.typicalDayLabel} that still leaves the{" "}
                    {result.med.minGapHours}-hour minimum gap, which puts you back on schedule without ever bunching two
                    doses too closely.
                  </p>
                </Card>
              )}

              {/* Metric grid */}
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { icon: Pill, label: resultCopy.labels.medication, value: result.med.name },
                  {
                    icon: Syringe,
                    label: resultCopy.labels.lastInjection,
                    value: result.lastInjection.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }),
                  },
                  { icon: CalendarCheck, label: resultCopy.labels.usualDay, value: result.typicalDayLabel },
                  { icon: Timer, label: resultCopy.labels.countdown, value: result.countdownLabel },
                  { icon: Shield, label: resultCopy.labels.minGap, value: `${result.med.minGapHours} hours` },
                  {
                    icon: Clock,
                    label: resultCopy.labels.missedWindow,
                    value: `${result.med.missedDoseWindowDays} days`,
                  },
                  {
                    icon: CalendarClock,
                    label: resultCopy.labels.earliestSafe,
                    value: result.earliestSafe.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }),
                  },
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

              {/* Day planner */}
              <Card className="mt-4 p-6">
                <h3 className="text-sm font-semibold text-ink-800">{dayChange.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{dayChange.body}</p>
                <div className="mt-5">
                  <DayPlanner result={result} />
                </div>
              </Card>

              {/* Best day */}
              {recommendation && (
                <Card className="mt-4 p-6">
                  <h3 className="text-sm font-semibold text-ink-800">{bestDay.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-700">{recommendation}</p>
                  {result.recommendedDay != null && result.recommendedDay !== result.typicalDay && (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-vital-50 px-4 py-1.5 text-sm font-semibold text-vital-800">
                      <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                      Suggested day: {WEEKDAYS[result.recommendedDay].label}
                    </p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">{bestDay.footer}</p>
                </Card>
              )}

              {/* Travel */}
              {intent === "travel" && (
                <Card className="mt-4 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                    <Plane className="h-4 w-4 text-vital-600" aria-hidden="true" />
                    {travel.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-700">{travel.body}</p>
                  <ul className="mt-4 space-y-2.5">
                    {travel.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-ink-700">
                        <Check className="mt-0.5 h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

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

          {/* ========================= PREMIUM =========================== */}
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

          {/* ============ THE BEST DAY IS THE ONE YOU NEVER FORGET ======= */}
          <section aria-labelledby="consistency-title" className="mx-auto max-w-4xl px-4 pb-20">
            <div className="rounded-card bg-ink-900 p-8 text-center sm:p-12">
              <h2 id="consistency-title" className="text-3xl font-bold tracking-tight text-white">
                {consistencyStory.headline}
              </h2>
              {consistencyStory.paragraphs.map((p) => (
                <p key={p} className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-200">
                  {p}
                </p>
              ))}
              <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
                {consistencyStory.unlocks.map((u, i) => (
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
                <PrimaryButton onClick={() => (window.location.href = "/signup")}>
                  {consistencyStory.cta}
                </PrimaryButton>
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
