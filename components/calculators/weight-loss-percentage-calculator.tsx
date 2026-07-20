"use client";

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
  RefreshCw,
  Loader2,
  Scale,
  Target,
  Calendar,
  TrendingDown,
  Copy,
  Share2,
  Ruler,
  Trophy,
  CheckCircle2,
  ArrowRight,
  Info,
  Percent,
  CalendarClock,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z
  .object({
    units: z.enum(["metric", "imperial"]),
    startingWeight: z.string().min(1, "Starting weight is required."),
    currentWeight: z.string().min(1, "Current weight is required."),
    targetWeight: z.string().optional(),
    height: z.string().optional(),
    startDate: z.string().optional(),
    currentDate: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const start = parseNumber(data.startingWeight);
    const current = parseNumber(data.currentWeight);
    const target = data.targetWeight ? parseNumber(data.targetWeight) : null;
    const height = data.height ? parseNumber(data.height) : null;

    if (isNaN(start) || start <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid starting weight greater than 0.",
        path: ["startingWeight"],
      });
    }
    if (isNaN(current) || current <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid current weight greater than 0.",
        path: ["currentWeight"],
      });
    }
    if (!isNaN(start) && !isNaN(current) && current > start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current weight should be less than starting weight.",
        path: ["currentWeight"],
      });
    }
    if (target !== null && (isNaN(target) || target <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid target weight.",
        path: ["targetWeight"],
      });
    }
    if (target !== null && !isNaN(start) && target >= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target weight should be less than starting weight.",
        path: ["targetWeight"],
      });
    }
    if (height !== null && (isNaN(height) || height <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid height.",
        path: ["height"],
      });
    }
    if (data.startDate && data.currentDate) {
      const sd = new Date(data.startDate);
      const cd = new Date(data.currentDate);
      if (cd < sd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current date must be after start date.",
          path: ["currentDate"],
        });
      }
    }
  });

type UnitSystem = "metric" | "imperial";

interface CalculationResult {
  weightLost: number;
  percentageLost: number;
  remainingToTarget: number | null;
  progressPercent: number | null;
  weeksElapsed: number | null;
  avgPerWeek: number | null;
  bmiCurrent: number | null;
  bmiCategory: string | null;
  goalReached: boolean;
  // FEATURE 2 — projected goal date (weeks needed + estimated date)
  weeksToGoal: number | null;
  projectedGoalDate: Date | null;
}

