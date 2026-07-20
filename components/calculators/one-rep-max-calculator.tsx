"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calculator,
  RefreshCw,
  Loader2,
  Dumbbell,
  Trophy,
  TrendingUp,
  LineChart,
  ListChecks,
  Medal
} from "lucide-react";
import { parseNumber } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// --- FORM SCHEMA ---
const formSchema = z.object({
  weight: z.string().min(1, "Lifted weight is required."),
  reps: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 1 && num <= 12;
  }, { message: "Calculations are most accurate between 1 and 12 reps." }),
  units: z.enum(["kg", "lbs"]),
  // OPTIONAL — non-breaking fields used only for the strength-percentile feature
  bodyweight: z.string().optional(),
  sex: z.enum(["male", "female"]).optional(),
});

type UnitSystem = "kg" | "lbs";

type StrengthLevelName = "Untrained" | "Novice" | "Intermediate" | "Advanced" | "Elite";

interface StrengthRanking {
  level: StrengthLevelName;
  ratio: number;           // 1RM / bodyweight (in kg terms)
  nextLevel: StrengthLevelName | null;
  toNextLevel: number;     // additional 1RM (display units) needed to reach the next tier
  thresholds: { level: StrengthLevelName; weight: number }[]; // 1RM thresholds in display units
}

interface CalculationResult {
  oneRepMax: number;
  percentages: { percent: number; weight: number; reps: number }[];
  chartData: { reps: number; weight: number }[];
  trainingZones: { zone: string; range: string; weightRange: string; focus: string; color: string }[];
  strengthRanking: StrengthRanking | null;
}

// --- CALCULATION LOGIC (Standard Epley) ---
const calculateORM = (weight: number, reps: number) => {
  if (reps === 1) return weight;
  // Epley Formula: Weight * (1 + Reps/30)
  // This is the industry standard used by StrengthLevel, Calculator.net, etc.
  return weight * (1 + reps / 30);
};

const getTrainingZones = (orm: number, unit: string) => {
  // Helper to round consistently
  const r = (val: number) => Math.round(val);
  
  return [
    {
      zone: "Explosive Power",
      range: "90-100%",
      weightRange: `${r(orm * 0.9)} - ${r(orm)} ${unit}`,
      focus: "1-3 Reps (Max Effort)",
      color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
    },
    {
      zone: "Strength",
      range: "80-90%",
      weightRange: `${r(orm * 0.8)} - ${r(orm * 0.9)} ${unit}`,
      focus: "4-6 Reps (Heavy)",
      color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
    },
    {
      zone: "Hypertrophy",
      range: "60-80%",
      weightRange: `${r(orm * 0.6)} - ${r(orm * 0.8)} ${unit}`,
      focus: "8-12 Reps (Muscle Growth)",
      color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
    },
    {
      zone: "Endurance",
      range: "40-60%",
      weightRange: `${r(orm * 0.4)} - ${r(orm * 0.6)} ${unit}`,
      focus: "15+ Reps (Stamina)",
      color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
    },
  ];
};

// --- STRENGTH STANDARDS (1RM as a multiple of bodyweight) ---
// Bodyweight-relative strength ratios for a general compound lift, expressed as
// 1RM ÷ bodyweight. These are typical, widely-cited training benchmarks used to
// place a lift on the Untrained → Elite spectrum.
const STRENGTH_RATIOS: Record<"male" | "female", { level: StrengthLevelName; ratio: number }[]> = {
  male: [
    { level: "Untrained", ratio: 0.5 },
    { level: "Novice", ratio: 0.75 },
    { level: "Intermediate", ratio: 1.25 },
    { level: "Advanced", ratio: 1.75 },
    { level: "Elite", ratio: 2.25 },
  ],
  female: [
    { level: "Untrained", ratio: 0.35 },
    { level: "Novice", ratio: 0.55 },
    { level: "Intermediate", ratio: 0.9 },
    { level: "Advanced", ratio: 1.25 },
    { level: "Elite", ratio: 1.6 },
  ],
};

