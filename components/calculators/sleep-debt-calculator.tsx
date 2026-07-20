"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RefreshCw, Loader2, Moon, Sun, Battery, BatteryWarning, Brain, Activity, Clock, AlertTriangle, CalendarClock, Zap } from "lucide-react";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  ageGroup: z.string({ required_error: "Please select your age group." }),
  idealSleep: z.string().min(1, "Ideal sleep is required."),
  weekdaySleep: z.string().min(1, "Weekday sleep is required."),
  weekendSleep: z.string().min(1, "Weekend sleep is required."),
  weeks: z.string().min(1, "Number of weeks is required."),
});

// --- RESULT TYPE INTERFACE ---
interface RecoveryNight {
  label: string;
  detail: string;
}

interface CalculationResult {
  totalDebt: number;
  severity: string;
  colorClass: string;
  description: string;
  recoveryPlan: string[];
  healthImpact: string;
  batteryPercentage: number;
  // FEATURE 1 — age-calibrated accumulated deficit
  ageLabel: string;
  recommendedRange: string;
  idealUsed: number;
  debtSeverityNote: string;
  // FEATURE 2 — recovery schedule + nap guidance
  recoveryNights: RecoveryNight[];
  recoveryDays: number;
  napGuidance: string;
}

// Age-based recommended sleep need (hours/night) used for the calibrated readout.
const AGE_SLEEP_NEEDS: Record<string, { label: string; range: string; ideal: number }> = {
  teen: { label: "Teenager (14–17 yrs)", range: "8–10 hours", ideal: 9 },
  adult: { label: "Adult (18–64 yrs)", range: "7–9 hours", ideal: 8 },
  senior: { label: "Older Adult (65+ yrs)", range: "7–8 hours", ideal: 7.5 },
};

// FEATURE 2 — build a realistic catch-up schedule, capping nightly top-ups and
// weekend recovery so users don't oversleep into a "sleep hangover".
const buildRecoverySchedule = (totalDebt: number): { nights: RecoveryNight[]; days: number; nap: string } => {
  if (totalDebt <= 0) {
    return {
      nights: [{ label: "You're balanced", detail: "No catch-up needed — keep a consistent wake time." }],
      days: 0,
      nap: "Skip naps after 3 PM so they don't push back tonight's bedtime.",
    };
  }

  // Add 1h/night on weekdays and up to 2h on weekend recovery nights.
  const nights: RecoveryNight[] = [];
  let remaining = totalDebt;
  let dayIndex = 0;
  const weekendSlots = new Set([5, 6]); // day 6 & 7 in the cycle act as weekend
  while (remaining > 0.05 && dayIndex < 28) {
    const isWeekend = weekendSlots.has(dayIndex % 7);
    const cap = isWeekend ? 2 : 1; // weekend recovery limit of +2h
    const addTonight = Math.min(cap, remaining);
    remaining = parseNumber((remaining - addTonight).toFixed(2));
    nights.push({
      label: `Night ${dayIndex + 1}${isWeekend ? " (weekend)" : ""}`,
      detail: `Add +${addTonight.toFixed(addTonight % 1 === 0 ? 0 : 1)}h sleep · ${remaining > 0.05 ? `${remaining.toFixed(1)}h debt left` : "debt cleared"}`,
    });
    dayIndex++;
  }

  const days = nights.length;
  const nap =
    totalDebt <= 4
      ? "A single 20-minute power nap before 3 PM clears grogginess without entering deep sleep."
      : "Use a 20-minute power nap on busy days for a quick reset, or a full 90-minute nap (one complete cycle) on a free afternoon to recover deep + REM sleep.";

  return { nights, days, nap };
};

// --- VISUAL COMPONENTS ---