// --- CALCULATION LOGIC (separate, pure functions) ---
const calculateResults = (
  startingWeight: number,
  currentWeight: number,
  targetWeight: number | null,
  heightCm: number | null,
  startDate: string | null,
  currentDate: string | null
): CalculationResult => {
  // Core formula: Weight Loss % = ((Start - Current) / Start) * 100
  const weightLost = startingWeight - currentWeight;
  const percentageLost = (weightLost / startingWeight) * 100;

  // Goal tracking
  let remainingToTarget: number | null = null;
  let progressPercent: number | null = null;
  let goalReached = false;

  if (targetWeight !== null) {
    remainingToTarget = currentWeight - targetWeight;
    const totalToLose = startingWeight - targetWeight;
    progressPercent = totalToLose > 0 ? Math.min(100, (weightLost / totalToLose) * 100) : 0;
    goalReached = currentWeight <= targetWeight;
  }

  // Time-based projection
  let weeksElapsed: number | null = null;
  let avgPerWeek: number | null = null;
  if (startDate && currentDate) {
    const sd = new Date(startDate);
    const cd = new Date(currentDate);
    const diffMs = cd.getTime() - sd.getTime();
    const days = diffMs / (1000 * 60 * 60 * 24);
    if (days > 0) {
      weeksElapsed = days / 7;
      avgPerWeek = weightLost / weeksElapsed;
    }
  }

  // BMI context (height in cm, weight in kg)
  let bmiCurrent: number | null = null;
  let bmiCategory: string | null = null;
  if (heightCm !== null && heightCm > 0) {
    const heightM = heightCm / 100;
    bmiCurrent = currentWeight / (heightM * heightM);
    if (bmiCurrent < 18.5) bmiCategory = "Underweight";
    else if (bmiCurrent < 25) bmiCategory = "Normal";
    else if (bmiCurrent < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";
  }

  // FEATURE 2 — projected goal date.
  // If we know the average weekly loss rate AND there is still weight to lose to
  // reach the target, estimate how many weeks remain at the current pace and
  // project a calendar date measured from the current (most recent) date.
  let weeksToGoal: number | null = null;
  let projectedGoalDate: Date | null = null;
  if (
    avgPerWeek !== null &&
    avgPerWeek > 0 &&
    remainingToTarget !== null &&
    remainingToTarget > 0 &&
    !goalReached
  ) {
    weeksToGoal = remainingToTarget / avgPerWeek;
    const base = currentDate ? new Date(currentDate) : new Date();
    if (!isNaN(base.getTime())) {
      const projected = new Date(base.getTime());
      projected.setDate(projected.getDate() + Math.ceil(weeksToGoal * 7));
      projectedGoalDate = projected;
    }
  }

  return {
    weightLost,
    percentageLost,
    remainingToTarget,
    progressPercent,
    weeksElapsed,
    avgPerWeek,
    bmiCurrent,
    bmiCategory,
    goalReached,
    weeksToGoal,
    projectedGoalDate,
  };
};

export default function WeightLossPercentageCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      units: "metric",
      startingWeight: "",
      currentWeight: "",
      targetWeight: "",
      height: "",
      startDate: "",
      currentDate: "",
    },
  });

  const { watch, getValues, setValue } = form;
  const units = watch("units");
  const startingWeight = watch("startingWeight");
  const currentWeight = watch("currentWeight");
  const targetWeight = watch("targetWeight");
  const height = watch("height");
  const startDate = watch("startDate");
  const currentDate = watch("currentDate");

  // Live calculation while typing
  useEffect(() => {
    const start = parseNumber(startingWeight);
    const current = parseNumber(currentWeight);
    const target = targetWeight ? parseNumber(targetWeight) : null;
    const heightVal = height ? parseNumber(height) : null;

    if (
      !isNaN(start) &&
      !isNaN(current) &&
      start > 0 &&
      current > 0 &&
      current <= start
    ) {
      // Convert height to cm for BMI if imperial (inches -> cm)
      const heightCm =
        heightVal !== null && !isNaN(heightVal)
          ? units === "metric"
            ? heightVal
            : heightVal * 2.54
          : null;

      // Convert weights to kg internally for BMI accuracy
      const startKg = units === "metric" ? start : start * 0.453592;
      const currentKg = units === "metric" ? current : current * 0.453592;
      const targetKg =
        target !== null
          ? units === "metric"
            ? target
            : target * 0.453592
          : null;

      const calc = calculateResults(
        start,
        current,
        target,
        heightCm,
        startDate || null,
        currentDate || null
      );

      // Recompute BMI using kg values regardless of unit
      if (heightCm !== null) {
        const heightM = heightCm / 100;
        calc.bmiCurrent = currentKg / (heightM * heightM);
        if (calc.bmiCurrent < 18.5) calc.bmiCategory = "Underweight";
        else if (calc.bmiCurrent < 25) calc.bmiCategory = "Normal";
        else if (calc.bmiCurrent < 30) calc.bmiCategory = "Overweight";
        else calc.bmiCategory = "Obese";
      }

      setResult(calc);
    } else {
      setResult(null);
    }
  }, [startingWeight, currentWeight, targetWeight, height, startDate, currentDate, units]);

  // Animate progress bar
  useEffect(() => {
    if (result?.progressPercent !== null && result?.progressPercent !== undefined) {
      const target = result.progressPercent;
      let current = 0;
      const step = target / 30;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedProgress(current);
      }, 15);
      return () => clearInterval(timer);
    } else {
      setAnimatedProgress(0);
    }
  }, [result?.progressPercent]);

  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;

    // Convert weight values without losing data
    const fields: Array<"startingWeight" | "currentWeight" | "targetWeight"> = [
      "startingWeight",
      "currentWeight",
      "targetWeight",
    ];

    fields.forEach((f) => {
      const val = getValues(f);
      if (val && !isNaN(parseNumber(val))) {
        const num = parseNumber(val);
        const converted = newUnit === "imperial" ? num / 0.453592 : num * 0.453592;
        setValue(f, converted.toFixed(1));
      }
    });

    // Convert height (cm <-> inches)
    const heightVal = getValues("height");
    if (heightVal && !isNaN(parseNumber(heightVal))) {
      const num = parseNumber(heightVal);
      const converted = newUnit === "imperial" ? num / 2.54 : num * 2.54;
      setValue("height", converted.toFixed(1));
    }

    setValue("units", newUnit);
  };

  function onSubmit() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 500);
  }

  const handleReset = () => {
    form.reset();
    setResult(null);
    setAnimatedProgress(0);
  };

  const handleCopy = async () => {
    if (!result) return;
    const unit = units === "metric" ? "kg" : "lbs";
    const text =
      `Weight Loss Progress\n` +
      `• Weight Lost: ${result.weightLost.toFixed(1)} ${unit}\n` +
      `• Percentage Lost: ${result.percentageLost.toFixed(2)}%\n` +
      (result.remainingToTarget !== null
        ? `• Remaining to Goal: ${result.remainingToTarget.toFixed(1)} ${unit}\n`
        : "") +
      (result.avgPerWeek !== null
        ? `• Avg Loss/Week: ${result.avgPerWeek.toFixed(2)} ${unit}\n`
        : "");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail on browsers without clipboard API
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const unit = units === "metric" ? "kg" : "lbs";
    const text = `I lost ${result.percentageLost.toFixed(2)}% of my starting weight (${result.weightLost.toFixed(1)} ${unit})!`;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "My Weight Loss Progress",
          text,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const unit = units === "metric" ? "kg" : "lbs";
  const heightUnit = units === "metric" ? "cm" : "in";

  return (
    <>
      <div className="grid lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
        {/* LEFT: Calculator Form */}
        <Card className="lg:col-span-3 shadow-lg border-primary/10" id="calculator">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 rounded-t-xl border-b border-border/50 pb-8">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingDown className="w-6 h-6 text-green-600" /> Weight Loss Percentage Calculator
            </CardTitle>
            <CardDescription className="text-base">
              Track your progress with accurate percentage-based weight loss insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Units */}
                <div className="p-4 bg-muted/40 rounded-xl space-y-4 border border-border/50">
                  <FormField
                    control={form.control}
                    name="units"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Measurement System</FormLabel>
                        <RadioGroup
                          onValueChange={(value) => handleUnitChange(value as UnitSystem)}
                          value={field.value}
                          className="flex flex-col sm:flex-row gap-4 pt-2"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-background px-4 py-3 rounded-lg border w-full">
                            <FormControl>
                              <RadioGroupItem value="metric" />
                            </FormControl>
                            <FormLabel className="font-medium cursor-pointer flex-1">
                              Metric (kg, cm)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-background px-4 py-3 rounded-lg border w-full">
                            <FormControl>
                              <RadioGroupItem value="imperial" />
                            </FormControl>
                            <FormLabel className="font-medium cursor-pointer flex-1">
                              Imperial (lbs, in)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Required Weights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="startingWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting Weight *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.1"
                              inputMode="decimal"
                              placeholder={units === "metric" ? "85.0" : "187.0"}
                              className="pl-10"
                              aria-label="Starting weight"
                              {...field}
                            />
                            <Scale className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                              {unit}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Weight *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.1"
                              inputMode="decimal"
                              placeholder={units === "metric" ? "78.0" : "172.0"}
                              className="pl-10"
                              aria-label="Current weight"
                              {...field}
                            />
                            <TrendingDown className="absolute left-3 top-2.5 h-4 w-4 text-green-600" />
                            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                              {unit}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Optional Section */}
                <div className="pt-2">
                  <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Optional — for richer insights
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="targetWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Weight</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                inputMode="decimal"
                                placeholder={units === "metric" ? "70.0" : "154.0"}
                                className="pl-10"
                                aria-label="Target weight"
                                {...field}
                              />
                              <Target className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
                              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                {unit}
                              </span>
                            </div>
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
                          <FormLabel>Height (for BMI)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                inputMode="decimal"
                                placeholder={units === "metric" ? "170" : "67"}
                                className="pl-10"
                                aria-label="Height"
                                {...field}
                              />
                              <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                                {heightUnit}
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="date"
                                className="pl-10"
                                aria-label="Start date"
                                {...field}
                              />
                              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Date</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="date"
                                className="pl-10"
                                aria-label="Current date"
                                {...field}
                              />
                              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                  <Button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <TrendingDown className="h-5 w-5 mr-2" />
                    )}
                    {isLoading ? "Calculating..." : "Calculate Progress"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* RIGHT: Result Card */}
        <div ref={resultsRef} className="lg:col-span-2">
          {result ? (
            <div className="space-y-6 sticky top-4">
            <Card className="overflow-hidden border-green-500/20 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div
                className={`p-8 text-center text-white bg-gradient-to-br ${
                  result.goalReached
                    ? "from-emerald-500 to-teal-600"
                    : "from-green-500 to-emerald-600"
                }`}
              >
                {result.goalReached ? (
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-90" />
                ) : (
                  <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-90" />
                )}
                <p className="text-lg font-medium opacity-90 mb-1">Weight Loss Percentage</p>
                <p className="text-6xl font-bold tracking-tight">
                  {result.percentageLost.toFixed(2)}
                  <span className="text-3xl font-normal opacity-80">%</span>
                </p>
                <p className="mt-3 text-green-100 text-sm">
                  You lost <span className="font-semibold">{result.weightLost.toFixed(1)} {unit}</span> of your starting weight
                </p>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Goal Reached Banner */}
                {result.goalReached && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    Congratulations! You&apos;ve reached your target weight.
                  </div>
                )}

                {/* Progress Bar */}
                {result.progressPercent !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Progress to Goal
                      </span>
                      <span className="font-bold text-green-600">
                        {animatedProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div
                      className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={Math.round(animatedProgress)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${animatedProgress}%` }}
                      />
                    </div>
                    {result.remainingToTarget !== null && result.remainingToTarget > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {result.remainingToTarget.toFixed(1)} {unit} away from your goal
                      </p>
                    )}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Weight Lost</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                      {result.weightLost.toFixed(1)} <span className="text-sm font-normal">{unit}</span>
                    </p>
                  </div>

                  {result.remainingToTarget !== null && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">To Goal</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {Math.max(0, result.remainingToTarget).toFixed(1)}{" "}
                        <span className="text-sm font-normal">{unit}</span>
                      </p>
                    </div>
                  )}

                  {result.avgPerWeek !== null && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Avg / Week</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {result.avgPerWeek.toFixed(2)} <span className="text-sm font-normal">{unit}</span>
                      </p>
                    </div>
                  )}

                  {result.bmiCurrent !== null && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Current BMI</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {result.bmiCurrent.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">{result.bmiCategory}</p>
                    </div>
                  )}
                </div>

                {/* Copy / Share */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" /> Copy
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground italic border-t pt-3">
                  This calculator is for informational purposes only and should not replace medical advice.
                </p>
              </CardContent>

              {/* Internal Link CTA */}
              <div className="p-5 bg-blue-50 dark:bg-blue-950/30 border-t border-blue-100 dark:border-blue-900">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-1">
                  Want to track calories burned?
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Pair your weight loss with workout tracking.
                </p>
                <Link href="/health/calories-burned-calculator">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    Calories Burned Calculator <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* FEATURE 1 — EXACT % LOST & AMOUNT REMAINING TO GOAL */}
            <Card className="border shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Percent className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Exact Progress &amp; Remaining to Goal
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You&apos;ve lost{" "}
                  <span className="font-bold text-emerald-700">
                    {result.percentageLost.toFixed(2)}%
                  </span>{" "}
                  of your starting body weight — that&apos;s{" "}
                  <span className="font-semibold">
                    {result.weightLost.toFixed(1)} {unit}
                  </span>
                  {result.remainingToTarget !== null ? (
                    result.goalReached ? (
                      <> and you have already reached your goal weight. 🎉</>
                    ) : (
                      <>
                        , with{" "}
                        <span className="font-bold text-emerald-700">
                          {Math.max(0, result.remainingToTarget).toFixed(1)} {unit}
                        </span>{" "}
                        still to lose to hit your target.
                      </>
                    )
                  ) : (
                    <>. Add a target weight above to see exactly how much is left to your goal.</>
                  )}
                </p>

                {result.remainingToTarget !== null && (
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                        % Lost
                      </p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                        {result.percentageLost.toFixed(2)}%
                      </p>
                    </div>
                    <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                        Lost
                      </p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                        {result.weightLost.toFixed(1)} {unit}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                        <Flag className="w-3.5 h-3.5" /> To Goal
                      </div>
                      <p className="text-lg font-black text-emerald-700 mt-1">
                        {Math.max(0, result.remainingToTarget).toFixed(1)} {unit}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  Calculated as ((Start − Current) ÷ Start) × 100, with the remaining
                  amount measured against your target weight.
                </p>
              </CardContent>
            </Card>

            {/* FEATURE 2 — WEEKLY RATE & PROJECTED GOAL DATE */}
            <Card className="border shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarClock className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Weekly Average &amp; Projected Goal Date
                  </h3>
                </div>

                {result.avgPerWeek !== null && result.avgPerWeek > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You&apos;re losing about{" "}
                      <span className="font-bold text-emerald-700">
                        {result.avgPerWeek.toFixed(2)} {unit}/week
                      </span>
                      {result.goalReached ? (
                        <> — and you&apos;ve already reached your goal. Keep it up!</>
                      ) : result.projectedGoalDate && result.weeksToGoal !== null ? (
                        <>
                          . At this pace you&apos;d reach your target in about{" "}
                          <span className="font-bold text-emerald-700">
                            {Math.ceil(result.weeksToGoal)} week
                            {Math.ceil(result.weeksToGoal) === 1 ? "" : "s"}
                          </span>{" "}
                          — around{" "}
                          <span className="font-bold text-emerald-700">
                            {result.projectedGoalDate.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          .
                        </>
                      ) : (
                        <>. Add a target weight above to see a projected goal date.</>
                      )}
                    </p>

                    {result.projectedGoalDate && !result.goalReached && (
                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="rounded-xl border bg-slate-50 dark:bg-slate-900 p-4 text-center">
                          <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                            Avg / Week
                          </p>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">
                            {result.avgPerWeek.toFixed(2)} {unit}
                          </p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
                          <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                            Projected Goal
                          </p>
                          <p className="text-base font-black text-emerald-700 mt-1">
                            {result.projectedGoalDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Add your <span className="font-semibold">start date</span> and{" "}
                    <span className="font-semibold">current date</span> above and we&apos;ll
                    calculate your weekly average loss rate and project when you&apos;ll
                    reach your target weight.
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  Estimate assumes your current weekly average loss rate stays constant
                  until you reach your goal. Real progress varies — use it as motivation,
                  not a guarantee.
                </p>
              </CardContent>
            </Card>
            </div>
          ) : (
            <Card className="border-dashed border-2 sticky top-4">
              <CardContent className="p-10 text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="font-semibold text-lg mb-2">Your Results Will Appear Here</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your starting and current weight to see your weight loss percentage instantly.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
