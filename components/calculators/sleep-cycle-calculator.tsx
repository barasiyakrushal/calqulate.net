"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, RefreshCw, Loader2, Moon, Sun, Clock, Sparkles, Activity, BedDouble } from "lucide-react";

// --- FORM SCHEMA ---
const formSchema = z.object({
  calculationMode: z.enum(["wake", "sleep", "now"]),
  time: z.string().optional(),
  fallAsleepTime: z.string().min(1, "Required").default("15"),
  // Optional, non-breaking: lets us tailor the cycle-length accuracy note.
  ageBand: z.enum(["teen", "adult", "older"]).optional(),
}).superRefine((data, ctx) => {
  if (data.calculationMode !== "now" && !data.time) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a time.",
      path: ["time"],
    });
  }
});

type CycleResult = {
  cycles: number;
  timeStr: string;
  durationStr: string;
  isOptimal: boolean;
  colorClass: string;
  badge: string;
  // FEATURE 1: marks options that deliver a full, restful night (5–6 cycles).
  fullNight: boolean;
};

// FEATURE 2: age-based cycle-length guidance for accuracy.
type AgeBand = "teen" | "adult" | "older";
const getCycleNote = (band: AgeBand): { label: string; note: string } => {
  switch (band) {
    case "teen":
      return {
        label: "Teens (13–18)",
        note: "Teen sleep cycles often run a touch longer (around 90–100 min) and teens need 8–10 hours, so leaning toward 5–6 cycles is ideal.",
      };
    case "older":
      return {
        label: "Older adults (61+)",
        note: "After 60, cycles can shorten (closer to 80–90 min) with lighter, more fragmented sleep. If you wake groggy, try shifting your alarm 10–15 min earlier.",
      };
    default:
      return {
        label: "Adults (18–60)",
        note: "Adult cycles average ~90 minutes. Individual cycles can range 80–110 min, so treat these times as a tight guide and fine-tune by ±15 min.",
      };
  }
};

// --- VISUAL UI: SLEEP STAGE TIMELINE ---
const SleepStageTimeline = () => (
  <div className="mt-8 mb-4">
    <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
      <span>Awake</span>
      <span>Light Sleep</span>
      <span>Deep Sleep</span>
      <span>REM (Dreaming)</span>
      <span>Wake Up Refreshed</span>
    </div>
    <div className="h-4 w-full rounded-full flex overflow-hidden border border-gray-200 shadow-inner">
      <div className="bg-gray-200 w-[5%] hover:opacity-80 transition-opacity" title="Falling Asleep (5%)"></div>
      <div className="bg-blue-300 w-[45%] hover:opacity-80 transition-opacity" title="Light Sleep (45%)"></div>
      <div className="bg-blue-700 w-[25%] hover:opacity-80 transition-opacity" title="Deep Sleep (25%)"></div>
      <div className="bg-purple-500 w-[25%] hover:opacity-80 transition-opacity" title="REM Sleep (25%)"></div>
    </div>
    <p className="text-center text-xs text-muted-foreground mt-3">
      A typical 90-minute cycle progresses through these stages. Waking up during or right after REM prevents grogginess.
    </p>
  </div>
);

