"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Activity, RefreshCw, Loader2, HeartPulse, AlertTriangle, CheckCircle2, Gauge, Brain } from "lucide-react";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  systolic: z.string().min(1, "Systolic BP is required.")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 300, "Enter a valid systolic value (0-300)."),
  diastolic: z.string().min(1, "Diastolic BP is required.")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 200, "Enter a valid diastolic value (0-200)."),
}).refine((data) => Number(data.systolic) > Number(data.diastolic), {
  message: "Systolic must be higher than diastolic.",
  path: ["systolic"], 
});

// --- RESULT INTERFACE ---
interface CalculationResult {
  map: number;
  category: "Low" | "Low Normal" | "Normal" | "High";
  description: string;
  color: string;
}

// --- VISUAL GAUGE COMPONENT ---
const MapGauge = ({ value }: { value: number }) => {
  // Scale mapping: 40 (min) to 130 (max) for visual purposes
  const min = 40;
  const max = 130;
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="mt-6 mb-2">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Low (&lt;60)</span>
        <span>Normal (70-100)</span>
        <span>High (&gt;100)</span>
      </div>
      <div className="relative w-full h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500">
          {/* We need a specific gradient: Red (Low) -> Yellow -> Green (Normal) -> Red (High) */}
          {/* Overriding the simple gradient above with a specific CSS style for MAP */}
          <div 
            className="absolute inset-0 rounded-full opacity-90"
            style={{
                background: "linear-gradient(90deg, #ef4444 0%, #ef4444 22%, #eab308 25%, #22c55e 33%, #22c55e 66%, #ef4444 75%, #ef4444 100%)"
            }}
          ></div>
          
          {/* Indicator Dot */}
          <div 
            className="absolute top-1/2 h-6 w-6 rounded-full bg-white border-4 border-primary shadow-xl -translate-y-1/2 -translate-x-1/2 transition-all duration-700 ease-out" 
            style={{ left: `${percentage}%` }}
          ></div>
      </div>
      <div className="text-center mt-2 text-sm font-medium">
        Current MAP: {value.toFixed(1)} mmHg
      </div>
    </div>
  );
}

// --- FEATURE 1: HEALTHY-RANGE BAND HELPER ---
// Healthy MAP band is 70-100 mmHg. Marker placed on a 40-130 visual scale.
const getHealthyRangeBand = (map: number) => {
  const min = 40;
  const max = 130;
  const markerPct = Math.max(0, Math.min(100, ((map - min) / (max - min)) * 100));
  // Healthy band (70-100) as a highlighted segment of the same scale.
  const bandStartPct = ((70 - min) / (max - min)) * 100;
  const bandEndPct = ((100 - min) / (max - min)) * 100;

  if (map < 70) {
    return {
      zone: "low" as const,
      label: "Below healthy range",
      headline: "Your MAP is under 70 mmHg",
      accent: "text-red-600",
      dot: "border-red-500",
      markerPct,
      bandStartPct,
      bandEndPct,
    };
  }
  if (map <= 100) {
    return {
      zone: "normal" as const,
      label: "Within healthy range",
      headline: "Your MAP is in the healthy 70-100 mmHg band",
      accent: "text-green-600",
      dot: "border-green-500",
      markerPct,
      bandStartPct,
      bandEndPct,
    };
  }
  return {
    zone: "high" as const,
    label: "Above healthy range",
    headline: "Your MAP is over 100 mmHg",
    accent: "text-orange-600",
    dot: "border-orange-500",
    markerPct,
    bandStartPct,
    bandEndPct,
  };
};