const getStrengthRanking = (
  ormDisplay: number,        // 1RM in the user's display units (kg or lbs)
  bodyweightDisplay: number, // bodyweight in the user's display units
  sex: "male" | "female",
  units: UnitSystem
): StrengthRanking | null => {
  if (!bodyweightDisplay || bodyweightDisplay <= 0) return null;

  // ratio is unit-agnostic (both numerator & denominator share the same unit)
  const ratio = ormDisplay / bodyweightDisplay;
  const tiers = STRENGTH_RATIOS[sex];

  // Build display-unit 1RM thresholds for each tier.
  const thresholds = tiers.map((t) => ({
    level: t.level,
    weight: Math.round(t.ratio * bodyweightDisplay),
  }));

  // Find the highest tier the lifter meets or exceeds.
  let levelIndex = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (ratio >= tiers[i].ratio) levelIndex = i;
  }
  const level = tiers[levelIndex].level;
  const nextTier = tiers[levelIndex + 1] || null;
  const nextLevel = nextTier ? nextTier.level : null;
  const toNextLevel = nextTier
    ? Math.max(0, Math.round(nextTier.ratio * bodyweightDisplay - ormDisplay))
    : 0;

  return {
    level,
    ratio: parseNumber(ratio.toFixed(2)),
    nextLevel,
    toNextLevel,
    thresholds,
  };
};

const STRENGTH_LEVEL_STYLES: Record<StrengthLevelName, string> = {
  Untrained: "bg-slate-100 text-slate-700 border-slate-200",
  Novice: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-teal-50 text-teal-700 border-teal-200",
  Advanced: "bg-amber-50 text-amber-700 border-amber-200",
  Elite: "bg-emerald-600 text-white border-emerald-700",
};

