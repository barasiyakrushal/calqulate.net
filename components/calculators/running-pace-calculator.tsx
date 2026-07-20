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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RefreshCw, Loader2, Timer, FastForward, Activity, Flame, Route, Goal } from "lucide-react";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  calcMode: z.enum(["pace", "time", "distance"]),
  
  // Time inputs
  timeHrs: z.string().optional(),
  timeMins: z.string().optional(),
  timeSecs: z.string().optional(),
  
  // Distance inputs
  distanceVal: z.string().optional(),
  distanceUnit: z.enum(["km", "mi", "m"]),
  
  // Pace inputs
  paceMins: z.string().optional(),
  paceSecs: z.string().optional(),
  paceUnit: z.enum(["km", "mi"]),

  // Goal-pace mode (optional, non-breaking)
  goalRace: z.enum(["5", "10", "21.0975", "42.195"]).optional(),
  goalHrs: z.string().optional(),
  goalMins: z.string().optional(),
  goalSecs: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Split {
  marker: number;
  timeStr: string;
}

interface CalculationResult {
  mode: "pace" | "time" | "distance";
  timeStr: string;
  distanceStr: string;
  paceStrKm: string;
  paceStrMi: string;
  
  // Mathematical base values for predictors
  totalSeconds: number;
  distanceInKm: number;
  paceSecondsPerKm: number;
  
  predictions: { event: string; time: string }[];
  trainingZones: { zone: string; desc: string; paceKm: string; paceMi: string; color: string }[];
  splits: Split[];
}

// Goal-pace result (Feature 2): exact pace needed to hit a target finish time.
interface GoalResult {
  raceLabel: string;
  raceDistanceStr: string;
  finishStr: string;
  goalPaceKm: string;
  goalPaceMi: string;
}

const GOAL_RACES: { value: "5" | "10" | "21.0975" | "42.195"; label: string }[] = [
  { value: "5", label: "5K" },
  { value: "10", label: "10K" },
  { value: "21.0975", label: "Half Marathon" },
  { value: "42.195", label: "Full Marathon" },
];

// Quick Select Distances
const PRESETS = [
  { label: "5K", val: "5", unit: "km" },
  { label: "10K", val: "10", unit: "km" },
  { label: "Half", val: "21.0975", unit: "km" },
  { label: "Full", val: "42.195", unit: "km" },
];

// Helpers
const pad = (num: number) => num.toString().padStart(2, "0");
const formatTime = (totalSecs: number) => {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = Math.floor(totalSecs % 60);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
};