export default function SleepCycleCalculator() {
  const [results, setResults] = useState<CycleResult[] | null>(null);
  const [resultMeta, setResultMeta] = useState<{ fallAsleepMins: number; ageBand: AgeBand } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMode: "wake",
      time: "07:00",
      fallAsleepTime: "15",
      ageBand: "adult",
    },
  });

  const mode = form.watch("calculationMode");

  // Helper: Format Date to 12h time string (e.g., "10:30 PM")
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
      const fallAsleepMins = parseInt(values.fallAsleepTime) || 15;
      const cycleLength = 90; // 90 minutes per cycle
      let baseDate = new Date();

      if (values.calculationMode === "now") {
        // Base is right now
        baseDate = new Date();
      } else {
        // Parse the input time (HH:mm format from HTML time input)
        const [hours, minutes] = values.time!.split(':').map(Number);
        baseDate.setHours(hours, minutes, 0, 0);
      }

      const calculatedCycles: CycleResult[] = [];
      const cyclesToCalculate = [6, 5, 4, 3]; // 9h, 7.5h, 6h, 4.5h

      cyclesToCalculate.forEach(cycles => {
        const totalSleepMins = cycles * cycleLength;
        let targetDate = new Date(baseDate.getTime());

        if (values.calculationMode === "wake") {
          // If I want to WAKE at 7:00 AM, I need to sleep (cycles + fall asleep time) BEFORE
          targetDate.setMinutes(targetDate.getMinutes() - totalSleepMins - fallAsleepMins);
        } else {
          // If I go to sleep AT 10:00 PM (or NOW), I will wake up (cycles + fall asleep time) AFTER
          targetDate.setMinutes(targetDate.getMinutes() + fallAsleepMins + totalSleepMins);
        }

        let isOptimal = false;
        let colorClass = "border-gray-200 bg-white text-gray-800";
        let badge = "";

        if (cycles === 5) {
          isOptimal = true;
          colorClass = "border-primary bg-primary/5 text-primary ring-2 ring-primary ring-offset-2";
          badge = "Highly Recommended (7.5 Hours)";
        } else if (cycles === 6) {
          colorClass = "border-green-500 bg-green-50 text-green-900";
          badge = "Good for athletes/teens (9 Hours)";
        } else if (cycles === 4) {
          colorClass = "border-yellow-400 bg-yellow-50 text-yellow-900";
          badge = "Minimum for Adults (6 Hours)";
        } else if (cycles === 3) {
          colorClass = "border-red-300 bg-red-50 text-red-900 opacity-80";
          badge = "Not Recommended (4.5 Hours)";
        }

        const hoursText = (totalSleepMins / 60).toFixed(1).replace('.0', '');

        calculatedCycles.push({
          cycles,
          timeStr: formatTime(targetDate),
          durationStr: `${hoursText} hours`,
          isOptimal,
          colorClass,
          badge,
          // FEATURE 1: 5–6 cycles (7.5–9h) count as a full night for adults.
          fullNight: cycles >= 5,
        });
      });

      // Sort chronological order depending on mode
      if (values.calculationMode === "wake") {
        // Earliest bedtime first
        calculatedCycles.sort((a, b) => b.cycles - a.cycles);
      } else {
        // Earliest wake time first
        calculatedCycles.sort((a, b) => a.cycles - b.cycles);
      }

      setResults(calculatedCycles);
      setResultMeta({ fallAsleepMins, ageBand: (values.ageBand as AgeBand) || "adult" });
      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    }, 500);
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto border-t-4 border-t-primary shadow-lg" id="calculator">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-8 rounded-t-xl border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Moon className="w-6 h-6 text-primary" /> Sleep Cycle Calculator
          </CardTitle>
          <CardDescription className="text-base">
            Find the exact time to go to bed or wake up to avoid grogginess and sleep inertia.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Mode Selection */}
              <FormField
                control={form.control}
                name="calculationMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">What do you want to calculate?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        <FormItem className="relative">
                          <FormControl>
                            <RadioGroupItem value="wake" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer h-full text-center">
                            <Sun className="mb-2 h-6 w-6" />
                            <span className="font-semibold">I want to wake up at</span>
                            <span className="text-xs text-muted-foreground mt-1 font-normal">Find what time to sleep</span>
                          </FormLabel>
                        </FormItem>
                        
                        <FormItem className="relative">
                          <FormControl>
                            <RadioGroupItem value="sleep" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer h-full text-center">
                            <BedDouble className="mb-2 h-6 w-6" />
                            <span className="font-semibold">I will go to bed at</span>
                            <span className="text-xs text-muted-foreground mt-1 font-normal">Find what time to wake</span>
                          </FormLabel>
                        </FormItem>

                        <FormItem className="relative">
                          <FormControl>
                            <RadioGroupItem value="now" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer h-full text-center">
                            <Clock className="mb-2 h-6 w-6" />
                            <span className="font-semibold">I am sleeping right now</span>
                            <span className="text-xs text-muted-foreground mt-1 font-normal">Set alarm for later</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-8 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                {/* Time Input (Hidden if 'now' is selected) */}
                <div className={`transition-opacity duration-300 ${mode === 'now' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">
                          {mode === 'wake' ? 'Target Wake Time' : 'Target Bedtime'}
                        </FormLabel>
                        <FormControl>
                          <Input type="time" className="text-lg py-6" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Custom Fall Asleep Time */}
                <FormField
                  control={form.control}
                  name="fallAsleepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        Time to fall asleep <Sparkles className="h-4 w-4 text-yellow-500" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" min="0" max="120" placeholder="15" className="text-lg py-6 pr-16" {...field} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">mins</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Standard calculators use 15 mins. Customize this for your unique biology.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Optional age band — tailors the cycle-length accuracy note (FEATURE 2) */}
                <FormField
                  control={form.control}
                  name="ageBand"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        Age group <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value || "adult"}
                          className="grid grid-cols-3 gap-3"
                        >
                          {([
                            { value: "teen", label: "Teen 13–18" },
                            { value: "adult", label: "Adult 18–60" },
                            { value: "older", label: "Older 61+" },
                          ] as const).map((opt) => (
                            <FormItem key={opt.value} className="relative">
                              <FormControl>
                                <RadioGroupItem value={opt.value} className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 text-sm hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer text-center transition-all">
                                {opt.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Used only to fine-tune the cycle-length accuracy note below your results.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1 text-lg py-6 shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating Optimal Times...' : 'Calculate Sleep Cycles'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef}>
        {results && (
          <div className="max-w-4xl mx-auto mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3">
                <Moon className="h-8 w-8 text-indigo-500" /> 
                {mode === "wake" ? "Your Optimal Bedtimes" : "Your Optimal Wake Times"}
              </h2>
              <p className="text-lg text-muted-foreground text-balance">
                Based on 90-minute sleep cycles and {form.getValues("fallAsleepTime")} minutes to fall asleep. 
                Waking up between cycles prevents sleep inertia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {results.map((res, i) => (
                <Card key={i} className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${res.colorClass}`}>
                  {res.isOptimal && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1">
                      <Activity className="h-3 w-3" /> BEST CHOICE
                    </div>
                  )}
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold opacity-80 mb-1 uppercase tracking-wider">{res.badge}</p>
                    <div className="flex items-end gap-3 mb-2">
                      <span className="text-4xl md:text-5xl font-black tracking-tight">{res.timeStr}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-md text-sm font-medium">
                        {res.cycles} Sleep Cycles
                      </div>
                      <div className="text-sm font-semibold opacity-90">
                        {res.durationStr} of sleep
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* FEATURE 1 — FULL-NIGHT RECOMMENDATION SUMMARY ───────────────────── */}
            <Card className="border border-emerald-200 bg-emerald-50/60 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-emerald-700">
                  <Moon className="h-5 w-5" /> Wake Between Cycles, Not Mid-Cycle
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Each option below lands you at the <strong>end of a full 90-minute cycle</strong>, so your alarm
                  catches you in light sleep instead of deep sleep — the trick to waking up rested. The times marked
                  <span className="font-semibold text-emerald-700"> Full Night</span> give adults a complete 7.5–9 hours.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.map((res, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-xl border bg-white px-4 py-3 ${
                        res.isOptimal ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"
                      }`}
                    >
                      <div>
                        <p className="text-lg font-bold text-slate-900">{res.timeStr}</p>
                        <p className="text-xs text-muted-foreground">
                          {res.cycles} cycles · {res.durationStr}
                        </p>
                      </div>
                      {res.isOptimal ? (
                        <span className="text-xs font-bold rounded-full bg-emerald-600 text-white px-2.5 py-1">
                          Recommended
                        </span>
                      ) : res.fullNight ? (
                        <span className="text-xs font-bold rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1">
                          Full Night
                        </span>
                      ) : (
                        <span className="text-xs font-semibold rounded-full bg-slate-100 text-slate-500 px-2.5 py-1">
                          Short Night
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FEATURE 2 — SLEEP LATENCY + AGE-BASED CYCLE NOTE ─────────────────── */}
            {resultMeta && (
              <Card className="border border-slate-200 shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-700" /> Accuracy Adjustments Applied
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Sleep Latency Buffer
                      </p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">
                        {resultMeta.fallAsleepMins} min
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        We added the time it takes you to actually fall asleep
                        {resultMeta.fallAsleepMins === 15 ? " (the ~15 min average)" : ""} before counting cycles,
                        so your {mode === "wake" ? "bedtime" : "wake time"} reflects real sleep, not just time in bed.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Cycle-Length Note · {getCycleNote(resultMeta.ageBand).label}
                      </p>
                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                        {getCycleNote(resultMeta.ageBand).note}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-8 border border-slate-200 shadow-sm">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-500" /> The Science: Inside a 90-Minute Sleep Cycle
                </h3>
                <SleepStageTimeline />
                
                {/* Cross-Promotion for Body Shape Calculator */}
                <div className="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-center gap-4">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm shrink-0">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Looking to improve your overall health?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Your sleep quality directly impacts metabolism and body shape. Discover your exact proportions and get personalized fitness tips with our <b>Body Shape Calculator</b>.
                    </p>
                  </div>
                  <Button variant="outline" className="shrink-0 w-full sm:w-auto border-blue-200 hover:bg-blue-100" asChild>
                    <a href="/health/body-shape-calculator">Try it now</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </>
  );
}