export default function OneRepMaxCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { weight: "", reps: "", units: "kg", bodyweight: "", sex: "male" },
  });

  const { setValue, getValues, watch } = form;
  const units = watch("units");

  // --- UNIT CONVERSION HANDLER ---
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    const currentWeight = getValues("weight");

    if (newUnit === currentUnit) return;

    const convert = (val: number) =>
      currentUnit === "kg" && newUnit === "lbs"
        ? val * 2.20462
        : currentUnit === "lbs" && newUnit === "kg"
        ? val / 2.20462
        : val;

    if (currentWeight && !isNaN(parseNumber(currentWeight))) {
      // Update the input with 1 decimal place accuracy
      setValue("weight", convert(parseNumber(currentWeight)).toFixed(1));
    }

    // Keep the optional bodyweight field in sync with the selected unit too.
    const currentBodyweight = getValues("bodyweight");
    if (currentBodyweight && !isNaN(parseNumber(currentBodyweight))) {
      setValue("bodyweight", convert(parseNumber(currentBodyweight)).toFixed(1));
    }

    setValue("units", newUnit);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
      const weight = parseNumber(values.weight);
      const reps = parseInt(values.reps);
      const orm = calculateORM(weight, reps);

      // Generate Percentage Table
      const percentages = [];
      const chartData = [];
      const percentsToCalc = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
      
      // Standard Rep Estimates (Brzycki/Epley inverted logic for reps)
      const repEstimates: Record<number, number> = {
        100: 1, 95: 2, 90: 4, 85: 6, 80: 8, 75: 10, 70: 12, 65: 16, 60: 20, 55: 24, 50: 30
      };

      for (let p of percentsToCalc) {
        const liftWeight = Math.round(orm * (p / 100));
        percentages.push({
          percent: p,
          weight: liftWeight,
          reps: repEstimates[p]
        });
        
        // Populate Chart Data (limit to 20 reps for cleaner graph)
        if (repEstimates[p] <= 20) {
           chartData.push({ reps: repEstimates[p], weight: liftWeight });
        }
      }
      
      // Sort chart data for Recharts (x-axis ascending)
      chartData.sort((a,b) => a.reps - b.reps);

      const trainingZones = getTrainingZones(orm, values.units);

      // FEATURE 2 — bodyweight-relative strength ranking (Novice → Elite).
      // Optional: only computed when the user supplies a bodyweight.
      const bodyweightVal = values.bodyweight ? parseNumber(values.bodyweight) : NaN;
      const strengthRanking = !isNaN(bodyweightVal)
        ? getStrengthRanking(orm, bodyweightVal, values.sex || "male", values.units)
        : null;

      setResult({
        oneRepMax: orm,
        percentages,
        trainingZones,
        chartData,
        strengthRanking
      });
      
      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }, 400); // Faster calculation feel
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-xl border-t-4 border-t-blue-600" id="calculator">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl text-blue-900 dark:text-blue-100">
            <Dumbbell className="w-6 h-6 text-blue-600" /> 1RM Calculator
          </CardTitle>
          <CardDescription>
            Calculate your One Rep Max using the industry-standard formula used by powerlifters.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Inputs */}
                <div className="flex-1 space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Select Units</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val) => handleUnitChange(val as UnitSystem)}
                            defaultValue={field.value}
                            value={field.value}
                            className="flex space-x-0 bg-secondary rounded-lg p-1 w-fit"
                          >
                            <FormItem className="flex items-center space-y-0">
                              <FormControl>
                                <RadioGroupItem value="kg" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="cursor-pointer px-4 py-2 rounded-md transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-primary hover:text-primary">
                                Metric (kg)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-y-0">
                              <FormControl>
                                <RadioGroupItem value="lbs" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="cursor-pointer px-4 py-2 rounded-md transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-primary hover:text-primary">
                                Imperial (lbs)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Weight Lifted</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" step="0.5" placeholder={units === 'kg' ? "100" : "225"} {...field} className="text-lg pl-3 pr-12 h-12" />
                              <span className="absolute right-3 top-3 text-muted-foreground text-sm font-medium">{units}</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="reps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Repetitions</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} className="text-lg h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* OPTIONAL — strength-percentile inputs (non-breaking) */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-emerald-700" />
                      <p className="text-sm font-semibold text-emerald-700">
                        Optional: rank your strength (Novice → Elite)
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="bodyweight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Bodyweight</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type="number" step="0.5" placeholder={units === 'kg' ? "80" : "176"} {...field} className="text-base pl-3 pr-12 h-11" />
                                <span className="absolute right-3 top-3 text-muted-foreground text-sm font-medium">{units}</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Sex</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="flex space-x-0 bg-secondary rounded-lg p-1 w-full"
                              >
                                {["male", "female"].map((s) => (
                                  <FormItem key={s} className="flex-1 flex items-center space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value={s} className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className="w-full text-center cursor-pointer px-3 py-2 rounded-md text-sm capitalize transition-all peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-sm peer-data-[state=checked]:text-emerald-700 hover:text-emerald-700">
                                      {s}
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave blank to skip — your 1RM and training table still work without it.
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 p-6 rounded-xl border border-blue-100 dark:border-blue-900 flex flex-col justify-center">
                  <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Accuracy Tip
                  </h4>
                  <p className="text-sm text-blue-800/80 dark:text-blue-300 leading-relaxed">
                    This calculator uses the <strong>Epley Formula</strong>, widely considered the most accurate method for general lifting populations.
                  </p>
                  <p className="text-sm text-blue-800/80 dark:text-blue-300 leading-relaxed mt-2">
                    For the best results, use a weight you can lift for <strong>3 to 6 reps</strong>. Calculations based on 10+ reps are less reliable due to muscle endurance factors.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="flex-1 text-lg h-12 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate 1RM'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={() => { form.reset(); setResult(null); }} 
                  className="h-12 px-8" 
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef} className="scroll-mt-24">
        {result && (
          <div className="grid gap-8 mt-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* MAIN RESULT: BIG NUMBER */}
            <Card className="overflow-hidden border-2 border-blue-100 dark:border-blue-900 shadow-lg relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-8 text-center bg-white dark:bg-slate-900">
                 <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Your Estimated One Rep Max</p>
                 <div className="flex items-center justify-center gap-4">
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <Trophy className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <span className="text-7xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
                        {result.oneRepMax.toFixed(1)} 
                      </span>
                      <span className="text-3xl text-muted-foreground font-medium ml-2">{units}</span>
                    </div>
                 </div>
                 <p className="text-muted-foreground text-sm mt-4 max-w-md mx-auto">
                    *Based on <strong>{form.getValues("weight")} {units}</strong> for <strong>{form.getValues("reps")} reps</strong> using the Epley equation.
                 </p>
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8">
              
              {/* PERCENTAGE TABLE */}
              <Card className="h-full shadow-md">
                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b pb-4">
                   <CardTitle className="text-lg flex items-center gap-2">
                     <Calculator className="w-5 h-5 text-blue-500" /> Load Percentages
                   </CardTitle>
                   <CardDescription>Reference these weights for your programming.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[350px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10 shadow-sm">
                        <TableRow>
                          <TableHead className="w-[80px] text-center font-bold text-slate-900 dark:text-white">% 1RM</TableHead>
                          <TableHead className="text-center font-bold text-slate-900 dark:text-white">Weight ({units})</TableHead>
                          <TableHead className="text-right">Est. Reps</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.percentages.map((row, i) => (
                          <TableRow key={i} className={i < 3 ? "bg-blue-50/50 dark:bg-blue-900/10 font-medium" : ""}>
                            <TableCell className="text-center font-bold text-blue-700 dark:text-blue-400">{row.percent}%</TableCell>
                            <TableCell className="text-center text-lg">{row.weight}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{row.reps}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* CHART */}
              <Card className="h-full shadow-md flex flex-col">
                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <LineChart className="w-5 h-5 text-purple-500" /> Strength Curve
                    </CardTitle>
                    <CardDescription>Estimated weight capacity vs repetitions.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-4 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="reps" label={{ value: 'Reps', position: 'insideBottomRight', offset: -5, fontSize: 12 }} tick={{fontSize: 12}} />
                            <YAxis tick={{fontSize: 12}} domain={['dataMin - 20', 'auto']} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                formatter={(value: number) => [`${value} ${units}`, "Weight"]}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#8884d8" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* ZONES */}
            <div className="grid gap-4 md:grid-cols-4">
              {result.trainingZones.map((zone, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-900 ${zone.color.replace('bg-', 'border-')}`}>
                   <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{zone.zone}</p>
                   <p className="text-xl font-extrabold mb-1">{zone.weightRange}</p>
                   <p className="text-xs opacity-60">{zone.focus}</p>
                </div>
              ))}
            </div>

            {/* FEATURE 2 — STRENGTH RANKING (Novice → Elite) */}
            {result.strengthRanking && (
              <Card className="shadow-md border-t-4 border-t-emerald-600">
                <CardHeader className="bg-emerald-50/60 dark:bg-emerald-950/20 border-b pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-700">
                    <Medal className="w-5 h-5" /> Your Strength Level
                  </CardTitle>
                  <CardDescription>
                    Where your 1RM ranks for your bodyweight, using standard strength-to-bodyweight ratios.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Headline rank */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span
                      className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-1.5 text-base font-bold ${STRENGTH_LEVEL_STYLES[result.strengthRanking.level]}`}
                    >
                      <Trophy className="w-4 h-4" /> {result.strengthRanking.level}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Your 1RM is{" "}
                      <strong className="text-emerald-700">{result.strengthRanking.ratio}×</strong>{" "}
                      your bodyweight.
                      {result.strengthRanking.nextLevel ? (
                        <>
                          {" "}Lift <strong className="text-emerald-700">{result.strengthRanking.toNextLevel} {units}</strong>{" "}
                          more to reach <strong>{result.strengthRanking.nextLevel}</strong>.
                        </>
                      ) : (
                        <> You are at the top tier — outstanding strength.</>
                      )}
                    </p>
                  </div>

                  {/* Tier thresholds */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {result.strengthRanking.thresholds.map((t) => {
                      const isCurrent = t.level === result.strengthRanking!.level;
                      return (
                        <div
                          key={t.level}
                          className={`rounded-xl border p-3 text-center transition-all ${
                            isCurrent
                              ? "border-emerald-400 bg-emerald-50 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-950/30"
                              : "border-slate-200 bg-white dark:bg-slate-900"
                          }`}
                        >
                          <p className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? "text-emerald-700" : "text-muted-foreground"}`}>
                            {t.level}
                          </p>
                          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                            {t.weight}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{units} 1RM</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Thresholds are typical bodyweight-relative benchmarks for a general compound lift and are estimates, not absolute standards. Strength varies by lift, training age, and individual factors.
                  </p>
                </CardContent>
              </Card>
            )}

          </div>
        )}
      </div>
    </>
  );
}