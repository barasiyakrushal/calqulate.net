"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calculator, RefreshCw, Loader2, Activity, HeartPulse, Info, AlertTriangle, Gauge, ShieldCheck, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  systolic: z.string().min(1, "Systolic pressure is required."),
  diastolic: z.string().min(1, "Diastolic pressure is required."),
  // Optional, non-breaking: lets us add age context to the result.
  age: z.string().optional(),
}).refine((data) => {
  const sys = parseNumber(data.systolic);
  const dia = parseNumber(data.diastolic);
  return !isNaN(sys) && !isNaN(dia) && sys > dia;
}, {
  message: "Systolic must be higher than Diastolic.",
  path: ["systolic"], 
});

// --- RESULT TYPE INTERFACE ---
interface CalculationResult {
  pulsePressure: number;
  map: number; // Mean Arterial Pressure
  category: "Narrow" | "Normal" | "Wide" | "High Risk";
  description: string;
  recommendation: string;
  color: string;
  // ── USP FEATURE 1: classification band (Narrow <40 / Normal 40-60 / Wide >60) ──
  band: "Narrow" | "Normal" | "Wide";
  bandLabel: string;
  bandTone: "narrow" | "normal" | "wide";
  arterialMeaning: string;
  // ── USP FEATURE 2: age context + next steps ──
  age: number | null;
  ageContext: string;
  isElevated: boolean;
  nextSteps: string[];
}

// --- VISUAL COMPONENTS ---

const PulseGauge = ({ value }: { value: number }) => {
  // Scale: 0 to 100+ (Clamped at 120 for visual)
  // Ranges: <30 (Low/Blue), 30-40 (Low Normal), 40-60 (Ideal/Green), 60-80 (Elevated/Yellow), >80 (High/Red)
  
  const minScale = 10;
  const maxScale = 110;
  const range = maxScale - minScale;
  const position = Math.max(0, Math.min(100, ((value - minScale) / range) * 100));

  let labelColor = "text-green-600";
  if (value < 30) labelColor = "text-blue-600";
  else if (value > 60) labelColor = "text-orange-500";
  else if (value > 80) labelColor = "text-red-600";

  return (
    <div className="text-center mt-4">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Narrow (&lt;30)</span>
        <span>Normal (40-60)</span>
        <span>Wide (&gt;60)</span>
      </div>
      <div className="relative w-full h-3 bg-gradient-to-r from-blue-300 via-green-400 to-red-500 rounded-full mb-2">
        {/* Markers for ideal range 40-60 */}
        <div className="absolute top-0 bottom-0 border-l border-white/50" style={{ left: '30%' }}></div>
        <div className="absolute top-0 bottom-0 border-l border-white/50" style={{ left: '50%' }}></div>
        
        {/* The Indicator Dot */}
        <div 
          className="absolute top-1/2 h-5 w-5 rounded-full bg-white border-4 border-primary shadow-lg -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-out" 
          style={{ left: `${position}%` }}
        ></div>
      </div>
      <p className={`font-bold ${labelColor} mt-2`}>
        {value} mmHg
      </p>
    </div>
  )
}

// --- LOGIC ---

// ── USP FEATURE 1: 3-band clinical classification (Narrow <40, Normal 40-60, Wide >60) ──
const classifyBand = (pp: number): { band: CalculationResult["band"]; bandLabel: string; bandTone: CalculationResult["bandTone"]; arterialMeaning: string } => {
  if (pp < 40) {
    return {
      band: "Narrow",
      bandLabel: "Narrow (under 40 mmHg)",
      bandTone: "narrow",
      arterialMeaning:
        "A narrow pulse pressure means the gap between your beats is small. It can point to reduced stroke volume rather than stiff arteries — for example weak heart pumping, dehydration, or blood loss.",
    };
  }
  if (pp <= 60) {
    return {
      band: "Normal",
      bandLabel: "Normal (40–60 mmHg)",
      bandTone: "normal",
      arterialMeaning:
        "A normal pulse pressure suggests your arteries are still flexible and absorb each heartbeat well. Healthy, elastic arteries cushion the pressure surge, keeping the gap in this ideal band.",
    };
  }
  return {
    band: "Wide",
    bandLabel: "Wide (over 60 mmHg)",
    bandTone: "wide",
    arterialMeaning:
      "A wide pulse pressure is a classic marker of arterial stiffness. As large arteries lose their elasticity, they can no longer cushion each beat, so the gap between systolic and diastolic widens.",
  };
};

