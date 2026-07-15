"use client";

/**
 * ============================================================
 * GLP-1 INJECTION SAFETY ASSISTANT
 * calqulate.net · Calqulate Vitals
 *
 * Not a unit converter. It answers what people actually ask:
 *   · How many units do I inject?      → mg to units, both ways
 *   · Am I drawing the correct amount? → Syringe fill visual
 *   · Is my compounded dose correct?   → Concentration-first logic
 *   · Can I overdose by converting wrong? → Safety checks
 *
 * The single rule everything rests on:
 *   U-100 syringe: 100 units = 1 mL
 *   volume (mL) = dose (mg) / concentration (mg/mL)
 *   units = volume (mL) x 100
 * ============================================================
 */

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Beaker,
  Check,
  CheckCircle2,
  ChevronRight,
  Droplets,
  FlaskConical,
  Lock,
  LockOpen,
  Pill,
  Ruler,
  Shield,
  Sparkles,
  Syringe as SyringeIcon,
  UserX,
} from "lucide-react";
import {
  MEDICATIONS,
  SYRINGES,
  UNITS_PER_ML,
  penWarning,
  hero,
  wizard,
  result as resultCopy,
  safetyInsight,
  safetyChecklist,
  freeFeatures,
  freeCta,
  dashboardPreview,
  premium,
  beyondStory,
  type Direction,
  type MedicationId,
} from "@/lib/glp1-unit-converter/content";
import { computeConversion, type ConversionResult } from "@/lib/glp1-unit-converter/convert";

/* ================================================================== */
/* VALIDATION (Zod)                                                    */
/* ================================================================== */

