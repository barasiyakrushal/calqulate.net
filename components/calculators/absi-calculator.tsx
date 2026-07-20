"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

import { SyncPrompt } from "@/components/marketing/SyncPrompt"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseNumber } from "@/lib/utils"
import {
  Calculator, RefreshCw, Loader2, Scale, Target, TrendingDown, TrendingUp,
  Activity, Info, Save, History, ChevronRight, AlertCircle, Award, Flame,
  Heart, Brain, ArrowRight, CheckCircle2, BarChart3, HelpCircle
} from "lucide-react";

// ─── VALIDATION SCHEMA ────────────────────────────────────────────────────────
const formSchema = z.object({
  waist: z.string().min(1, "Waist circumference is required"),
  weight: z.string().min(1, "Weight is required"),
  height: z.string().min(1, "Height is required"),
  age: z.string().min(1, "Age is required").refine(val => Number(val) >= 18, { message: "Age must be 18 or older" }),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  units: z.enum(["metric", "imperial"]),
});

type UnitSystem = "metric" | "imperial";

// ─── INTERFACES ───────────────────────────────────────────────────────────────
interface CalculationResult {
  bmi: number;
  absi: number;
  whtr: number;
  absiZScore: number;
  riskCategory: string;
  interpretation: string;
  riskColor: string;
  textRiskColor: string;
  badgeBg: string;
  recommendations: string[];
  absiFact: string;
  // USP #1 — population percentile
  percentile: number;
  percentileTone: "low" | "average" | "high";
  // USP #2 — target waist
  unitLabel: string;
  currentWaistStr: string;
  targetWaistStr: string;
  waistToLoseStr: string;
  projectedPercentile: number;
  waistAtTargetOptimal: boolean;
}

interface SavedEntry {
  date: string;
  bmi: number;
  absi: number;
  whtr: number;
  riskCategory: string;
  units: string;
  gender: string;
  age: string;
}

// ─── CONSTANTS & LOCAL STORAGE KEY ────────────────────────────────────────────
const STORAGE_KEY = "calqulate_absi_history";