// ── USP FEATURE 2: age-aware context and clear next steps ──
const buildAgeContext = (pp: number, age: number | null): { ageContext: string; isElevated: boolean; nextSteps: string[] } => {
  const isElevated = pp > 60;

  let ageContext: string;
  if (age == null) {
    ageContext = isElevated
      ? "A wide pulse pressure becomes more common and more concerning with age, because arteries naturally stiffen over time. Adding your age above gives more tailored context."
      : "Pulse pressure tends to widen as arteries stiffen with age. Adding your age above lets us tailor this context to your stage of life.";
  } else if (age >= 60) {
    ageContext = isElevated
      ? `At ${age}, a wide pulse pressure is especially worth attention — arterial stiffening accelerates after 50–60, and wide pulse pressure is a recognised predictor of cardiovascular events in older adults.`
      : `At ${age}, keeping your pulse pressure in range is a good sign, since arteries naturally stiffen with age. Continue monitoring it as part of your routine checks.`;
  } else if (age >= 50) {
    ageContext = isElevated
      ? `At ${age}, a wide pulse pressure matters: research such as the Framingham Heart Study shows that after 50 it can predict heart risk better than systolic pressure alone.`
      : `At ${age}, a normal pulse pressure is reassuring. After 50 the value carries extra weight, so it is worth re-checking periodically.`;
  } else {
    ageContext = isElevated
      ? `At ${age}, a wide pulse pressure is less typical and worth investigating, since arterial stiffness usually develops later in life. Lifestyle factors and a clinician review can help find the cause.`
      : `At ${age}, a normal pulse pressure fits the expectation for your age, when arteries are usually still flexible. Healthy habits now help keep them that way.`;
  }

  const nextSteps = isElevated
    ? [
        "Re-check on different days: take two seated readings two minutes apart and average them before drawing conclusions.",
        "Trim sodium and processed foods, and add regular aerobic exercise (brisk walking, swimming, cycling) to help keep arteries elastic.",
        "Manage stress, sleep 7–9 hours, and limit alcohol and nicotine, all of which influence arterial stiffness.",
        "See a clinician if your pulse pressure is consistently above 60 mmHg — they can check for arterial stiffening or valve issues.",
      ]
    : [
        "Keep a heart-healthy routine: balanced diet, regular movement, and steady weight management.",
        "Re-measure periodically (more often if you are over 50) so you can spot any upward trend early.",
        "Maintain healthy blood pressure habits — low sodium, limited alcohol, and good sleep.",
      ];

  return { ageContext, isElevated, nextSteps };
};

