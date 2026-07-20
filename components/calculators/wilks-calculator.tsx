"use client";

import { SyncPrompt } from "@/components/marketing/SyncPrompt";
import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calculator, RefreshCw, Loader2, Dumbbell, Trophy, Scale, TrendingUp,
  BarChart3, Save, History, ChevronRight, CheckCircle2, Award, AlertCircle, Info
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
  bodyWeight: z.string().min(1, "Body weight is required."),
  totalWeight: z.string().optional(), // Used for Simple Mode
  squat: z.string().optional(),       // Used for Detailed Mode
  bench: z.string().optional(),       // Used for Detailed Mode
  deadlift: z.string().optional(),    // Used for Detailed Mode
  units: z.enum(["metric", "imperial"]),
  mode: z.enum(["simple", "detailed"]),
}).refine((data) => {
  if (data.mode === "simple") {
    return !!data.totalWeight && data.totalWeight.length > 0;
  }
  return (!!data.squat && !!data.bench && !!data.deadlift);
}, {
  message: "Please enter your lift numbers.",
  path: ["totalWeight"], // Attach error to totalWeight for simplicity
});

type UnitSystem = "metric" | "imperial";
type Gender = "male" | "female";

interface CalculationResult {
  wilksScore: number;
  totalLifted: number;
  category: string;
  percentileText: string;
  categoryColor: string;
  // FEATURE 1 — strength-level rating context
  levelLabel: string;
  levelBlurb: string;
  // FEATURE 2 — population ranking
  percentile: number;
  percentileTone: "low" | "average" | "high";
  unitLabel: string;
}

interface SavedWilksEntry {
  date: string;
  wilksScore: number;
  totalLifted: number;
  category: string;
  percentile: number;
  gender: string;
  unitLabel: string;
}

// ─── LOCAL STORAGE (mirrors the ABSI browser-history pattern) ─────────────────
const STORAGE_KEY = "calqulate_wilks_history";

function getWilksStorage(): SavedWilksEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWilksEntry(entry: SavedWilksEntry) {
  try {
    const existing = getWilksStorage();
    existing.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 10)));
  } catch {
    /* ignore */
  }
}

function wilksDelta(current: number, previous: number) {
  return parseNumber((current - previous).toFixed(2));
}

// Pick the true prior entry, skipping a saved copy of the current result.
function getPreviousWilksEntry(current: CalculationResult, history: SavedWilksEntry[]): SavedWilksEntry | null {
  if (history.length === 0) return null;
  const latest = history[0];
  const isDuplicate = Math.abs(latest.wilksScore - current.wilksScore) < 1e-6;
  return isDuplicate ? history[1] || null : latest;
}

// Ordinal suffix for percentiles: 1 → "1st", 22 → "22nd", 78 → "78th".
function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Map a Wilks score to an approximate population percentile band. Anchored to the
// widely-cited recreational-to-elite benchmarks (≈200 average → ≈500+ world-class).
function wilksToPercentile(score: number): number {
  const clamped = Math.min(550, Math.max(100, score));
  // 100 → 1st, 200 → ~25th, 300 → ~55th, 400 → ~85th, 500+ → 99th
  const pct = Math.round(((clamped - 100) / (520 - 100)) * 98) + 1;
  return Math.min(99, Math.max(1, pct));
}

// FEATURE 1 — beginner → world-class rating with an explanatory blurb.
const getStrengthLevel = (score: number): { label: string; blurb: string } => {
  if (score >= 500) return { label: "World-Class", blurb: "Among the strongest lifters on the planet — international podium territory." };
  if (score >= 450) return { label: "Elite", blurb: "Competitive at a national level; a very rare level of relative strength." };
  if (score >= 400) return { label: "Advanced", blurb: "Stronger than the vast majority of trained lifters." };
  if (score >= 350) return { label: "Intermediate", blurb: "A solid competitive base — clearly above the average gym-goer." };
  if (score >= 300) return { label: "Novice", blurb: "Good foundational strength relative to your bodyweight." };
  if (score >= 200) return { label: "Untrained", blurb: "An early baseline — consistent training moves this up quickly." };
  return { label: "Beginner", blurb: "Everyone starts here — your score will climb fast with structured training." };
};

