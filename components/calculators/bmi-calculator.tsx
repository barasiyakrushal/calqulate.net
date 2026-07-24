"use client";

import { SyncPrompt } from "@/components/marketing/SyncPrompt";
import { Glp1EligibilityBranch } from "@/components/calculators/glp1-eligibility-branch";
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { parseNumber } from "@/lib/utils"
import {
  Calculator, RefreshCw, Loader2, Scale, Target, TrendingDown, TrendingUp,
  Activity, Info, Save, History, ChevronRight, AlertCircle, Award, Flame,
  Heart, Brain, ArrowRight, CheckCircle2, BarChart3
} from "lucide-react";

// ─── SCHEMA ───────────────────────────────────────────────────────────────────
const formSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.string().min(1, "Age is required"),
  units: z.enum(["metric", "imperial"]),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  heightFt: z.string().optional(),
  heightIn: z.string().optional(),
  weightLbs: z.string().optional(),
  waist: z.string().optional(), // optional — sharpens the read, never required
});

type UnitSystem = "metric" | "imperial";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  textColor: string;
  badgeBg: string;
  ponderalIndex: number;
  prime: number;
  idealRange: string;
  weightDifference: { amount: string; amountNum: number; type: "lose" | "gain" | "maintain" } | null;
  description: string;
  headline: string;
  subheadline: string;
  nextSteps: string[];
  usFact: string;
  riskLevel: "low" | "moderate" | "high" | "very-high";
  // ── FEATURE 1: waist-to-height cross-check + muscle/athlete caveat ──────────
  waistCheck: {
    hasWaist: boolean;
    whtr: number | null;           // waist-to-height ratio (null if no waist given)
    whtrTone: "low" | "elevated" | null;
    showMuscleCaveat: boolean;     // BMI flags overweight/obese but waist looks healthy
    headline: string;
    body: string;
  };
  // ── FEATURE 2: healthy weight range + amount to reach the midpoint ──────────
  midpoint: {
    targetWeightStr: string;       // weight at BMI ~21.7
    differenceStr: string;         // amount to gain/lose to reach the midpoint
    direction: "lose" | "gain" | "at-target";
  };
}

interface SavedEntry {
  date: string;
  bmi: number;
  category: string;
  weightDiff: string;
  weightDiffType: string;
  units: string;
  gender: string;
  age: string;
}

// ─── CONSTS ───────────────────────────────────────────────────────────────────
const KG_TO_LBS = 2.20462;
const CM_TO_IN = 0.393701;
const STORAGE_KEY = "calqulate_bmi_history";

