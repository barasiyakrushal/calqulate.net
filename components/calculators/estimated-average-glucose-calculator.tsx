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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RefreshCw, Loader2, Activity, Droplet, Info, HeartPulse, Target, TrendingDown } from "lucide-react";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  calculationMode: z.enum(["a1c_to_eag", "eag_to_a1c"]),
  inputValue: z.string().min(1, "Please enter a value."),
  glucoseUnit: z.enum(["mg/dl", "mmol/l"]),
}).superRefine((data, ctx) => {
  const val = parseNumber(data.inputValue);
  if (isNaN(val)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a valid number", path: ["inputValue"] });
    return;
  }
  
  if (data.calculationMode === "a1c_to_eag") {
    if (val < 4 || val > 20) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A1C generally falls between 4% and 20%", path: ["inputValue"] });
    }
  } else {
    if (data.glucoseUnit === "mg/dl" && (val < 50 || val > 600)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "eAG (mg/dL) should be between 50 and 600", path: ["inputValue"] });
    }
    if (data.glucoseUnit === "mmol/l" && (val < 2.5 || val > 35)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "eAG (mmol/L) should be between 2.5 and 35", path: ["inputValue"] });
    }
  }
});

type CalculationMode = "a1c_to_eag" | "eag_to_a1c";
type GlucoseUnit = "mg/dl" | "mmol/l";

// --- RESULT TYPE INTERFACE ---
interface CalculationResult {
  a1c: number;
  eagMgdl: number;
  eagMmol: number;
  category: "Normal" | "Prediabetes" | "Diabetes";
  colorClass: string;
  insights: string[];
}

// --- ADAG FORMULA HELPERS (additive features) ---
// eAG mg/dL = 28.7 * A1c - 46.7  (ADAG 2008 regression)
const a1cToEagMgdl = (a1c: number) => 28.7 * a1c - 46.7;
const mgdlToMmol = (mgdl: number) => mgdl / 18.015;

// The A1C goals most adults are guided toward.
const A1C_TARGETS = [7.0, 6.5];

interface A1cTargetRow {
  target: number;
  targetEagMgdl: number;
  targetEagMmol: number;
  a1cChange: number; // current A1C minus target (positive = needs to drop)
}