// --- VISUAL COMPONENTS ---

const StrengthGauge = ({ score }: { score: number }) => {
  // Scale: 0 to 600 (World class is usually 500-600)
  const maxScore = 600;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  let label = "Beginner";
  if (score > 500) label = "World Class";
  else if (score > 450) label = "Elite";
  else if (score > 400) label = "Advanced";
  else if (score > 350) label = "Intermediate";
  else if (score > 300) label = "Novice";
  else if (score > 200) label = "Untrained";

  return (
    <div className="mt-6 space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>Untrained</span>
        <span>Elite</span>
      </div>
      <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-amber-500 transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-sm text-muted-foreground">Strength Standard: </span>
        <span className="font-bold text-primary">{label}</span>
      </div>
    </div>
  );
};

// --- LOGIC ---

// Original Wilks Coefficients (Metric)
const MALE_COEFFS = [
  -216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863E-06, -1.291E-08
];
const FEMALE_COEFFS = [
  594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582E-05, -9.054E-08
];

const calculateWilks = (bw: number, total: number, gender: Gender): number => {
  const x = bw;
  const coeffs = gender === "male" ? MALE_COEFFS : FEMALE_COEFFS;
  
  const denominator = coeffs[0] + 
                      (coeffs[1] * x) + 
                      (coeffs[2] * Math.pow(x, 2)) + 
                      (coeffs[3] * Math.pow(x, 3)) + 
                      (coeffs[4] * Math.pow(x, 4)) + 
                      (coeffs[5] * Math.pow(x, 5));
                      
  const coeff = 500 / denominator;
  return total * coeff;
};

const getCategory = (score: number) => {
  if (score >= 500) return { label: "World Class", color: "text-amber-500", text: "You are among the strongest lifters on the planet." };
  if (score >= 400) return { label: "Elite", color: "text-purple-600", text: "Competitive at a national level." };
  if (score >= 350) return { label: "Advanced", color: "text-blue-600", text: "Stronger than most gym-goers." };
  if (score >= 300) return { label: "Intermediate", color: "text-green-600", text: "Solid foundation, better than average." };
  if (score >= 200) return { label: "Novice", color: "text-yellow-600", text: "Good start, keep training!" };
  return { label: "Beginner", color: "text-gray-500", text: "Everyone starts somewhere." };
};