// --- FEATURE 2: ORGAN-PERFUSION PLAIN-LANGUAGE HELPER ---
// Explains what the value means for blood flow to vital organs, tailored to MAP.
const getPerfusionMeaning = (map: number): { title: string; body: string; accent: string } => {
  if (map < 60) {
    return {
      title: "Too low to reliably perfuse your organs",
      body: `At ${map.toFixed(0)} mmHg, your MAP is below the ~65 mmHg generally considered the minimum needed to push blood through the small vessels of the brain, kidneys and heart. Pressure this low risks hypoperfusion — organs may not get enough oxygen, which can cause dizziness, confusion or, if sustained, tissue damage.`,
      accent: "text-red-600",
    };
  }
  if (map < 70) {
    return {
      title: "On the low edge for organ blood flow",
      body: `At ${map.toFixed(0)} mmHg, your MAP is just above the ~65 mmHg perfusion threshold but below the typical healthy floor of 70. There is usually enough pressure to supply vital organs, but the margin is thin — worth monitoring, especially if you feel light-headed or fatigued.`,
      accent: "text-yellow-600",
    };
  }
  if (map <= 100) {
    return {
      title: "Enough pressure to perfuse your vital organs",
      body: `At ${map.toFixed(0)} mmHg, your MAP comfortably clears the ~65 mmHg needed to perfuse organs and sits inside the healthy 70-100 range. This means your brain, kidneys and heart are likely receiving a steady, adequate supply of oxygen-rich blood without putting excess strain on your vessels.`,
      accent: "text-green-600",
    };
  }
  return {
    title: "More than enough flow, but added vascular strain",
    body: `At ${map.toFixed(0)} mmHg, your MAP is above the healthy 70-100 range. Your organs are well perfused, but sustained high mean pressure makes the heart work harder and stresses artery walls over time, raising long-term cardiovascular risk. Persistent high readings are worth discussing with a clinician.`,
    accent: "text-orange-600",
  };
};

