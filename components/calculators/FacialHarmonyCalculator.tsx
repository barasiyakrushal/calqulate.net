"use client";

// components/calculators/FacialHarmonyCalculator.tsx
// Reusable Facial Harmony Calculator (USP widget).
// Two ways to measure: upload a photo and click landmark points, or type angles
// in by hand. Results are scored against clinical "balanced" ranges, saved to
// localStorage, and can be compared across dates. No data leaves the browser.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  facialMetrics,
  idealFor,
  scoreMetric,
  overallScore,
  scoreBand,
  angle3,
  tiltAngle,
  ratioLenWidth,
  type FacialMetric,
  type Gender,
  type Pt,
} from "@/lib/blog/facial-harmony-data";
import { parseNumber } from "@/lib/utils";

type NPt = { x: number; y: number };
type PointMap = Record<string, NPt[]>;
type ValueMap = Record<string, number | null>;

interface SavedResult {
  id: string;
  label: string;
  date: string;
  gender: Gender;
  values: ValueMap;
  score: number;
}

const STORAGE_KEY = "calqulate_facial_harmony_results_v1";

function toPixels(pts: NPt[], natW: number, natH: number): Pt[] {
  return pts.map((p) => ({ x: p.x * natW, y: p.y * natH }));
}

function computeValue(
  metric: FacialMetric,
  pts: NPt[],
  natW: number,
  natH: number
): number | null {
  const need = metric.points.length;
  if (pts.length < need) return null;
  const px = toPixels(pts, natW, natH);
  if (metric.geometry === "angle3") {
    return round1(angle3(px[0], px[1], px[2]));
  }
  if (metric.geometry === "tiltLine") {
    return round1(tiltAngle(px[0], px[1]));
  }
  if (metric.geometry === "ratioLenWidth") {
    return round2(ratioLenWidth(px[0], px[1], px[2], px[3]));
  }
  return null;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function fmt(metric: FacialMetric, v: number | null): string {
  if (v === null || Number.isNaN(v)) return "—";
  return metric.unit === "deg" ? `${v}°` : `${v.toFixed(2)}`;
}

export default function FacialHarmonyCalculator() {
  const [gender, setGender] = useState<Gender>("neutral");
  const [mode, setMode] = useState<"photo" | "manual">("photo");

  const [values, setValues] = useState<ValueMap>({});

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [natSize, setNatSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });
  const [activeId, setActiveId] = useState<string>(facialMetrics[0].id);
  const [points, setPoints] = useState<PointMap>({});

  const [saved, setSaved] = useState<SavedResult[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const imgWrapRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((next: SavedResult[]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be full or blocked */
    }
  }, []);

  const activeMetric = facialMetrics.find((m) => m.id === activeId)!;

  useEffect(() => {
    if (mode !== "photo") return;
    const pts = points[activeId] ?? [];
    const v = computeValue(activeMetric, pts, natSize.w, natSize.h);
    setValues((prev) => ({ ...prev, [activeId]: v }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, activeId, natSize, mode]);

  const overall = useMemo(() => overallScore(values, gender), [values, gender]);
  const filledCount = facialMetrics.filter(
    (m) => values[m.id] !== null && values[m.id] !== undefined
  ).length;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const im = new Image();
      im.onload = () => {
        setNatSize({ w: im.naturalWidth, h: im.naturalHeight });
        setImgSrc(src);
        setPoints({});
        setValues({});
      };
      im.src = src;
    };
    reader.readAsDataURL(file);
  }

  function onImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgSrc || !imgWrapRef.current) return;
    const rect = imgWrapRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const need = activeMetric.points.length;
    setPoints((prev) => {
      const cur = prev[activeId] ?? [];
      const next = cur.length >= need ? [{ x: nx, y: ny }] : [...cur, { x: nx, y: ny }];
      return { ...prev, [activeId]: next };
    });
  }

  function undoPoint() {
    setPoints((prev) => {
      const cur = prev[activeId] ?? [];
      return { ...prev, [activeId]: cur.slice(0, -1) };
    });
  }
  function clearPoints() {
    setPoints((prev) => ({ ...prev, [activeId]: [] }));
  }
  function resetAll() {
    setImgSrc(null);
    setPoints({});
    setValues({});
    if (fileRef.current) fileRef.current.value = "";
  }

  function onManual(id: string, raw: string) {
    const v = raw.trim() === "" ? null : parseNumber(raw);
    setValues((prev) => ({ ...prev, [id]: v === null || Number.isNaN(v) ? null : v }));
  }

  function saveResult() {
    if (overall === null) return;
    const now = new Date();
    const result: SavedResult = {
      id: `${now.getTime()}`,
      label: now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      date: now.toISOString(),
      gender,
      values: { ...values },
      score: overall,
    };
    persist([result, ...saved].slice(0, 20));
  }
  function deleteSaved(id: string) {
    persist(saved.filter((s) => s.id !== id));
    setCompareIds((c) => c.filter((x) => x !== id));
  }
  function loadSaved(s: SavedResult) {
    setGender(s.gender);
    setValues({ ...s.values });
    setMode("manual");
  }
  function toggleCompare(id: string) {
    setCompareIds((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 2) return [c[1], id];
      return [...c, id];
    });
  }

  const compareA = saved.find((s) => s.id === compareIds[0]);
  const compareB = saved.find((s) => s.id === compareIds[1]);

  return (
    <div className="w-full text-slate-800">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {(["photo", "manual"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
                mode === m
                  ? "bg-white text-emerald-700 shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m === "photo" ? "📷 Photo mode" : "✏️ Manual mode"}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Profile
          </span>
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {(
              [
                { k: "neutral", t: "Neutral" },
                { k: "female", t: "Female" },
                { k: "male", t: "Male" },
              ] as { k: Gender; t: string }[]
            ).map((g) => (
              <button
                key={g.k}
                onClick={() => setGender(g.k)}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  gender === g.k
                    ? "bg-white text-emerald-700 shadow"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {g.t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          {mode === "photo" ? (
            <PhotoPanel
              imgSrc={imgSrc}
              imgWrapRef={imgWrapRef}
              fileRef={fileRef}
              onFile={onFile}
              onImageClick={onImageClick}
              activeMetric={activeMetric}
              activeId={activeId}
              setActiveId={setActiveId}
              points={points}
              values={values}
              gender={gender}
              undoPoint={undoPoint}
              clearPoints={clearPoints}
              resetAll={resetAll}
            />
          ) : (
            <ManualPanel values={values} gender={gender} onManual={onManual} />
          )}
        </div>

        <div>
          <ResultsPanel
            values={values}
            gender={gender}
            overall={overall}
            filledCount={filledCount}
            onSave={saveResult}
          />
        </div>
      </div>

      <SavedPanel
        saved={saved}
        compareIds={compareIds}
        toggleCompare={toggleCompare}
        loadSaved={loadSaved}
        deleteSaved={deleteSaved}
      />

      {(compareA || compareB) && (
        <ComparePanel a={compareA} b={compareB} />
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Everything you enter stays in this browser. Nothing is uploaded. This tool is for
        general interest, not a medical or cosmetic assessment.
      </p>
    </div>
  );
}

function PhotoPanel(props: {
  imgSrc: string | null;
  imgWrapRef: React.RefObject<HTMLDivElement>;
  fileRef: React.RefObject<HTMLInputElement>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  activeMetric: FacialMetric;
  activeId: string;
  setActiveId: (id: string) => void;
  points: PointMap;
  values: ValueMap;
  gender: Gender;
  undoPoint: () => void;
  clearPoints: () => void;
  resetAll: () => void;
}) {
  const {
    imgSrc,
    imgWrapRef,
    fileRef,
    onFile,
    onImageClick,
    activeMetric,
    activeId,
    setActiveId,
    points,
    values,
    gender,
    undoPoint,
    clearPoints,
    resetAll,
  } = props;

  const pts = points[activeId] ?? [];
  const nextPointLabel = activeMetric.points[pts.length] ?? null;
  const value = values[activeId] ?? null;
  const range = idealFor(activeMetric, gender);

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {facialMetrics.map((m) => {
          const done =
            (points[m.id]?.length ?? 0) >= m.points.length &&
            values[m.id] !== null &&
            values[m.id] !== undefined;
          return (
            <button
              key={m.id}
              onClick={() => setActiveId(m.id)}
              className={`rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                activeId === m.id
                  ? "text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={activeId === m.id ? { backgroundColor: m.brandColor } : undefined}
            >
              {done && <span className="mr-1">✓</span>}
              {m.short}
            </button>
          );
        })}
      </div>

      {!imgSrc ? (
        <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 text-center transition hover:bg-emerald-50">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
          <span className="text-4xl">📷</span>
          <span className="mt-3 px-6 text-sm font-semibold text-emerald-700">
            Upload a photo to start
          </span>
          <span className="mt-1 px-8 text-xs text-slate-500">
            Side profile for jaw and nose angles, front-on for eyes and ratio. Your image
            never leaves your device.
          </span>
        </label>
      ) : (
        <>
          <div
            ref={imgWrapRef}
            onClick={onImageClick}
            className="relative w-full cursor-crosshair select-none overflow-hidden rounded-2xl ring-1 ring-slate-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="Your uploaded face" className="block w-full" />

            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {pts.length >= 2 &&
                (activeMetric.geometry === "ratioLenWidth" ? (
                  <>
                    {pts[0] && pts[1] && (
                      <line
                        x1={pts[0].x * 100}
                        y1={pts[0].y * 100}
                        x2={pts[1].x * 100}
                        y2={pts[1].y * 100}
                        stroke={activeMetric.brandColor}
                        strokeWidth={0.5}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    {pts[2] && pts[3] && (
                      <line
                        x1={pts[2].x * 100}
                        y1={pts[2].y * 100}
                        x2={pts[3].x * 100}
                        y2={pts[3].y * 100}
                        stroke={activeMetric.brandColor}
                        strokeWidth={0.5}
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                  </>
                ) : (
                  <polyline
                    points={pts.map((p) => `${p.x * 100},${p.y * 100}`).join(" ")}
                    fill="none"
                    stroke={activeMetric.brandColor}
                    strokeWidth={0.5}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
            </svg>

            {pts.map((p, i) => (
              <span
                key={i}
                className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[10px] font-bold text-white shadow ring-2 ring-white"
                style={{
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  backgroundColor: activeMetric.brandColor,
                }}
              >
                {i + 1}
              </span>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
            {nextPointLabel ? (
              <p className="text-sm text-slate-700">
                <span className="font-bold text-emerald-700">
                  Point {pts.length + 1} of {activeMetric.points.length}:
                </span>{" "}
                click <strong>{nextPointLabel}</strong>
              </p>
            ) : (
              <p className="text-sm text-slate-700">
                <span className="font-bold text-emerald-700">{activeMetric.name}:</span>{" "}
                <strong>{fmt(activeMetric, value)}</strong>{" "}
                <span className="text-slate-500">
                  (balanced {range.min}
                  {activeMetric.unit === "deg" ? "°" : ""} to {range.max}
                  {activeMetric.unit === "deg" ? "°" : ""})
                </span>
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={undoPoint}
                disabled={pts.length === 0}
                className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-40"
              >
                Undo point
              </button>
              <button
                onClick={clearPoints}
                disabled={pts.length === 0}
                className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:opacity-40"
              >
                Clear this metric
              </button>
              <button
                onClick={resetAll}
                className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
              >
                New photo
              </button>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500">{activeMetric.blurb}</p>
        </>
      )}
    </div>
  );
}

function ManualPanel(props: {
  values: ValueMap;
  gender: Gender;
  onManual: (id: string, raw: string) => void;
}) {
  const { values, gender, onManual } = props;
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
      <p className="mb-4 text-sm text-slate-600">
        Already measured your angles with a digital protractor? Type them in. Leave any box
        blank and it just won't count toward your score.
      </p>
      <div className="space-y-3">
        {facialMetrics.map((m) => {
          const range = idealFor(m, gender);
          const v = values[m.id];
          return (
            <div key={m.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{m.name}</p>
                <p className="text-xs text-slate-400">
                  balanced {range.min}
                  {m.unit === "deg" ? "°" : ""} to {range.max}
                  {m.unit === "deg" ? "°" : ""}
                </p>
              </div>
              <div className="relative w-28 shrink-0">
                <input
                  type="number"
                  inputMode="decimal"
                  step={m.unit === "deg" ? 1 : 0.01}
                  value={v === null || v === undefined ? "" : v}
                  onChange={(e) => onManual(m.id, e.target.value)}
                  placeholder={m.unit === "deg" ? "e.g. 120" : "e.g. 0.85"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-base font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {m.unit === "deg" ? "°" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultsPanel(props: {
  values: ValueMap;
  gender: Gender;
  overall: number | null;
  filledCount: number;
  onSave: () => void;
}) {
  const { values, gender, overall, filledCount, onSave } = props;
  const band = overall !== null ? scoreBand(overall) : null;
  const circ = 2 * Math.PI * 52;
  const dash = overall !== null ? (overall / 100) * circ : 0;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-4 ring-1 ring-emerald-200 sm:p-5">
      <div className="flex items-center gap-5">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={band?.color ?? "#10b981"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              style={{ transition: "stroke-dasharray .5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">
              {overall === null ? "—" : overall}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              / 100
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Harmony score
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {band ? band.label : "Add a measurement"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {filledCount} of {facialMetrics.length} measured
          </p>
          <button
            onClick={onSave}
            disabled={overall === null}
            className="mt-3 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            💾 Save this result
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {facialMetrics.map((m) => {
          const v = values[m.id] ?? null;
          const s = scoreMetric(m, v, gender);
          const range = idealFor(m, gender);
          return (
            <div key={m.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{m.name}</span>
                <span className="tabular-nums text-slate-500">
                  {fmt(m, v)}
                  {s !== null && (
                    <span className="ml-2 font-semibold" style={{ color: m.brandColor }}>
                      {s}/100
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${s ?? 0}%`,
                    backgroundColor: m.brandColor,
                  }}
                />
              </div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                balanced {range.min}
                {m.unit === "deg" ? "°" : ""} to {range.max}
                {m.unit === "deg" ? "°" : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SavedPanel(props: {
  saved: SavedResult[];
  compareIds: string[];
  toggleCompare: (id: string) => void;
  loadSaved: (s: SavedResult) => void;
  deleteSaved: (id: string) => void;
}) {
  const { saved, compareIds, toggleCompare, loadSaved, deleteSaved } = props;
  if (saved.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
        No saved results yet. Measure your face, then hit{" "}
        <strong>Save this result</strong>. Your history shows up here and stays on this
        device so you can compare it on your next visit.
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Your saved results
        </h4>
        <span className="text-xs text-slate-400">tick two to compare</span>
      </div>
      <div className="space-y-2">
        {saved.map((s) => {
          const band = scoreBand(s.score);
          const checked = compareIds.includes(s.id);
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCompare(s.id)}
                className="h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: band.color }}
              >
                {s.score}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {s.label}{" "}
                  <span className="font-normal text-slate-400">· {band.label}</span>
                </p>
                <p className="truncate text-xs text-slate-400 capitalize">
                  {s.gender} profile
                </p>
              </div>
              <button
                onClick={() => loadSaved(s)}
                className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50"
              >
                Load
              </button>
              <button
                onClick={() => deleteSaved(s.id)}
                aria-label="Delete result"
                className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComparePanel(props: { a?: SavedResult; b?: SavedResult }) {
  const { a, b } = props;
  if (!a && !b) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <div className="bg-slate-900 px-4 py-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-white">
          Compare results
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
              <th className="px-4 py-2 font-semibold">Measurement</th>
              <th className="px-4 py-2 font-semibold">{a?.label ?? "—"}</th>
              <th className="px-4 py-2 font-semibold">{b?.label ?? "—"}</th>
              <th className="px-4 py-2 font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 bg-emerald-50/40">
              <td className="px-4 py-2 font-bold text-slate-800">Harmony score</td>
              <td className="px-4 py-2 font-bold tabular-nums">{a ? a.score : "—"}</td>
              <td className="px-4 py-2 font-bold tabular-nums">{b ? b.score : "—"}</td>
              <td className="px-4 py-2 font-bold tabular-nums">
                {a && b ? <Delta v={b.score - a.score} unit="" /> : "—"}
              </td>
            </tr>
            {facialMetrics.map((m) => {
              const va = a?.values[m.id] ?? null;
              const vb = b?.values[m.id] ?? null;
              const diff =
                va !== null && vb !== null ? round1Diff(vb - va) : null;
              return (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 text-slate-700">{m.name}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-600">{fmt(m, va)}</td>
                  <td className="px-4 py-2 tabular-nums text-slate-600">{fmt(m, vb)}</td>
                  <td className="px-4 py-2 tabular-nums">
                    {diff !== null ? (
                      <Delta v={diff} unit={m.unit === "deg" ? "°" : ""} />
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function round1Diff(n: number) {
  return Math.round(n * 10) / 10;
}

function Delta({ v, unit }: { v: number; unit: string }) {
  if (v === 0) return <span className="text-slate-400">0{unit}</span>;
  const up = v > 0;
  return (
    <span className={up ? "text-emerald-600" : "text-rose-500"}>
      {up ? "▲ +" : "▼ "}
      {v}
      {unit}
    </span>
  );
}
