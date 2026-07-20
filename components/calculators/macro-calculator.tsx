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
import { Calculator, RefreshCw, Loader2, Info, Beef, Wheat, Droplets, Target, Flame, GlassWater, ChevronRight, UtensilsCrossed, TrendingDown, Scale, TrendingUp } from "lucide-react";
import { parseNumber } from "@/lib/utils"

// --- MACRO MATH HELPERS (additive) ---
// Build protein / fat / carb grams (rounded) for an arbitrary calorie target,
// reusing the same protein-first formula the main calculator uses.
function buildMacros(targetCalories: number, weightKg: number) {
  let proteinGrams = weightKg * 2.2;
  let fatGrams = weightKg * 0.8;
  let remainingCals = targetCalories - (proteinGrams * 4 + fatGrams * 9);
  if (remainingCals < 0) {
    proteinGrams = (targetCalories * 0.4) / 4;
    fatGrams = (targetCalories * 0.3) / 9;
    remainingCals = targetCalories * 0.3;
  }
  const carbGrams = remainingCals / 4;
  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinGrams),
    fats: Math.round(fatGrams),
    carbs: Math.round(carbGrams),
  };
}

// --- FORM SCHEMA ---
const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
  age: z.string().min(1, "Age is required"),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  activity: z.string(),
  goal: z.string(),
  units: z.enum(["metric", "imperial"]),
  knowBodyFat: z.enum(["yes", "no"]),
  bodyFat: z.string().optional(),
});

type UnitSystem = "metric" | "imperial";

// --- VISUAL COMPONENTS ---

// 1. Simple SVG Donut Chart
const MacroDonut = ({ protein, fats, carbs, total }: { protein: number, fats: number, carbs: number, total: number }) => {
    // Calculate percentages for the circle stroke
    const pPct = (protein * 4 / total) * 100;
    const fPct = (fats * 9 / total) * 100;
    const cPct = (carbs * 4 / total) * 100;
    
    // SVG Dash array math
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    
    return (
        <div className="relative w-40 h-40 mx-auto">
            <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="5" />
                {/* Protein (Blue) */}
                <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#3b82f6" strokeWidth="5" 
                    strokeDasharray={`${(pPct / 100) * circumference} ${circumference}`} />
                {/* Fats (Yellow) - Offset by Protein */}
                <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#eab308" strokeWidth="5" 
                    strokeDasharray={`${(fPct / 100) * circumference} ${circumference}`} 
                    strokeDashoffset={-((pPct / 100) * circumference)} />
                {/* Carbs (Orange) - Offset by Protein + Fats */}
                <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f97316" strokeWidth="5" 
                    strokeDasharray={`${(cPct / 100) * circumference} ${circumference}`} 
                    strokeDashoffset={-(((pPct + fPct) / 100) * circumference)} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-muted-foreground font-medium">Total</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white">{total}</span>
            </div>
        </div>
    )
}

// 2. Meal Planner Row
const MealRow = ({ label, cals, p, c, f }: any) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0 border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary font-bold text-xs w-12 text-center">{label}</div>
            <span className="font-semibold text-sm">{cals} kcal</span>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>{p}g</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>{c}g</span>
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>{f}g</span>
        </div>
    </div>
)

