"use client";

import { SyncPrompt } from "@/components/marketing/SyncPrompt";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calculator, RefreshCw, Loader2, Flame, AlertTriangle, Calendar, Apple,
  Save, History, ChevronRight, Award, AlertCircle, Brain, ArrowRight,
  CheckCircle2, BarChart3, TrendingDown, TrendingUp, Info, Scale, Zap,
  Dumbbell, ShieldCheck, CalendarCheck
} from "lucide-react";

// ─── VALIDATION SCHEMA ────────────────────────────────────────────────────────
const formSchema = z.object({
  units: z.enum(["metric", "imperial"]),
  gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
  age: z.string().min(1, "Age is required."),
  weight: z.string().min(1, "Weight is required."),
  height: z.string().min(1, "Height is required."),
  activity: z.string({ required_error: "Please select activity level" }),
  goal: z.string({ required_error: "Please select a weight loss goal" }),
  macroSplit: z.string({ required_error: "Please select a macro preference" }),
  // ── ADDITIVE: optional goal weight (non-breaking; blank = use ~5% milestone) ──
  goalWeight: z.string().optional(),
});

type UnitSystem = "metric" | "imperial";

// ─── INTERFACES ───────────────────────────────────────────────────────────────
interface MacroSplit {
  protein: number;
  fat: number;
  carbs: number;
  proteinPercent: number;
  fatPercent: number;
  carbsPercent: number;
}

interface CalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  weeklyDeficit: number;
  warning: string | null;
  macros: MacroSplit;
  zigZag: { day: string; calories: number }[];
  headline: string;
  nextSteps: string[];
  deficitFact: string;
  // ── ADDITIVE FEATURE 1: goal date projection ──
  hasGoalProjection: boolean;
  goalLossUnitStr: string;        // e.g. "4.0 kg" — amount to lose at a healthy pace
  goalWeeklyLossStr: string;      // e.g. "0.6 kg/week"
  goalWeeksToReach: number;       // whole weeks at the current deficit
  goalDateStr: string;           // projected calendar date
  goalDailyTarget: number;        // exact daily calorie target to hit the goal
  goalUsesCustomWeight: boolean;  // true when the user supplied their own goal weight
  // ── ADDITIVE FEATURE 2: safe floor + protein target ──
  safeFloor: number;              // 1500 men / 1200 women
  belowFloor: boolean;            // would the chosen deficit push below the floor?
  proteinFloorTarget: number;     // protein at ~2.2 g/kg (upper, muscle-protective)
  proteinFloorTargetLow: number;  // protein at ~1.6 g/kg (lower bound)
}

interface SavedEntry {
  date: string;
  bmr: number;
  tdee: number;
  targetCalories: number;
  weight: number;
  units: string;
  gender: string;
  goal: string;
  macroSplit: string;
}

// ─── LOCAL STORAGE KEY & CONFIGS ──────────────────────────────────────────────
const STORAGE_KEY = "calqulate_deficit_history";

