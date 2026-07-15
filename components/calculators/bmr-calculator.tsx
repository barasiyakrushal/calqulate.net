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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, RefreshCw, Loader2, Flame, Info } from "lucide-react";

// --- FORM SCHEMA ---
const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
  age: z.string().min(1, "Age is required."),
  weight: z.string().min(1, "Weight is required."),
  height: z.string().min(1, "Height is required."),
  units: z.enum(["metric", "imperial"]),
  formula: z.enum(["mifflin", "harris", "katch"]),
  bodyFat: z.string().optional(),
  activityLevel: z.string({ required_error: "Please select an activity level." }),
}).superRefine((data, ctx) => {
  if (data.formula === "katch" && (!data.bodyFat || parseFloat(data.bodyFat) <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Body Fat % is required for the Katch-McArdle formula.",
      path: ["bodyFat"],
    });
  }
});

type UnitSystem = "metric" | "imperial";

interface CalculationResult {
  bmr: number;
  tdee: number;
  activityLevel: string;
  mifflinBmr: number;
  harrisBmr: number;
  activityCalories: { label: string; multiplier: number; value: number }[];
}

// Activity Multipliers
const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (little or no exercise)", multiplier: 1.2 },
  { value: "light", label: "Lightly active (exercise 1-3 days/week)", multiplier: 1.375 },
  { value: "moderate", label: "Moderately active (exercise 3-5 days/week)", multiplier: 1.55 },
  { value: "active", label: "Very active (hard exercise 6-7 days/week)", multiplier: 1.725 },
  { value: "extreme", label: "Extra active (very hard exercise and physical job)", multiplier: 1.9 },
];