// ─── BRAND COLORS (Green) ─────────────────────────────────────────────────────
const brand = {
  primary: "#3B6D11",
  primaryLight: "#639922",
  primaryBg: "#EAF3DE",
  primaryBorder: "#C0DD97",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getStorage(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToStorage(entry: SavedEntry) {
  try {
    const existing = getStorage();
    existing.unshift(entry);
    const trimmed = existing.slice(0, 10); // keep last 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

function bmiDelta(current: number, previous: number) {
  const diff = parseNumber((current - previous).toFixed(1));
  return diff;
}

function getBmiDeltaLabel(delta: number): { label: string; color: string; icon: "up" | "down" | "same" } {
  if (Math.abs(delta) < 0.1) return { label: "No change since last check", color: "#888", icon: "same" };
  if (delta < 0) return { label: `BMI down ${Math.abs(delta)} — moving in the right direction`, color: brand.primary, icon: "down" };
  return { label: `BMI up ${delta} since your last check`, color: "#D85A30", icon: "up" };
}

// ─── GAUGE ────────────────────────────────────────────────────────────────────
const BMIGauge = ({ bmi }: { bmi: number }) => {
  const min = 15, max = 40;
  const percent = Math.min(Math.max(((bmi - min) / (max - min)) * 100), 100);

  return (
    <div className="mt-6 mb-2">
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#888" }}>
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
        <span>Obese</span>
      </div>
      <div className="relative h-3 w-full rounded-full overflow-visible" style={{ background: "#e5e7eb" }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: "linear-gradient(to right, #60a5fa, #4ade80, #fbbf24, #f87171)" }}
        />
        {[18.5, 25, 30].map((mark) => (
          <div
            key={mark}
            className="absolute top-0 bottom-0 w-px"
            style={{ left: `${((mark - min) / (max - min)) * 100}%`, background: "rgba(255,255,255,0.6)" }}
          />
        ))}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700"
          style={{ left: `${percent}%` }}
        >
          <div className="relative">
            <div className="w-px h-7 -translate-y-2" style={{ background: "#1a1a1a", position: "absolute", left: 0, top: -10 }} />
            <div
              className="absolute -top-9 -translate-x-1/2 text-white text-[11px] py-1 px-2 rounded font-bold whitespace-nowrap"
              style={{ background: "#1a1a1a", left: 0 }}
            >
              {bmi}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PROGRESS CARD ────────────────────────────────────────────────────────────
const ProgressCard = ({ current, history }: { current: BMIResult; history: SavedEntry[] }) => {
  if (history.length === 0) return null;
  const last = history[0];
  const delta = bmiDelta(current.bmi, last.bmi);
  const info = getBmiDeltaLabel(delta);
  const improving = delta < 0 || (current.category === "Normal Weight" && last.category !== "Normal Weight");

  return (
    <div
      className="rounded-xl p-4 border flex items-start gap-4"
      style={{
        background: improving ? brand.primaryBg : "#FEF3EE",
        borderColor: improving ? brand.primaryBorder : "#F5C4B3",
      }}
    >
      <div
        className="p-2 rounded-lg flex-shrink-0"
        style={{ background: improving ? brand.primaryBorder : "#F0997B" }}
      >
        {improving ? <Award className="w-5 h-5" style={{ color: brand.primary }} /> : <AlertCircle className="w-5 h-5 text-orange-700" />}
      </div>
      <div>
        <p className="font-bold text-sm" style={{ color: improving ? brand.primary : "#993C1D" }}>
          {improving ? "You're making progress! Keep it up." : "Your BMI has increased. Time to act."}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#555" }}>
          {info.label} · Last checked: {new Date(last.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
};

// ─── HISTORY PANEL ────────────────────────────────────────────────────────────
const HistoryPanel = ({ history, onClear }: { history: SavedEntry[]; onClear: () => void }) => {
  if (history.length === 0) return null;

  return (
    <Card className="max-w-3xl mx-auto border shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-4 h-4" style={{ color: brand.primary }} />
          Your BMI History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SyncPrompt ctaId="sync_prompt_bmi" className="mt-0 mb-4" />
        <div className="space-y-2">
          {history.map((entry, i) => {
            const prev = history[i + 1];
            const delta = prev ? bmiDelta(entry.bmi, prev.bmi) : null;
            return (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: brand.primaryBg, color: brand.primary }}
                  >
                    {entry.bmi}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{entry.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {delta !== null && (
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: delta < 0 ? brand.primaryBg : "#FEF3EE",
                      color: delta < 0 ? brand.primary : "#993C1D",
                    }}
                  >
                    {delta < 0 ? "▼" : delta > 0 ? "▲" : "─"} {Math.abs(delta)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={onClear}
          className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear history
        </button>
      </CardContent>
    </Card>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BmiCalculator() {
  const [result, setResult] = useState<BMIResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<SavedEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getStorage());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "female",
      age: "30",
      units: "imperial", // US default
      heightCm: "",
      weightKg: "",
      heightFt: "",
      heightIn: "",
      weightLbs: "",
    },
  });

  const { setValue, getValues, watch } = form;
  const currentUnits = watch("units");

  const handleUnitChange = (newUnit: UnitSystem) => {
    const oldUnit = getValues("units");
    if (newUnit === oldUnit) return;
    // Convert the optional waist value alongside the rest (cm ⇄ in).
    const waistVal = parseNumber(getValues("waist") || "0");
    if (waistVal > 0) {
      setValue(
        "waist",
        newUnit === "imperial"
          ? (waistVal * CM_TO_IN).toFixed(1)
          : (waistVal / CM_TO_IN).toFixed(1)
      );
    }
    if (newUnit === "imperial") {
      const cm = parseNumber(getValues("heightCm") || "0");
      const kg = parseNumber(getValues("weightKg") || "0");
      if (cm > 0) {
        const totalInches = cm * CM_TO_IN;
        setValue("heightFt", Math.floor(totalInches / 12).toString());
        setValue("heightIn", Math.round(totalInches % 12).toString());
        setValue("heightCm", "");
      }
      if (kg > 0) {
        setValue("weightLbs", (kg * KG_TO_LBS).toFixed(1));
        setValue("weightKg", "");
      }
    } else {
      const ft = parseNumber(getValues("heightFt") || "0");
      const inch = parseNumber(getValues("heightIn") || "0");
      const lbs = parseNumber(getValues("weightLbs") || "0");
      if (ft > 0 || inch > 0) {
        const totalInches = (ft * 12) + inch;
        setValue("heightCm", (totalInches * 2.54).toFixed(1));
        setValue("heightFt", ""); setValue("heightIn", "");
      }
      if (lbs > 0) {
        setValue("weightKg", (lbs / KG_TO_LBS).toFixed(1));
        setValue("weightLbs", "");
      }
    }
    setValue("units", newUnit);
  };

  const handleSave = () => {
    if (!result) return;
    const entry: SavedEntry = {
      date: new Date().toISOString(),
      bmi: result.bmi,
      category: result.category,
      weightDiff: result.weightDifference?.amount || "0",
      weightDiffType: result.weightDifference?.type || "maintain",
      units: currentUnits,
      gender: getValues("gender"),
      age: getValues("age"),
    };
    saveToStorage(entry);
    const updated = getStorage();
    setHistory(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    setShowHistory(false);
  };

  // ─── HEADLINE GENERATOR ────────────────────────────────────────────────────
  function generateHeadlines(bmi: number, category: string, gender: string, age: string, weightDiffType: string, weightDiffAmount: number): { headline: string; subheadline: string } {
    const ageNum = parseInt(age);
    const isOlder = ageNum >= 45;
    const genderWord = gender === "male" ? "men" : "women";

    if (category === "Normal Weight") {
      return {
        headline: `You're in the healthy zone — here's how to stay there`,
        subheadline: `Only 1 in 3 American adults maintain a healthy BMI throughout their 40s. Your lifestyle habits today determine where you'll be in a decade.`,
      };
    }
    if (category === "Underweight") {
      return {
        headline: `Your body needs more fuel — here's the science behind it`,
        subheadline: `Being underweight can affect bone density, immunity, and energy levels. The good news: targeted nutrition changes can reverse this within weeks.`,
      };
    }
    if (category === "Overweight") {
      const lbsStr = (weightDiffAmount * KG_TO_LBS).toFixed(0);
      return {
        headline: `Losing just ${lbsStr} lbs could change your health trajectory`,
        subheadline: `Research shows even a 5–10% reduction in body weight measurably lowers blood pressure, cholesterol, and type 2 diabetes risk — especially for ${genderWord} ${isOlder ? "over 40" : "in their " + (Math.floor(ageNum / 10) * 10) + "s"}.`,
      };
    }
    // Obesity
    return {
      headline: `Your results are a wake-up call — and the best time to act is now`,
      subheadline: `Over 42% of US adults fall into this category, but those who take measurable steps in the next 90 days see the fastest results. Here's exactly what to do.`,
    };
  }

  // ─── NEXT STEPS GENERATOR ──────────────────────────────────────────────────
  function generateNextSteps(category: string, gender: string): string[] {
    if (category === "Normal Weight") return [
      "Calculate your TDEE to know exactly how many calories to eat daily",
      "Track your macros — protein, carbs, fat — to maintain lean mass",
      "Check your Ideal Heart Rate zone for cardio efficiency",
      "Monitor your waist-to-height ratio for a fuller picture",
    ];
    if (category === "Underweight") return [
      "Calculate your TDEE — then add 300–500 calories above it",
      "Aim for 1g of protein per pound of bodyweight daily",
      "Prioritize resistance training 3x/week to gain lean mass",
      "Get bloodwork done to rule out nutritional deficiencies",
    ];
    if (category === "Overweight") return [
      "Calculate your calorie deficit — 500 cal/day = ~1 lb/week loss",
      "Start with 30-min walks daily: burns 150–200 calories, no gym needed",
      "Track your sleep — poor sleep raises hunger hormones by 24%",
      "Check your resting heart rate to set safe cardio targets",
    ];
    return [
      "Consult your doctor before starting any weight loss program",
      "Calculate your TDEE to understand your exact maintenance calories",
      "Focus on reducing processed foods and added sugar first",
      "Add 10-min walks after each meal — proven to lower blood sugar",
    ];
  }

  // ─── US FACT GENERATOR ────────────────────────────────────────────────────
  function getUSFact(category: string, gender: string): string {
    if (category === "Normal Weight") return "You're healthier than 66% of American adults. The CDC reports only 33.4% of US adults maintain a normal BMI.";
    if (category === "Underweight") return "About 1.5% of US adults are clinically underweight. Causes vary — from high metabolism to nutritional gaps.";
    if (category === "Overweight") return "Approximately 31.9% of American adults are overweight. Small consistent changes — not crash diets — produce lasting results.";
    return "The CDC reports 41.9% of US adults have obesity. It's the #1 modifiable risk factor for heart disease, the leading cause of death in America.";
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setSaved(false);

    setTimeout(() => {
      let weightKg = 0, heightM = 0;

      if (values.units === "metric") {
        weightKg = parseNumber(values.weightKg || "0");
        heightM = parseNumber(values.heightCm || "0") / 100;
      } else {
        weightKg = parseNumber(values.weightLbs || "0") / KG_TO_LBS;
        const totalInches = (parseNumber(values.heightFt || "0") * 12) + parseNumber(values.heightIn || "0");
        heightM = totalInches * 0.0254;
      }

      if (heightM > 0 && weightKg > 0) {
        const bmi = parseNumber((weightKg / (heightM * heightM)).toFixed(1));
        const pi = parseNumber((weightKg / Math.pow(heightM, 3)).toFixed(2));
        const prime = parseNumber((bmi / 25).toFixed(2));

        let category = "", color = "", textColor = "", badgeBg = "", desc = "", riskLevel: BMIResult["riskLevel"] = "low";

        if (bmi < 18.5) {
          category = "Underweight"; color = "bg-blue-500"; textColor = "text-blue-700";
          badgeBg = "#DBEAFE"; riskLevel = "moderate";
          desc = "A BMI below 18.5 indicates your body may not have enough stored energy or nutrients. This can affect immunity, bone strength, and hormonal health.";
        } else if (bmi < 25) {
          category = "Normal Weight"; color = "bg-green-500"; textColor = "text-green-700";
          badgeBg = brand.primaryBg; riskLevel = "low";
          desc = "Your BMI falls in the clinically healthy range. Maintaining this is associated with lower risk of cardiovascular disease, type 2 diabetes, and metabolic conditions.";
        } else if (bmi < 30) {
          category = "Overweight"; color = "bg-yellow-500"; textColor = "text-yellow-700";
          badgeBg = "#FEF9C3"; riskLevel = "moderate";
          desc = "A BMI between 25–29.9 places you above the healthy threshold. At this stage, lifestyle changes are highly effective — most people see results within 8–12 weeks.";
        } else {
          category = "Obesity"; color = "bg-red-500"; textColor = "text-red-700";
          badgeBg = "#FEE2E2"; riskLevel = "high";
          desc = "A BMI of 30+ is associated with significantly elevated risk of heart disease, stroke, sleep apnea, and type 2 diabetes. Medical guidance alongside lifestyle change is strongly recommended.";
        }

        const minHealthyKg = 18.5 * (heightM * heightM);
        const maxHealthyKg = 24.9 * (heightM * heightM);
        let weightDifference = null;
        let weightDiffNum = 0;

        if (bmi < 18.5) {
          const gain = minHealthyKg - weightKg;
          weightDiffNum = gain;
          weightDifference = {
            amount: values.units === "metric" ? `${gain.toFixed(1)} kg` : `${(gain * KG_TO_LBS).toFixed(1)} lbs`,
            amountNum: gain,
            type: "gain" as const,
          };
        } else if (bmi > 25) {
          const lose = weightKg - maxHealthyKg;
          weightDiffNum = lose;
          weightDifference = {
            amount: values.units === "metric" ? `${lose.toFixed(1)} kg` : `${(lose * KG_TO_LBS).toFixed(1)} lbs`,
            amountNum: lose,
            type: "lose" as const,
          };
        } else {
          weightDifference = { amount: "0", amountNum: 0, type: "maintain" as const };
        }

        let idealRange = "";
        if (values.units === "metric") {
          idealRange = `${minHealthyKg.toFixed(1)}–${maxHealthyKg.toFixed(1)} kg`;
        } else {
          idealRange = `${(minHealthyKg * KG_TO_LBS).toFixed(1)}–${(maxHealthyKg * KG_TO_LBS).toFixed(1)} lbs`;
        }

        const { headline, subheadline } = generateHeadlines(bmi, category, values.gender, values.age, weightDifference?.type || "maintain", weightDiffNum);

        // ── FEATURE 1: waist-to-height cross-check + muscle/athlete caveat ──────
        // Waist is optional. If provided, we compute WHtR (waist ÷ height in the
        // same unit) and sanity-check whether an "overweight"/"obese" BMI might be
        // muscle rather than fat. If absent, we still surface the athlete caveat
        // conditionally and note that adding a waist measurement sharpens the read.
        let waistRaw = parseNumber(values.waist || "0");
        let waistM = 0;
        if (waistRaw > 0) {
          waistM = values.units === "metric" ? waistRaw / 100 : (waistRaw * 2.54) / 100;
        }
        const hasWaist = waistM > 0;
        const whtr = hasWaist ? parseNumber((waistM / heightM).toFixed(3)) : null;
        const whtrTone: "low" | "elevated" | null =
          whtr === null ? null : whtr < 0.5 ? "low" : "elevated";

        const bmiFlagsExcess = bmi >= 25;
        // A healthy waist alongside an "overweight" BMI is the classic muscle signal.
        const waistLooksHealthy = whtr !== null && whtr < 0.5;
        const showMuscleCaveat = bmiFlagsExcess && (waistLooksHealthy || !hasWaist);

        let waistHeadline = "";
        let waistBody = "";
        if (hasWaist && whtr !== null) {
          if (whtrTone === "low" && bmiFlagsExcess) {
            waistHeadline = "BMI may overstate your risk — your waist looks healthy";
            waistBody = `Your waist-to-height ratio is ${whtr} (a ratio under 0.5 is considered low-risk), yet your BMI of ${bmi} reads as "${category}". This pattern is common in athletic or muscular builds: muscle is denser than fat, so it inflates BMI without adding metabolic risk. Treat your healthy waist as the more reassuring signal here.`;
          } else if (whtrTone === "low") {
            waistHeadline = "Your waist confirms a low-risk profile";
            waistBody = `Your waist-to-height ratio is ${whtr} — under the 0.5 threshold — which agrees with your BMI of ${bmi}. Both metrics point in the same direction, giving you a more confident read than BMI alone.`;
          } else {
            waistHeadline = "Your waist points to elevated central fat";
            waistBody = `Your waist-to-height ratio is ${whtr}, above the 0.5 low-risk threshold. Central (belly) fat carries more metabolic risk than fat elsewhere, so this sharpens your BMI of ${bmi} rather than softening it — worth acting on even if your BMI looks borderline.`;
          }
        } else if (showMuscleCaveat) {
          waistHeadline = "Could this be muscle, not fat?";
          waistBody = `Your BMI of ${bmi} reads as "${category}", but BMI can't tell muscle from fat. If you strength-train or play sport, an athletic build often pushes BMI up without raising health risk. Add your waist measurement above for a waist-to-height cross-check — a ratio under 0.5 would confirm the extra mass is likely muscle, not central fat.`;
        } else {
          waistHeadline = "Add your waist for a sharper read";
          waistBody = `BMI uses only height and weight, so it can't see where fat sits or tell muscle from fat. Adding your waist measurement above unlocks a waist-to-height ratio — the single best quick check for the belly fat that drives metabolic risk.`;
        }

        // ── FEATURE 2: healthy weight range + amount to reach the midpoint ──────
        // Midpoint BMI ~21.7 sits in the centre of the healthy 18.5–24.9 band.
        const MIDPOINT_BMI = 21.7;
        const midpointKg = MIDPOINT_BMI * (heightM * heightM);
        const midpointDiffKg = midpointKg - weightKg; // positive ⇒ need to gain
        const atMidpoint = Math.abs(midpointDiffKg) < (values.units === "metric" ? 0.5 : 0.45);
        const fmtWeight = (kg: number) =>
          values.units === "metric" ? `${kg.toFixed(1)} kg` : `${(kg * KG_TO_LBS).toFixed(1)} lbs`;
        const midpoint = {
          targetWeightStr: fmtWeight(midpointKg),
          differenceStr: fmtWeight(Math.abs(midpointDiffKg)),
          direction: (atMidpoint ? "at-target" : midpointDiffKg > 0 ? "gain" : "lose") as
            "lose" | "gain" | "at-target",
        };

        setResult({
          bmi, category, color, textColor, badgeBg, ponderalIndex: pi, prime,
          idealRange, weightDifference, description: desc,
          headline, subheadline,
          nextSteps: generateNextSteps(category, values.gender),
          usFact: getUSFact(category, values.gender),
          riskLevel,
          waistCheck: {
            hasWaist,
            whtr,
            whtrTone,
            showMuscleCaveat,
            headline: waistHeadline,
            body: waistBody,
          },
          midpoint,
        });
      }

      setIsLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }, 700);
  }

  const prevHistory = history.filter((_, i) => i > 0); // exclude the latest (which is current save)

  return (
    <div className="space-y-8">

      {/* ── HISTORY TOGGLE ───────────────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-semibold transition-colors"
            style={{ color: brand.primary }}
          >
            <History className="w-4 h-4" />
            {showHistory ? "Hide" : "View"} your BMI history ({history.length} {history.length === 1 ? "entry" : "entries"})
            <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}

      {showHistory && <HistoryPanel history={history} onClear={clearHistory} />}

      {/* ── CALCULATOR CARD ──────────────────────────────────────────────────── */}
      <Card className="max-w-3xl mx-auto shadow-lg overflow-hidden" style={{ borderTop: `4px solid ${brand.primary}` }}>
        <CardHeader className="pb-6 border-b" style={{ background: `linear-gradient(to bottom, ${brand.primaryBg}, white)` }}>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Scale className="w-6 h-6" style={{ color: brand.primary }} />
                BMI Calculator
              </CardTitle>
              <CardDescription className="mt-1">
                Body Mass Index · Ponderal Index · Weight Goals · Personalized Insights
              </CardDescription>
            </div>
            {history.length > 0 && (
              <div
                className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ background: brand.primaryBg, color: brand.primary, border: `1px solid ${brand.primaryBorder}` }}
              >
                <CheckCircle2 className="w-3 h-3" />
                Progress tracking on
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Gender + Units */}
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
                              <FormLabel className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all capitalize"
                                style={{ "--tw-ring-color": brand.primary } as React.CSSProperties}>
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
                      <FormLabel className="font-semibold">Units</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={(val) => handleUnitChange(val as UnitSystem)} value={field.value} className="flex gap-2">
                          <FormItem className="flex-1">
                            <FormControl><RadioGroupItem value="imperial" className="peer sr-only" /></FormControl>
                            <FormLabel className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all text-sm">
                              🇺🇸 lbs / ft
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex-1">
                            <FormControl><RadioGroupItem value="metric" className="peer sr-only" /></FormControl>
                            <FormLabel className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all text-sm">
                              kg / cm
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {currentUnits === "metric" ? (
                  <>
                    <FormField control={form.control} name="heightCm" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="170" {...field} className="h-12 text-lg" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="weightKg" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl><Input type="number" placeholder="70" {...field} className="h-12 text-lg" /></FormControl>
                      </FormItem>
                    )} />
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <FormLabel>Height</FormLabel>
                      <div className="flex gap-2">
                        <FormField control={form.control} name="heightFt" render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="relative">
                                <Input type="number" placeholder="5" {...field} className="h-12 text-lg pr-8" />
                                <span className="absolute right-3 top-3.5 text-xs text-muted-foreground">ft</span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="heightIn" render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <div className="relative">
                                <Input type="number" placeholder="7" {...field} className="h-12 text-lg pr-8" />
                                <span className="absolute right-3 top-3.5 text-xs text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </div>
                    <FormField control={form.control} name="weightLbs" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (lbs)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" placeholder="155" {...field} className="h-12 text-lg" />
                            <span className="absolute right-3 top-3.5 text-sm text-muted-foreground">lbs</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )} />
                  </>
                )}

                {/* Optional waist — sharpens the read, never required */}
                <FormField control={form.control} name="waist" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Waist ({currentUnits === "metric" ? "cm" : "in"})
                      <span className="text-xs font-normal text-muted-foreground">· optional</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder={currentUnits === "metric" ? "85" : "34"} {...field} className="h-12 text-lg" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Adds a waist-to-height cross-check</p>
                  </FormItem>
                )} />
              </div>

              <Button type="submit" size="lg" className="w-full text-lg h-14 font-bold" disabled={isLoading}
                style={{ background: brand.primary, color: "white" }}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Calculator className="mr-2 h-5 w-5" />}
                Calculate My BMI
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── RESULTS ──────────────────────────────────────────────────────────── */}
      <div ref={resultsRef} className="scroll-mt-16">
        {result && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-6 duration-700 fade-in">

            {/* PROGRESS CARD (only if history exists) */}
            {history.length > 0 && <div className="max-w-4xl mx-auto"><ProgressCard current={result} history={history} /></div>}

            {/* 1. HERO: HIGH-CTR HEADLINE + SCORE */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className={`h-1.5 w-full ${result.color}`} />
              <CardContent className="p-8 md:p-10">

                {/* US Fact Strip */}
                <div
                  className="text-xs font-semibold px-4 py-2 rounded-lg mb-6 flex items-start gap-2"
                  style={{ background: brand.primaryBg, color: brand.primary, border: `1px solid ${brand.primaryBorder}` }}
                >
                  <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{result.usFact}</span>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Score */}
                  <div className="flex-shrink-0 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: result.badgeBg, color: result.textColor.replace("text-", "") }}>
                      <Activity className="w-3 h-3" /> BMI Score
                    </div>
                    <div className="text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                      {result.bmi}
                    </div>
                    <div className={`text-xl font-bold mt-2 ${result.textColor}`}>
                      {result.category}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">WHO Classification</div>
                  </div>

                  {/* Gauge + Headline */}
                  <div className="flex-1 w-full">
                    <BMIGauge bmi={result.bmi} />

                    {/* HIGH-CTR HEADLINE */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                        {result.headline}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {result.subheadline}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. CLINICAL DESCRIPTION */}
            <Card className="border shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: brand.primaryBg }}>
                    <Heart className="w-5 h-5" style={{ color: brand.primary }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1" style={{ color: brand.primary }}>What this means for your health</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{result.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. DATA GRID */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* A. Weight Goals */}
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5" style={{ color: brand.primary }} />
                    Your Weight Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-sm text-muted-foreground">Healthy weight range for your height</span>
                    <span className="font-bold">{result.idealRange}</span>
                  </div>

                  <div
                    className="p-4 rounded-xl flex items-center gap-4"
                    style={{ background: result.weightDifference?.type === "lose" ? "#FEF3EE" : result.weightDifference?.type === "gain" ? "#EFF6FF" : brand.primaryBg }}
                  >
                    <div className={`p-3 rounded-full ${result.weightDifference?.type === "lose" ? "bg-orange-100 text-orange-600" : result.weightDifference?.type === "gain" ? "bg-blue-100 text-blue-600" : "bg-green-100"}`}
                      style={result.weightDifference?.type === "maintain" ? { color: brand.primary } : {}}>
                      {result.weightDifference?.type === "lose" ? <TrendingDown className="w-6 h-6" /> : result.weightDifference?.type === "gain" ? <TrendingUp className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {result.weightDifference?.type === "maintain" ? "Status" : "Your goal"}
                      </p>
                      {result.weightDifference?.type === "maintain" ? (
                        <p className="font-bold" style={{ color: brand.primary }}>You're in the healthy range — maintain it</p>
                      ) : (
                        <p className="font-bold text-slate-800 dark:text-slate-100">
                          {result.weightDifference?.type === "lose" ? "Lose " : "Gain "}
                          <span className={result.weightDifference?.type === "lose" ? "text-orange-600 text-lg" : "text-blue-600 text-lg"}>
                            {result.weightDifference?.amount}
                          </span>
                          {" "}to reach healthy range
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Weekly timeline estimate */}
                  {result.weightDifference && result.weightDifference.type !== "maintain" && (
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 pt-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      At a safe pace of {currentUnits === "imperial" ? "1–2 lbs/week" : "0.5–1 kg/week"}, that's approximately{" "}
                      <strong>{Math.ceil(result.weightDifference.amountNum * (currentUnits === "imperial" ? KG_TO_LBS : 1) / 1.5)} weeks</strong> to reach your goal.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* B. Advanced Metrics */}
              <Card className="border shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="w-5 h-5 text-purple-500" />
                    Advanced Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <Link href="/health/ponderal-index-calculator" className="font-semibold text-sm hover:underline" style={{ color: brand.primary }}>
                        Ponderal Index →
                      </Link>
                      <p className="text-xs text-muted-foreground">More accurate for tall or short individuals</p>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1 border-purple-200 bg-purple-50 text-purple-700">
                      {result.ponderalIndex}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-semibold text-sm">BMI Prime</p>
                      <p className="text-xs text-muted-foreground">Ratio to healthy upper limit (25)</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${result.prime > 1 ? "text-red-500" : "text-green-600"}`}>
                        {result.prime}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {result.prime > 1 ? `${((result.prime - 1) * 100).toFixed(0)}% above limit` : "Within limit"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">Health Risk Level</p>
                      <p className="text-xs text-muted-foreground">Based on BMI category</p>
                    </div>
                    <Badge
                      className={`capitalize ${result.riskLevel === "low" ? "bg-green-100 text-green-800" : result.riskLevel === "moderate" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                    >
                      {result.riskLevel === "very-high" ? "Very High" : result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── FEATURE 1: WAIST CROSS-CHECK + MUSCLE/ATHLETE CAVEAT ─────────── */}
            <Card className="border shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg flex-shrink-0" style={{ background: brand.primaryBg }}>
                    <Activity className="w-5 h-5" style={{ color: brand.primary }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <p className="font-bold text-sm text-emerald-700">{result.waistCheck.headline}</p>
                      {result.waistCheck.whtr !== null && (
                        <Badge
                          variant="outline"
                          className={`text-xs font-bold ${
                            result.waistCheck.whtrTone === "low"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          WHtR {result.waistCheck.whtr} · {result.waistCheck.whtrTone === "low" ? "Optimal" : "Elevated"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.waistCheck.body}</p>
                    {!result.waistCheck.hasWaist && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        Tip: a waist-to-height ratio under 0.5 is the simplest at-home check for healthy central fat.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── FEATURE 2: HEALTHY RANGE + MIDPOINT TARGET (BMI ~21.7) ───────── */}
            <Card className="border shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5" style={{ color: brand.primary }} />
                  <h3 className="text-base font-bold">Your Healthy Weight Range & Ideal Target</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For your height, a healthy weight (BMI 18.5–24.9) is{" "}
                  <strong className="text-emerald-700">{result.idealRange}</strong>. The centre of that band
                  (BMI ~21.7) lands at about <strong className="text-emerald-700">{result.midpoint.targetWeightStr}</strong>
                  {result.midpoint.direction === "at-target"
                    ? " — and you're already right there."
                    : result.midpoint.direction === "lose"
                    ? <> — roughly <strong className="text-emerald-700">{result.midpoint.differenceStr}</strong> to lose to reach that sweet spot.</>
                    : <> — roughly <strong className="text-emerald-700">{result.midpoint.differenceStr}</strong> to gain to reach that sweet spot.</>}
                </p>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Healthy range</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">{result.idealRange}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                      {result.midpoint.direction === "lose" ? (
                        <><TrendingDown className="w-3.5 h-3.5" /> Lose</>
                      ) : result.midpoint.direction === "gain" ? (
                        <><TrendingUp className="w-3.5 h-3.5" /> Gain</>
                      ) : (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> On target</>
                      )}
                    </div>
                    <p className="text-sm font-black text-emerald-700 mt-1">
                      {result.midpoint.direction === "at-target" ? "—" : result.midpoint.differenceStr}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Ideal target</p>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">{result.midpoint.targetWeightStr}</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  The midpoint (BMI ~21.7) is a balanced goal inside the healthy band — not a hard rule. Anywhere in your healthy range is clinically fine.
                </p>
              </CardContent>
            </Card>

            {/* 4. HIGH-CTR NEXT STEPS */}
            <Card className="border-0 shadow-xl" style={{ background: brand.primaryBg, border: `1px solid ${brand.primaryBorder}` }}>
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-5">
                  <ArrowRight className="w-5 h-5" style={{ color: brand.primary }} />
                  <h3 className="text-lg font-black" style={{ color: brand.primary }}>
                    What to do right now — your personalized action plan
                  </h3>
                </div>
                <div className="space-y-3">
                  {result.nextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/70 rounded-lg p-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: brand.primary, color: "white" }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Cross-links */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: brand.primaryBorder }}>
                  <p className="text-xs font-bold mb-3" style={{ color: brand.primary }}>Continue your health analysis →</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "TDEE / Calorie Calculator", href: "/health/tdee-calculator" },
                      { label: "Ideal Weight Calculator", href: "/health/ideal-body-weight-calculator" },
                      { label: "Body Fat % Calculator", href: "/health/body-fat-calculator" },
                      { label: "Heart Rate Zones", href: "/health/heart-rate-calculator" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors hover:bg-white/90"
                        style={{ background: "white", color: brand.primary, border: `1px solid ${brand.primaryBorder}` }}
                      >
                        {link.label} <ChevronRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. MEDICAL DISCLAIMER */}
            <div className="text-xs text-gray-400 text-center max-w-2xl mx-auto leading-relaxed px-4">
              <strong>Medical Disclaimer:</strong> BMI is a screening tool, not a diagnostic measure. It does not account for muscle mass, bone density, age-related fat distribution, or ethnic differences in body composition. Always consult a qualified healthcare professional before making health decisions. Data cited from CDC, WHO, and NIH.
            </div>

            {/* 6. SAVE RESULTS + RESET */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-4">
              <Button
                onClick={handleSave}
                disabled={saved}
                className="font-bold px-8"
                style={saved ? { background: brand.primaryBg, color: brand.primary } : { background: brand.primary, color: "white" }}
              >
                {saved ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved to your progress</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save my results</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => { form.reset(); setResult(null); setSaved(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Calculate Again
              </Button>
            </div>

            {/* IS A GLP-1 RIGHT FOR ME? — connect an overweight/obese result to the GLP-1 path */}
            {result.bmi >= 25 && (
              <div className="mt-8">
                <Glp1EligibilityBranch bmi={result.bmi} />
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}