// --- VISUAL GAUGE COMPONENT ---
const BloodSugarGauge = ({ a1c }: { a1c: number }) => {
  // A1C Scale: Min 4.0, Max 14.0 for visualization
  const scaleMin = 4.0;
  const scaleMax = 12.0;
  const position = Math.max(0, Math.min(100, ((a1c - scaleMin) / (scaleMax - scaleMin)) * 100));

  let categoryLabel = "Normal";
  let pointerColor = "bg-green-500";
  
  if (a1c >= 6.5) {
    categoryLabel = "Diabetes";
    pointerColor = "bg-red-500";
  } else if (a1c >= 5.7) {
    categoryLabel = "Prediabetes";
    pointerColor = "bg-yellow-500";
  }

  return (
    <div className="w-full mt-6 mb-4">
      <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium px-1">
        <span>Normal</span>
        <span className="pr-12">Prediabetes</span>
        <span>Diabetes</span>
      </div>
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
        <div className="h-full bg-green-400" style={{ width: '31.5%' }}></div> {/* 4.0 to 5.7 (1.7/5.4 * 100) */}
        <div className="h-full bg-yellow-400" style={{ width: '13%' }}></div>  {/* 5.7 to 6.4 (0.7/5.4 * 100) */}
        <div className="h-full bg-red-400" style={{ width: '55.5%' }}></div>   {/* 6.4 to 12.0 */}
      </div>
      
      {/* Pointer Marker */}
      <div className="relative w-full h-4 -mt-4">
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center drop-shadow-md transition-all duration-700 ease-out"
          style={{ left: `${position}%` }}
        >
          <div className="w-1 h-6 bg-slate-800 rounded-full z-10"></div>
          <div className={`mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm whitespace-nowrap ${pointerColor}`}>
            {a1c.toFixed(1)}% ({categoryLabel})
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN CALCULATOR COMPONENT ---
export default function EstimatedAverageGlucoseCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMode: "a1c_to_eag",
      inputValue: "",
      glucoseUnit: "mg/dl",
    },
  });

  const mode = form.watch("calculationMode");
  const unit = form.watch("glucoseUnit");

  // Determine categories and insights
  const getInsights = (a1c: number): Pick<CalculationResult, "category" | "colorClass" | "insights"> => {
    if (a1c < 5.7) {
      return {
        category: "Normal",
        colorClass: "text-green-600",
        insights: [
          "Your estimated average glucose is within the normal, healthy range.",
          "Maintain your current balanced diet and regular exercise routine.",
          "Continue routine checkups with your doctor as recommended."
        ]
      };
    } else if (a1c >= 5.7 && a1c <= 6.4) {
      return {
        category: "Prediabetes",
        colorClass: "text-yellow-600",
        insights: [
          "Your levels indicate Prediabetes. This is a crucial window for preventive action.",
          "Consider adopting a diet lower in refined carbohydrates and sugars.",
          "Aim for at least 150 minutes of moderate exercise per week to improve insulin sensitivity.",
          "Consult your healthcare provider about monitoring strategies."
        ]
      };
    } else {
      return {
        category: "Diabetes",
        colorClass: "text-red-600",
        insights: [
          "Your levels fall within the Diabetes range.",
          "An A1C of < 7.0% is a common target for non-pregnant adults, but your personal target may vary.",
          "Ensure you are following your prescribed medication and dietary plan.",
          "Regular self-monitoring of daily blood sugar can help you understand your patterns.",
          "Please discuss these results with your endocrinologist or primary care doctor."
        ]
      };
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
      const input = parseNumber(values.inputValue);
      let calcA1c = 0;
      let calcMgdl = 0;
      let calcMmol = 0;

      if (values.calculationMode === "a1c_to_eag") {
        calcA1c = input;
        calcMgdl = (28.7 * calcA1c) - 46.7;
        calcMmol = calcMgdl / 18.015; // standard conversion
      } else {
        if (values.glucoseUnit === "mg/dl") {
          calcMgdl = input;
          calcA1c = (calcMgdl + 46.7) / 28.7;
          calcMmol = calcMgdl / 18.015;
        } else {
          calcMmol = input;
          calcMgdl = calcMmol * 18.015;
          calcA1c = (calcMgdl + 46.7) / 28.7;
        }
      }

      const { category, colorClass, insights } = getInsights(calcA1c);

      setResult({
        a1c: calcA1c,
        eagMgdl: calcMgdl,
        eagMmol: calcMmol,
        category,
        colorClass,
        insights
      });
      
      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }, 600);
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-md" id="calculator">
        <CardHeader className="bg-slate-50 border-b rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" /> 
            Estimated Average Glucose Calculator
          </CardTitle>
          <CardDescription>
            Convert between HbA1c and daily average blood glucose levels accurately.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="calculationMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-semibold">What do you want to calculate?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val) => {
                          field.onChange(val);
                          form.setValue("inputValue", "");
                        }}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="a1c_to_eag" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer">
                            <span className="font-semibold text-lg">A1C to eAG</span>
                            <span className="text-sm text-muted-foreground mt-1 text-center">I know my A1C percentage</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="eag_to_a1c" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer">
                            <span className="font-semibold text-lg">eAG to A1C</span>
                            <span className="text-sm text-muted-foreground mt-1 text-center">I know my average glucose</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="inputValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {mode === "a1c_to_eag" ? "Your A1C Value (%)" : "Your Average Glucose Level"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input 
                            type="number" 
                            step="0.1" 
                            placeholder={mode === "a1c_to_eag" ? "e.g. 6.5" : "e.g. 140"} 
                            className="text-lg pl-4 pr-16 h-12"
                            {...field} 
                          />
                          {mode === "a1c_to_eag" && (
                             <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground font-medium">
                               %
                             </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="glucoseUnit"
                  render={({ field }) => (
                    <FormItem className={mode === "a1c_to_eag" ? "opacity-50 pointer-events-none" : ""}>
                      <FormLabel>
                        {mode === "a1c_to_eag" ? "Output Unit Preference" : "Glucose Unit"}
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={mode === "a1c_to_eag"} 
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mg/dl">mg/dL (US Standard)</SelectItem>
                          <SelectItem value="mmol/l">mmol/L (UK/Global Standard)</SelectItem>
                        </SelectContent>
                      </Select>
                      {mode === "a1c_to_eag" && (
                         <p className="text-xs text-muted-foreground mt-1">
                           Calculates both units automatically.
                         </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate Results'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 text-lg" 
                  onClick={() => { form.reset(); setResult(null); }} 
                  disabled={isLoading}
                >
                  <RefreshCw className="h-5 w-5 mr-2" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef}>
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 border-blue-100 shadow-lg overflow-hidden">
            <div className={`h-2 w-full ${result.colorClass.replace('text-', 'bg-')}`}></div>
            <CardContent className="p-6 md:p-8 space-y-8">
              
              <div className="text-center">
                <p className="text-sm font-semibold text-muted-foreground tracking-wider uppercase mb-2">
                  Health Diagnostic Category
                </p>
                <div className="inline-flex items-center justify-center space-x-2 bg-gray-50 px-6 py-2 rounded-full border">
                   <div className={`w-3 h-3 rounded-full ${result.colorClass.replace('text-', 'bg-')} animate-pulse`}></div>
                   <h2 className={`text-2xl font-bold ${result.colorClass}`}>
                     {result.category}
                   </h2>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 items-center border-t border-b py-8">
                <div className="text-center md:border-r border-gray-100 px-4">
                  <p className="text-sm text-muted-foreground font-medium mb-1">HbA1c Level</p>
                  <p className="text-5xl font-extrabold text-slate-800">{result.a1c.toFixed(1)}<span className="text-2xl text-slate-500 ml-1">%</span></p>
                </div>
                
                <div className="text-center md:border-r border-gray-100 px-4">
                  <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center justify-center gap-1">
                    <Droplet className="w-4 h-4 text-blue-500" /> eAG (US Standard)
                  </p>
                  <p className="text-5xl font-extrabold text-slate-800">{Math.round(result.eagMgdl)}<span className="text-xl text-slate-500 ml-1 block mt-2 font-normal">mg/dL</span></p>
                </div>

                <div className="text-center px-4">
                  <p className="text-sm text-muted-foreground font-medium mb-1 flex items-center justify-center gap-1">
                    <Droplet className="w-4 h-4 text-blue-500" /> eAG (Global)
                  </p>
                  <p className="text-5xl font-extrabold text-slate-800">{result.eagMmol.toFixed(1)}<span className="text-xl text-slate-500 ml-1 block mt-2 font-normal">mmol/L</span></p>
                </div>
              </div>

              {/* Graphical representation */}
              <div className="max-w-2xl mx-auto pt-2">
                 <h3 className="text-center text-sm font-semibold mb-6 flex items-center justify-center gap-2">
                   <Activity className="w-4 h-4" /> A1C Risk Spectrum
                 </h3>
                 <BloodSugarGauge a1c={result.a1c} />
              </div>

              <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 mt-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-slate-800">
                  <HeartPulse className="w-5 h-5 text-blue-600" /> Actionable Insights
                </h3>
                <ul className="space-y-3">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 bg-blue-100 p-1 rounded-full shrink-0">
                        <Info className="w-3 h-3 text-blue-700" />
                      </div>
                      <span className="text-slate-700 leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FEATURE 1 — Everyday eAG in both units (ADAG formula) */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-emerald-700">
                  <Droplet className="w-5 h-5 text-emerald-600" /> Your Everyday Average Glucose
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Your HbA1c of <strong>{result.a1c.toFixed(1)}%</strong> converts to this estimated average
                  glucose using the recognised ADAG formula (eAG = 28.7 &times; A1c &minus; 46.7), shown in both
                  everyday units.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-100 bg-white p-5 text-center">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                      mg/dL (US standard)
                    </p>
                    <p className="text-4xl font-extrabold text-emerald-700">
                      {Math.round(a1cToEagMgdl(result.a1c))}
                      <span className="text-base font-normal text-slate-500 ml-1">mg/dL</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white p-5 text-center">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                      mmol/L (UK / global)
                    </p>
                    <p className="text-4xl font-extrabold text-emerald-700">
                      {mgdlToMmol(a1cToEagMgdl(result.a1c)).toFixed(1)}
                      <span className="text-base font-normal text-slate-500 ml-1">mmol/L</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This is the average sugar level your meter would show day to day, not a single reading. It is an
                  estimate for understanding, not a diagnosis.
                </p>
              </div>

              {/* FEATURE 2 — A1C change needed to reach a target average glucose */}
              <div className="rounded-xl border border-emerald-100 bg-white p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-1 text-emerald-700">
                  <Target className="w-5 h-5 text-emerald-600" /> What It Takes to Reach a Target
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Common A1C goals for many adults are 7% and 6.5%. Here is the A1C change needed from your current{" "}
                  <strong>{result.a1c.toFixed(1)}%</strong> and the everyday average glucose each target represents.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {A1C_TARGETS.map((target) => {
                    const row: A1cTargetRow = {
                      target,
                      targetEagMgdl: a1cToEagMgdl(target),
                      targetEagMmol: mgdlToMmol(a1cToEagMgdl(target)),
                      a1cChange: result.a1c - target,
                    };
                    const atOrBelow = row.a1cChange <= 0.05;
                    return (
                      <div key={target} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-slate-700">Target A1C {target.toFixed(1)}%</span>
                          {atOrBelow ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <TrendingDown className="w-3.5 h-3.5" /> Reached
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <TrendingDown className="w-3.5 h-3.5" /> Lower A1C
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700">
                          {atOrBelow ? (
                            <>You are already at or below this target.</>
                          ) : (
                            <>
                              Reduce A1C by{" "}
                              <strong className="text-emerald-700">{row.a1cChange.toFixed(1)} points</strong>.
                            </>
                          )}
                        </p>
                        <div className="mt-3 pt-3 border-t border-emerald-100 text-sm text-slate-600">
                          Resulting eAG:{" "}
                          <strong className="text-slate-800">{Math.round(row.targetEagMgdl)} mg/dL</strong>{" "}
                          <span className="text-slate-400">/</span>{" "}
                          <strong className="text-slate-800">{row.targetEagMmol.toFixed(1)} mmol/L</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Targets are general references only. Your personal A1C goal should be set with your healthcare
                  provider.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}