export default function RunningPaceCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [goalResult, setGoalResult] = useState<GoalResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calcMode: "pace",
      timeHrs: "0", timeMins: "25", timeSecs: "00",
      distanceVal: "5", distanceUnit: "km",
      paceMins: "5", paceSecs: "00", paceUnit: "km",
      goalRace: "42.195", goalHrs: "4", goalMins: "00", goalSecs: "00",
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const calcMode = watch("calcMode");
  const distanceUnit = watch("distanceUnit");

  // Validate custom requirement depending on mode before submit
  const validateForm = (v: FormValues): boolean => {
    const parseNum = (str?: string) => parseNumber(str || "0");
    if (v.calcMode === "pace" && (parseNum(v.distanceVal) <= 0 || (parseNum(v.timeHrs) + parseNum(v.timeMins) + parseNum(v.timeSecs) <= 0))) return false;
    if (v.calcMode === "time" && (parseNum(v.distanceVal) <= 0 || (parseNum(v.paceMins) + parseNum(v.paceSecs) <= 0))) return false;
    if (v.calcMode === "distance" && ((parseNum(v.timeHrs) + parseNum(v.timeMins) + parseNum(v.timeSecs) <= 0) || (parseNum(v.paceMins) + parseNum(v.paceSecs) <= 0))) return false;
    return true;
  };

  function onSubmit(values: FormValues) {
    if (!validateForm(values)) {
      alert("Please enter valid positive numbers for the required fields.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const parseNum = (str?: string) => parseNumber(str || "0") || 0;
      
      let totalSecs = 0;
      let distKm = 0;
      let paceSecsKm = 0;

      // Extract raw inputs
      const inputSecs = parseNum(values.timeHrs) * 3600 + parseNum(values.timeMins) * 60 + parseNum(values.timeSecs);
      const inputDistMultiplier = values.distanceUnit === "km" ? 1 : values.distanceUnit === "mi" ? 1.60934 : 0.001;
      const inputDistKm = parseNum(values.distanceVal) * inputDistMultiplier;
      const inputPaceSecs = parseNum(values.paceMins) * 60 + parseNum(values.paceSecs);
      const inputPaceSecsKm = values.paceUnit === "km" ? inputPaceSecs : inputPaceSecs / 1.60934;

      // Primary Logic
      if (values.calcMode === "pace") {
        totalSecs = inputSecs;
        distKm = inputDistKm;
        paceSecsKm = totalSecs / distKm;
      } else if (values.calcMode === "time") {
        distKm = inputDistKm;
        paceSecsKm = inputPaceSecsKm;
        totalSecs = paceSecsKm * distKm;
      } else if (values.calcMode === "distance") {
        totalSecs = inputSecs;
        paceSecsKm = inputPaceSecsKm;
        distKm = totalSecs / paceSecsKm;
      }

      // Safeguard
      if (!isFinite(paceSecsKm) || !isFinite(totalSecs) || !isFinite(distKm)) {
        setIsLoading(false);
        return;
      }

      // Generate Strings
      const paceStrKm = formatTime(paceSecsKm);
      const paceStrMi = formatTime(paceSecsKm * 1.60934);
      const distMi = distKm / 1.60934;
      const displayDist = values.distanceUnit === "km" ? `${distKm.toFixed(2)} km` : values.distanceUnit === "mi" ? `${distMi.toFixed(2)} mi` : `${(distKm*1000).toFixed(0)} m`;

      // Predictions (Riegel's Formula: T2 = T1 * (D2/D1)^1.06)
      // Base prediction off their inputted pace representing a "race" or maximum effort for the given distance. 
      // If distance is extremely small, cap the math. Let's use 5k as base if calculating from pace only without distance.
      const baseDistForPredict = distKm > 0 ? distKm : 5; 
      const baseTimeForPredict = distKm > 0 ? totalSecs : paceSecsKm * 5;

      const predictTime = (targetKm: number) => formatTime(baseTimeForPredict * Math.pow(targetKm / baseDistForPredict, 1.06));
      
      const predictions = [
        { event: "5K", time: predictTime(5) },
        { event: "10K", time: predictTime(10) },
        { event: "Half Marathon", time: predictTime(21.0975) },
        { event: "Marathon", time: predictTime(42.195) },
      ];

      // Training Zones (approximations based on race pace)
      // Usually calculated via VO2Max, but standard % adjustments are excellent guidelines.
      const trainingZones = [
        { zone: "Easy Pace", desc: "Builds endurance & recovery", paceKm: formatTime(paceSecsKm * 1.25), paceMi: formatTime((paceSecsKm * 1.60934) * 1.25), color: "bg-green-100 border-green-200 text-green-800" },
        { zone: "Tempo Pace", desc: "Lactate threshold (comfortably hard)", paceKm: formatTime(paceSecsKm * 0.95), paceMi: formatTime((paceSecsKm * 1.60934) * 0.95), color: "bg-yellow-100 border-yellow-200 text-yellow-800" },
        { zone: "VO2 Max / Intervals", desc: "Short hard bursts for speed", paceKm: formatTime(paceSecsKm * 0.88), paceMi: formatTime((paceSecsKm * 1.60934) * 0.88), color: "bg-red-100 border-red-200 text-red-800" },
      ];

      // Splits generator
      const splits: Split[] = [];
      const isKm = values.distanceUnit !== "mi";
      const totalUnits = isKm ? distKm : distMi;
      const splitPace = isKm ? paceSecsKm : (paceSecsKm * 1.60934);
      
      for (let i = 1; i <= Math.ceil(totalUnits); i++) {
        if (i === Math.ceil(totalUnits) && totalUnits % 1 !== 0) {
           // final partial split
           splits.push({ marker: totalUnits, timeStr: formatTime(totalSecs) });
        } else {
           splits.push({ marker: i, timeStr: formatTime(i * splitPace) });
        }
      }

      setResult({
        mode: values.calcMode,
        timeStr: formatTime(totalSecs),
        distanceStr: displayDist,
        paceStrKm,
        paceStrMi,
        totalSeconds: totalSecs,
        distanceInKm: distKm,
        paceSecondsPerKm: paceSecsKm,
        predictions,
        trainingZones,
        splits: splits.slice(0, 50) // Cap to avoid massive arrays if they type 1000 miles
      });

      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
    }, 500);
  }

  // ── FEATURE 2: Goal-pace mode ───────────────────────────────────────────────
  // Given a target finish time for a chosen race, compute the exact per-km and
  // per-mile pace required: pace = finishTime ÷ distance.
  function calculateGoalPace() {
    const values = form.getValues();
    const parseNum = (str?: string) => parseNumber(str || "0") || 0;
    const race = GOAL_RACES.find((r) => r.value === (values.goalRace ?? "42.195"));
    if (!race) return;

    const raceKm = parseNumber(race.value);
    const finishSecs =
      parseNum(values.goalHrs) * 3600 + parseNum(values.goalMins) * 60 + parseNum(values.goalSecs);

    if (finishSecs <= 0 || raceKm <= 0) {
      alert("Please enter a valid target finish time greater than zero.");
      return;
    }

    const goalPaceSecsKm = finishSecs / raceKm;
    const raceMi = raceKm / 1.60934;

    setGoalResult({
      raceLabel: race.label,
      raceDistanceStr: `${raceKm.toFixed(raceKm % 1 === 0 ? 0 : 4)} km · ${raceMi.toFixed(2)} mi`,
      finishStr: formatTime(finishSecs),
      goalPaceKm: formatTime(goalPaceSecsKm),
      goalPaceMi: formatTime(goalPaceSecsKm * 1.60934),
    });

    setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto border-t-4 border-t-primary" id="calculator">
        <CardHeader className="bg-slate-50/50 rounded-t-xl pb-6 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl"><Route className="w-6 h-6 text-primary" /> Advanced Pace Calculator</CardTitle>
          <CardDescription className="text-base text-gray-600">Choose what you want to calculate, enter the other two values, and unlock predictions.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Mode Selection - Made to look like big modern tabs */}
              <FormField control={form.control} name="calcMode" render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base font-semibold">What do you want to calculate?</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={(val) => { field.onChange(val); setResult(null); }} 
                      value={field.value} 
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <FormItem>
                        <FormControl><RadioGroupItem value="pace" className="peer sr-only" /></FormControl>
                        <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                          <Timer className="mb-2 h-6 w-6" />
                          <span className="font-semibold text-base">Find Pace</span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl><RadioGroupItem value="time" className="peer sr-only" /></FormControl>
                        <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                          <Activity className="mb-2 h-6 w-6" />
                          <span className="font-semibold text-base">Find Time</span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl><RadioGroupItem value="distance" className="peer sr-only" /></FormControl>
                        <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                          <Route className="mb-2 h-6 w-6" />
                          <span className="font-semibold text-base">Find Distance</span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )} />

              <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl p-2">
                
                {/* TIME INPUTS */}
                <div className={`space-y-4 p-4 rounded-xl border transition-colors ${calcMode === 'time' ? 'opacity-50 grayscale bg-slate-50 border-dashed cursor-not-allowed' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h3 className="font-semibold flex items-center gap-2"><Timer className="w-4 h-4 text-slate-500"/> Time</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <FormField control={form.control} name="timeHrs" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs text-slate-500">Hours</FormLabel><FormControl><Input type="number" min="0" placeholder="0" disabled={calcMode === 'time'} {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="timeMins" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs text-slate-500">Minutes</FormLabel><FormControl><Input type="number" min="0" max="59" placeholder="30" disabled={calcMode === 'time'} {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="timeSecs" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs text-slate-500">Seconds</FormLabel><FormControl><Input type="number" min="0" max="59" placeholder="0" disabled={calcMode === 'time'} {...field} /></FormControl></FormItem>
                    )} />
                  </div>
                </div>

                {/* DISTANCE INPUTS */}
                <div className={`space-y-4 p-4 rounded-xl border transition-colors ${calcMode === 'distance' ? 'opacity-50 grayscale bg-slate-50 border-dashed cursor-not-allowed' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2"><Route className="w-4 h-4 text-slate-500"/> Distance</h3>
                    {calcMode !== 'distance' && (
                       <div className="flex gap-1">
                          {PRESETS.map(p => (
                            <button key={p.label} type="button" onClick={() => { setValue("distanceVal", p.val); setValue("distanceUnit", p.unit as "km"|"mi"); }} className="text-[10px] font-medium px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors">
                              {p.label}
                            </button>
                          ))}
                       </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <FormField control={form.control} name="distanceVal" render={({ field }) => (
                      <FormItem className="flex-1"><FormLabel className="text-xs text-slate-500">Value</FormLabel><FormControl><Input type="number" step="0.01" min="0" placeholder="e.g. 10" disabled={calcMode === 'distance'} {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="distanceUnit" render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel className="text-xs text-slate-500">Unit</FormLabel>
                        <Select disabled={calcMode === 'distance'} onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="km">km</SelectItem><SelectItem value="mi">miles</SelectItem><SelectItem value="m">meters</SelectItem></SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* PACE INPUTS */}
                <div className={`md:col-span-2 space-y-4 p-4 rounded-xl border transition-colors ${calcMode === 'pace' ? 'opacity-50 grayscale bg-slate-50 border-dashed cursor-not-allowed' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                  <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-slate-500"/> Pace</h3>
                  <div className="flex gap-2 items-end">
                    <FormField control={form.control} name="paceMins" render={({ field }) => (
                      <FormItem className="w-1/3"><FormLabel className="text-xs text-slate-500">Minutes</FormLabel><FormControl><Input type="number" min="0" placeholder="5" disabled={calcMode === 'pace'} {...field} /></FormControl></FormItem>
                    )} />
                    <FormField control={form.control} name="paceSecs" render={({ field }) => (
                      <FormItem className="w-1/3"><FormLabel className="text-xs text-slate-500">Seconds</FormLabel><FormControl><Input type="number" min="0" max="59" placeholder="30" disabled={calcMode === 'pace'} {...field} /></FormControl></FormItem>
                    )} />
                    <div className="pb-2 text-slate-400 font-medium px-2">per</div>
                    <FormField control={form.control} name="paceUnit" render={({ field }) => (
                      <FormItem className="w-1/3">
                         <FormLabel className="text-xs text-slate-500">Unit</FormLabel>
                        <Select disabled={calcMode === 'pace'} onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                          <SelectContent><SelectItem value="km">km</SelectItem><SelectItem value="mi">mile</SelectItem></SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating...' : `Calculate ${calcMode.charAt(0).toUpperCase() + calcMode.slice(1)}`}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setResult(null); }} className="sm:w-32" disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef}>
        {result && (
          <div className="space-y-8 mt-10">
            {/* Primary Result Banner */}
            <Card className="max-w-4xl mx-auto overflow-hidden border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-8 md:p-10 text-center relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Goal className="w-32 h-32" /></div>
                <p className="text-blue-100 font-medium mb-2 uppercase tracking-wider text-sm">Calculated {result.mode}</p>
                <div className="text-5xl md:text-7xl font-bold tracking-tight mb-4 drop-shadow-sm">
                  {result.mode === "pace" && (result.paceStrKm + ' /km')}
                  {result.mode === "time" && result.timeStr}
                  {result.mode === "distance" && result.distanceStr}
                </div>
                {result.mode === "pace" && <p className="text-blue-100 text-xl font-medium drop-shadow-sm border-t border-blue-400/30 pt-4 inline-block px-8">Or {result.paceStrMi} /mi</p>}
              </CardContent>
            </Card>

            {/* ── FEATURE 1: Pace conversion + Riegel finish-time predictions ──────── */}
            <Card className="max-w-4xl mx-auto shadow-sm border-emerald-100">
              <CardHeader className="pb-3 border-b bg-emerald-50/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                  <FastForward className="w-5 h-5" /> Pace Conversion & Finish-Time Predictions
                </CardTitle>
                <CardDescription className="text-sm">
                  Your pace shown in both units, plus Riegel-predicted finish times across standard races.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Min/km ↔ Min/mile conversion */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Pace per km</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{result.paceStrKm}<span className="text-sm font-semibold text-slate-500"> /km</span></p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Pace per mile</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">{result.paceStrMi}<span className="text-sm font-semibold text-slate-500"> /mi</span></p>
                  </div>
                </div>

                {/* Riegel finish-time predictions */}
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-3">
                    Predicted finish times (Riegel formula: T₂ = T₁ × (D₂/D₁)^1.06)
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-bold text-slate-600">Race</th>
                          <th className="px-4 py-2.5 text-right font-bold text-slate-600">Predicted Finish</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.predictions.map((p, i) => (
                          <tr key={i} className="hover:bg-emerald-50/40">
                            <td className="px-4 py-2.5 font-medium text-slate-700">{p.event}</td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-700">{p.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    Predictions are extrapolated from your entered distance and time. Real race times also depend on terrain, weather, and fatigue.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ── FEATURE 2: Goal-pace mode ──────────────────────────────────────── */}
            <Form {...form}>
            <Card className="max-w-4xl mx-auto shadow-sm border-emerald-100">
              <CardHeader className="pb-3 border-b bg-emerald-50/50 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                  <Goal className="w-5 h-5" /> Goal-Pace Target
                </CardTitle>
                <CardDescription className="text-sm">
                  Pick a race and target finish time to see the exact per-km and per-mile pace you need.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="goalRace" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-slate-500">Target Race</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "42.195"}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Race" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {GOAL_RACES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <div>
                    <FormLabel className="text-xs text-slate-500">Target Finish Time</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <FormField control={form.control} name="goalHrs" render={({ field }) => (
                        <FormItem><FormControl><Input type="number" min="0" placeholder="hh" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="goalMins" render={({ field }) => (
                        <FormItem><FormControl><Input type="number" min="0" max="59" placeholder="mm" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="goalSecs" render={({ field }) => (
                        <FormItem><FormControl><Input type="number" min="0" max="59" placeholder="ss" {...field} /></FormControl></FormItem>
                      )} />
                    </div>
                  </div>
                </div>

                <Button type="button" onClick={calculateGoalPace} className="w-full sm:w-auto">
                  <Goal className="h-4 w-4 mr-2" /> Calculate Goal Pace
                </Button>

                {goalResult && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
                    <p className="text-sm text-slate-700">
                      To finish the <strong className="text-emerald-700">{goalResult.raceLabel}</strong>{" "}
                      ({goalResult.raceDistanceStr}) in <strong className="text-emerald-700">{goalResult.finishStr}</strong>, you need to hold:
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="rounded-xl border border-emerald-100 bg-white p-4 text-center">
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Per km</p>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{goalResult.goalPaceKm}<span className="text-sm font-semibold text-slate-500"> /km</span></p>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-white p-4 text-center">
                        <p className="text-xs uppercase tracking-wider font-bold text-slate-500">Per mile</p>
                        <p className="text-2xl font-black text-emerald-700 mt-1">{goalResult.goalPaceMi}<span className="text-sm font-semibold text-slate-500"> /mi</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </Form>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              
              {/* Training Zones */}
              <Card className="shadow-sm border-gray-200 h-full">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg"><Activity className="w-5 h-5 text-indigo-500" /> Training Paces</CardTitle>
                  <CardDescription>Estimated zones based on your calculated pace.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {result.trainingZones.map((z, i) => (
                      <div key={i} className="p-4 flex flex-col justify-center transition-colors hover:bg-slate-50">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full border uppercase tracking-wider ${z.color}`}>{z.zone}</span>
                          <span className="font-semibold text-gray-800">{z.paceKm}/km</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>{z.desc}</span>
                          <span>{z.paceMi}/mi</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Race Predictor */}
              <Card className="shadow-sm border-gray-200 h-full">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg"><FastForward className="w-5 h-5 text-indigo-500" /> Race Predictor</CardTitle>
                  <CardDescription>Estimated finish times for standard distances.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {result.predictions.map((p, i) => (
                      <div key={i} className="p-4 flex justify-between items-center transition-colors hover:bg-slate-50">
                        <span className="font-medium text-gray-700">{p.event}</span>
                        <span className="font-bold text-lg text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{p.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Split Times Table */}
              <Card className="shadow-sm border-gray-200 md:col-span-2">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg"><Timer className="w-5 h-5 text-indigo-500" /> Split Times ({distanceUnit === 'mi' ? 'Miles' : 'Kilometers'})</CardTitle>
                  <CardDescription>Your cumulative time at each marker.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 sticky top-0 shadow-sm">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-500 font-medium">Marker</th>
                        <th className="px-6 py-3 text-right text-gray-500 font-medium">Split Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {result.splits.map((s, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-3 font-medium text-gray-700">{s.marker} {distanceUnit}</td>
                          <td className="px-6 py-3 text-right font-mono font-medium text-indigo-600">{s.timeStr}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </>
  );
}