// ─── HISTORY PANEL (mirrors the ABSI browser-history component) ───────────────
const WilksHistoryPanel = ({ history, onClear }: { history: SavedWilksEntry[]; onClear: () => void }) => {
  if (history.length === 0) return null;

  return (
    <Card className="max-w-4xl mx-auto border shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="w-4 h-4 text-emerald-700" />
          Your Local Wilks Tracking History
        </CardTitle>
        <CardDescription className="text-xs">
          Stored directly in your browser. Nothing is uploaded and no tracking cookies are set.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SyncPrompt ctaId="sync_prompt_wilks" className="mt-0 mb-4" />
        <div className="space-y-2">
          {history.map((entry, i) => {
            const nextEntry = history[i + 1];
            const delta = nextEntry ? wilksDelta(entry.wilksScore, nextEntry.wilksScore) : null;
            return (
              <div key={entry.date} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b last:border-0 border-gray-100 dark:border-gray-800 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-50 text-emerald-700">
                    #{history.length - i}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{entry.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at{" "}
                      {new Date(entry.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right text-xs">
                    <span className="text-gray-500">Wilks: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.wilksScore.toFixed(2)}</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-gray-500">Total: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{entry.totalLifted} {entry.unitLabel}</span>
                    <span className="mx-1 text-gray-300">|</span>
                    <span className="text-gray-500">Pct: </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{ordinal(entry.percentile)}</span>
                  </div>

                  {delta !== null && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        delta > 0 ? "bg-emerald-50 text-emerald-700" : delta < 0 ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {delta > 0 ? "▲" : delta < 0 ? "▼" : "─"} {Math.abs(delta).toFixed(2)}
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

export default function WilksCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<SavedWilksEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getWilksStorage());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      gender: "male", 
      bodyWeight: "", 
      totalWeight: "", 
      squat: "",
      bench: "",
      deadlift: "",
      units: "metric",
      mode: "simple"
    },
  });

  const { getValues, setValue, watch } = form;
  const units = watch("units");
  const mode = watch("mode");

  // Auto-calculate total if detailed mode inputs change
  useEffect(() => {
    if (mode === "detailed") {
      const s = parseNumber(getValues("squat") || "0");
      const b = parseNumber(getValues("bench") || "0");
      const d = parseNumber(getValues("deadlift") || "0");
      if (!isNaN(s) || !isNaN(b) || !isNaN(d)) {
        setValue("totalWeight", (s + b + d).toFixed(1));
      }
    }
  }, [watch("squat"), watch("bench"), watch("deadlift"), mode, getValues, setValue]);

  // Handle Unit Conversion
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;

    const fields = ["bodyWeight", "totalWeight", "squat", "bench", "deadlift"] as const;
    const factor = 2.20462; // 1 kg = 2.20462 lbs

    fields.forEach(field => {
      const val = getValues(field);
      if (val && !isNaN(parseNumber(val))) {
        let num = parseNumber(val);
        // Metric to Imperial (Kg -> Lbs)
        if (newUnit === "imperial") {
           num = num * factor;
        } 
        // Imperial to Metric (Lbs -> Kg)
        else {
           num = num / factor;
        }
        setValue(field, num.toFixed(1));
      }
    });
    setValue("units", newUnit);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSaved(false);

    // Simulate calculation delay for effect
    setTimeout(() => {
      let bw = parseNumber(values.bodyWeight);
      let total = parseNumber(values.totalWeight || "0");

      // Normalize to Metric (KG) for calculation
      if (values.units === "imperial") {
        bw = bw / 2.20462;
        total = total / 2.20462;
      }

      const score = calculateWilks(bw, total, values.gender);
      const cat = getCategory(score);

      // Display total in current unit
      const displayTotal = parseNumber(values.totalWeight || "0");

      // FEATURE 1 — strength-level rating + plain-language meaning
      const level = getStrengthLevel(score);

      // FEATURE 2 — population ranking band
      const percentile = wilksToPercentile(score);
      const percentileTone: "low" | "average" | "high" =
        percentile <= 33 ? "low" : percentile >= 66 ? "high" : "average";

      setResult({
        wilksScore: score,
        totalLifted: displayTotal,
        category: cat.label,
        categoryColor: cat.color,
        percentileText: cat.text,
        levelLabel: level.label,
        levelBlurb: level.blurb,
        percentile,
        percentileTone,
        unitLabel: values.units === "metric" ? "kg" : "lbs",
      });

      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }, 600);
  }

  const handleSave = () => {
    if (!result) return;
    const values = getValues();
    const entry: SavedWilksEntry = {
      date: new Date().toISOString(),
      wilksScore: result.wilksScore,
      totalLifted: result.totalLifted,
      category: result.category,
      percentile: result.percentile,
      gender: values.gender,
      unitLabel: result.unitLabel,
    };
    saveWilksEntry(entry);
    setHistory(getWilksStorage());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    setShowHistory(false);
  };

  return (
    <>
      {/* ── HISTORICAL TRACKING TRIGGER ─────────────────────────────────────── */}
      {history.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Found {history.length} saved {history.length === 1 ? "score" : "scores"} in this browser
            </span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:underline"
          >
            {showHistory ? "Collapse Tracking" : "Show Saved Scores"}
            <ChevronRight className={`w-4 h-4 transition-transform ${showHistory ? "rotate-90" : ""}`} />
          </button>
        </div>
      )}

      {showHistory && (
        <div className="mb-8">
          <WilksHistoryPanel history={history} onClear={clearHistory} />
        </div>
      )}

      <Card className="max-w-4xl mx-auto shadow-lg" id="calculator">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 rounded-t-xl border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-amber-500" /> Wilks Score Calculator
          </CardTitle>
          <CardDescription>
            Calculate your competitive powerlifting strength level standardized across body weights.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Top Controls: Gender & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Gender</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                      <FormItem className="flex items-center space-x-2 space-y-0 bg-white dark:bg-slate-800 px-4 py-2 rounded-md border shadow-sm cursor-pointer">
                        <FormControl><RadioGroupItem value="male" /></FormControl>
                        <FormLabel className="cursor-pointer">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0 bg-white dark:bg-slate-800 px-4 py-2 rounded-md border shadow-sm cursor-pointer">
                        <FormControl><RadioGroupItem value="female" /></FormControl>
                        <FormLabel className="cursor-pointer">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />

                <FormField control={form.control} name="units" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Units</FormLabel>
                    <RadioGroup 
                      onValueChange={(val) => handleUnitChange(val as UnitSystem)} 
                      value={field.value} 
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0 bg-white dark:bg-slate-800 px-4 py-2 rounded-md border shadow-sm cursor-pointer">
                        <FormControl><RadioGroupItem value="metric" /></FormControl>
                        <FormLabel className="cursor-pointer">Metric (kg)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0 bg-white dark:bg-slate-800 px-4 py-2 rounded-md border shadow-sm cursor-pointer">
                        <FormControl><RadioGroupItem value="imperial" /></FormControl>
                        <FormLabel className="cursor-pointer">Imperial (lbs)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />
              </div>

              {/* Body Weight Input */}
              <div className="grid grid-cols-1 gap-4">
                 <FormField control={form.control} name="bodyWeight" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Scale className="w-4 h-4"/> Body Weight</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" step="0.1" placeholder={units === "metric" ? "e.g. 80" : "e.g. 176"} {...field} className="pl-4 text-lg" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                            {units === "metric" ? "kg" : "lbs"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
              </div>

              {/* Lift Inputs (Tabs) */}
              <Tabs defaultValue="simple" className="w-full" onValueChange={(val) => setValue("mode", val as "simple" | "detailed")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="simple">Total Lift Weight</TabsTrigger>
                  <TabsTrigger value="detailed">Enter S/B/D Individually</TabsTrigger>
                </TabsList>
                
                <TabsContent value="simple">
                  <FormField control={form.control} name="totalWeight" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Dumbbell className="w-4 h-4"/> Total Weight Lifted (Squat + Bench + Deadlift)</FormLabel>
                      <FormControl>
                         <div className="relative">
                          <Input type="number" step="0.1" placeholder={units === "metric" ? "e.g. 500" : "e.g. 1100"} {...field} className="text-lg" />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                            {units === "metric" ? "kg" : "lbs"}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </TabsContent>
                
                <TabsContent value="detailed" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="squat" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Squat</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="0" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="bench" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bench Press</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="0" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="deadlift" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadlift</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="0" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  <div className="text-center text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    Total Calculated: <span className="font-bold text-foreground">{form.watch("totalWeight") || 0} {units === "metric" ? "kg" : "lbs"}</span>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1 text-lg h-12" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate Wilks Score'}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setResult(null); }} className="h-12">
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* RESULTS SECTION */}
      <div ref={resultsRef}>
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 border-2 border-primary/10 overflow-hidden">
            <div className="bg-primary/5 p-2"></div>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                
                {/* Score Display */}
                <div className="text-center md:text-left space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Your Wilks Score</h3>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="text-6xl md:text-7xl font-extrabold text-foreground tracking-tight">
                      {result.wilksScore.toFixed(2)}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${result.categoryColor} flex items-center justify-center md:justify-start gap-2`}>
                    <TrendingUp className="w-5 h-5" /> {result.category}
                  </p>
                  <p className="text-muted-foreground pt-2">{result.percentileText}</p>
                </div>

                {/* Gauge and Stats */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <span className="text-sm text-muted-foreground">Total Lifted</span>
                    <span className="font-bold text-lg">{result.totalLifted} {units === "metric" ? "kg" : "lbs"}</span>
                  </div>
                  <StrengthGauge score={result.wilksScore} />
                </div>
              </div>

              {/* FEATURE 1 — FAIR CROSS-BODYWEIGHT COMPARISON ─────────────────── */}
              <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50/60 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Scale className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold">Your Wilks Score — A Fair Comparison</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your total of{" "}
                  <strong className="text-emerald-700">{result.totalLifted} {result.unitLabel}</strong>{" "}
                  converts to a Wilks score of{" "}
                  <strong className="text-emerald-700">{result.wilksScore.toFixed(2)}</strong>. The Wilks formula
                  applies the recognised competition coefficient to your bodyweight, so it{" "}
                  <strong>normalises for bodyweight</strong> — letting a lighter lifter and a heavier lifter compare
                  relative strength on a level playing field instead of just raw kilos lifted.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-white dark:bg-slate-900 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Raw Total</p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                      {result.totalLifted} {result.unitLabel}
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-white dark:bg-slate-900 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">Bodyweight-Adjusted Wilks</p>
                    <p className="text-lg font-black text-emerald-700 mt-1">{result.wilksScore.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  Wilks removes the bodyweight advantage so two lifters at different weights can be ranked by relative,
                  not absolute, strength.
                </p>
              </div>

              {/* FEATURE 2 — WHERE YOU RANK + PROGRESS TRACKING ──────────────── */}
              <div className="mt-6 rounded-xl border shadow-sm bg-white dark:bg-slate-950 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold">Where You Rank Among Lifters</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your score places you at the{" "}
                  <span
                    className={`font-bold ${
                      result.percentileTone === "low"
                        ? "text-yellow-700"
                        : result.percentileTone === "high"
                        ? "text-emerald-700"
                        : "text-blue-700"
                    }`}
                  >
                    {ordinal(result.percentile)} percentile
                  </span>{" "}
                  of lifters — your strength level is{" "}
                  <strong className={result.categoryColor}>{result.levelLabel}</strong>. {result.levelBlurb}
                </p>

                {/* Strength-level bands */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
                  {[
                    { label: "Beginner", min: 0 },
                    { label: "Novice", min: 300 },
                    { label: "Intermediate", min: 350 },
                    { label: "Advanced", min: 400 },
                    { label: "Elite", min: 450 },
                    { label: "World-Class", min: 500 },
                  ].map((band) => {
                    const active =
                      band.label === result.levelLabel ||
                      (result.levelLabel === "Untrained" && band.label === "Beginner");
                    return (
                      <div
                        key={band.label}
                        className={`rounded-lg border p-2 text-[11px] font-bold transition-colors ${
                          active
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500 dark:bg-slate-900 dark:border-slate-800"
                        }`}
                      >
                        {band.label}
                      </div>
                    );
                  })}
                </div>

                {/* Percentile bar */}
                <div className="relative mt-5 w-full h-3 bg-gradient-to-r from-slate-300 via-blue-400 to-emerald-500 rounded-full">
                  <div
                    className="absolute top-1/2 h-5 w-5 rounded-full bg-white border-4 border-emerald-600 shadow-lg -translate-y-1/2 -translate-x-1/2 transition-all duration-1000"
                    style={{ left: `${result.percentile}%` }}
                    title={`${ordinal(result.percentile)} percentile`}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-2 px-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>World-Class</span>
                </div>

                {/* Save / track over time (mirrors ABSI browser-history pattern) */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 border-t pt-5">
                  <p className="text-xs text-muted-foreground flex-1 text-center sm:text-left">
                    Track your Wilks score over time. Saved privately in this browser, so clearing your cookies or switching device will clear it.
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={saved}
                      className="flex-1 sm:flex-none font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {saved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" /> Save to History
                        </>
                      )}
                    </Button>
                    {history.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowHistory(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <History className="w-4 h-4 mr-2" /> View History
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}