// --- MAIN CALCULATOR COMPONENT ---
export default function MAPCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { systolic: "", diastolic: "" },
  });

  const getMapCategory = (map: number): Omit<CalculationResult, 'map'> => {
    if (map < 60) {
        return {
            category: "Low",
            description: "A MAP below 60 mmHg indicates that vital organs may not be receiving enough blood (hypoperfusion). This can lead to shock or organ damage if not treated.",
            color: "text-red-600"
        };
    } else if (map >= 60 && map < 70) {
        return {
            category: "Low Normal",
            description: "This is on the lower end of the spectrum. While often sufficient for survival, it may be monitored closely in clinical settings.",
            color: "text-yellow-600"
        };
    } else if (map >= 70 && map <= 100) {
        return {
            category: "Normal",
            description: "Your MAP is within the healthy range. Your major organs (brain, kidneys, heart) are likely receiving adequate oxygen and blood flow.",
            color: "text-green-600"
        };
    } else {
        return {
            category: "High",
            description: "A MAP above 100 mmHg suggests high pressure in the arteries. While sometimes necessary to push blood to the brain in specific injuries, chronic high MAP strains the heart.",
            color: "text-red-600"
        };
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Simulate slight delay for UX feel
    setTimeout(() => {
      const sbp = parseNumber(values.systolic);
      const dbp = parseNumber(values.diastolic);

      // MAP Formula: (SBP + 2*DBP) / 3 — equivalent to DBP + 1/3(SBP - DBP)
      const mapValue = (sbp + (2 * dbp)) / 3;

      const analysis = getMapCategory(mapValue);

      setResult({
        map: mapValue,
        ...analysis
      });

      setIsLoading(false);
      
      // Scroll to results
      setTimeout(() => { 
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
      }, 100);
    }, 600);
  }

  return (
    <>
      <Card className="max-w-xl mx-auto border-t-4 border-t-primary shadow-lg" id="map-calculator">
        <CardHeader className="bg-muted/10">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6 text-primary" /> 
            Enter Blood Pressure
          </CardTitle>
          <CardDescription>
            Input your Systolic (top number) and Diastolic (bottom number) readings.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Systolic Input */}
                <FormField
                  control={form.control}
                  name="systolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Systolic <span className="text-xs text-muted-foreground">(Top)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input type="number" placeholder="120" className="pr-12 text-lg" {...field} />
                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">mmHg</span>
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
                      <FormLabel className="flex items-center gap-1">
                        Diastolic <span className="text-xs text-muted-foreground">(Bottom)</span>
                      </FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Input type="number" placeholder="80" className="pr-12 text-lg" {...field} />
                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">mmHg</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 text-base" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Activity className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate MAP'}
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={() => { form.reset(); setResult(null); }} 
                    disabled={isLoading}
                >
                    <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div ref={resultsRef} className="scroll-mt-24">
        {result && (
          <Card className="max-w-xl mx-auto mt-6 border-2 border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="flex justify-between items-center">
                <span>Result Analysis</span>
                <span className={`text-sm px-3 py-1 rounded-full bg-muted font-normal ${result.color}`}>
                   {result.category} Risk
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="text-center space-y-1">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground font-semibold">Mean Arterial Pressure</p>
                  <div className="flex items-end justify-center gap-2">
                      <span className="text-6xl font-extrabold text-foreground">{result.map.toFixed(0)}</span>
                      <span className="text-xl text-muted-foreground mb-2">mmHg</span>
                  </div>
              </div>

              {/* Visual Gauge */}
              <MapGauge value={result.map} />

              <div className="bg-muted/40 p-4 rounded-xl flex gap-3 items-start">
                  {result.category === 'Normal' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                      <AlertTriangle className={`w-6 h-6 shrink-0 mt-0.5 ${result.color}`} />
                  )}
                  <div>
                      <h4 className={`font-semibold mb-1 ${result.color}`}>{result.category} Range</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                          {result.description}
                      </p>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="text-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <p className="text-xs text-muted-foreground">Systolic Input</p>
                    <p className="font-semibold text-lg">{form.getValues("systolic")} mmHg</p>
                 </div>
                 <div className="text-center p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <p className="text-xs text-muted-foreground">Diastolic Input</p>
                    <p className="font-semibold text-lg">{form.getValues("diastolic")} mmHg</p>
                 </div>
              </div>

              {/* ── FEATURE 1: HEALTHY-RANGE CHECK (70-100 mmHg) ───────────────── */}
              {(() => {
                const band = getHealthyRangeBand(result.map);
                return (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Gauge className="w-5 h-5 text-emerald-700" />
                      <h4 className="text-base font-bold text-slate-800">Healthy Range Check (70-100 mmHg)</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {band.headline} —{" "}
                      <span className={`font-semibold ${band.accent}`}>{band.label}</span>. The
                      clinically healthy mean arterial pressure band is{" "}
                      <strong className="text-emerald-700">70-100 mmHg</strong>.
                    </p>

                    {/* Colour-cued band with the user's marker */}
                    <div className="relative mt-5 w-full h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-red-500">
                      {/* Healthy 70-100 segment highlighted */}
                      <div
                        className="absolute top-0 h-4 bg-green-500 rounded-sm"
                        style={{
                          left: `${band.bandStartPct}%`,
                          width: `${band.bandEndPct - band.bandStartPct}%`,
                        }}
                      />
                      {/* User marker */}
                      <div
                        className={`absolute top-1/2 h-6 w-6 rounded-full bg-white border-4 ${band.dot} shadow-lg -translate-y-1/2 -translate-x-1/2 transition-all duration-700`}
                        style={{ left: `${band.markerPct}%` }}
                        title={`Your MAP: ${result.map.toFixed(1)} mmHg`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400 mt-2 px-0.5">
                      <span className="text-red-500">Low &lt;70</span>
                      <span className="text-green-600">Normal 70-100</span>
                      <span className="text-orange-500">High &gt;100</span>
                    </div>
                  </div>
                );
              })()}

              {/* ── FEATURE 2: WHAT IT MEANS FOR ORGAN PERFUSION ──────────────── */}
              {(() => {
                const meaning = getPerfusionMeaning(result.map);
                return (
                  <div className="rounded-xl border bg-card p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-5 h-5 text-emerald-700" />
                      <h4 className="text-base font-bold text-slate-800">What This Means for Your Organs</h4>
                    </div>
                    <p className={`text-sm font-semibold ${meaning.accent}`}>{meaning.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      {meaning.body}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                      MAP reflects the average pressure driving blood to your vital organs across a full heartbeat. A MAP of at least ~65 mmHg is generally needed to perfuse them — too low risks hypoperfusion, too high risks vascular strain.
                    </p>
                  </div>
                );
              })()}

            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}