// ─── BRAND PALETTE (Forest/Emerald Green Context) ─────────────────────────────
const brand = {
  primary: "#15803d", // emerald-700
  primaryBg: "#f0fdf4", // emerald-50
  primaryBorder: "#bbf7d0", // emerald-200
};

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
function getABSIStorage(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveABSIEntry(entry: SavedEntry) {
  try {
    const existing = getABSIStorage();
    existing.unshift(entry);
    const trimmed = existing.slice(0, 10); // Keep last 10 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

function absiDelta(current: number, previous: number) {
  return parseNumber((current - previous).toFixed(5));
}

function getAbsiDeltaLabel(delta: number): { label: string; color: string; improving: boolean } {
  if (Math.abs(delta) < 0.0005) {
    return { label: "No significant change in body shape metrics since your last check.", color: "#6b7280", improving: true };
  }
  if (delta < 0) {
    return { label: `Your ABSI decreased by ${Math.abs(delta).toFixed(5)} — moving in a healthier direction.`, color: brand.primary, improving: true };
  }
  return { label: `Your ABSI increased by ${delta.toFixed(5)} — indicating an increase in relative central body fat.`, color: "#c2410c", improving: false };
}

// Helper to determine the true prior entry for active comparisons (prevents matching the currently saved state)
function getPreviousEntry(current: CalculationResult, history: SavedEntry[]): SavedEntry | null {
  if (history.length === 0) return null;
  const latestSaved = history[0];
  // If latest entry matches current active output exactly, compare to the one before it
  const isDuplicateOfCurrent = Math.abs(latestSaved.absi - current.absi) < 1e-6 && Math.abs(latestSaved.bmi - current.bmi) < 1e-3;
  if (isDuplicateOfCurrent) {
    return history[1] || null;
  }
  return latestSaved;
}

// ─── GENDER/AGE SPECIFIC COHORT DATA (Epidemiological Reference Means) ────────
const getAbsiReference = (age: number, gender: "male" | "female"): { mean: number; sd: number } => {
  if (gender === "female") {
    if (age < 30) return { mean: 0.076, sd: 0.0045 };
    if (age < 50) return { mean: 0.079, sd: 0.0048 };
    return { mean: 0.083, sd: 0.0051 };
  } else {
    if (age < 30) return { mean: 0.077, sd: 0.0042 };
    if (age < 50) return { mean: 0.080, sd: 0.0046 };
    return { mean: 0.084, sd: 0.0050 };
  }
};

// ─── NORMAL CDF (Abramowitz & Stegun 26.2.17) → percentile from a z-score ─────
function normalCdf(z: number): number {
  const az = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * az);
  const d = 0.3989422804014327 * Math.exp((-az * az) / 2);
  const q = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - q : q;
}

// Ordinal suffix for percentiles: 1 → "1st", 22 → "22nd", 78 → "78th".
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── PERSONALIZED RECOMMENDATION ENGINE ───────────────────────────────────────
function generatePersonalizedRecommendations(riskCategory: string, whtr: number, bmi: number): string[] {
  const isHighVisceral = whtr > 0.5 || riskCategory.includes("High");
  const isBmiElevated = bmi >= 25;

  if (isHighVisceral && isBmiElevated) {
    return [
      "Prioritize visceral fat reduction: Integrate steady-state cardiovascular conditioning and full-body resistance exercises to retain muscle while decreasing trunk fat.",
      "Optimize nutrition: Reduce highly refined sugars and ultra-processed foods, which have a strong clinical correlation with selective abdominal visceral fat accumulation.",
      "Check stress & sleep hygiene: High chronic cortisol promotes visceral fat deposits. Ensure you are hitting 7-9 hours of restorative sleep and implementing baseline recovery habits.",
      "Target Waist-to-Height ratio: Work progressively toward bringing your waist circumference down to less than half your height (WHtR < 0.50)."
    ];
  }
  if (isHighVisceral && !isBmiElevated) {
    return [
      "Address metabolic 'Normal Weight Obesity' (TOFI): Focus on body recomposition. Maintain or slightly increase protein intake (1.2-1.6g/kg) and engage in progressive strength training.",
      "Add metabolic conditioning: Combine daily brisk walking (Zone 2) with high-intensity intervals once or twice a week to target metabolically active internal fat depots.",
      "Audit liquid carbohydrate sources: Monitor juices, soft drinks, and alcohol intake, which promote abdominal fat deposition despite a normal overall weight.",
      "Consult on metabolic markers: Consider asking your healthcare practitioner to monitor fasting insulin, HbA1c, and lipid panels to stay ahead of silent cardiovascular indicators."
    ];
  }
  if (!isHighVisceral && isBmiElevated) {
    return [
      "Preserve structural body composition: Your low relative waist-to-height ratio suggests an elevated BMI may stem from a solid skeletal frame or high muscle mass. Keep lifting.",
      "Monitor structural metrics: Check your waist-to-height ratio occasionally to ensure any weight gain is not shifting toward unhealthy central adiposity.",
      "Incorporate joint-friendly mobility: Maintain cardiac health with swimming, cycling, or climbing to preserve joints from unnecessary high-impact strain.",
      "Review caloric thresholds: Map out your total daily energy expenditure to align target goals with realistic muscle-maintenance parameters."
    ];
  }
  return [
    "Maintain high metabolic versatility: Continue a diversified eating structure composed primarily of whole food patterns, active fiber sources, and lean protein options.",
    "Prioritize strength over time: Focus on progressive resistance load to safeguard lean skeletal tissue from natural muscular atrophy as age bands increase.",
    "Perform baseline checks: Re-evaluate weight and waist circumference variables monthly to prevent silent, progressive central adiposity creep.",
    "Optimize recovery metrics: Maximize recovery indicators, targeting stable structural hydration (2.5-3.5L daily) to preserve systemic efficiency."
  ];
}

function getABSIFact(riskCategory: string, whtr: number): string {
  if (riskCategory.includes("High")) {
    return "Clinical Context: ABSI is backed by epidemiological research showing that central fat distribution (visceral fat) is a stronger predictor of premature mortality than BMI alone [1].";
  }
  if (whtr > 0.5) {
    return "Health Guideline: A Waist-to-Height Ratio (WHtR) over 0.50 points to increased cardiovascular exposure, regardless of whether your raw BMI categorizes you as healthy.";
  }
  return "Science: While BMI lumps muscle mass and visceral fat together, ABSI isolates central waist mass relative to standard height-and-weight coordinates to highlight real health risks [1].";
}

// ─── PROGRESS CARD COMPONENT ──────────────────────────────────────────────────
const ProgressCard = ({ current, history }: { current: CalculationResult; history: SavedEntry[] }) => {
  const previous = getPreviousEntry(current, history);
  if (!previous) return null;

  const delta = absiDelta(current.absi, previous.absi);
  const info = getAbsiDeltaLabel(delta);

  const prevWhtr = previous.whtr;
  const whtrDelta = current.whtr - prevWhtr;
  const bmiDeltaVal = current.bmi - previous.bmi;

  return (
    <div
      className="rounded-xl p-5 border flex items-start gap-4 max-w-4xl mx-auto shadow-sm"
      style={{
        background: info.improving ? brand.primaryBg : "#FEF3EE",
        borderColor: info.improving ? brand.primaryBorder : "#F5C4B3",
      }}
    >
      <div
        className="p-2 rounded-lg flex-shrink-0"
        style={{ background: info.improving ? brand.primaryBorder : "#F0997B" }}
      >
        {info.improving ? (
          <Award className="w-5 h-5 animate-pulse" style={{ color: brand.primary }} />
        ) : (
          <AlertCircle className="w-5 h-5 text-orange-700" />
        )}
      </div>
      <div className="space-y-2 w-full">
        <div>
          <p className="font-bold text-sm" style={{ color: info.improving ? brand.primary : "#993C1D" }}>
            {info.improving ? "Excellent! Your body composition is moving in the right direction." : "Central body shape metrics have shifted upward."}
          </p>
          <p className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">
            {info.label} · Compared to your check on {new Date(previous.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Side-by-Side Delta Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-dashed border-gray-300 dark:border-gray-700 text-xs">
          <div>
            <span className="text-gray-500 block">ABSI Delta</span>
            <span className={`font-bold ${delta <= 0 ? "text-emerald-700" : "text-orange-700"}`}>
              {delta <= 0 ? "" : "+"}{delta.toFixed(5)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">WHtR Delta</span>
            <span className={`font-bold ${whtrDelta <= 0 ? "text-emerald-700" : "text-orange-700"}`}>
              {whtrDelta <= 0 ? "" : "+"}{whtrDelta.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">BMI Delta</span>
            <span className={`font-bold ${bmiDeltaVal <= 0 ? "text-emerald-700" : "text-orange-700"}`}>
              {bmiDeltaVal <= 0 ? "" : "+"}{bmiDeltaVal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── HISTORY PANEL COMPONENT ──────────────────────────────────────────────────
const HistoryPanel = ({ history, onClear }: { history: SavedEntry[]; onClear: () => void }) => {
  if (history.length === 0) return null;

  return (
    <Card className="max-w-4xl mx-auto border shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-4 h-4 text-emerald-700" />
          Your Local ABSI Tracking History
        </CardTitle>
        <CardDescription className="text-xs">
          Stored directly in your browser. Nothing is uploaded and no tracking cookies are set.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SyncPrompt ctaId="sync_prompt_absi" />
        <div className="space-y-2">
          {history.map((entry, i) => {
            const nextEntry = history[i + 1];
            const delta = nextEntry ? absiDelta(entry.absi, nextEntry.absi) : null;
            return (
              <div key={entry.date} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b last:border-0 border-gray-100 dark:border-gray-800 gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: brand.primaryBg, color: brand.primary }}
                  >
                    #{history.length - i}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{entry.riskCategory}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at{" "}
                      {new Date(entry.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right text-xs">
                    <span className="text-gray-500">ABSI: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.absi.toFixed(5)}</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-gray-500">BMI: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.bmi.toFixed(1)}</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-gray-500">WHtR: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.whtr.toFixed(3)}</span>
                  </div>

                  {delta !== null && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: delta < 0 ? brand.primaryBg : "#FEF3EE",
                        color: delta < 0 ? brand.primary : "#993C1D",
                      }}
                    >
                      {delta < 0 ? "▼" : delta > 0 ? "▲" : "─"}{" "}
                      {Math.abs(delta).toFixed(4)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClear}
          className="mt-4 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear history from this browser
        </button>
      </CardContent>
    </Card>
  );
};

// ─── RISK QUADRANT CHART COMPONENT ────────────────────────────────────────────
const RiskQuadrantChart = ({ bmi, absi }: { bmi: number; absi: number }) => {
  // Normalize grid coordinates to fit inside the 0 to 100 boundaries
  const bmiPercent = Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100));
  // ABSI standard bounds: 0.06 to 0.10
  const absiPercent = 100 - Math.min(100, Math.max(0, ((absi - 0.06) / (0.1 - 0.06)) * 100));

  const quadrants = [
    { name: "High Shape Risk (High ABSI)", color: "bg-orange-500/10 dark:bg-orange-500/5 border-orange-200/50", textColor: "text-orange-600 dark:text-orange-400" },
    { name: "Highest Unified Risk (High BMI & ABSI)", color: "bg-red-500/10 dark:bg-red-500/5 border-red-200/50", textColor: "text-red-600 dark:text-red-400" },
    { name: "Lower Overall Risk Profile", color: "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-200/50", textColor: "text-emerald-700 dark:text-emerald-400" },
    { name: "High Mass Risk (High BMI)", color: "bg-yellow-500/10 dark:bg-yellow-500/5 border-yellow-200/50", textColor: "text-yellow-600 dark:text-yellow-400" },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-700" />
        ABSI vs. BMI Unified Risk Matrix
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed">
        This quadrant profiles how your weight profile (BMI) interacts dynamically with your central fat profile (ABSI) [1]. Standard models overlook hidden risks when waist ratios diverge from BMI thresholds.
      </p>
      <div className="relative w-full max-w-md mx-auto aspect-square grid grid-cols-2 grid-rows-2 gap-2 border border-muted p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 mt-4">
        {quadrants.map((q, i) => (
          <div key={i} className={`flex items-center justify-center rounded-lg border p-3 text-center transition-all ${q.color}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${q.textColor}`}>{q.name}</span>
          </div>
        ))}

        {/* Labels for Axis */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
          BMI Axis (Overall Weight) &rarr;
        </div>
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 text-[10px] uppercase font-bold tracking-widest text-gray-400 -rotate-90">
          ABSI Axis (Shape Risk) &rarr;
        </div>

        {/* Pinpoint User Coordinate */}
        <div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ top: `${absiPercent}%`, left: `${bmiPercent}%` }}
        >
          <div className="relative w-4 h-4 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-700 border-2 border-white dark:border-slate-950" />
            <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
              YOU (BMI: {bmi.toFixed(1)}, ABSI: {absi.toFixed(4)})
            </span>
          </div>
        </div>
      </div>
      <div className="pt-4 text-center">
        <span className="text-[10px] text-gray-400 italic">
          Standard grid margins represent normalized limits across global cohort groups.
        </span>
      </div>
    </div>
  );
};

// ─── MAIN EXPORTED COMPONENT ──────────────────────────────────────────────────
export default function ABSICalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [history, setHistory] = useState<SavedEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getABSIStorage());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      waist: "",
      weight: "",
      height: "",
      age: "30",
      gender: "female",
      units: "metric",
    },
  });

  // Basic Unit Converters
  const cmToInches = (cm: number) => cm / 2.54;
  const inchesToCm = (inches: number) => inches * 2.54;
  const kgToLbs = (kg: number) => kg * 2.20462;
  const lbsToKg = (lbs: number) => lbs / 2.20462;

  // Active inputs conversion logic
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentValues = form.getValues();
    const updatedValues: Record<string, any> = { ...currentValues };

    if (currentValues.height) {
      const h = parseNumber(currentValues.height);
      if (!isNaN(h)) {
        updatedValues.height =
          newUnit === "imperial" ? cmToInches(h).toFixed(1) : inchesToCm(h).toFixed(1);
      }
    }

    if (currentValues.waist) {
      const w = parseNumber(currentValues.waist);
      if (!isNaN(w)) {
        updatedValues.waist =
          newUnit === "imperial" ? cmToInches(w).toFixed(1) : inchesToCm(w).toFixed(1);
      }
    }

    if (currentValues.weight) {
      const wt = parseNumber(currentValues.weight);
      if (!isNaN(wt)) {
        updatedValues.weight =
          newUnit === "imperial" ? kgToLbs(wt).toFixed(1) : lbsToKg(wt).toFixed(1);
      }
    }

    updatedValues.units = newUnit;
    form.reset(updatedValues);
    setUnits(newUnit);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setSaved(false);

    setTimeout(() => {
      const waist = parseNumber(values.waist);
      const weight = parseNumber(values.weight);
      const height = parseNumber(values.height);
      const age = parseInt(values.age);
      const gender = values.gender;

      // Unify coordinates into metric SI base limits
      const weightInKg = units === "metric" ? weight : weight * 0.45359237;
      const heightInCm = units === "metric" ? height : height * 2.54;
      const heightInM = heightInCm / 100;
      const waistInM = (units === "metric" ? waist : waist * 2.54) / 100;

      // Core Physics Formulas
      const bmi = weightInKg / Math.pow(heightInM, 2);
      const absi = waistInM / (Math.pow(bmi, 2 / 3) * Math.pow(heightInM, 0.5));
      const whtr = waistInM / heightInM;

      // Extract precise statistical standard deviations
      const { mean, sd } = getAbsiReference(age, gender);
      const absiZScore = (absi - mean) / sd;

      let riskCategory = "";
      let riskColor = "";
      let textRiskColor = "";
      let badgeBg = "";

      if (absiZScore < -0.868) {
        riskCategory = "Low Risk Profile";
        riskColor = "bg-emerald-500";
        textRiskColor = "text-emerald-700";
        badgeBg = "#f0fdf4";
      } else if (absiZScore < 0.868) {
        riskCategory = "Average Risk Profile";
        riskColor = "bg-yellow-500";
        textRiskColor = "text-yellow-700";
        badgeBg = "#fefce8";
      } else if (absiZScore < 1.645) {
        riskCategory = "High Risk Profile";
        riskColor = "bg-orange-500";
        textRiskColor = "text-orange-700";
        badgeBg = "#fff7ed";
      } else {
        riskCategory = "Very High Risk Profile";
        riskColor = "bg-red-500";
        textRiskColor = "text-red-700";
        badgeBg = "#fef2f2";
      }

      // Dynamic epidemiological interpretation
      const isBmiNormal = bmi >= 18.5 && bmi < 25;
      let interpretation = "";

      if (riskCategory.includes("High") && isBmiNormal) {
        interpretation = "Your result indicates an elevated relative central adiposity despite your healthy body weight (normal BMI). Clinicians often term this 'normal weight obesity' or 'TOFI' (Thin Outside, Fat Inside) — which can host structural metabolic stresses otherwise missed by standard scales.";
      } else if (riskCategory.includes("High") && !isBmiNormal) {
        interpretation = "Both your ABSI profile and BMI coordinate metrics register inside highly elevated thresholds. This indicates systemic structural stresses stemming from unified weight variables and concentrated central adipose tissues. Consolidating healthy body recomposition is strongly indicated.";
      } else if (!riskCategory.includes("High") && !isBmiNormal) {
        interpretation = "Your shape dynamics (ABSI) present inside standard parameters despite showing a raised overall BMI. This distribution profile sometimes highlights elevated lean structural mass (muscle) or healthy subcutaneous fat layers. However, maintaining functional conditioning remains beneficial.";
      } else {
        interpretation = "Your results suggest a highly favorable relationship between standard mass variables and trunk boundaries. Both metrics fall within low-to-average risk bands compared against matching cohort age bands.";
      }

      // ── USP #1: population percentile from the z-score ──────────────────────
      const percentile = Math.min(99, Math.max(1, Math.round(normalCdf(absiZScore) * 100)));
      const percentileTone: "low" | "average" | "high" =
        percentile <= 25 ? "low" : percentile >= 75 ? "high" : "average";

      // ── USP #2: target waist to reach the cohort average (50th percentile) ───
      // ABSI isolates waist relative to BMI & height, so we hold BMI/height fixed
      // and solve for the waist that lands the user at their age/sex average.
      const denom = Math.pow(bmi, 2 / 3) * Math.pow(heightInM, 0.5);
      const targetWaistM = mean * denom; // waist (m) that yields ABSI = cohort mean
      const waistToLoseM = waistInM - targetWaistM; // positive ⇒ trim needed
      const waistAtTargetOptimal = waistToLoseM <= 0.005; // already at/below average

      // Convert metres → the unit the user entered with.
      const toUnit = (m: number) => (units === "metric" ? m * 100 : (m * 100) / 2.54);
      const unitLabel = units === "metric" ? "cm" : "in";
      const currentWaistStr = `${toUnit(waistInM).toFixed(1)} ${unitLabel}`;
      const targetWaistStr = `${toUnit(targetWaistM).toFixed(1)} ${unitLabel}`;
      const waistToLoseStr = `${toUnit(Math.abs(waistToLoseM)).toFixed(1)} ${unitLabel}`;
      const projectedPercentile = waistAtTargetOptimal ? percentile : 50; // average ⇒ 50th

      setResult({
        bmi,
        absi,
        whtr,
        absiZScore,
        riskCategory,
        interpretation,
        riskColor,
        textRiskColor,
        badgeBg,
        recommendations: generatePersonalizedRecommendations(riskCategory, whtr, bmi),
        absiFact: getABSIFact(riskCategory, whtr),
        percentile,
        percentileTone,
        unitLabel,
        currentWaistStr,
        targetWaistStr,
        waistToLoseStr,
        projectedPercentile,
        waistAtTargetOptimal,
      });

      setIsLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }, 700);
  }

  const handleSave = () => {
    if (!result) return;
    const values = form.getValues();
    const entry: SavedEntry = {
      date: new Date().toISOString(),
      bmi: result.bmi,
      absi: result.absi,
      whtr: result.whtr,
      riskCategory: result.riskCategory,
      units: values.units,
      gender: values.gender,
      age: values.age,
    };
    saveABSIEntry(entry);
    setHistory(getABSIStorage());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    setShowHistory(false);
  };

  return (
    <div className="space-y-8">
      {/* ── HISTORICAL TRACKING TRIGGER ────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="max-w-4xl mx-auto flex justify-between items-center bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Found {history.length} active browser {history.length === 1 ? "record" : "records"}
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider hover:underline"
            style={{ color: brand.primary }}
          >
            {showHistory ? "Collapse Tracking" : "Show Saved Entries"}
            <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}

      {showHistory && (
        <div className="space-y-4">
          <HistoryPanel history={history} onClear={clearHistory} />
        </div>
      )}

      {/* ── CALCULATOR INTERFACE ──────────────────────────────────────────────── */}
      <Card className="max-w-4xl mx-auto shadow-lg overflow-hidden" style={{ borderTop: `4px solid ${brand.primary}` }}>
        <CardHeader className="pb-6 border-b" style={{ background: `linear-gradient(to bottom, ${brand.primaryBg}, white)` }}>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Scale className="w-6 h-6 text-emerald-700" />
                A Body Shape Index (ABSI) Calculator
              </CardTitle>
              <CardDescription className="mt-1">
                Evaluate visceral fat metrics, waist-to-height correlations, and customized shape-based mortality risks [1].
              </CardDescription>
            </div>
            {history.length > 0 && (
              <div
                className="hidden sm:flex text-xs font-semibold px-3 py-1.5 rounded-full items-center gap-1.5"
                style={{ background: brand.primaryBg, color: brand.primary, border: `1px solid ${brand.primaryBorder}` }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Browser Saving On
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Sex assigned at birth & Unit System settings */}
              <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="font-semibold">Sex assigned at birth</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2">
                          {["female", "male"].map((g) => (
                            <FormItem key={g} className="flex-1">
                              <FormControl><RadioGroupItem value={g} className="peer sr-only" /></FormControl>
                              <FormLabel
                                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-emerald-700 peer-data-[state=checked]:text-emerald-700 cursor-pointer transition-all capitalize"
                              >
                                {g}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="font-semibold">Unit System</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(val: UnitSystem) => {
                            field.onChange(val);
                            handleUnitChange(val);
                          }}
                          value={field.value}
                          className="flex gap-2"
                        >
                          <FormItem className="flex-1">
                            <FormControl><RadioGroupItem value="metric" className="peer sr-only" /></FormControl>
                            <FormLabel className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-emerald-700 peer-data-[state=checked]:text-emerald-700 cursor-pointer transition-all text-sm">
                              Metric (cm, kg)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex-1">
                            <FormControl><RadioGroupItem value="imperial" className="peer sr-only" /></FormControl>
                            <FormLabel className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-emerald-700 peer-data-[state=checked]:text-emerald-700 cursor-pointer transition-all text-sm">
                              Imperial (in, lbs)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Data Grid fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist Circumference ({units === "metric" ? "cm" : "inches"})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={units === "metric" ? "88" : "34"} {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height ({units === "metric" ? "cm" : "inches"})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={units === "metric" ? "170" : "67"} {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight ({units === "metric" ? "kg" : "pounds"})</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder={units === "metric" ? "70" : "155"} {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" size="lg" className="flex-1 text-lg h-14 font-bold" disabled={isLoading} style={{ background: brand.primary, color: "white" }}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Calculator className="mr-2 h-5 w-5" />}
                  Calculate Shape Risk
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="sm:w-44 text-lg h-14"
                  onClick={() => {
                    form.reset({
                      waist: "",
                      weight: "",
                      height: "",
                      age: "30",
                      gender: "female",
                      units: "metric",
                    });
                    setResult(null);
                    setSaved(false);
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-5 w-5" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── UNIFIED RESULTS BLOCK ─────────────────────────────────────────────── */}
      <div ref={resultsRef} className="scroll-mt-16">
        {result && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-6 duration-700 fade-in">
            {/* COMPARATIVE PROGRESS COMPONENT */}
            <ProgressCard current={result} history={history} />

            {/* 1. PRIMARY HEALTH HERO SHIELD */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className={`h-1.5 w-full ${result.riskColor}`} />
              <CardContent className="p-8 md:p-10">
                {/* Visual Fact Strip */}
                <div
                  className="text-xs font-semibold px-4 py-2.5 rounded-lg mb-6 flex items-start gap-2.5"
                  style={{ background: brand.primaryBg, color: brand.primary, border: `1px solid ${brand.primaryBorder}` }}
                >
                  <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{result.absiFact}</span>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Result Metric */}
                  <div className="flex-shrink-0 text-center md:text-left min-w-[200px]">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
                      style={{ background: result.badgeBg, color: result.textRiskColor }}
                    >
                      <Activity className="w-3.5 h-3.5" /> Calculated Risk
                    </div>
                    <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                      {result.riskCategory}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Z-Score: {result.absiZScore.toFixed(3)}
                    </div>
                  </div>

                  {/* Interpretation Area */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="pt-2">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dynamic Profile Synthesis</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                        {result.interpretation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk spectrum bar */}
                <div className="border-t pt-6 mt-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Your Z-Score Placement</h3>
                  <div className="relative w-full h-3 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 rounded-full">
                    {/* Z-Scores mapped to a relative scale of -3 to +3 (translating to a 0% to 100% spectrum) */}
                    <div
                      className="absolute top-1/2 h-5 w-5 rounded-full bg-white border-4 shadow-lg -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                      style={{
                        left: `${Math.min(100, Math.max(0, ((result.absiZScore + 3) / 6) * 100))}%`,
                        borderColor: result.absiZScore < -0.868 ? "#10b981" : result.absiZScore < 0.868 ? "#eab308" : result.absiZScore < 1.645 ? "#f97316" : "#ef4444",
                      }}
                      title={`Z-Score: ${result.absiZScore.toFixed(3)}`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-2 px-1">
                    <span>Very Low Risk</span>
                    <span>Average Threshold</span>
                    <span>High Risk</span>
                    <span>Extreme Risk</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* USP #1 — POPULATION PERCENTILE ───────────────────────────────── */}
            <Card className="border shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold">Where You Rank — Population Percentile</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your ABSI sits in the{" "}
                  <span
                    className={`font-bold ${
                      result.percentileTone === "low"
                        ? "text-emerald-700"
                        : result.percentileTone === "high"
                        ? "text-red-600"
                        : "text-yellow-700"
                    }`}
                  >
                    {ordinal(result.percentile)} percentile
                  </span>{" "}
                  for your age and sex — your central-fat risk is{" "}
                  {result.percentileTone === "low"
                    ? "lower than most people like you."
                    : result.percentileTone === "high"
                    ? "higher than most people like you."
                    : "about average for people like you."}
                </p>

                {/* Percentile bar */}
                <div className="relative mt-6 w-full h-3 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 rounded-full">
                  <div
                    className="absolute top-1/2 h-5 w-5 rounded-full bg-white border-4 shadow-lg -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                    style={{
                      left: `${result.percentile}%`,
                      borderColor:
                        result.percentileTone === "low"
                          ? "#10b981"
                          : result.percentileTone === "high"
                          ? "#ef4444"
                          : "#eab308",
                    }}
                    title={`${ordinal(result.percentile)} percentile`}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-2 px-1">
                  <span>Low risk (0)</span>
                  <span>Average (50)</span>
                  <span>High risk (100)</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  Percentile is derived from your ABSI z-score against age- and sex-matched reference data — a higher percentile means more central fat relative to peers.
                </p>
              </CardContent>
            </Card>

            {/* USP #2 — TARGET WAIST ───────────────────────────────────────────── */}
            <Card className="border shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold">Your Target Waist</h3>
                </div>

                {result.waistAtTargetOptimal ? (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Great news — at your current weight, your waist of{" "}
                    <strong className="text-emerald-700">{result.currentWaistStr}</strong> is already at or below the
                    average for your age and sex. Maintain it with your current habits and re-check every few weeks.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      Trimming your waist to about{" "}
                      <strong className="text-emerald-700">{result.targetWaistStr}</strong> — a reduction of{" "}
                      <strong className="text-emerald-700">{result.waistToLoseStr}</strong> at your current weight —
                      would move you from the {ordinal(result.percentile)} to roughly the{" "}
                      {ordinal(result.projectedPercentile)} percentile, lowering your central-fat risk to average.
                    </p>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Current</p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{result.currentWaistStr}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                          <TrendingDown className="w-3.5 h-3.5" /> Lose
                        </div>
                        <p className="text-lg font-black text-emerald-700 mt-1">{result.waistToLoseStr}</p>
                      </div>
                      <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Target</p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{result.targetWaistStr}</p>
                      </div>
                    </div>
                  </>
                )}
                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  Target assumes waist reduction through central-fat loss at a stable weight. Use it as a motivating first milestone, not a medical prescription.
                </p>
              </CardContent>
            </Card>

            {/* 2. THREE-PANE ANALYSIS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BMI Panel */}
              <Card className="border shadow-md">
                <CardHeader className="pb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Weight Metric</span>
                  <CardTitle className="text-xl">Body Mass Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight mb-1 text-gray-800 dark:text-gray-100">
                    {result.bmi.toFixed(1)}
                  </div>
                  <Badge variant="outline" className="text-xs font-bold">
                    {result.bmi < 18.5 ? "Underweight" : result.bmi < 25 ? "Normal Range" : result.bmi < 30 ? "Overweight" : "Obesity Category"}
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                    Calculates aggregate body mass per unit of frame height, mapping weight limits [1].
                  </p>
                </CardContent>
              </Card>

              {/* ABSI Panel */}
              <Card className="border shadow-md">
                <CardHeader className="pb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Adiposity Index</span>
                  <CardTitle className="text-xl">A Body Shape Index</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight mb-1 text-gray-800 dark:text-gray-100">
                    {result.absi.toFixed(5)}
                  </div>
                  <Badge variant="outline" className="text-xs font-bold bg-muted">
                    Raw Coordinate
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                    Measures relative trunk size compared against average profiles to isolate health vulnerabilities [1].
                  </p>
                </CardContent>
              </Card>

              {/* WHtR Panel */}
              <Card className="border shadow-md">
                <CardHeader className="pb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">Structural Ratio</span>
                  <CardTitle className="text-xl">Waist-to-Height</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight mb-1 text-gray-800 dark:text-gray-100">
                    {result.whtr.toFixed(3)}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${result.whtr > 0.5 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                  >
                    {result.whtr > 0.5 ? "Elevated Risk" : "Optimal"}
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                    Reflects relative cardiovascular stress; optimal profiles represent values below 0.50.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3. QUADRANT GRAPHICS MAP */}
            <Card className="border shadow-md">
              <CardContent className="p-6 md:p-8">
                <RiskQuadrantChart bmi={result.bmi} absi={result.absi} />
              </CardContent>
            </Card>

            {/* 4. HIGH-CTR PERSONALIZED ACTION RECOMMENDATIONS */}
            <Card className="border-0 shadow-lg" style={{ background: brand.primaryBg, border: `1px solid ${brand.primaryBorder}` }}>
              <CardContent className="p-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <ArrowRight className="w-5 h-5 animate-bounce-horizontal" style={{ color: brand.primary }} />
                  <h3 className="text-lg font-black" style={{ color: brand.primary }}>
                    Personalized Body Recomposition Steps
                  </h3>
                </div>
                <div className="space-y-3">
                  {result.recommendations.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/80 dark:bg-slate-950/70 rounded-lg p-3.5 border border-emerald-100/50">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: brand.primary, color: "white" }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Core Cross-Links */}
                <div className="mt-8 pt-4 border-t" style={{ borderColor: brand.primaryBorder }}>
                  <p className="text-xs font-bold mb-3" style={{ color: brand.primary }}>Compare other key baseline metrics &rarr;</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "TDEE / Calories Calculator", href: "/health/tdee-calculator" },
                      { label: "Ideal Body Weight Calculator", href: "/health/ideal-body-weight-calculator" },
                      { label: "Body Fat % Calculator", href: "/health/body-fat-calculator" },
                      { label: "Heart Rate Zones", href: "/health/heart-rate-calculator" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all hover:bg-white/95 border bg-white text-gray-700 hover:shadow-sm"
                        style={{ borderColor: brand.primaryBorder }}
                      >
                        {link.label} <ChevronRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. CLINICAL & ETHNIC COHORT DISCLAIMER */}
            <div className="text-[11px] text-gray-400 text-center max-w-2xl mx-auto leading-relaxed px-4">
              <strong>Methodology & Limits:</strong> A Body Shape Index (ABSI) uses statistical approximations built on historical cohort analyses [1]. Clinical classifications represent statistical calculations of mortality odds relative to age, gender, and regional populations, and are not direct medical diagnostic markers. Subcutaneous fat vs. visceral mass distribution patterns may vary across ethnic backgrounds. Consult certified healthcare practitioners before initiating new training or nutritional pathways.
            </div>

            {/* 6. STORAGE SAVE & REDIRECT CONSOLES */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-6">
              <Button
                onClick={handleSave}
                disabled={saved}
                className="font-bold px-8 w-full sm:w-auto h-12"
                style={saved ? { background: brand.primaryBg, color: brand.primary, border: `1px solid ${brand.primaryBorder}` } : { background: brand.primary, color: "white" }}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Saved in History
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save to Progress History
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-12"
                onClick={() => {
                  form.reset({
                    waist: "",
                    weight: "",
                    height: "",
                    age: "30",
                    gender: "female",
                    units: "metric",
                  });
                  setResult(null);
                  setSaved(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> New Evaluation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}