const formSchema = z.object({
  medication: z.enum([
    "semaglutide",
    "tirzepatide",
    "ozempic",
    "wegovy",
    "mounjaro",
    "zepbound",
    "compounded",
  ]),
  concentration: z
    .number({ invalid_type_error: "Enter the concentration printed on your vial" })
    .positive("Concentration must be greater than zero")
    .max(100, "That concentration looks too high. Re-check your label"),
  direction: z.enum(["mg-to-units", "units-to-mg", "ml-to-units", "units-to-ml"]),
  value: z
    .number({ invalid_type_error: "Enter the value you want to convert" })
    .positive("Enter a number greater than zero"),
  syringe: z.enum(["30", "50", "100"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

/** The conversion itself lives in lib/glp1-unit-converter/convert.ts, where it is unit tested. */
type Result = ConversionResult;

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

/**
 * Animated insulin syringe, filled to the calculated dose.
 * The barrel is drawn to the selected syringe's capacity, so a 10-unit dose
 * genuinely looks different on a 30-unit barrel than on a 100-unit one.
 */
function SyringeVisual({ result, reduce }: { result: Result; reduce: boolean }) {
  const W = 640;
  const H = 120;
  const barrelX = 70;
  const barrelW = 430;
  const barrelY = 34;
  const barrelH = 44;

  const capacity = result.syringe.capacityUnits;
  const fillRatio = Math.min(1, result.units / capacity);
  const overfilled = result.units > capacity;

  // Ticks: every 5 units on a 30/50, every 10 on a 100.
  const tickStep = capacity <= 50 ? 5 : 10;
  const ticks = Array.from({ length: Math.floor(capacity / tickStep) + 1 }, (_, i) => i * tickStep);

  return (
    <figure aria-label={`Insulin syringe filled to ${result.units} units of ${capacity}`} role="img">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        {/* Needle */}
        <line x1={10} y1={barrelY + barrelH / 2} x2={barrelX} y2={barrelY + barrelH / 2} stroke="#94a3b8" strokeWidth={3} />
        <rect x={barrelX - 12} y={barrelY + barrelH / 2 - 6} width={12} height={12} rx={2} fill="#94a3b8" />

        {/* Barrel */}
        <rect
          x={barrelX}
          y={barrelY}
          width={barrelW}
          height={barrelH}
          rx={6}
          fill="#ffffff"
          stroke="#cbd5e1"
          strokeWidth={2}
        />

        {/* Medication fill */}
        <motion.rect
          x={barrelX + 2}
          y={barrelY + 2}
          height={barrelH - 4}
          rx={4}
          fill={overfilled ? "#e5b437" : "#2a9a63"}
          fillOpacity={0.85}
          initial={{ width: reduce ? (barrelW - 4) * fillRatio : 0 }}
          animate={{ width: (barrelW - 4) * fillRatio }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Plunger seal at the fill line */}
        <motion.rect
          y={barrelY - 4}
          width={7}
          height={barrelH + 8}
          rx={2}
          fill="#0f172a"
          initial={{ x: reduce ? barrelX + (barrelW - 4) * fillRatio : barrelX }}
          animate={{ x: barrelX + (barrelW - 4) * fillRatio }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Ticks and labels */}
        {ticks.map((t) => {
          const x = barrelX + 2 + ((barrelW - 4) * t) / capacity;
          const major = t % (tickStep * 2) === 0;
          return (
            <g key={t}>
              <line
                x1={x}
                y1={barrelY}
                x2={x}
                y2={barrelY + (major ? 12 : 7)}
                stroke="#64748b"
                strokeWidth={1}
              />
              {major && (
                <text x={x} y={barrelY + 26} textAnchor="middle" className="fill-ink-400 text-[10px]">
                  {t}
                </text>
              )}
            </g>
          );
        })}

        {/* Plunger rod */}
        <rect x={barrelX + barrelW} y={barrelY + barrelH / 2 - 5} width={110} height={10} rx={3} fill="#cbd5e1" />
        <rect x={W - 40} y={barrelY - 6} width={10} height={barrelH + 12} rx={3} fill="#94a3b8" />

        {/* Dose callout */}
        <motion.text
          y={barrelY - 12}
          textAnchor="middle"
          className={clsx("text-[13px] font-bold", overfilled ? "fill-gold-800" : "fill-vital-700")}
          initial={{ x: reduce ? barrelX + (barrelW - 4) * fillRatio : barrelX, opacity: reduce ? 1 : 0 }}
          animate={{ x: barrelX + (barrelW - 4) * fillRatio, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {result.units} units
        </motion.text>
      </svg>
      <figcaption className="mt-1 text-xs leading-relaxed text-ink-500">
        Fill level on a {result.syringe.label}. {result.syringe.note}
      </figcaption>
    </figure>
  );
}

/** mg → mL → units, the three-step chain that produced the answer. */
function ConversionFlow({ result, reduce }: { result: Result; reduce: boolean }) {
  const steps = [
    {
      icon: Pill,
      label: "Dose",
      value: `${result.doseMg} mg`,
      note: "What your prescriber wrote",
    },
    {
      icon: Droplets,
      label: "Volume",
      value: `${result.volumeMl} mL`,
      note: `${result.doseMg} mg ÷ ${result.concentration} mg/mL`,
    },
    {
      icon: Ruler,
      label: "Units",
      value: `${result.units} units`,
      note: `${result.volumeMl} mL × ${UNITS_PER_ML}`,
    },
  ];

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((s, i) => (
        <motion.li
          key={s.label}
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduce ? 0 : 0.15 * i }}
          className="rounded-2xl border-2 border-ink-100 bg-white p-4"
        >
          <s.icon className="h-5 w-5 text-vital-600" aria-hidden="true" />
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink-400">{s.label}</p>
          <p className="mt-0.5 text-xl font-bold text-ink-900">{s.value}</p>
          <p className="mt-1 text-xs text-ink-500">{s.note}</p>
        </motion.li>
      ))}
    </ol>
  );
}

/** Vial showing how much drug sits in each mL at this concentration. */
function VialVisual({ result }: { result: Result }) {
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-28 w-16 shrink-0 rounded-b-xl rounded-t-md border-2 border-ink-200 bg-white">
        <div className="absolute inset-x-1 top-1 h-3 rounded-sm bg-ink-200" aria-hidden="true" />
        <div
          className="absolute inset-x-1 bottom-1 rounded-b-lg bg-gradient-to-t from-vital-500 to-vital-200"
          style={{ height: "62%" }}
          aria-hidden="true"
        />
        <FlaskConical className="absolute inset-0 m-auto h-5 w-5 text-white/70" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-800">
          {result.concentration} mg in every 1 mL
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">
          Your vial holds {result.concentration} mg of {result.med.name.toLowerCase()} per millilitre. That is the
          number that turns your {result.doseMg} mg dose into {result.units} units. Change the concentration and this
          number changes with it, even though your prescription has not.
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/* MAIN COMPONENT                                                      */
/* ================================================================== */

const TOTAL_STEPS = 5;

export default function Glp1InjectionSafetyAssistant() {
  const reduce = useReducedMotion() ?? false;
  const [step, setStep] = useState(0); // 0 = not started
  const [customConcentration, setCustomConcentration] = useState(false);
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
    defaultValues: { medication: "semaglutide", direction: "mg-to-units" },
    mode: "onTouched",
  });

  const medication = watch("medication");
  const concentration = watch("concentration");
  const direction = watch("direction");
  const syringe = watch("syringe");
  const med = MEDICATIONS.find((m) => m.id === medication)!;

  const fieldsPerStep: (keyof FormValues)[][] = [
    ["medication"],
    ["concentration"],
    ["direction"],
    ["value"],
    ["syringe"],
  ];

  const valueUnit = useMemo(() => {
    switch (direction) {
      case "mg-to-units":
        return "mg";
      case "ml-to-units":
        return "mL";
      default:
        return "units";
    }
  }, [direction]);

  async function next() {
    const valid = await trigger(fieldsPerStep[step - 1]);
    if (!valid) return;
    if (step < TOTAL_STEPS) setStep(step + 1);
  }

  const onSubmit = handleSubmit((values) => {
    setResult(computeConversion(values));
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

        {/* Capability chips: the primary keywords, front and centre */}
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
          className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-2"
        >
          {hero.capabilities.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-vital-100 bg-vital-50 px-3 py-1.5 text-sm font-semibold text-vital-800"
            >
              <Check className="h-4 w-4 shrink-0 text-vital-600" aria-hidden="true" />
              {c}
            </li>
          ))}
        </motion.ul>

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
      <section ref={wizardRef} aria-label="GLP-1 unit converter" className="mx-auto max-w-xl px-4 pb-16">
        <Card className="p-6 sm:p-8">
          {step === 0 && (
            <div className="py-6 text-center">
              <SyringeIcon className="mx-auto h-10 w-10 text-vital-500" aria-hidden="true" />
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
                            setValue("concentration", undefined as unknown as number);
                            setCustomConcentration(false);
                          }}
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
                            <span className="block text-xs text-ink-500">{m.genericLabel}</span>
                          </span>
                          {medication === m.id && (
                            <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}

                {/* Q2: Concentration */}
                {step === 2 && (
                  <motion.fieldset key="q2" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[1].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[1].helper}</p>

                    {med.penOnly && (
                      <div className="mt-4 flex gap-3 rounded-2xl border-2 border-gold-600/30 bg-gold-50 p-4">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-semibold text-gold-800">{penWarning.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-ink-700">{penWarning.body}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {med.concentrations.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setCustomConcentration(false);
                            setValue("concentration", c, { shouldValidate: true });
                          }}
                          className={clsx(
                            "rounded-2xl border-2 px-3 py-4 text-center font-semibold transition-colors",
                            !customConcentration && concentration === c
                              ? "border-vital-500 bg-vital-50 text-vital-800"
                              : "border-ink-100 bg-white text-ink-700 hover:border-vital-200",
                          )}
                          aria-pressed={!customConcentration && concentration === c}
                        >
                          {c} mg/mL
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomConcentration(true);
                          setValue("concentration", undefined as unknown as number);
                        }}
                        className={clsx(
                          "rounded-2xl border-2 px-3 py-4 text-center font-semibold transition-colors",
                          customConcentration
                            ? "border-vital-500 bg-vital-50 text-vital-800"
                            : "border-ink-100 bg-white text-ink-700 hover:border-vital-200",
                        )}
                        aria-pressed={customConcentration}
                      >
                        Custom
                      </button>
                    </div>

                    {customConcentration && (
                      <div className="mt-4">
                        <label htmlFor="concentration" className="block text-sm font-semibold text-ink-800">
                          {wizard.customConcentration}
                        </label>
                        <div className="mt-2 flex items-center gap-3">
                          <input
                            id="concentration"
                            type="number"
                            inputMode="decimal"
                            step="0.1"
                            autoFocus
                            placeholder="e.g. 2.5"
                            {...register("concentration", { valueAsNumber: true })}
                            className="w-36 rounded-2xl border-2 border-ink-100 bg-white px-4 py-3 text-lg font-semibold text-ink-900 focus:border-vital-500"
                            aria-invalid={!!errors.concentration}
                          />
                          <span className="text-ink-500">mg/mL</span>
                        </div>
                      </div>
                    )}

                    {errors.concentration && (
                      <p role="alert" className="mt-3 text-sm text-red-600">
                        {errors.concentration.message}
                      </p>
                    )}

                    <p className="mt-5 flex gap-2 rounded-2xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-600">
                      <Beaker className="h-4 w-4 shrink-0 text-vital-600" aria-hidden="true" />
                      {med.note}
                    </p>
                  </motion.fieldset>
                )}

                {/* Q3: Direction */}
                {step === 3 && (
                  <motion.fieldset key="q3" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[2].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[2].helper}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {wizard.directions.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setValue("direction", d.id as Direction, { shouldValidate: true })}
                          className={clsx(
                            "flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            direction === d.id
                              ? "border-vital-500 bg-vital-50"
                              : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={direction === d.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{d.label}</span>
                            <span className="block text-xs text-ink-500">{d.desc}</span>
                          </span>
                          {direction === d.id && <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}

                {/* Q4: Value */}
                {step === 4 && (
                  <motion.div key="q4" {...slide}>
                    <label htmlFor="value" className="text-xl font-semibold text-ink-900">
                      {wizard.steps[3].question}
                    </label>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[3].helper}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <input
                        id="value"
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        placeholder={valueUnit === "mg" ? "e.g. 1" : valueUnit === "mL" ? "e.g. 0.2" : "e.g. 20"}
                        {...register("value", { valueAsNumber: true })}
                        className="w-40 rounded-2xl border-2 border-ink-100 bg-white px-4 py-3 text-lg font-semibold text-ink-900 focus:border-vital-500"
                        aria-invalid={!!errors.value}
                        aria-describedby={errors.value ? "value-error" : undefined}
                      />
                      <span className="text-lg font-medium text-ink-500">{valueUnit}</span>
                    </div>
                    {errors.value && (
                      <p id="value-error" role="alert" className="mt-3 text-sm text-red-600">
                        {errors.value.message}
                      </p>
                    )}
                    <p className="mt-5 rounded-2xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-600">
                      Converting at <strong className="text-ink-800">{concentration} mg/mL</strong>. If that is not the
                      number on your label, go back and change it. Everything below depends on it.
                    </p>
                  </motion.div>
                )}

                {/* Q5: Syringe (optional) */}
                {step === 5 && (
                  <motion.fieldset key="q5" {...slide}>
                    <legend className="text-xl font-semibold text-ink-900">{wizard.steps[4].question}</legend>
                    <p className="mt-1 text-sm text-ink-500">{wizard.steps[4].helper}</p>
                    <div className="mt-5 grid gap-3">
                      {SYRINGES.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setValue("syringe", s.id, { shouldValidate: true })}
                          className={clsx(
                            "flex items-center justify-between gap-2 rounded-2xl border-2 px-5 py-4 text-left transition-colors",
                            syringe === s.id
                              ? "border-vital-500 bg-vital-50"
                              : "border-ink-100 bg-white hover:border-vital-200",
                          )}
                          aria-pressed={syringe === s.id}
                        >
                          <span>
                            <span className="block font-semibold text-ink-900">{s.label}</span>
                            <span className="block text-xs text-ink-500">
                              Holds {s.capacityMl} mL · {s.increment}-unit markings
                            </span>
                          </span>
                          {syringe === s.id && <Check className="h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />}
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
                Convert again
              </GhostButton>
            </div>
          )}
        </Card>
      </section>

      {/* =================== YOUR INJECTION SNAPSHOT ================== */}
      {result && (
        <div ref={resultRef}>
          <section aria-labelledby="snapshot-title" className="mx-auto max-w-5xl scroll-mt-6 px-4 pb-16">
            <motion.div
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 id="snapshot-title" className="text-center text-3xl font-bold tracking-tight text-ink-900">
                {resultCopy.title}
              </h2>
              <p className="mt-2 text-center text-ink-500">{resultCopy.subtitle}</p>

              <div
                className={clsx(
                  "mx-auto mt-6 w-fit rounded-full px-5 py-2 text-sm font-semibold",
                  result.confidence.tone === "green" ? "bg-vital-50 text-vital-800" : "bg-gold-50 text-gold-800",
                )}
              >
                {resultCopy.labels.confidence}: {result.confidence.label}
              </div>

              {/* The number, big */}
              <Card className="mt-8 p-6 sm:p-8">
                <p className="text-center text-sm font-medium uppercase tracking-wide text-ink-400">
                  {resultCopy.labels.units}
                </p>
                <motion.p
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mt-1 text-center text-5xl font-bold tracking-tight text-ink-900 sm:text-6xl"
                >
                  {result.units} <span className="text-3xl font-semibold text-ink-500">units</span>
                </motion.p>
                <p className="mt-2 text-center text-ink-500">
                  {result.doseMg} mg · {result.volumeMl} mL · {result.concentration} mg/mL
                </p>
                <div className="mt-7">
                  <SyringeVisual result={result} reduce={reduce} />
                </div>
              </Card>

              {/* Metric grid */}
              <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { icon: Pill, label: resultCopy.labels.medication, value: result.med.name },
                  { icon: Beaker, label: resultCopy.labels.concentration, value: `${result.concentration} mg/mL` },
                  { icon: Pill, label: resultCopy.labels.dose, value: `${result.doseMg} mg` },
                  { icon: Droplets, label: resultCopy.labels.volume, value: `${result.volumeMl} mL` },
                  { icon: Ruler, label: resultCopy.labels.units, value: `${result.units} units` },
                  { icon: SyringeIcon, label: resultCopy.labels.syringe, value: result.syringe.label },
                  {
                    icon: CheckCircle2,
                    label: resultCopy.labels.verified,
                    value: result.confidence.id === "high" ? resultCopy.verified : "Check below",
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

              {/* Warnings, only when the numbers earn one */}
              {result.warnings.length > 0 && (
                <Card className="mt-4 border-l-4 border-l-gold-600 p-6">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold-700">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    Check this before you draw
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {result.warnings.map((w) => (
                      <li key={w} className="flex gap-2 leading-relaxed text-ink-700">
                        <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Conversion flow */}
              <Card className="mt-4 p-6">
                <h3 className="mb-4 text-sm font-semibold text-ink-800">How this number was reached</h3>
                <ConversionFlow result={result} reduce={reduce} />
              </Card>

              {/* Concentration explainer */}
              <Card className="mt-4 p-6">
                <h3 className="mb-4 text-sm font-semibold text-ink-800">Your vial</h3>
                <VialVisual result={result} />
              </Card>

              {/* Safety insight */}
              <Card className="mt-4 border-l-4 border-l-vital-500 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-vital-700">{safetyInsight.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-700">{safetyInsight.body}</p>
              </Card>

              {/* Safety checklist */}
              <Card className="mt-4 p-6">
                <h3 className="text-sm font-semibold text-ink-800">{safetyChecklist.headline}</h3>
                <ul className="mt-4 space-y-2.5">
                  {safetyChecklist.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-ink-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-vital-600" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm leading-relaxed text-ink-500">{safetyChecklist.footer}</p>
              </Card>

              <p className="mt-6 rounded-2xl bg-ink-50 p-4 text-center text-sm font-medium leading-relaxed text-ink-700">
                {resultCopy.reminder}
              </p>
              <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">{resultCopy.disclaimer}</p>
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

          {/* ============= PREMIUM: GO BEYOND UNIT CONVERSION ============ */}
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

          {/* ========== CONVERTING YOUR DOSE IS ONLY THE BEGINNING ======= */}
          <section aria-labelledby="beyond-title" className="mx-auto max-w-4xl px-4 pb-20">
            <div className="rounded-card bg-ink-900 p-8 text-center sm:p-12">
              <h2 id="beyond-title" className="text-3xl font-bold tracking-tight text-white">
                {beyondStory.headline}
              </h2>
              {beyondStory.paragraphs.map((p) => (
                <p key={p} className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-200">
                  {p}
                </p>
              ))}
              <ul className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
                {beyondStory.unlocks.map((u, i) => (
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
                <PrimaryButton onClick={() => (window.location.href = "/signup")}>{beyondStory.cta}</PrimaryButton>
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
              Save My Medication Setup
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