export default function BMRCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "male",
      units: "metric",
      formula: "mifflin",
      activityLevel: "moderate",
      age: "",
      weight: "",
      height: "",
      bodyFat: "",
    },
  });

  const { getValues, setValue, watch } = form;
  const units = watch("units");
  const formula = watch("formula");

  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;

    const weightVal = parseFloat(getValues("weight"));
    const heightVal = parseFloat(getValues("height"));

    if (newUnit === "imperial") {
      if (!isNaN(weightVal)) setValue("weight", (weightVal * 2.20462).toFixed(1));
      if (!isNaN(heightVal)) setValue("height", (heightVal / 2.54).toFixed(1));
    } else {
      if (!isNaN(weightVal)) setValue("weight", (weightVal / 2.20462).toFixed(1));
      if (!isNaN(heightVal)) setValue("height", (heightVal * 2.54).toFixed(1));
    }
    setValue("units", newUnit);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    setTimeout(() => {
      const weightKg = values.units === "imperial" ? parseFloat(values.weight) / 2.20462 : parseFloat(values.weight);
      const heightCm = values.units === "imperial" ? parseFloat(values.height) * 2.54 : parseFloat(values.height);
      const age = parseInt(values.age);
      const bodyFat = values.bodyFat ? parseFloat(values.bodyFat) : 0;

      let calculatedBMR = 0;

      if (values.formula === "mifflin") {
        calculatedBMR = values.gender === "male"
          ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
          : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
      } else if (values.formula === "harris") {
        calculatedBMR = values.gender === "male"
          ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
          : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
      } else if (values.formula === "katch") {
        const leanBodyMass = weightKg * (1 - (bodyFat / 100));
        calculatedBMR = 370 + (21.6 * leanBodyMass);
      }

      const activeLevelData = ACTIVITY_LEVELS.find(l => l.value === values.activityLevel);
      const activeMultiplier = activeLevelData ? activeLevelData.multiplier : 1.2;
      const tdee = calculatedBMR * activeMultiplier;

      // Both gold-standard formulas on the same inputs, for comparison
      const mifflinBmr = values.gender === "male"
        ? (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5
        : (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
      const harrisBmr = values.gender === "male"
        ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
        : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);

      const activityCalories = ACTIVITY_LEVELS.map(level => ({
        label: level.label,
        multiplier: level.multiplier,
        value: Math.round(calculatedBMR * level.multiplier),
      }));

      setResult({
        bmr: Math.round(calculatedBMR),
        tdee: Math.round(tdee),
        activityLevel: activeLevelData?.label || "Sedentary",
        mifflinBmr: Math.round(mifflinBmr),
        harrisBmr: Math.round(harrisBmr),
        activityCalories,
      });

      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: "smooth" }); }, 100);
    }, 500);
  }

  // Neutral macro card
  const MacroCard = ({ protein, fats, carbs }: { protein: number; fats: number; carbs: number }) => (
    <div className="mt-6 grid grid-cols-3 gap-3">
      {[
        { k: "Protein", g: protein, c: protein * 4 },
        { k: "Fats", g: fats, c: fats * 9 },
        { k: "Carbs", g: carbs, c: carbs * 4 },
      ].map((m) => (
        <div key={m.k} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{m.k}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{m.g}g</p>
          <p className="text-xs text-slate-400">{m.c} kcal</p>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ── CALCULATOR ─────────────────────────────────────────────────────────── */}
      <Card className="mx-auto max-w-3xl border-t-4 border-t-emerald-600 shadow-sm" id="calculator">
        <CardHeader className="border-b pb-6">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-emerald-700" />
            Calculate your BMR and TDEE
          </CardTitle>
          <CardDescription>
            Enter your details to get your basal metabolic rate and daily calorie needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 rounded-lg border bg-slate-50 p-4 md:grid-cols-2">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sex</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-6 pt-2">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="male" /></FormControl>
                        <FormLabel className="cursor-pointer font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="female" /></FormControl>
                        <FormLabel className="cursor-pointer font-normal">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />
                <FormField control={form.control} name="units" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Units</FormLabel>
                    <RadioGroup onValueChange={(value) => handleUnitChange(value as UnitSystem)} value={field.value} className="flex items-center space-x-6 pt-2">
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="metric" /></FormControl>
                        <FormLabel className="cursor-pointer font-normal">Metric (kg, cm)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="imperial" /></FormControl>
                        <FormLabel className="cursor-pointer font-normal">Imperial (lbs, in)</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age (years)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g. 30" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight {units === "metric" ? "(kg)" : "(lbs)"}</FormLabel>
                    <FormControl><Input type="number" step="0.1" placeholder={units === "metric" ? "75" : "165"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height {units === "metric" ? "(cm)" : "(inches)"}</FormLabel>
                    <FormControl><Input type="number" step="0.1" placeholder={units === "metric" ? "175" : "69"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 gap-6 rounded-lg border bg-slate-50 p-4 md:grid-cols-2">
                <div className="space-y-6">
                  <FormField control={form.control} name="formula" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">Formula <Info className="h-3 w-3 text-slate-400" /></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a formula" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mifflin">Mifflin-St Jeor (default)</SelectItem>
                          <SelectItem value="harris">Harris-Benedict (revised)</SelectItem>
                          <SelectItem value="katch">Katch-McArdle (needs body fat)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {formula === "katch" && (
                    <FormField control={form.control} name="bodyFat" render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2">
                        <FormLabel>Body fat %</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder="e.g. 15" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </div>

                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-auto py-3"><SelectValue placeholder="Select activity level" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Button type="submit" className="h-12 flex-1 bg-emerald-700 text-white hover:bg-emerald-800" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Calculator className="mr-2 h-5 w-5" />}
                  {isLoading ? "Calculating..." : "Calculate my BMR"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setResult(null); }} className="h-12 sm:w-40" disabled={isLoading}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── UNDERSTAND YOUR RESULT ──────────────────────────────────────────────── */}
      <div ref={resultsRef}>
        {result && (
          <div className="mx-auto mt-8 max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Understand your result</h2>
              <p className="mt-1 text-sm text-slate-500">Your BMR, and what to eat for each goal.</p>
            </div>

            {/* BMR headline + goal calories */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="col-span-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center lg:col-span-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your BMR</p>
                <p className="mt-1 text-3xl font-bold text-emerald-700">{result.bmr.toLocaleString()}</p>
                <p className="text-xs text-slate-400">kcal/day at rest</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Maintenance</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{result.tdee.toLocaleString()}</p>
                <p className="text-xs text-slate-400">kcal/day</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weight loss</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{(result.tdee - 500).toLocaleString()}</p>
                <p className="text-xs text-slate-400">500 kcal deficit</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Muscle gain</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{(result.tdee + 300).toLocaleString()}</p>
                <p className="text-xs text-slate-400">300 kcal surplus</p>
              </div>
            </div>

            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700">
              Your BMR of <strong>{result.bmr.toLocaleString()} kcal</strong> is the energy your body burns at complete
              rest. Your maintenance calories (TDEE) of <strong>{result.tdee.toLocaleString()} kcal</strong> include your
              daily activity. Eat 300 to 500 kcal below maintenance to lose fat, and never eat below your BMR.
            </p>

            {/* Daily calories by activity level */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold text-slate-900">Daily calories by activity level</h3>
              <p className="mt-1 text-sm text-slate-500">Maintenance calories for every lifestyle.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {result.activityCalories.map((item, i) => {
                  const isCurrent = item.label === result.activityLevel;
                  return (
                    <div key={i} className={`rounded-xl border p-4 ${isCurrent ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                      <p className="text-xs font-semibold text-slate-600">{item.label.split("(")[0].trim()}</p>
                      <p className="text-[11px] text-slate-400">x {item.multiplier}</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{item.value.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">kcal/day</p>
                      {isCurrent && <p className="mt-1 text-[11px] font-semibold text-emerald-700">Your selected level</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two formulas side by side */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold text-slate-900">Mifflin-St Jeor vs Harris-Benedict</h3>
              <p className="mt-1 text-sm text-slate-500">The same inputs through both gold-standard formulas.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Mifflin-St Jeor</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{result.mifflinBmr.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">kcal/day</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Harris-Benedict</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{result.harrisBmr.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">kcal/day</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                The two differ by about{" "}
                <strong>{Math.abs(result.mifflinBmr - result.harrisBmr).toLocaleString()} kcal/day</strong>. Both are
                estimates with a margin of roughly 10%. Mifflin-St Jeor is the recommended default for modern adults.
              </p>
            </div>

            {/* Macro planner */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-6 text-center">
                <h3 className="text-lg font-bold text-slate-900">Calorie and macro planner</h3>
                <p className="mt-1 text-sm text-slate-500">Based on your maintenance of {result.tdee.toLocaleString()} kcal</p>
              </div>
              <Tabs defaultValue="cut" className="w-full">
                <TabsList className="grid h-14 w-full grid-cols-3 rounded-none bg-slate-50">
                  <TabsTrigger value="cut" className="h-full rounded-none data-[state=active]:bg-white">Weight loss</TabsTrigger>
                  <TabsTrigger value="maintain" className="h-full rounded-none data-[state=active]:bg-white">Maintenance</TabsTrigger>
                  <TabsTrigger value="bulk" className="h-full rounded-none data-[state=active]:bg-white">Muscle gain</TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <TabsContent value="cut" className="mt-0 animate-in fade-in">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-slate-900">{(result.tdee - 500).toLocaleString()} <span className="text-lg font-normal text-slate-400">kcal/day</span></p>
                      <p className="mt-2 text-sm text-slate-500">A 500 kcal deficit, about 0.5 kg of fat loss per week.</p>
                    </div>
                    <MacroCard
                      protein={Math.round(((result.tdee - 500) * 0.4) / 4)}
                      fats={Math.round(((result.tdee - 500) * 0.3) / 9)}
                      carbs={Math.round(((result.tdee - 500) * 0.3) / 4)}
                    />
                  </TabsContent>
                  <TabsContent value="maintain" className="mt-0 animate-in fade-in">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-slate-900">{result.tdee.toLocaleString()} <span className="text-lg font-normal text-slate-400">kcal/day</span></p>
                      <p className="mt-2 text-sm text-slate-500">Eat what you burn. Good for body recomposition.</p>
                    </div>
                    <MacroCard
                      protein={Math.round((result.tdee * 0.3) / 4)}
                      fats={Math.round((result.tdee * 0.3) / 9)}
                      carbs={Math.round((result.tdee * 0.4) / 4)}
                    />
                  </TabsContent>
                  <TabsContent value="bulk" className="mt-0 animate-in fade-in">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-slate-900">{(result.tdee + 300).toLocaleString()} <span className="text-lg font-normal text-slate-400">kcal/day</span></p>
                      <p className="mt-2 text-sm text-slate-500">A 300 kcal surplus to build lean muscle with minimal fat gain.</p>
                    </div>
                    <MacroCard
                      protein={Math.round(((result.tdee + 300) * 0.3) / 4)}
                      fats={Math.round(((result.tdee + 300) * 0.25) / 9)}
                      carbs={Math.round(((result.tdee + 300) * 0.45) / 4)}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
