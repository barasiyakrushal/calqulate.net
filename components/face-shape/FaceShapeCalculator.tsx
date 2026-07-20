// components/face-shape/FaceShapeCalculator.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { parseNumber } from "@/lib/utils";
import {
  faceShapeGuides,
  quizQuestions,
  detectShapeFromMeasurements,
  type FaceShape,
  type FaceMeasurements,
} from "@/lib/blog/face-shape-data";

/**
 * Face Shape Calculator / Detector
 *
 * Two modes:
 *   1. Quiz   — 5 quick questions, scored to pick the most likely shape.
 *   2. Measure — user inputs 4 measurements, detector compares ratios.
 *
 * Brand color: emerald-600 (green).
 * Fully client-side, mobile-responsive, with a result screen
 * that includes image zoom and click-to-fullscreen.
 */

type Mode = "quiz" | "measure";
type AnswerMap = Record<string, number>; // question.id → answer index

export default function FaceShapeCalculator() {
  const [mode, setMode] = useState<Mode>("quiz");

  // ── Quiz state ─────────────────────────────────────────
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [step, setStep] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  // ── Measurement state ──────────────────────────────────
  const [measurements, setMeasurements] = useState<FaceMeasurements>({
    forehead: 0,
    cheekbones: 0,
    jawline: 0,
    faceLength: 0,
  });
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [measureDone, setMeasureDone] = useState(false);

  // ── Lightbox ───────────────────────────────────────────
  const [zoomImage, setZoomImage] = useState<{ src: string; alt: string } | null>(null);

  // Lock body scroll while lightbox open; close on Escape.
  useEffect(() => {
    if (!zoomImage) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomImage]);

  // ── Quiz scoring ───────────────────────────────────────
  const quizResult = useMemo<FaceShape | null>(() => {
    if (!quizDone) return null;
    const scores: Record<FaceShape, number> = {
      oval: 0,
      round: 0,
      square: 0,
      heart: 0,
      diamond: 0,
      oblong: 0,
      rectangle: 0,
      triangle: 0,
    };

    for (const q of quizQuestions) {
      const idx = answers[q.id];
      if (idx === undefined) continue;
      const chosen = q.answers[idx];
      if (!chosen) continue;
      for (const shape of Object.keys(chosen.scores) as FaceShape[]) {
        scores[shape] += chosen.scores[shape] ?? 0;
      }
    }

    let winner: FaceShape = "oval";
    let high = -1;
    (Object.keys(scores) as FaceShape[]).forEach((s) => {
      if (scores[s] > high) {
        high = scores[s];
        winner = s;
      }
    });
    return winner;
  }, [answers, quizDone]);

  const measureResult = useMemo(() => {
    if (!measureDone) return null;
    return detectShapeFromMeasurements(measurements);
  }, [measureDone, measurements]);

  // Reset helpers
  function restart() {
    setAnswers({});
    setStep(0);
    setQuizDone(false);
    setMeasurements({ forehead: 0, cheekbones: 0, jawline: 0, faceLength: 0 });
    setMeasureDone(false);
  }

  function handleAnswer(qid: string, answerIdx: number) {
    const next = { ...answers, [qid]: answerIdx };
    setAnswers(next);
    if (step < quizQuestions.length - 1) {
      setStep(step + 1);
    } else {
      setQuizDone(true);
    }
  }

  function handlePrev() {
    if (step > 0) setStep(step - 1);
  }

  function handleMeasurementSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMeasureDone(true);
  }

  const winner = quizResult ?? measureResult?.shape ?? null;
  const winnerGuide = winner ? faceShapeGuides.find((g) => g.id === winner) : null;
  const showResult = (quizDone && quizResult) || (measureDone && measureResult);

  return (
    <section
      id="face-shape-calculator"
      aria-label="Face shape calculator"
      className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-white p-5 shadow-sm md:p-8"
    >
      {/* ── Heading ──────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          Free Face Shape Detector
        </span>
        <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
          Find Your Face Shape Online Free
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
          Answer five quick questions or enter your face measurements. We&apos;ll match you to
          one of eight face shapes and recommend glasses, hairstyles, and beard styles.
        </p>
      </div>

      {/* ── Mode toggle ───────────────────────────────────── */}
      {!showResult && (
        <div className="mb-8 flex justify-center">
          <div
            role="tablist"
            aria-label="Choose calculator mode"
            className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm"
          >
            {(["quiz", "measure"] as Mode[]).map((m) => {
              const active = mode === m;
              const label = m === "quiz" ? "Quick Quiz" : "Use Measurements";
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setMode(m);
                    restart();
                  }}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-600 text-white shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── QUIZ MODE ─────────────────────────────────────── */}
      {!showResult && mode === "quiz" && (
        <QuizPanel
          step={step}
          answers={answers}
          onAnswer={handleAnswer}
          onPrev={handlePrev}
        />
      )}

      {/* ── MEASUREMENT MODE ──────────────────────────────── */}
      {!showResult && mode === "measure" && (
        <MeasurePanel
          measurements={measurements}
          setMeasurements={setMeasurements}
          unit={unit}
          setUnit={setUnit}
          onSubmit={handleMeasurementSubmit}
        />
      )}

      {/* ── RESULT ────────────────────────────────────────── */}
      {showResult && winnerGuide && (
        <ResultPanel
          guide={winnerGuide}
          reason={measureResult?.reason}
          confidence={measureResult?.confidence}
          onRestart={restart}
          onZoom={(src, alt) => setZoomImage({ src, alt })}
        />
      )}

      {/* ── Trust note ────────────────────────────────────── */}
      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-slate-500 md:text-sm">
        Your result is a helpful styling guide, not a strict rule. Many people have a mix of
        two face shapes — use this as a starting point, then try a few hairstyles or frames to
        see what works best for you.
      </p>

      {/* ── Lightbox ──────────────────────────────────────── */}
      {zoomImage && (
        <Lightbox image={zoomImage} onClose={() => setZoomImage(null)} />
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 * Quiz panel
 * ─────────────────────────────────────────────────────── */

interface QuizPanelProps {
  step: number;
  answers: AnswerMap;
  onAnswer: (qid: string, answerIdx: number) => void;
  onPrev: () => void;
}

function QuizPanel({ step, answers, onAnswer, onPrev }: QuizPanelProps) {
  const q = quizQuestions[step];
  if (!q) return null;

  const progress = ((step + 1) / quizQuestions.length) * 100;
  const selectedIdx = answers[q.id];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-semibold text-slate-500">
          <span>
            Question {step + 1} of {quizQuestions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-lg font-bold text-slate-900 md:text-xl">{q.question}</h3>
      {q.helperText && (
        <p className="mt-2 text-sm text-slate-500">{q.helperText}</p>
      )}

      {/* Answers */}
      <div className="mt-6 grid gap-3">
        {q.answers.map((a, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={a.label}
              type="button"
              onClick={() => onAnswer(q.id, idx)}
              className={`w-full rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition md:text-base ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 text-slate-400"
                  }`}
                  aria-hidden="true"
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                {a.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          type="button"
          onClick={onPrev}
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          ← Previous question
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Measurement panel
 * ─────────────────────────────────────────────────────── */

interface MeasurePanelProps {
  measurements: FaceMeasurements;
  setMeasurements: (m: FaceMeasurements) => void;
  unit: "cm" | "in";
  setUnit: (u: "cm" | "in") => void;
  onSubmit: (e: React.FormEvent) => void;
}

function MeasurePanel({
  measurements,
  setMeasurements,
  unit,
  setUnit,
  onSubmit,
}: MeasurePanelProps) {
  const fields: { key: keyof FaceMeasurements; label: string; helper: string }[] = [
    {
      key: "forehead",
      label: "Forehead width",
      helper: "From temple to temple, across the widest part.",
    },
    {
      key: "cheekbones",
      label: "Cheekbone width",
      helper: "From the outer edge of one cheekbone to the other, just under the eyes.",
    },
    {
      key: "jawline",
      label: "Jawline width",
      helper: "Just below the ears, around the curve to the chin.",
    },
    {
      key: "faceLength",
      label: "Face length",
      helper: "Center of the hairline straight down to the bottom of your chin.",
    },
  ];

  const allFilled = Object.values(measurements).every((v) => v > 0);

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-2xl space-y-5 rounded-2xl bg-white p-5 shadow-sm md:p-6"
    >
      {/* Unit toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Use a soft measuring tape and a mirror, or have a friend help.
        </p>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {(["cm", "in"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                unit === u
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      {fields.map((f) => (
        <label key={f.key} className="block">
          <span className="text-sm font-semibold text-slate-800">
            {f.label}{" "}
            <span className="text-xs font-normal text-slate-500">({unit})</span>
          </span>
          <input
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            value={measurements[f.key] || ""}
            onChange={(e) =>
              setMeasurements({
                ...measurements,
                [f.key]: parseNumber(e.target.value) || 0,
              })
            }
            placeholder={unit === "cm" ? "e.g. 14.5" : "e.g. 5.7"}
            className="mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <span className="mt-1 block text-xs text-slate-500">{f.helper}</span>
        </label>
      ))}

      <button
        type="submit"
        disabled={!allFilled}
        className={`w-full rounded-xl px-5 py-3 text-sm font-semibold text-white shadow transition ${
          allFilled
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "cursor-not-allowed bg-slate-300"
        }`}
      >
        Detect my face shape →
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────
 * Result panel
 * ─────────────────────────────────────────────────────── */

interface ResultPanelProps {
  guide: (typeof faceShapeGuides)[number];
  reason?: string;
  confidence?: "high" | "medium" | "low";
  onRestart: () => void;
  onZoom: (src: string, alt: string) => void;
}

function ResultPanel({ guide, reason, confidence, onRestart, onZoom }: ResultPanelProps) {
  const imgSrc = `/blog/face-shape/shape-${guide.id}.jpg`;
  const imgAlt = `${guide.label} illustration`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Image with zoom */}
          <button
            type="button"
            onClick={() => onZoom(imgSrc, imgAlt)}
            aria-label={`View ${guide.label} illustration in full screen`}
            className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-emerald-50 md:w-56 md:shrink-0"
          >
            <FaceShapeImage src={imgSrc} alt={imgAlt} shape={guide.id} />
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 opacity-0 shadow transition group-hover:opacity-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              Tap to zoom
            </span>
          </button>

          {/* Content */}
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Your likely face shape
            </span>
            <h3 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              {guide.label}
            </h3>

            {confidence && (
              <div className="mt-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    confidence === "high"
                      ? "bg-emerald-100 text-emerald-800"
                      : confidence === "medium"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {confidence} confidence
                </span>
              </div>
            )}

            <p className="mt-3 text-sm leading-relaxed text-slate-700 md:text-base">
              {guide.shortDescription}
            </p>

            {reason && (
              <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-slate-700">
                <span className="font-semibold text-emerald-700">Why this match:</span> {reason}
              </p>
            )}
          </div>
        </div>

        {/* Recommendations grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <RecCard title="Best glasses" items={guide.bestGlasses} icon="glasses" />
          <RecCard title="Best hairstyles" items={guide.bestHairstyles} icon="scissors" />
          <RecCard title="Best beard styles (men)" items={guide.bestBeard} icon="beard" />
          <RecCard
            title="Common mistake to avoid"
            items={[guide.commonMistake]}
            icon="warning"
          />
        </div>

        <div className="mt-6 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Stylist tip
          </p>
          <p className="mt-1 text-sm text-slate-700">{guide.styleTip}</p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl border-2 border-emerald-600 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Try again
          </button>
          <a
            href={`#shape-${guide.id}`}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
          >
            Read full {guide.label} guide →
          </a>
        </div>
      </div>
    </div>
  );
}

function RecCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: "glasses" | "scissors" | "beard" | "warning";
}) {
  const isWarning = icon === "warning";
  return (
    <div
      className={`rounded-xl border p-4 ${
        isWarning ? "border-red-100 bg-red-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <IconForRec icon={icon} />
        <h4
          className={`text-xs font-bold uppercase tracking-wider ${
            isWarning ? "text-red-700" : "text-emerald-700"
          }`}
        >
          {title}
        </h4>
      </div>
      <ul className="space-y-1.5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">{isWarning ? "✕" : "•"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconForRec({ icon }: { icon: "glasses" | "scissors" | "beard" | "warning" }) {
  const cls = "h-4 w-4 text-emerald-600";
  if (icon === "glasses") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} aria-hidden="true">
        <circle cx="6" cy="14" r="4" />
        <circle cx="18" cy="14" r="4" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    );
  }
  if (icon === "scissors") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    );
  }
  if (icon === "beard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden="true">
        <path d="M6 9c0-4 2-6 6-6s6 2 6 6v3c0 4-3 8-6 8s-6-4-6-8z" />
        <line x1="9" y1="11" x2="9.01" y2="11" />
        <line x1="15" y1="11" x2="15.01" y2="11" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-red-600" aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
 * Image with graceful SVG fallback
 * ─────────────────────────────────────────────────────── */

function FaceShapeImage({ src, alt, shape }: { src: string; alt: string; shape: FaceShape }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100"
      >
        <FaceShapeSvg shape={shape} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      onError={() => setErrored(true)}
    />
  );
}

/* Inline SVG silhouettes for each face shape — renders if no image is uploaded. */
function FaceShapeSvg({ shape }: { shape: FaceShape }) {
  // Each path is a stylized silhouette of the named face shape.
  const paths: Record<FaceShape, string> = {
    oval: "M100 20 C 60 20, 35 60, 35 120 C 35 175, 65 220, 100 220 C 135 220, 165 175, 165 120 C 165 60, 140 20, 100 20 Z",
    round: "M100 25 C 50 25, 30 75, 30 125 C 30 180, 60 220, 100 220 C 140 220, 170 180, 170 125 C 170 75, 150 25, 100 25 Z",
    square: "M50 30 L150 30 L160 80 L160 175 C 160 200, 130 220, 100 220 C 70 220, 40 200, 40 175 L40 80 Z",
    heart: "M40 30 L160 30 L170 90 C 170 130, 145 175, 100 220 C 55 175, 30 130, 30 90 Z",
    diamond: "M100 20 L70 60 L30 120 L70 180 L100 220 L130 180 L170 120 L130 60 Z",
    oblong: "M55 25 L145 25 L155 80 L155 195 C 155 215, 130 230, 100 230 C 70 230, 45 215, 45 195 L45 80 Z",
    rectangle: "M50 25 L150 25 L155 80 L155 200 C 155 215, 130 225, 100 225 C 70 225, 45 215, 45 200 L45 80 Z",
    triangle: "M70 30 L130 30 L150 80 L170 175 C 170 205, 140 225, 100 225 C 60 225, 30 205, 30 175 L50 80 Z",
  };
  return (
    <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" className="h-3/4 w-3/4 text-emerald-600" aria-hidden="true">
      <defs>
        <linearGradient id={`face-${shape}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d={paths[shape]}
        fill={`url(#face-${shape})`}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
 * Lightbox
 * ─────────────────────────────────────────────────────── */

function Lightbox({
  image,
  onClose,
}: {
  image: { src: string; alt: string };
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close full-screen view"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="aspect-square w-full bg-emerald-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-contain"
            onError={(e) => {
              // Replace broken image with inline SVG fallback.
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        </div>
      </div>
    </div>
  );
}