export default function MacroCalculator() {
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "female",
      age: "",
      height: "",
      weight: "",
      activity: "1.2",
      goal: "lose",
      units: "metric",
      knowBodyFat: "no",
      bodyFat: "",
    },
  });

  const { getValues, setValue, watch } = form;
  const units = watch("units");
  const knowBodyFat = watch("knowBodyFat");

  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;
    const weight = getValues("weight");
    const height = getValues("height");
    if (weight && !isNaN(parseNumber(weight))) {
        const val = parseNumber(weight);
        setValue("weight", (newUnit === 'metric' ? val / 2.20462 : val * 2.20462).toFixed(1));
    }
    if (height && !isNaN(parseNumber(height))) {
        const val = parseNumber(height);
        setValue("height", (newUnit === 'metric' ? val * 2.54 : val / 2.54).toFixed(1));
    }
    setValue("units", newUnit);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTimeout(() => {
      // Inputs
      const weightKg = values.units === 'metric' ? parseNumber(values.weight) : parseNumber(values.weight) / 2.20462;
      const heightCm = values.units === 'metric' ? parseNumber(values.height) : parseNumber(values.height) * 2.54;
      const age = parseNumber(values.age);
      const activityMultiplier = parseNumber(values.activity);
      
      // BMR Calculation
      let bmr = 0;
      if (values.knowBodyFat === 'yes' && values.bodyFat) {
        const lbm = weightKg * (1 - (parseNumber(values.bodyFat) / 100));
        bmr = 370 + (21.6 * lbm);
      } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (values.gender === 'male' ? 5 : -161);
      }

      // TDEE & Goal
      const tdee = bmr * activityMultiplier;
      let targetCalories = tdee;
      let goalText = "Maintenance";
      
      if (values.goal === 'lose') { targetCalories = tdee * 0.80; goalText = "Fat Loss"; }
      if (values.goal === 'gain') { targetCalories = tdee * 1.10; goalText = "Muscle Gain"; }

      // Macros
      let proteinGrams = weightKg * 2.2; 
      let fatGrams = weightKg * 0.8;
      const proteinCals = proteinGrams * 4;
      const fatCals = fatGrams * 9;
      let remainingCals = targetCalories - (proteinCals + fatCals);

      if (remainingCals < 0) {
        proteinGrams = (targetCalories * 0.4) / 4;
        fatGrams = (targetCalories * 0.3) / 9;
        remainingCals = targetCalories * 0.3;
      }
      const carbGrams = remainingCals / 4;
      
      // Water (approx 35ml per kg)
      const waterLitres = (weightKg * 0.035).toFixed(1);

      // --- Goal presets: cut / maintain / bulk recalculated together (FEATURE 2) ---
      const presets = [
        { key: "cut", label: "Cut", desc: "20% deficit", factor: 0.8, ...buildMacros(tdee * 0.8, weightKg) },
        { key: "maintain", label: "Maintain", desc: "TDEE", factor: 1.0, ...buildMacros(tdee, weightKg) },
        { key: "bulk", label: "Bulk", desc: "10% surplus", factor: 1.1, ...buildMacros(tdee * 1.1, weightKg) },
      ];
      const activePreset = values.goal === "lose" ? "cut" : values.goal === "gain" ? "bulk" : "maintain";

      setResult({
        calories: Math.round(targetCalories),
        protein: Math.round(proteinGrams),
        fats: Math.round(fatGrams),
        carbs: Math.round(carbGrams),
        goalType: goalText,
        water: waterLitres,
        weightKg,
        tdee: Math.round(tdee),
        presets,
        activePreset,
      });

      setIsLoading(false);
      setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }, 600);
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-md border-t-4 border-t-primary" id="calculator">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50">
          <CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" /> Macro Calculator</CardTitle>
          <CardDescription>Enter your metrics to calculate your optimal IIFYM split.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ... (Keep your existing Form Fields here for Gender, Units, Stats, Activity, Goal, and Body Fat) ... */}
                {/* COPY PASTE THE INPUT FIELDS FROM PREVIOUS CODE HERE TO KEEP IT CONCISE */}
                
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Gender</FormLabel><RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 transition-colors"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal cursor-pointer flex-1">Female</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 transition-colors"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal cursor-pointer flex-1">Male</FormLabel></FormItem></RadioGroup></FormItem>)} />
                <FormField control={form.control} name="units" render={({ field }) => (
                  <FormItem className="space-y-3"><FormLabel>Units</FormLabel><RadioGroup onValueChange={(val) => handleUnitChange(val as UnitSystem)} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 transition-colors"><FormControl><RadioGroupItem value="metric" /></FormControl><FormLabel className="font-normal cursor-pointer flex-1">Metric</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0 border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 transition-colors"><FormControl><RadioGroupItem value="imperial" /></FormControl><FormLabel className="font-normal cursor-pointer flex-1">Imperial</FormLabel></FormItem></RadioGroup></FormItem>)} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="25" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height ({units === 'metric' ? 'cm' : 'in'})</FormLabel><FormControl><Input type="number" placeholder={units === 'metric' ? "170" : "67"} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight ({units === 'metric' ? 'kg' : 'lbs'})</FormLabel><FormControl><Input type="number" placeholder={units === 'metric' ? "70" : "154"} {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="activity" render={({ field }) => (<FormItem><FormLabel>Activity Level</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger></FormControl><SelectContent><SelectItem value="1.2">Sedentary (Desk job)</SelectItem><SelectItem value="1.375">Light Activity (1-3 days/wk)</SelectItem><SelectItem value="1.55">Moderate Activity (3-5 days/wk)</SelectItem><SelectItem value="1.725">Very Active (6-7 days/wk)</SelectItem><SelectItem value="1.9">Extra Active (Physical job)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="goal" render={({ field }) => (<FormItem><FormLabel>Your Goal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your goal" /></SelectTrigger></FormControl><SelectContent><SelectItem value="lose">Lose Weight (Fat Loss)</SelectItem><SelectItem value="maintain">Maintain Weight</SelectItem><SelectItem value="gain">Gain Muscle (Bulking)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <FormField control={form.control} name="knowBodyFat" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <div className="flex items-center gap-2"><FormLabel className="text-base font-semibold">Body Fat %? <span className="text-xs font-normal text-muted-foreground">(optional)</span></FormLabel><Info className="w-4 h-4 text-muted-foreground" /></div>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center gap-4"><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" className="text-primary" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem></RadioGroup>
                    </FormItem>
                  )} />
                  {knowBodyFat === 'yes' && (<FormField control={form.control} name="bodyFat" render={({ field }) => (<FormItem className="animate-in fade-in slide-in-from-left-4 duration-300 w-full md:w-32"><FormLabel>Percentage</FormLabel><div className="relative"><FormControl><Input type="number" placeholder="15" className="pr-8" {...field} /></FormControl><span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span></div><FormMessage /></FormItem>)} />)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="flex-1 text-base h-12" size="lg" disabled={isLoading}>{isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}{isLoading ? 'Calculating...' : 'Calculate Macros'}</Button>
                <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setResult(null); }} className="flex-1 h-12" disabled={isLoading}><RefreshCw className="h-5 w-5 mr-2" /> Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- ENHANCED RESULTS DASHBOARD --- */}
      <div ref={resultsRef} className="scroll-mt-24">
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto mt-12 space-y-6">
            
            {/* Header Result */}
            <div className="text-center mb-8">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
                <Target className="w-4 h-4" /> Goal: {result.goalType}
              </div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Personal Macro Blueprint</h3>
              <p className="text-muted-foreground">Follow these daily targets to reach your goal effectively.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                
                {/* 1. Main Visual Card */}
                <Card className="md:col-span-2 border-primary/20 shadow-lg overflow-hidden">
                    <CardHeader className="pb-2 border-b bg-gray-50/50">
                        <CardTitle className="flex justify-between items-center text-lg">
                            <span>Daily Distribution</span>
                            <span className="text-sm font-normal text-muted-foreground flex items-center gap-1"><GlassWater className="w-4 h-4 text-blue-400" /> Water: <strong>{result.water}L</strong></span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            {/* Donut Chart */}
                            <div className="flex-shrink-0">
                                <MacroDonut protein={result.protein} fats={result.fats} carbs={result.carbs} total={result.calories} />
                            </div>

                            {/* Legend / Stats */}
                            <div className="flex-1 w-full space-y-4">
                                {/* Protein */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500 text-white rounded-md"><Beef className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Protein</p>
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{result.protein}g</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <p>Muscle Repair</p>
                                        <p>4 cal/g</p>
                                    </div>
                                </div>
                                
                                {/* Carbs */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500 text-white rounded-md"><Wheat className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Carbs</p>
                                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{result.carbs}g</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <p>Energy Fuel</p>
                                        <p>4 cal/g</p>
                                    </div>
                                </div>

                                {/* Fats */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-500 text-white rounded-md"><Droplets className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Fats</p>
                                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{result.fats}g</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-muted-foreground">
                                        <p>Hormone Health</p>
                                        <p>9 cal/g</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Meal Planner Card */}
                <Card className="h-full flex flex-col">
                    <CardHeader className="bg-gray-50/50 pb-2 border-b">
                        <CardTitle className="text-lg">Meal Planner</CardTitle>
                        <CardDescription>How to split your macros</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pt-4">
                        <Tabs defaultValue="4" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="3">3 Meals</TabsTrigger>
                                <TabsTrigger value="4">4 Meals</TabsTrigger>
                                <TabsTrigger value="5">5 Meals</TabsTrigger>
                            </TabsList>
                            
                            {/* 3 Meals Logic */}
                            <TabsContent value="3" className="space-y-1">
                                {[1, 2, 3].map((m) => (
                                    <MealRow key={m} label={`Meal ${m}`} 
                                        cals={Math.round(result.calories / 3)} 
                                        p={Math.round(result.protein / 3)} 
                                        c={Math.round(result.carbs / 3)} 
                                        f={Math.round(result.fats / 3)} 
                                    />
                                ))}
                            </TabsContent>

                            {/* 4 Meals Logic */}
                            <TabsContent value="4" className="space-y-1">
                                {[1, 2, 3, 4].map((m) => (
                                    <MealRow key={m} label={`Meal ${m}`} 
                                        cals={Math.round(result.calories / 4)} 
                                        p={Math.round(result.protein / 4)} 
                                        c={Math.round(result.carbs / 4)} 
                                        f={Math.round(result.fats / 4)} 
                                    />
                                ))}
                            </TabsContent>

                            {/* 5 Meals Logic */}
                            <TabsContent value="5" className="space-y-1">
                                {[1, 2, 3, 4, 5].map((m) => (
                                    <MealRow key={m} label={`Meal ${m}`} 
                                        cals={Math.round(result.calories / 5)} 
                                        p={Math.round(result.protein / 5)} 
                                        c={Math.round(result.carbs / 5)} 
                                        f={Math.round(result.fats / 5)} 
                                    />
                                ))}
                            </TabsContent>
                        </Tabs>
                        
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs text-muted-foreground text-center">
                            Tip: Consistency is more important than meal frequency. Choose what fits your schedule.
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FEATURE 1 — MACRO TARGETS PER MEAL (computed grams split across meals) */}
            <Card className="border shadow-md overflow-hidden">
              <CardHeader className="bg-emerald-50/60 dark:bg-emerald-900/10 pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                  <UtensilsCrossed className="w-5 h-5" /> Your Macro Targets Per Meal
                </CardTitle>
                <CardDescription className="text-sm">
                  Daily protein, carb and fat targets for your <strong>{result.goalType}</strong> goal, split into even meals so you know exactly what to put on each plate.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Daily totals strip */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 dark:bg-blue-900/20 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-blue-700 font-bold">Protein</p>
                    <p className="text-lg font-black text-blue-700">{result.protein}g</p>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-orange-50 dark:bg-orange-900/20 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-orange-700 font-bold">Carbs</p>
                    <p className="text-lg font-black text-orange-700">{result.carbs}g</p>
                  </div>
                  <div className="rounded-xl border border-yellow-100 bg-yellow-50 dark:bg-yellow-900/20 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-yellow-700 font-bold">Fats</p>
                    <p className="text-lg font-black text-yellow-700">{result.fats}g</p>
                  </div>
                </div>

                {[3, 4].map((meals) => (
                  <div key={meals} className="mb-5 last:mb-0">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Split across {meals} meals (per meal)
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">Per meal</th>
                            <th className="px-3 py-2 text-right font-semibold">Protein</th>
                            <th className="px-3 py-2 text-right font-semibold">Carbs</th>
                            <th className="px-3 py-2 text-right font-semibold">Fats</th>
                            <th className="px-3 py-2 text-right font-semibold">kcal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr className="bg-white dark:bg-transparent">
                            <td className="px-3 py-2.5 font-semibold text-emerald-700">Each meal</td>
                            <td className="px-3 py-2.5 text-right font-bold text-blue-700">{Math.round(result.protein / meals)}g</td>
                            <td className="px-3 py-2.5 text-right font-bold text-orange-700">{Math.round(result.carbs / meals)}g</td>
                            <td className="px-3 py-2.5 text-right font-bold text-yellow-700">{Math.round(result.fats / meals)}g</td>
                            <td className="px-3 py-2.5 text-right font-bold text-slate-700">{Math.round(result.calories / meals)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-1">
                  Targets are divided evenly — front-load protein around training if it suits your schedule better.
                </p>
              </CardContent>
            </Card>

            {/* FEATURE 2 — CUT / MAINTAIN / BULK PRESETS (calories + macros side by side) */}
            <Card className="border shadow-md overflow-hidden">
              <CardHeader className="bg-emerald-50/60 dark:bg-emerald-900/10 pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                  <Scale className="w-5 h-5" /> Compare Goal Presets
                </CardTitle>
                <CardDescription className="text-sm">
                  See how your calories <strong>and</strong> macros change across cut, maintain and bulk — all calculated from your TDEE of <strong>{result.tdee} kcal</strong>.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.presets.map((p: any) => {
                    const isActive = p.key === result.activePreset;
                    const Icon = p.key === "cut" ? TrendingDown : p.key === "bulk" ? TrendingUp : Scale;
                    return (
                      <div
                        key={p.key}
                        className={`rounded-2xl border p-4 transition-all ${
                          isActive
                            ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm ring-1 ring-emerald-200"
                            : "border-slate-200 bg-white dark:bg-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-slate-500"}`} />
                            <span className={`font-bold ${isActive ? "text-emerald-700" : "text-slate-700"}`}>{p.label}</span>
                          </div>
                          {isActive && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Your goal
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{p.calories}<span className="text-sm font-medium text-muted-foreground"> kcal</span></p>
                        <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>
                        <div className="space-y-1.5 text-sm border-t border-dashed border-slate-200 pt-3">
                          <div className="flex justify-between"><span className="text-slate-500">Protein</span><span className="font-bold text-blue-700">{p.protein}g</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Carbs</span><span className="font-bold text-orange-700">{p.carbs}g</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Fats</span><span className="font-bold text-yellow-700">{p.fats}g</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Protein stays high across every preset to protect muscle — only carbs and total calories shift with your goal.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}