const SleepBatteryGauge = ({ percentage, colorClass, severity }: { percentage: number, colorClass: string, severity: string }) => {
  return (
    <div className="text-center w-full max-w-sm mx-auto my-6">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-sm font-semibold text-muted-foreground">Sleep Bank Status</span>
        <span className={`text-sm font-bold ${colorClass}`}>{severity}</span>
      </div>
      <div className="relative w-full h-8 bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 overflow-hidden flex items-center">
        {/* The Battery Core */}
        <div 
          className={`h-full transition-all duration-1000 ease-in-out ${
            percentage > 75 ? "bg-green-500" : 
            percentage > 50 ? "bg-yellow-400" : 
            percentage > 25 ? "bg-orange-500" : "bg-red-600"
          }`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">100% means zero sleep debt. The lower the bar, the more exhausted you are.</p>
    </div>
  )
}

// --- CALCULATION LOGIC ---
const generateSleepInsights = (
  totalDebt: number,
  weeks: number,
  ageGroup: string,
  idealUsed: number
): CalculationResult => {
  const ageInfo = AGE_SLEEP_NEEDS[ageGroup] ?? AGE_SLEEP_NEEDS.adult;
  const schedule = buildRecoverySchedule(totalDebt);

  // Edge Case: Surplus
  if (totalDebt <= 0) {
    return {
      totalDebt,
      severity: "Optimal Balance",
      colorClass: "text-green-500",
      description: "Congratulations! You have zero sleep debt. You are giving your body the exact amount of rest it needs.",
      recoveryPlan: [
        "Maintain your current sleep schedule.",
        "Keep your weekend and weekday wake times as consistent as possible."
      ],
      healthImpact: "Your brain and body are fully optimized. Your immune system is strong, and cortisol levels are well-regulated.",
      batteryPercentage: 100,
      ageLabel: ageInfo.label,
      recommendedRange: ageInfo.range,
      idealUsed,
      debtSeverityNote: `Calibrated to the ${ageInfo.range} recommended for your age group, you currently carry no accumulated deficit.`,
      recoveryNights: schedule.nights,
      recoveryDays: schedule.days,
      napGuidance: schedule.nap,
    };
  }

  // Determine severity and battery percentage based on average debt per week
  const debtPerWeek = totalDebt / weeks;
  let severity, colorClass, description, healthImpact;
  let batteryPercentage = Math.max(0, 100 - (debtPerWeek * 5)); // Roughly 20 hours debt = 0% battery
  let recoveryPlan: string[] = [];

  if (debtPerWeek > 0 && debtPerWeek <= 4) {
    severity = "Mild Debt";
    colorClass = "text-yellow-500";
    description = `You have accumulated a mild sleep deficit of ${totalDebt.toFixed(1)} hours over ${weeks} week(s). You might be feeling just slightly sluggish.`;
    healthImpact = "Minimal physical impact, but you might experience slight dips in focus or mid-afternoon energy crashes.";
    recoveryPlan = [
      "Add 30-45 minutes of extra sleep this weekend.",
      "Consider a single 20-minute power nap in the afternoon.",
      "No major routine changes needed, just a bit of extra rest."
    ];
  } else if (debtPerWeek > 4 && debtPerWeek <= 10) {
    severity = "Moderate Debt";
    colorClass = "text-orange-500";
    description = `You have a moderate sleep debt of ${totalDebt.toFixed(1)} hours. Your body is feeling the strain of missed rest.`;
    healthImpact = "Your metabolism may begin to slow, and cortisol (stress hormone) levels are rising. You might be experiencing more food cravings.";
    recoveryPlan = [
      "Go to bed 20 minutes earlier every weekday night this week.",
      "Sleep in for exactly 1 extra hour on Saturday and Sunday.",
      "Avoid caffeine after 2 PM so your evening sleep is deeper."
    ];
  } else {
    severity = "Severe Debt";
    colorClass = "text-red-600";
    description = `Warning: You have accumulated ${totalDebt.toFixed(1)} hours of sleep debt. You are operating under chronic sleep deprivation.`;
    healthImpact = "High risk zone. Chronic sleep debt impairs cognitive function, severely increases stress hormones (promoting fat storage), and suppresses your immune system.";
    recoveryPlan = [
      "Do NOT try to sleep 14 hours this weekend. It will cause 'sleep hangover'.",
      "Go to bed 30-45 minutes earlier every single night for the next 2 weeks.",
      "Establish a strict winding-down routine: no screens 1 hour before bed.",
      "Consider scheduling a 20-30 minute nap during your lunch break to chip away at the deficit safely."
    ];
  }

  // FEATURE 1 — severity note tied to the age-based recommended need.
  const debtSeverityNote = `Measured against your age-based need of ${idealUsed}h/night (${ageInfo.range} for ${ageInfo.label}), you've accumulated ${totalDebt.toFixed(1)} hours of deficit over ${weeks} week(s) — a ${severity.toLowerCase()} level that ${
    severity === "Mild Debt"
      ? "is easily recoverable within a few days."
      : severity === "Moderate Debt"
      ? "needs a structured catch-up over about a week."
      : "calls for a gradual multi-week recovery, not a single weekend lie-in."
  }`;

  return {
    totalDebt,
    severity,
    colorClass,
    description,
    recoveryPlan,
    healthImpact,
    batteryPercentage,
    ageLabel: ageInfo.label,
    recommendedRange: ageInfo.range,
    idealUsed,
    debtSeverityNote,
    recoveryNights: schedule.nights,
    recoveryDays: schedule.days,
    napGuidance: schedule.nap,
  };
};


// --- MAIN CALCULATOR COMPONENT ---

export default function SleepDebtCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      ageGroup: "adult", 
      idealSleep: "8", 
      weekdaySleep: "", 
      weekendSleep: "", 
      weeks: "1" 
    },
  });

  const { setValue, watch } = form;

  // Auto-fill ideal sleep based on age selection
  const handleAgeChange = (value: string) => {
    setValue("ageGroup", value);
    let recommended = "8";
    if (value === "teen") recommended = "9";
    if (value === "adult") recommended = "8";
    if (value === "senior") recommended = "7.5";
    setValue("idealSleep", recommended);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
      const ideal = parseNumber(values.idealSleep);
      const wkday = parseNumber(values.weekdaySleep);
      const wkend = parseNumber(values.weekendSleep);
      const wks = parseNumber(values.weeks);

      // Total sleep you SHOULD have gotten
      const totalIdeal = ideal * 7 * wks;
      // Total sleep you ACTUALLY got ((weekday * 5 nights) + (weekend * 2 nights)) * weeks
      const totalActual = ((wkday * 5) + (wkend * 2)) * wks;
      
      const debt = totalIdeal - totalActual;
      
      const insights = generateSleepInsights(debt, wks, values.ageGroup, ideal);
      
      setResult(insights);
      setIsLoading(false);
      
      setTimeout(() => { 
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
      }, 100);
    }, 600);
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto border-t-4 border-t-primary shadow-lg" id="calculator">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" /> 
            Advanced Sleep Debt Calculator
          </CardTitle>
          <CardDescription>
            Most calculators only ask for an average. For higher accuracy, enter your specific weekday and weekend sleep patterns below.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="ageGroup" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Group</FormLabel>
                      <Select onValueChange={handleAgeChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your age group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="teen">Teenager (14-17 yrs)</SelectItem>
                          <SelectItem value="adult">Adult (18-64 yrs)</SelectItem>
                          <SelectItem value="senior">Older Adult (65+ yrs)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Sets a scientifically recommended baseline.</FormDescription>
                    </FormItem>
                  )} 
                />
                
                <FormField 
                  control={form.control} 
                  name="idealSleep" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Ideal Sleep (Hours)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g. 8" {...field} />
                      </FormControl>
                      <FormDescription>You can manually adjust this if you know your specific needs.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100 dark:border-gray-800">
                <FormField 
                  control={form.control} 
                  name="weekdaySleep" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-500" /> Average Weekday Sleep</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g. 6.5" {...field} />
                      </FormControl>
                      <FormDescription>Sun night - Thu night.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} 
                />

                <FormField 
                  control={form.control} 
                  name="weekendSleep" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Moon className="w-4 h-4 text-blue-500" /> Average Weekend Sleep</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g. 8.5" {...field} />
                      </FormControl>
                      <FormDescription>Fri night - Sat night.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <FormField 
                  control={form.control} 
                  name="weeks" 
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FormLabel>Calculate for the past...</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Week</SelectItem>
                          <SelectItem value="2">2 Weeks</SelectItem>
                          <SelectItem value="4">1 Month (4 Weeks)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate Sleep Debt'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  onClick={() => { form.reset(); setResult(null); }} 
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

      {/* RESULTS DISPLAY */}
      <div ref={resultsRef} className="scroll-mt-16 mt-8">
        {result && (
          <Card className="max-w-4xl mx-auto overflow-hidden shadow-xl border-primary/20">
            <div className={`h-2 w-full ${
                result.batteryPercentage > 75 ? "bg-green-500" : 
                result.batteryPercentage > 50 ? "bg-yellow-400" : 
                result.batteryPercentage > 25 ? "bg-orange-500" : "bg-red-600"
              }`} 
            />
            <CardContent className="p-6 md:p-8 space-y-8">
              
              {/* Header result */}
              <div className="text-center space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Your Total Sleep Debt</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className={`text-6xl md:text-7xl font-bold ${result.colorClass}`}>
                      {result.totalDebt <= 0 ? "0" : result.totalDebt.toFixed(1)}
                    </p>
                    <span className="text-2xl font-medium text-muted-foreground">Hours</span>
                  </div>
                  <p className="max-w-xl mx-auto text-lg mt-4 font-medium text-gray-800 dark:text-gray-200">
                    {result.description}
                  </p>
              </div>

              {/* Visual Gauge */}
              <div className="bg-muted/20 py-6 rounded-2xl border border-muted">
                <SleepBatteryGauge 
                  percentage={result.batteryPercentage} 
                  colorClass={result.colorClass} 
                  severity={result.severity} 
                />
              </div>

              {/* Actionable Recovery Plan */}
              <div className="grid md:grid-cols-2 gap-8 border-t pt-8">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" /> 
                    Your Recovery Plan
                  </h3>
                  <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
                    <ul className="space-y-3">
                        {result.recoveryPlan.map((step, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold mt-0.5">
                              {index + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Health Impact */}
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-red-500" /> 
                    Body & Brain Impact
                  </h3>
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-5 border border-red-100 dark:border-red-900/30">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {result.healthImpact}
                    </p>
                    {result.totalDebt > 5 && (
                      <p className="text-xs mt-4 text-muted-foreground font-medium">
                        *Pro Tip: Extra sleep debt raises cortisol levels, which can lead to weight gain around your midsection. 
                        Use our Body Shape Calculator to see how it affects your physique.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* FEATURE 1 — AGE-CALIBRATED ACCUMULATED DEFICIT */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-emerald-700" />
                  Age-Calibrated Sleep Deficit
                </h3>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 md:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Age Group</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{result.ageLabel}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Recommended</p>
                      <p className="text-sm font-bold text-emerald-700 mt-1">{result.recommendedRange}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Need Used</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1">{result.idealUsed}h/night</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Total Debt</p>
                      <p className={`text-sm font-bold mt-1 ${result.colorClass}`}>
                        {result.totalDebt <= 0 ? "0" : result.totalDebt.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.debtSeverityNote}
                  </p>
                </div>
              </div>

              {/* FEATURE 2 — CATCH-UP / RECOVERY SCHEDULE + NAP GUIDANCE */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                  <CalendarClock className="w-5 h-5 text-emerald-700" />
                  Your Catch-Up Recovery Schedule
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {result.recoveryDays > 0
                    ? `A realistic, paced plan to clear your debt over ${result.recoveryDays} night${result.recoveryDays === 1 ? "" : "s"} — capped at +1h on weeknights and +2h on weekends to avoid a "sleep hangover".`
                    : "You have no debt to clear — keep your schedule consistent."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.recoveryNights.map((night, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 p-4 shadow-sm"
                    >
                      <p className="text-sm font-bold text-emerald-700">{night.label}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{night.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
                  <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Smart Nap Guidance</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">{result.napGuidance}</p>
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