const calculatePulsePressure = (sys: number, dia: number, age: number | null): CalculationResult => {
  const pp = sys - dia;
  const map = dia + (pp / 3); // Standard MAP formula

  const { band, bandLabel, bandTone, arterialMeaning } = classifyBand(pp);
  const { ageContext, isElevated, nextSteps } = buildAgeContext(pp, age);

  let category: CalculationResult['category'] = "Normal";
  let description = "";
  let recommendation = "";
  let color = "text-green-600";

  if (pp < 30) {
    category = "Narrow";
    color = "text-blue-600";
    description = "Your pulse pressure is considered low (narrow). This can sometimes indicate that the heart isn't pumping enough blood (low stroke volume).";
    recommendation = "Narrow pulse pressure can be seen in heart failure or significant blood loss. If this is persistent, consult a cardiologist.";
  } else if (pp >= 30 && pp <= 60) {
    category = "Normal";
    color = "text-green-600";
    description = "Your pulse pressure is within the healthy physiological range. This suggests good arterial elasticity and heart function.";
    recommendation = "Keep up with a heart-healthy lifestyle, including regular exercise and a balanced diet.";
  } else if (pp > 60 && pp <= 80) {
    category = "Wide";
    color = "text-orange-500";
    description = "Your pulse pressure is elevated. This is often an early sign of arterial stiffening (loss of elasticity in blood vessels).";
    recommendation = "Monitor your blood pressure regularly. Reducing sodium intake and regular cardio exercise may help.";
  } else {
    category = "High Risk";
    color = "text-red-600";
    description = "A significantly wide pulse pressure (>80 mmHg) is a strong predictor of heart events and suggests stiffening of the aorta.";
    recommendation = "This reading warrants medical attention. Please consult a healthcare professional to assess your cardiovascular risk factors.";
  }

  return {
    pulsePressure: pp,
    map,
    category,
    description,
    recommendation,
    color,
    band,
    bandLabel,
    bandTone,
    arterialMeaning,
    age,
    ageContext,
    isElevated,
    nextSteps,
  };
};

// --- COMPONENT ---