const brand = {
  primary: "#15803d", // emerald-700
  primaryBg: "#f0fdf4", // emerald-50
  primaryBorder: "#bbf7d0", // emerald-200
};

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
function getDeficitStorage(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeficitEntry(entry: SavedEntry) {
  try {
    const existing = getDeficitStorage();
    existing.unshift(entry);
    const trimmed = existing.slice(0, 10); // Keep last 10 records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

function getCalorieDeltaLabel(delta: number): { label: string; improving: boolean } {
  if (Math.abs(delta) < 10) {
    return { label: "Your daily target deficit calories remain stable compared to your last calculation.", improving: true };
  }
  if (delta < 0) {
    return { label: `Your daily target calories decreased by ${Math.abs(delta)} kcal based on your updated dimensions.`, improving: true };
  }
  return { label: `Your daily target calories increased by ${delta} kcal since your last evaluation.`, improving: false };
}

// Determines the true prior entry for active comparisons (prevents self-comparison right after save)
function getPreviousEntry(currentTarget: number, history: SavedEntry[]): SavedEntry | null {
  if (history.length === 0) return null;
  const latestSaved = history[0];
  const isDuplicate = Math.abs(latestSaved.targetCalories - currentTarget) < 5;
  if (isDuplicate) {
    return history[1] || null;
  }
  return latestSaved;
}

// ─── PERSONALIZATION ENGINE ───────────────────────────────────────────────────
function generateDeficitInsights(goal: string, macroSplit: string, activity: string): { headline: string; nextSteps: string[]; deficitFact: string } {
  let headline = "";
  let nextSteps: string[] = [];
  let deficitFact = "";

  // Goal-based customizations
  if (goal === "maintain") {
    headline = "Optimizing cellular maintenance and baseline physiological stabilization";
    nextSteps.push("Prioritize metabolic health: Focus on diet diversity and high-quality micronutrients to sustain cell turnover without calorie deficits.");
    deficitFact = "Maintenance Focus: Eating at maintenance allows your endocrine system to stabilize and supports recovery after extended restriction phases [1].";
  } else if (goal === "extreme" || goal === "aggressive") {
    headline = "Managing safe muscular retention during heightened calorie deficits";
    nextSteps.push("Protect lean tissue: Ensure your protein intake matches your target to minimize muscular breakdown during this rapid deficit phase.");
    nextSteps.push("Evaluate recovery metrics: Restrict intensive activity if you experience severe brain fog or extended physical fatigue.");
    deficitFact = "Safety Parameter: Larger deficits increase the risk of lean tissue loss. High-protein splits are strongly recommended to protect structural mass [1].";
  } else {
    headline = "Achieving sustainable fat loss through moderate recomposition thresholds";
    nextSteps.push("Support energy levels: Consistently track daily protein and essential fatty acids to preserve athletic capacity and metabolic rate.");
    deficitFact = "Thermodynamic Rule: A steady daily deficit of 250-500 calories encourages gradual fat loss while preserving skeletal muscle integrity [1].";
  }

  // Macro preference additions
  if (macroSplit === "high_protein") {
    nextSteps.push("Optimize protein timing: Distribute protein intake evenly across 3-4 meals to continuously support muscle protein synthesis.");
  } else if (macroSplit === "low_carb") {
    nextSteps.push("Monitor essential minerals: Low-carb diets can accelerate sodium and water excretion. Keep hydrated and ensure adequate intake of sodium and magnesium.");
  } else {
    nextSteps.push("Fuel systemic output: Time your carbohydrate intake around training windows to maximize cognitive focus and muscle glycogen resynthesis.");
  }

  // Activity additions
  if (activity === "sedentary" && goal !== "maintain") {
    nextSteps.push("Incorporate low-impact movement: Introduce a 15-minute walk after meals. This simple change improves insulin sensitivity and burns calories without stressing joints.");
  } else if (activity === "active" || activity === "very_active") {
    nextSteps.push("Incorporate structured carbohydrate meals: Ensure you are refueling glycogen reserves after heavy training to support joint and structural recovery.");
  }

  return {
    headline,
    nextSteps: nextSteps.slice(0, 3), // return top 3 curated steps
    deficitFact
  };
}

// ─── ORIGINAL SUB-COMPONENTS ──────────────────────────────────────────────────
const CalorieBar = ({ target, tdee }: { target: number, tdee: number }) => {
  const percentage = Math.min(100, Math.max(0, (target / tdee) * 100));
  
  return (
    <div className="space-y-2 mt-4 text-left">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-emerald-700 font-bold">Deficit: {target} kcal</span>
        <span className="text-muted-foreground">Maintenance: {tdee} kcal</span>
      </div>
      <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-emerald-600 transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-0 right-0 h-full bg-amber-400 opacity-50"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center">
        You are cutting <span className="font-bold text-amber-500">{tdee - target}</span> calories per day.
      </p>
    </div>
  );
};

const MacroChart = ({ macros }: { macros: MacroSplit }) => {
  return (
    <div className="w-full text-left">
      <div className="flex h-4 w-full rounded-full overflow-hidden mb-3">
        <div style={{ width: `${macros.proteinPercent}%` }} className="bg-blue-500" title="Protein" />
        <div style={{ width: `${macros.fatPercent}%` }} className="bg-amber-400" title="Fat" />
        <div style={{ width: `${macros.carbsPercent}%` }} className="bg-green-500" title="Carbs" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg border border-blue-100 dark:border-blue-900">
          <p className="font-semibold text-blue-700 dark:text-blue-400">{macros.proteinPercent}%</p>
          <p className="text-xs text-muted-foreground">Protein</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">{macros.protein}g</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
          <p className="font-semibold text-amber-700 dark:text-amber-400">{macros.fatPercent}%</p>
          <p className="text-xs text-muted-foreground">Fats</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">{macros.fat}g</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg border border-green-100 dark:border-green-900">
          <p className="font-semibold text-green-700 dark:text-green-400">{macros.carbsPercent}%</p>
          <p className="text-xs text-muted-foreground">Carbs</p>
          <p className="font-bold text-slate-800 dark:text-slate-100">{macros.carbs}g</p>
        </div>
      </div>
    </div>
  );
};

// ─── CONSTANT DATA COEFFICIENTS ───────────────────────────────────────────────
const activityMultipliers: Record<string, number> = {
  "sedentary": 1.2,
  "light": 1.375,
  "moderate": 1.55,
  "active": 1.725,
  "very_active": 1.9,
};

const deficitAmounts: Record<string, number> = {
  "maintain": 0,
  "mild": 250,      // ~0.5 lb / week
  "normal": 500,    // ~1.0 lb / week
  "aggressive": 750,// ~1.5 lb / week
  "extreme": 1000,  // ~2.0 lb / week
};

const getMacros = (calories: number, splitType: string): MacroSplit => {
  let pPercent, fPercent, cPercent;

  switch(splitType) {
    case "low_carb":
      pPercent = 40; fPercent = 40; cPercent = 20;
      break;
    case "high_protein":
      pPercent = 40; fPercent = 30; cPercent = 30;
      break;
    case "balanced":
    default:
      pPercent = 30; fPercent = 30; cPercent = 40;
      break;
  }

  return {
    proteinPercent: pPercent,
    fatPercent: fPercent,
    carbsPercent: cPercent,
    protein: Math.round((calories * (pPercent / 100)) / 4),
    fat: Math.round((calories * (fPercent / 100)) / 9),
    carbs: Math.round((calories * (cPercent / 100)) / 4),
  };
};

const generateZigZag = (targetDaily: number): { day: string, calories: number }[] => {
  const high = Math.round(targetDaily * 1.15);
  const low = Math.round(targetDaily * 0.85);
  const requiredWeekly = targetDaily * 7;
  const normal = Math.round((requiredWeekly - (2 * high) - (2 * low)) / 3);

  return [
    { day: "Monday", calories: low },
    { day: "Tuesday", calories: normal },
    { day: "Wednesday", calories: high },
    { day: "Thursday", calories: low },
    { day: "Friday", calories: normal },
    { day: "Saturday", calories: high },
    { day: "Sunday", calories: normal },
  ];
};

// ─── PROGRESS CARD COMPONENT ──────────────────────────────────────────────────
const ProgressCard = ({ current, history, unit }: { current: CalculationResult; history: SavedEntry[]; unit: string }) => {
  const previous = getPreviousEntry(current.targetCalories, history);
  if (!previous) return null;

  const targetDelta = current.targetCalories - previous.targetCalories;
  const info = getCalorieDeltaLabel(targetDelta);

  const weightDeltaVal = previous.weight ? (history[0].weight - previous.weight) : 0;

  return (
    <div
      className="rounded-xl p-5 border flex items-start gap-4 max-w-4xl mx-auto shadow-sm text-left"
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
          <Award className="w-5 h-5 text-emerald-700" />
        ) : (
          <AlertCircle className="w-5 h-5 text-orange-700" />
        )}
      </div>
      <div className="space-y-2 w-full">
        <div>
          <p className="font-bold text-sm" style={{ color: info.improving ? brand.primary : "#993C1D" }}>
            {info.improving ? "Tracking Update: Target configurations calculated." : "Calorie targets adjusted."}
          </p>
          <p className="text-xs mt-0.5 text-gray-600 dark:text-gray-400">
            {info.label} · Evaluated against baseline on {new Date(previous.date).toLocaleDateString()}
          </p>
        </div>

        {/* System parameters metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-dashed border-gray-300 dark:border-gray-700 text-xs">
          <div>
            <span className="text-gray-500 block">Target Delta</span>
            <span className={`font-bold ${targetDelta <= 0 ? "text-emerald-700" : "text-orange-700"}`}>
              {targetDelta <= 0 ? "" : "+"}{targetDelta} kcal
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">TDEE Delta</span>
            <span className={`font-bold ${current.tdee - previous.tdee <= 0 ? "text-emerald-700" : "text-orange-700"}`}>
              {current.tdee - previous.tdee <= 0 ? "" : "+"}{current.tdee - previous.tdee} kcal
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Weight Delta</span>
            <span className={`font-bold ${weightDeltaVal <= 0 ? "text-emerald-700" : "text-orange-700"}`}>
              {weightDeltaVal <= 0 ? "" : "+"}{weightDeltaVal.toFixed(1)} {unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── HISTORY PANEL COMPONENT ──────────────────────────────────────────────────
const HistoryPanel = ({ history, onClear, unit }: { history: SavedEntry[]; onClear: () => void; unit: string }) => {
  if (history.length === 0) return null;

  return (
    <Card className="max-w-4xl mx-auto border shadow-md text-left">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-4 h-4 text-emerald-700" />
          Your Deficit History Tracking
        </CardTitle>
        <CardDescription className="text-xs">
          Saved locally inside your browser. Personal metrics privacy remains completely secured.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SyncPrompt ctaId="sync_prompt_calorie_deficit" className="mt-0 mb-4" />
        <div className="space-y-2">
          {history.map((entry, i) => {
            const nextEntry = history[i + 1];
            const delta = nextEntry ? entry.targetCalories - nextEntry.targetCalories : null;
            return (
              <div key={entry.date} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b last:border-0 border-gray-100 dark:border-gray-800 gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                  >
                    #{history.length - i}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize">{entry.goal.replace("_", " ")} ({entry.targetCalories} kcal)</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.date).toLocaleDateString()} at {new Date(entry.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right text-xs">
                    <span className="text-gray-500 font-medium">Weight: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.weight.toFixed(1)} {unit}</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-gray-500 font-medium">BMR: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.bmr} kcal</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-gray-500 font-medium">TDEE: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.tdee} kcal</span>
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
                      {Math.abs(delta)} kcal Target
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClear}
          className="mt-4 text-xs text-gray-400 hover:text-red-500 transition-colors block"
        >
          Clear history from session
        </button>
      </CardContent>
    </Card>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CalorieDeficitCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<SavedEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getDeficitStorage());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      units: "metric", 
      gender: "female", 
      age: "", 
      weight: "", 
      height: "",
      activity: "moderate",
      goal: "normal",
      macroSplit: "balanced",
      goalWeight: ""
    },
  });

  const { getValues, setValue } = form;
  const units = form.watch("units");

  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;
    
    const weightVal = getValues("weight");
    const heightVal = getValues("height");

    if (weightVal && !isNaN(parseFloat(weightVal))) {
      const weight = parseFloat(weightVal);
      const newWeight = newUnit === 'imperial' ? weight * 2.20462 : weight / 2.20462;
      setValue("weight", newWeight.toFixed(1));
    }

    if (heightVal && !isNaN(parseFloat(heightVal))) {
      const height = parseFloat(heightVal);
      const newHeight = newUnit === 'imperial' ? height / 2.54 : height * 2.54;
      setValue("height", newHeight.toFixed(1));
    }

    // ── ADDITIVE: convert the optional goal weight alongside current weight ──
    const goalWeightVal = getValues("goalWeight");
    if (goalWeightVal && !isNaN(parseFloat(goalWeightVal))) {
      const gw = parseFloat(goalWeightVal);
      const newGw = newUnit === 'imperial' ? gw * 2.20462 : gw / 2.20462;
      setValue("goalWeight", newGw.toFixed(1));
    }

    setValue("units", newUnit);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setSaved(false);
    
    setTimeout(() => {
      const age = parseInt(values.age);
      const weightKg = values.units === 'metric' ? parseFloat(values.weight) : parseFloat(values.weight) / 2.20462;
      const heightCm = values.units === 'metric' ? parseFloat(values.height) : parseFloat(values.height) * 2.54;

      // 1. Calculate BMR (Mifflin-St Jeor)
      let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
      bmr += values.gender === "male" ? 5 : -161;
      bmr = Math.round(bmr);

      // 2. Calculate TDEE
      const tdee = Math.round(bmr * activityMultipliers[values.activity]);

      // 3. Calculate Target Deficit
      const dailyDeficit = deficitAmounts[values.goal];
      let targetCalories = tdee - dailyDeficit;

      // 4. Safety Floor Corrections
      let warning = null;
      const safeFloor = values.gender === "male" ? 1500 : 1200;
      
      if (targetCalories < safeFloor && values.goal !== "maintain") {
        warning = `Your target dropped below the safe minimum of ${safeFloor} kcal/day for ${values.gender}s. We have adjusted your goal to ${safeFloor} kcal. Consider increasing your physical activity instead of eating less.`;
        targetCalories = safeFloor;
      } else if (targetCalories < bmr && values.goal !== "maintain") {
        warning = "Your calorie target is below your Basal Metabolic Rate (BMR). While acceptable for short periods, extended time below BMR may cause metabolic adaptation and persistent fatigue.";
      }

      const macros = getMacros(targetCalories, values.macroSplit);
      const zigZag = generateZigZag(targetCalories);

      const insights = generateDeficitInsights(values.goal, values.macroSplit, values.activity);

      // ── ADDITIVE FEATURE 1: projected goal date at a healthy pace ───────────
      // Healthy target: lose ~5% of body weight at ~0.75%/week (mid of 0.5–1%).
      // Energy math: 7700 kcal per kg of fat.
      const unitLabelWt = values.units === "metric" ? "kg" : "lbs";

      // Optional goal weight: if the user supplied a lower target weight, aim for
      // that; otherwise fall back to the ~5% body-weight first milestone.
      const goalWeightRaw = values.goalWeight ? parseFloat(values.goalWeight) : NaN;
      const goalWeightKg = !isNaN(goalWeightRaw)
        ? (values.units === "metric" ? goalWeightRaw : goalWeightRaw / 2.20462)
        : NaN;
      const goalUsesCustomWeight = !isNaN(goalWeightKg) && goalWeightKg > 0 && goalWeightKg < weightKg;

      const goalLossKg = goalUsesCustomWeight
        ? weightKg - goalWeightKg                         // distance to the chosen goal
        : weightKg * 0.05;                                // a sensible first milestone
      const healthyWeeklyLossKg = weightKg * 0.0075;      // ~0.75% body weight / week
      const effectiveDailyDeficit = tdee - targetCalories; // honours the safe floor
      const hasGoalProjection = effectiveDailyDeficit > 0 && goalLossKg > 0;

      // Weekly weight loss the user's *actual* deficit produces (7700 kcal/kg).
      const actualWeeklyLossKg = (effectiveDailyDeficit * 7) / 7700;
      const goalWeeksRaw = hasGoalProjection ? goalLossKg / actualWeeklyLossKg : 0;
      const goalWeeksToReach = hasGoalProjection ? Math.ceil(goalWeeksRaw) : 0;

      const goalDate = new Date();
      goalDate.setDate(goalDate.getDate() + goalWeeksToReach * 7);
      const goalDateStr = goalDate.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      });

      const toDisplayWt = (kg: number) => (values.units === "metric" ? kg : kg * 2.20462);
      const goalLossUnitStr = `${toDisplayWt(goalLossKg).toFixed(1)} ${unitLabelWt}`;
      const goalWeeklyLossStr = `${toDisplayWt(healthyWeeklyLossKg).toFixed(1)} ${unitLabelWt}/week`;

      // ── ADDITIVE FEATURE 2: protein target that protects muscle ─────────────
      const proteinFloorTargetLow = Math.round(weightKg * 1.6);  // lower bound g/day
      const proteinFloorTarget = Math.round(weightKg * 2.2);     // upper, protective
      const belowFloor = (tdee - dailyDeficit) < safeFloor && values.goal !== "maintain";

      setResult({
        bmr,
        tdee,
        targetCalories,
        weeklyDeficit: (tdee - targetCalories) * 7,
        warning,
        macros,
        zigZag,
        headline: insights.headline,
        nextSteps: insights.nextSteps,
        deficitFact: insights.deficitFact,
        // Feature 1
        hasGoalProjection,
        goalLossUnitStr,
        goalWeeklyLossStr,
        goalWeeksToReach,
        goalDateStr,
        goalDailyTarget: targetCalories,
        goalUsesCustomWeight,
        // Feature 2
        safeFloor,
        belowFloor,
        proteinFloorTarget,
        proteinFloorTargetLow,
      });
      
      setIsLoading(false);
      setTimeout(() => { 
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
      }, 150);
    }, 700);
  }

  const handleSave = () => {
    if (!result) return;
    const values = form.getValues();
    const entry: SavedEntry = {
      date: new Date().toISOString(),
      bmr: result.bmr,
      tdee: result.tdee,
      targetCalories: result.targetCalories,
      weight: parseFloat(values.weight),
      units: values.units,
      gender: values.gender,
      goal: values.goal,
      macroSplit: values.macroSplit
    };
    saveDeficitEntry(entry);
    setHistory(getDeficitStorage());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    setShowHistory(false);
  };

  const resultUnit = units === 'metric' ? 'kg' : 'lbs';

  return (
    <div className="space-y-8 text-left">
      {/* ── HISTORICAL PROGRESS TRIGGER ────────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="max-w-4xl mx-auto flex justify-between items-center bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Found {history.length} saved calorie {history.length === 1 ? "record" : "records"}
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:underline"
          >
            {showHistory ? "Collapse Tracking" : "Show Saved Entries"}
            <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}

      {showHistory && (
        <div className="space-y-4">
          <HistoryPanel history={history} onClear={clearHistory} unit={resultUnit} />
        </div>
      )}

      {/* ── CALCULATOR COMPONENT ───────────────────────────────────────────────── */}
      <Card className="max-w-4xl mx-auto shadow-sm" id="calculator">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b rounded-t-xl" style={{ background: `linear-gradient(to bottom, ${brand.primaryBg}, white)` }}>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Flame className="w-6 h-6 text-emerald-700" /> 
                Find Your Deficit
              </CardTitle>
              <CardDescription className="mt-1">
                Calculate daily energy limits, baseline metabolic indicators, and customized macronutrient pathways [1].
              </CardDescription>
            </div>
            {history.length > 0 && (
              <div
                className="hidden sm:flex text-xs font-semibold px-3 py-1.5 rounded-full items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200"
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
              
              {/* Unit Toggle & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border">
                <FormField control={form.control} name="units" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Unit System</FormLabel>
                    <RadioGroup onValueChange={(value) => handleUnitChange(value as UnitSystem)} value={field.value} className="flex items-center space-x-4 mt-2">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="metric" /></FormControl>
                        <FormLabel className="font-medium cursor-pointer">Metric (kg, cm)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="imperial" /></FormControl>
                        <FormLabel className="font-medium cursor-pointer">Imperial (lbs, in)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Biological Sex</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 mt-2">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="female" /></FormControl>
                        <FormLabel className="font-medium cursor-pointer">Female</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="male" /></FormControl>
                        <FormLabel className="font-medium cursor-pointer">Male</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />
              </div>

              {/* Core Measurements */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 28" {...field} className="h-11 text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight ({units === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                    <FormControl><Input type="number" step="0.1" placeholder={units === 'metric' ? "70" : "154"} {...field} className="h-11 text-base" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height ({units === 'metric' ? 'cm' : 'inches'})</FormLabel>
                    <FormControl><Input type="number" step="0.1" placeholder={units === 'metric' ? "170" : "67"} {...field} className="h-11 text-base" /></FormControl>
                    <p className="text-[10px] text-muted-foreground mt-1">{units === 'imperial' ? 'Enter total inches (e.g. 5\'10" = 70)' : ''}</p>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Lifestyle & Goals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="activity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Activity Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select activity" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary (Desk job, little exercise)</SelectItem>
                        <SelectItem value="light">Lightly Active (1-3 days/week)</SelectItem>
                        <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                        <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                        <SelectItem value="very_active">Extra Active (Physical job + training)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Goal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select goal" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="maintain">Maintain Current Weight</SelectItem>
                        <SelectItem value="mild">Mild Weight Loss (0.5 lb / week)</SelectItem>
                        <SelectItem value="normal">Normal Weight Loss (1 lb / week)</SelectItem>
                        <SelectItem value="aggressive">Aggressive Loss (1.5 lb / week)</SelectItem>
                        <SelectItem value="extreme">Extreme Loss (2 lb / week)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="macroSplit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diet Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select diet" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="balanced">Balanced (30% P / 30% F / 40% C)</SelectItem>
                        <SelectItem value="high_protein">High Protein (40% P / 30% F / 30% C)</SelectItem>
                        <SelectItem value="low_carb">Low Carb (40% P / 40% F / 20% C)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* ── ADDITIVE: optional goal weight ─────────────────────────────── */}
              <FormField control={form.control} name="goalWeight" render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    Goal Weight ({units === 'metric' ? 'kg' : 'lbs'})
                    <span className="text-[11px] font-normal text-muted-foreground">— optional</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder={units === 'metric' ? "e.g. 65" : "e.g. 143"} {...field} className="h-11 text-base" />
                  </FormControl>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Add a target weight to get the exact date you'll reach it. Leave blank to project your first 5% milestone.
                  </p>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button type="submit" size="lg" className="flex-1 h-14 text-lg font-bold bg-emerald-700 hover:bg-emerald-800" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Flame className="mr-2 h-5 w-5" />}
                  {isLoading ? 'Crunching Numbers...' : 'Calculate My Deficit'}
                </Button>
                <Button type="button" variant="outline" size="lg" className="sm:w-44 h-14" onClick={() => { form.reset(); setResult(null); setSaved(false); }} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── UNIFIED RESULTS SECTION ────────────────────────────────────────────── */}
      <div ref={resultsRef} className="scroll-mt-16">
        {result && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
            
            {/* COMPARATIVE PROGRESS COMPONENT */}
            <ProgressCard current={result} history={history} unit={resultUnit} />

            {/* 1. MAIN HERO SHIELD TARGET */}
            <Card className="border-primary/20 shadow-lg overflow-hidden border">
              <div className="bg-emerald-500/10 p-8 text-center border-b border-emerald-500/10">
                
                {/* Visual Fact Strip */}
                {result.deficitFact && (
                  <div
                    className="text-xs font-semibold px-4 py-2.5 rounded-lg mb-6 flex items-start text-left gap-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <Brain className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-700" />
                    <span>{result.deficitFact}</span>
                  </div>
                )}

                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Daily Target</p>
                <div className="flex items-end justify-center gap-1">
                  <p className="text-6xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">{result.targetCalories}</p>
                  <p className="text-xl font-medium text-muted-foreground pb-2">kcal</p>
                </div>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                  Consuming this amount consistently places you in an estimated weekly deficit of <span className="font-semibold text-foreground">{result.weeklyDeficit}</span> calories.
                </p>
                
                <div className="max-w-md mx-auto mt-6">
                  <CalorieBar target={result.targetCalories} tdee={result.tdee} />
                </div>
              </div>
            </Card>

            {/* Warning Message strip */}
            {result.warning && (
              <div className="bg-amber-50 border-y border-amber-200 p-4 flex gap-3 text-amber-800 rounded-lg">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{result.warning}</p>
              </div>
            )}

            {/* ── ADDITIVE FEATURE 1: GOAL DATE PROJECTION ──────────────────── */}
            {result.hasGoalProjection && (
              <Card className="border shadow-md">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarCheck className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-bold">Your Goal Date — Steady, Healthy Pace</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Eating your daily target of{" "}
                    <strong className="text-emerald-700">{result.goalDailyTarget} kcal</strong> puts you on track to
                    lose{" "}
                    <strong className="text-emerald-700">{result.goalLossUnitStr}</strong>{" "}
                    {result.goalUsesCustomWeight ? "to reach your goal weight" : "(about 5% of body weight)"}{" "}
                    at a sustainable{" "}
                    <strong className="text-emerald-700">{result.goalWeeklyLossStr}</strong>. Using proven
                    energy-balance math (7,700 kcal per kg), you should reach it in about{" "}
                    <strong className="text-emerald-700">{result.goalWeeksToReach} weeks</strong>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                    <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Daily Target</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{result.goalDailyTarget} kcal</p>
                    </div>
                    <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Time to Goal</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{result.goalWeeksToReach} weeks</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                        <Calendar className="w-3.5 h-3.5" /> Goal Date
                      </div>
                      <p className="text-lg font-black text-emerald-700 mt-1">{result.goalDateStr}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                    Projection assumes a consistent deficit. Re-check every few weeks — a lighter body burns fewer calories, so your pace naturally slows.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── ADDITIVE FEATURE 2: SAFE FLOOR + MUSCLE-PROTECTIVE PROTEIN ──── */}
            <Card className="border shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold">Safe-Calorie Floor &amp; Protein to Protect Muscle</h3>
                </div>

                {result.belowFloor ? (
                  <p className="text-sm text-amber-700 leading-relaxed mt-1">
                    Your selected pace would push you below the safe minimum of{" "}
                    <strong>{result.safeFloor} kcal/day</strong>. We have held your target at the floor — eat at
                    least <strong>{result.safeFloor} kcal</strong> and create the rest of your deficit through more
                    daily movement rather than eating less.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Your target stays safely above the minimum floor of{" "}
                    <strong className="text-emerald-700">{result.safeFloor} kcal/day</strong>. To preserve lean
                    muscle while losing fat, aim for{" "}
                    <strong className="text-emerald-700">{result.proteinFloorTargetLow}–{result.proteinFloorTarget} g of protein per day</strong>{" "}
                    (about 1.6–2.2 g/kg).
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Safe Floor</p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{result.safeFloor} kcal</p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Your Target</p>
                    <p className={`text-lg font-black mt-1 ${result.belowFloor ? "text-amber-600" : "text-slate-800 dark:text-slate-100"}`}>{result.targetCalories} kcal</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                      <Dumbbell className="w-3.5 h-3.5" /> Protein/Day
                    </div>
                    <p className="text-lg font-black text-emerald-700 mt-1">{result.proteinFloorTargetLow}–{result.proteinFloorTarget} g</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  Higher protein plus strength training during a deficit helps you lose fat — not muscle. Floors are general guidance, not a substitute for medical advice.
                </p>
              </CardContent>
            </Card>

            {/* 2. DUAL-SECTION COMPOSITIONAL MATRIX */}
            <Card className="border shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
                  
                  {/* Macros Column */}
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg"><Apple className="w-5 h-5" /></div>
                      <h3 className="text-lg font-bold">Macronutrient Distribution</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Formulated according to your physical requirements to defend muscle retention while reducing fat.</p>
                    <MacroChart macros={result.macros} />
                    
                    <div className="pt-4 border-t border-dashed mt-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Basal Metabolic Rate (BMR):</span>
                        <span className="font-semibold text-foreground">{result.bmr} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Daily Energy Expenditure (TDEE):</span>
                        <span className="font-semibold text-foreground">{result.tdee} kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Zig-Zag Schedule Column */}
                  <div className="p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-slate-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg"><Calendar className="w-5 h-5" /></div>
                        <h3 className="text-lg font-bold">Zig-Zag Schedule</h3>
                      </div>
                      <Badge className="bg-emerald-700 text-white hover:bg-emerald-800">Advanced Option</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">Vary your intake across the week to prevent metabolic deceleration while preserving the identical weekly deficit [1].</p>
                    
                    <div className="space-y-2 mt-4">
                      {result.zigZag.map((dayObj, i) => {
                        const isHigh = dayObj.calories > result.targetCalories;
                        const isLow = dayObj.calories < result.targetCalories;
                        return (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-md bg-white dark:bg-slate-800 border shadow-sm text-sm">
                            <span className="font-medium w-24">{dayObj.day}</span>
                            <span className="font-bold flex-1 text-right">{dayObj.calories} kcal</span>
                            <div className="w-24 text-right">
                              {isHigh ? (
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded">High Day</span>
                              ) : isLow ? (
                                <span className="text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 rounded">Low Day</span>
                              ) : (
                                <span className="text-xs font-semibold text-gray-600 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded">Normal</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* 3. HIGH-CTR PERSONALIZED ACTION RECOMMENDATIONS */}
            <Card className="border-0 shadow-lg" style={{ background: brand.primaryBg, border: `1px solid ${brand.primaryBorder}` }}>
              <CardContent className="p-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <ArrowRight className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-lg font-black text-emerald-700">
                    Your Personalized Recomposition Action Plan
                  </h3>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
                  {result.headline}
                </p>
                <div className="space-y-3">
                  {result.nextSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/80 dark:bg-slate-950/70 rounded-lg p-3.5 border border-emerald-100/50">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 bg-emerald-700 text-white"
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                {/* Core Cross-Links */}
                <div className="mt-8 pt-4 border-t border-emerald-200">
                  <p className="text-xs font-bold mb-3 text-emerald-700">Compare other key compositional indicators &rarr;</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Ideal Weight Calculator", href: "/health/ideal-body-weight-calculator" },
                      { label: "Body Fat % Calculator", href: "/health/body-fat-calculator" },
                      { label: "A Body Shape Index (ABSI)", href: "/health/absi-calculator" },
                      { label: "Heart Rate Zones", href: "/health/heart-rate-calculator" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-all hover:bg-white/95 border bg-white border-emerald-200 text-gray-700 hover:shadow-sm"
                      >
                        {link.label} <ChevronRight className="w-3 h-3" />
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. METHODOLOGY DISCLAIMER */}
            <div className="text-[11px] text-gray-400 text-center max-w-2xl mx-auto leading-relaxed px-4">
              <strong>Methodology Context:</strong> Energy requirements are calculated via the clinically validated Mifflin-St Jeor equation and adjusted based on metabolic activity indexes [1]. Estimated thresholds are predictions. Systemic responses can fluctuate based on genetic factors, sleep cycles, and physical history. Always seek professional advice before engaging in persistent weight adjustments or extreme deficit models.
            </div>

            {/* 5. SAVE RECORDS & ACTIONS CONSOLE */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pb-6">
              <Button
                onClick={handleSave}
                disabled={saved}
                className="font-bold px-8 w-full sm:w-auto h-12 bg-emerald-700 text-white hover:bg-emerald-800"
                style={saved ? { background: brand.primaryBg, color: brand.primary, border: `1px solid ${brand.primaryBorder}` } : {}}
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
                  form.reset();
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