export default function PulsePressureCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { systolic: "", diastolic: "", age: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate calculation delay for UX
    setTimeout(() => {
      const sys = parseNumber(values.systolic);
      const dia = parseNumber(values.diastolic);
      const ageNum = values.age && !isNaN(parseInt(values.age)) ? parseInt(values.age) : null;

      const calcResult = calculatePulsePressure(sys, dia, ageNum);
      setResult(calcResult);
      
      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }, 600);
  }

  return (
    <>
      <Card className="max-w-3xl mx-auto border-t-4 border-t-primary shadow-lg" id="calculator">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Activity className="w-6 h-6 text-red-500" /> Pulse Pressure Calculator
          </CardTitle>
          <CardDescription>
            Enter your blood pressure readings to calculate Pulse Pressure (PP).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                  {/* Systolic Input */}
                  <FormField 
                    control={form.control} 
                    name="systolic" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Systolic Pressure (Top Number)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" placeholder="120" className="pl-9" {...field} />
                            <HeartPulse className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            <span className="absolute right-3 top-3 text-xs text-muted-foreground">mmHg</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                  
                  {/* Diastolic Input */}
                  <FormField 
                    control={form.control} 
                    name="diastolic" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                           Diastolic Pressure (Bottom Number)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="number" placeholder="80" className="pl-9" {...field} />
                            <Activity className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                            <span className="absolute right-3 top-3 text-xs text-muted-foreground">mmHg</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
              </div>

              {/* Optional age field — adds age context to results, non-breaking */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Age <span className="text-xs font-normal text-muted-foreground">(optional — adds age context)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" placeholder="e.g. 45" className="pl-9" {...field} />
                        <Activity className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                        <span className="absolute right-3 top-3 text-xs text-muted-foreground">years</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="flex-1 text-lg h-12" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Analyzing...' : 'Calculate Pulse Pressure'}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setResult(null); }} disabled={isLoading}>
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef}>
        {result && (
          <Card className="max-w-3xl mx-auto mt-8 border-t-4 border-t-blue-500 shadow-xl bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="p-6 md:p-8 space-y-6">
              
              {/* Header Result */}
              <div className="text-center space-y-2">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground font-semibold">Your Pulse Pressure</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-extrabold text-primary">{result.pulsePressure}</span>
                    <span className="text-xl text-muted-foreground">mmHg</span>
                  </div>
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold bg-white dark:bg-slate-800 border shadow-sm ${result.color}`}>
                    {result.category} Range
                  </div>
              </div>

              {/* Visual Gauge */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-sm font-medium mb-4 text-center">Visual Indicator</h3>
                <PulseGauge value={result.pulsePressure} />
              </div>

              {/* MAP Result (Bonus) */}
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                       <Info className="w-4 h-4 text-blue-600" />
                       <h4 className="font-semibold text-blue-800 dark:text-blue-300">Interpretation</h4>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-200 leading-relaxed">
                      {result.description}
                    </p>
                 </div>

                 <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Additional Metric</p>
                    <div className="flex items-center justify-between">
                       <span className="font-medium">Mean Arterial Pressure (MAP)</span>
                       <span className="font-bold text-xl">{result.map.toFixed(0)} mmHg</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                       This represents the average pressure in your arteries during one cardiac cycle. Normal range is typically 70-100 mmHg.
                    </p>
                 </div>
              </div>
              
              {/* Recommendation */}
              <Alert className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                <HeartPulse className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-400">Health Tip</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {result.recommendation}
                </AlertDescription>
              </Alert>

              {/* ── USP FEATURE 1: Pulse pressure classification & arterial stiffness ── */}
              <Card className="border shadow-md rounded-xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-bold">Your Classification &amp; What It Means for Your Arteries</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Pulse pressure (systolic − diastolic) is{" "}
                    <strong className="text-slate-800 dark:text-slate-100">
                      {result.pulsePressure} mmHg
                    </strong>
                    , which falls in the{" "}
                    <span
                      className={`font-bold ${
                        result.bandTone === "normal"
                          ? "text-emerald-700"
                          : result.bandTone === "narrow"
                          ? "text-blue-600"
                          : "text-orange-600"
                      }`}
                    >
                      {result.bandLabel}
                    </span>{" "}
                    band.
                  </p>

                  {/* 3-band visual cue */}
                  <div className="grid grid-cols-3 gap-2 mt-5">
                    {[
                      { key: "narrow", title: "Narrow", range: "< 40", active: "border-blue-300 bg-blue-50 text-blue-700", text: "text-blue-700" },
                      { key: "normal", title: "Normal", range: "40–60", active: "border-emerald-300 bg-emerald-50 text-emerald-700", text: "text-emerald-700" },
                      { key: "wide", title: "Wide", range: "> 60", active: "border-orange-300 bg-orange-50 text-orange-700", text: "text-orange-700" },
                    ].map((b) => {
                      const isActive = result.bandTone === b.key;
                      return (
                        <div
                          key={b.key}
                          className={`rounded-xl border p-3 text-center transition-all ${
                            isActive ? b.active + " shadow-sm" : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          <p className="text-sm font-bold">{b.title}</p>
                          <p className="text-xs mt-0.5">{b.range} mmHg</p>
                          {isActive && <p className="text-[10px] font-bold uppercase tracking-wider mt-1">You</p>}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mt-5">
                    {result.arterialMeaning}
                  </p>
                </CardContent>
              </Card>

              {/* ── USP FEATURE 2: Age context & next steps ── */}
              <Card className="border shadow-md rounded-xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-bold">Age Context &amp; Next Steps</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {result.ageContext}
                  </p>

                  <div
                    className={`mt-5 rounded-xl border p-5 ${
                      result.isElevated
                        ? "border-orange-200 bg-orange-50/60"
                        : "border-emerald-200 bg-emerald-50/60"
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                        result.isElevated ? "text-orange-700" : "text-emerald-700"
                      }`}
                    >
                      {result.isElevated ? "Recommended next steps" : "Keep it healthy"}
                    </p>
                    <ul className="space-y-2.5">
                      {result.nextSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <ArrowRight
                            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                              result.isElevated ? "text-orange-600" : "text-emerald-600"
                            }`}
                          />
                          <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                 <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                   <AlertTriangle className="w-3 h-3" />
                   Result is for informational purposes only. Consult a doctor for diagnosis.
                 </p>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}