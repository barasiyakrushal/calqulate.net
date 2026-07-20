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
import { Calculator, RefreshCw, Loader2, Flame, Utensils, TrendingUp, TrendingDown, Activity, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
  age: z.string().min(1, "Age is required"),
  weight: z.string().min(1, "Weight is required"),
  height: z.string().min(1, "Height is required"),
  activity: z.string({ required_error: "Please select an activity level" }),
  bodyFat: z.string().optional(),
  units: z.enum(["metric", "imperial"]),
});

type UnitSystem = "metric" | "imperial";

// --- RESULT INTERFACES ---
interface MacroSplit {
  protein: number;
  fats: number;
  carbs: number;
}

interface TDEEResult {
  bmr: number;
  tdee: number;
  bmi: number;
  formulaUsed: string;
  goals: {
    maintenance: { calories: number; macros: MacroSplit };
    cutting: { calories: number; macros: MacroSplit }; // Mild deficit
    bulking: { calories: number; macros: MacroSplit }; // Mild surplus
  };
  // FEATURE 1 — energy breakdown into BMR, movement/activity, and thermic effect of food
  breakdown: {
    bmr: number; // resting metabolism (kcal)
    activity: number; // movement / activity (kcal)
    tef: number; // thermic effect of food ~10% of intake (kcal)
    total: number; // bmr + activity + tef
    bmrPct: number;
    activityPct: number;
    tefPct: number;
  };
  // FEATURE 2 — calorie targets derived from the same TDEE
  targets: {
    cut: number; // -20%
    maintain: number; // maintenance
    bulk: number; // +12.5%
  };
}

// --- ACTIVITY LEVELS ---
const activityLevels = [
  { value: "1.2", label: "Sedentary (office job, little exercise)" },
  { value: "1.375", label: "Light Exercise (1-2 days/week)" },
  { value: "1.55", label: "Moderate Exercise (3-5 days/week)" },
  { value: "1.725", label: "Heavy Exercise (6-7 days/week)" },
  { value: "1.9", label: "Athlete (2x per day)" },
];

// --- HELPER COMPONENTS ---
const MacroCard = ({ label, value, unit = "g", colorClass }: { label: string; value: number; unit?: string; colorClass: string }) => (
  <div className="flex flex-col items-center p-3 bg-secondary/20 rounded-lg border border-border/50">
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    <span className={`text-xl font-bold ${colorClass}`}>{Math.round(value)}{unit}</span>
  </div>
);

const GoalSection = ({ title, calories, macros, icon: Icon, description }: { title: string; calories: number; macros: MacroSplit; icon: any; description: string }) => (
  <div className="space-y-4 animate-in fade-in zoom-in duration-300">
    <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <Icon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">{description}</p>
        <div className="py-4">
            <span className="text-5xl font-extrabold text-primary">{Math.round(calories)}</span>
            <span className="text-lg text-muted-foreground ml-2">kcal/day</span>
        </div>
    </div>
    
    <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto">
        <MacroCard label="Protein" value={macros.protein} colorClass="text-blue-600" />
        <MacroCard label="Fats" value={macros.fats} colorClass="text-yellow-600" />
        <MacroCard label="Carbs" value={macros.carbs} colorClass="text-green-600" />
    </div>
    <p className="text-center text-xs text-muted-foreground pt-2">Based on Moderate Carb (30/35/35) split</p>
  </div>
);

export default function TDEECalculator() {
  const [result, setResult] = useState<TDEEResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "female",
      units: "metric",
      activity: "1.2",
      age: "",
      weight: "",
      height: "",
      bodyFat: "",
    },
  });

  const { setValue, getValues, watch } = form;
  const units = watch("units");

  // Handle Unit Conversion (Keeping layout consistent with your other calc)
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;

    const weight = parseNumber(getValues("weight"));
    const height = parseNumber(getValues("height"));

    if (!isNaN(weight)) {
      setValue("weight", (newUnit === "metric" ? weight / 2.20462 : weight * 2.20462).toFixed(1));
    }
    if (!isNaN(height)) {
      setValue("height", (newUnit === "metric" ? height * 2.54 : height / 2.54).toFixed(1));
    }
    setValue("units", newUnit);
  };

  const calculateMacros = (calories: number) => {
    // 30% Protein, 35% Fat, 35% Carbs (Balanced Fitness Approach)
    return {
      protein: (calories * 0.3) / 4,
      fats: (calories * 0.35) / 9,
      carbs: (calories * 0.35) / 4,
    };
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
        let weightKg = parseNumber(values.weight);
        let heightCm = parseNumber(values.height);
        const age = parseNumber(values.age);
        const activityMultiplier = parseNumber(values.activity);
        const bodyFat = values.bodyFat ? parseNumber(values.bodyFat) : null;

        if (values.units === "imperial") {
            weightKg = weightKg * 0.453592;
            heightCm = heightCm * 2.54;
        }

        let bmr = 0;
        let formula = "Mifflin-St Jeor";

        // Katch-McArdle (If body fat is provided)
        if (bodyFat !== null && !isNaN(bodyFat)) {
            const leanBodyMass = weightKg * (1 - bodyFat / 100);
            bmr = 370 + (21.6 * leanBodyMass);
            formula = "Katch-McArdle";
        } else {
            // Mifflin-St Jeor
            if (values.gender === "male") {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
            } else {
                bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
            }
        }

        const tdee = bmr * activityMultiplier;

        // BMI Calculation
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);

        // FEATURE 1 — Split TDEE into its physiological components.
        // The thermic effect of food (TEF) is ~10% of calories eaten; at energy
        // balance intake ≈ TDEE, so TEF ≈ 10% of TDEE. BMR is the resting floor,
        // and the remainder is movement/activity (exercise + NEAT).
        const tef = tdee * 0.10;
        const activityKcal = Math.max(0, tdee - bmr - tef);
        const breakdownTotal = bmr + activityKcal + tef;
        const breakdown = {
            bmr: bmr,
            activity: activityKcal,
            tef: tef,
            total: breakdownTotal,
            bmrPct: (bmr / breakdownTotal) * 100,
            activityPct: (activityKcal / breakdownTotal) * 100,
            tefPct: (tef / breakdownTotal) * 100,
        };

        // FEATURE 2 — Calorie targets derived from the same TDEE result.
        const targets = {
            cut: tdee * 0.80,   // -20% for fat loss
            maintain: tdee,     // hold current weight
            bulk: tdee * 1.125, // +12.5% lean surplus
        };

        setResult({
            bmr: bmr,
            tdee: tdee,
            bmi: bmi,
            formulaUsed: formula,
            goals: {
                maintenance: { calories: tdee, macros: calculateMacros(tdee) },
                cutting: { calories: tdee - 500, macros: calculateMacros(tdee - 500) },
                bulking: { calories: tdee + 500, macros: calculateMacros(tdee + 500) },
            },
            breakdown,
            targets,
        });

        setIsLoading(false);
        setTimeout(() => { resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }, 600);
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-lg border-t-4 border-t-primary" id="calculator">
        <CardHeader className="bg-secondary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Activity className="w-6 h-6 text-primary" /> 
            TDEE Calculator
          </CardTitle>
          <CardDescription>
            Calculate your Total Daily Energy Expenditure to know exactly how many calories you need to burn fat or build muscle.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Gender & Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="gender" render={({ field }) => (
                   <FormItem>
                     <FormLabel>Gender</FormLabel>
                     <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer w-full hover:bg-secondary/50 ${field.value === 'female' ? 'border-primary bg-secondary/50' : ''}`}>
                             <RadioGroupItem value="female" id="r-female"/>
                             <FormLabel htmlFor="r-female" className="cursor-pointer w-full">Female</FormLabel>
                        </div>
                        <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer w-full hover:bg-secondary/50 ${field.value === 'male' ? 'border-primary bg-secondary/50' : ''}`}>
                             <RadioGroupItem value="male" id="r-male"/>
                             <FormLabel htmlFor="r-male" className="cursor-pointer w-full">Male</FormLabel>
                        </div>
                     </RadioGroup>
                   </FormItem>
                 )} />

                 <FormField control={form.control} name="units" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units</FormLabel>
                      <RadioGroup onValueChange={(val) => handleUnitChange(val as UnitSystem)} value={field.value} className="flex space-x-4">
                        <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer w-full hover:bg-secondary/50 ${field.value === 'metric' ? 'border-primary bg-secondary/50' : ''}`}>
                             <RadioGroupItem value="metric" id="r-metric"/>
                             <FormLabel htmlFor="r-metric" className="cursor-pointer w-full">Metric (kg/cm)</FormLabel>
                        </div>
                        <div className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer w-full hover:bg-secondary/50 ${field.value === 'imperial' ? 'border-primary bg-secondary/50' : ''}`}>
                             <RadioGroupItem value="imperial" id="r-imperial"/>
                             <FormLabel htmlFor="r-imperial" className="cursor-pointer w-full">Imperial (lbs/in)</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormItem>
                 )} />
              </div>

              {/* Physical Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" placeholder="25" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weight ({units === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder={units === 'metric' ? "70" : "154"} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Height ({units === 'metric' ? 'cm' : 'inches'})</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder={units === 'metric' ? "170" : "67"} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>

              {/* Activity & Body Fat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="activity" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Activity Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select activity level" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {activityLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="bodyFat" render={({ field }) => (
                    <FormItem>
                        <div className="flex items-center gap-2 mb-2">
                             <FormLabel className="mb-0">Body Fat % <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Entering body fat calculates using Katch-McArdle formula (more accurate for lean/muscular bodies).</p>
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        </div>
                        <div className="relative">
                            <FormControl><Input type="number" step="0.1" placeholder="15" className="pr-8" {...field} /></FormControl>
                            <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                        </div>
                    </FormItem>
                )} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1 text-lg h-12" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Flame className="h-5 w-5 mr-2" />}
                    Calculate TDEE
                </Button>
                <Button type="button" variant="outline" onClick={() => { form.reset(); setResult(null); }} className="flex-1 h-12" disabled={isLoading}>
                    <RefreshCw className="h-5 w-5 mr-2" /> Reset
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef} className="scroll-mt-24">
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 border-t-4 border-blue-500 shadow-xl overflow-hidden">
            <CardHeader className="text-center bg-secondary/20 pb-8">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Total Daily Energy Expenditure</p>
              <h2 className="text-6xl font-extrabold text-blue-600 my-2">{Math.round(result.tdee)}</h2>
              <p className="text-lg text-muted-foreground">Calories per day</p>
              
              <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> BMR: {Math.round(result.bmr)}</span>
                <span className="flex items-center gap-1"><Info className="w-4 h-4" /> BMI: {result.bmi.toFixed(1)}</span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
                <Tabs defaultValue="maintenance" className="w-full">
                    <TabsList className="w-full grid grid-cols-3 h-14 rounded-none bg-muted/50 p-1">
                        <TabsTrigger value="cutting" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:border-t-2 border-red-500 h-full">
                           Weight Loss
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-t-2 border-blue-500 h-full">
                           Maintenance
                        </TabsTrigger>
                        <TabsTrigger value="bulking" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-t-2 border-green-500 h-full">
                           Bulking
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-8">
                        <TabsContent value="maintenance">
                            <GoalSection 
                                title="Maintain Weight"
                                description="Eat this amount to maintain your current weight. This matches your daily energy expenditure."
                                calories={result.goals.maintenance.calories}
                                macros={result.goals.maintenance.macros}
                                icon={Utensils}
                            />
                        </TabsContent>
                        <TabsContent value="cutting">
                            <GoalSection 
                                title="Sustainable Weight Loss"
                                description="A 500 calorie deficit allows you to lose approx 1lb (0.5kg) per week while retaining muscle."
                                calories={result.goals.cutting.calories}
                                macros={result.goals.cutting.macros}
                                icon={TrendingDown}
                            />
                        </TabsContent>
                        <TabsContent value="bulking">
                            <GoalSection 
                                title="Lean Bulk"
                                description="A 500 calorie surplus provides the energy needed to build muscle tissue effectively."
                                calories={result.goals.bulking.calories}
                                macros={result.goals.bulking.macros}
                                icon={TrendingUp}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
          </Card>
        )}

        {/* FEATURE 1 — ENERGY EXPENDITURE BREAKDOWN ──────────────────────── */}
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
                <Flame className="w-5 h-5" /> Where Your Calories Go
              </CardTitle>
              <CardDescription className="text-sm">
                Your {Math.round(result.tdee)} kcal/day broken into resting metabolism (BMR), movement &amp; activity, and the energy your body uses to digest food (TEF, about 10%).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Stacked bar */}
              <div className="flex w-full h-7 rounded-full overflow-hidden border border-border/60">
                <div
                  className="bg-emerald-600 h-full"
                  style={{ width: `${result.breakdown.bmrPct}%` }}
                  title={`BMR ${Math.round(result.breakdown.bmrPct)}%`}
                />
                <div
                  className="bg-teal-400 h-full"
                  style={{ width: `${result.breakdown.activityPct}%` }}
                  title={`Activity ${Math.round(result.breakdown.activityPct)}%`}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${result.breakdown.tefPct}%` }}
                  title={`Digestion ${Math.round(result.breakdown.tefPct)}%`}
                />
              </div>

              {/* Labelled segments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border bg-emerald-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">Resting (BMR)</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-emerald-700">{Math.round(result.breakdown.bmr)} <span className="text-sm font-medium text-muted-foreground">kcal</span></p>
                  <p className="text-xs text-muted-foreground">{Math.round(result.breakdown.bmrPct)}% · energy to stay alive at rest</p>
                </div>
                <div className="rounded-xl border bg-teal-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-teal-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">Movement</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-teal-600">{Math.round(result.breakdown.activity)} <span className="text-sm font-medium text-muted-foreground">kcal</span></p>
                  <p className="text-xs text-muted-foreground">{Math.round(result.breakdown.activityPct)}% · exercise, steps &amp; daily activity</p>
                </div>
                <div className="rounded-xl border bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-amber-400 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">Digestion (TEF)</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-amber-600">{Math.round(result.breakdown.tef)} <span className="text-sm font-medium text-muted-foreground">kcal</span></p>
                  <p className="text-xs text-muted-foreground">{Math.round(result.breakdown.tefPct)}% · processing the food you eat</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                TEF is estimated at ~10% of intake (assuming intake near maintenance). Movement covers both planned exercise and unplanned daily activity (NEAT).
              </p>
            </CardContent>
          </Card>
        )}

        {/* FEATURE 2 — CUT / MAINTAIN / BULK CALORIE TARGETS ──────────────── */}
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-emerald-700">
                <Activity className="w-5 h-5" /> Your Calorie Targets
              </CardTitle>
              <CardDescription className="text-sm">
                Daily calorie goals calculated from your TDEE of {Math.round(result.tdee)} kcal — pick the one that matches your goal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600">
                    <TrendingDown className="w-4 h-4" /> Cut
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-red-600">{Math.round(result.targets.cut)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day · 20% deficit</p>
                  <p className="mt-2 text-xs text-muted-foreground">Lose fat steadily while protecting muscle.</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <Utensils className="w-4 h-4" /> Maintain
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-emerald-700">{Math.round(result.targets.maintain)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day · at TDEE</p>
                  <p className="mt-2 text-xs text-muted-foreground">Hold your current weight and body composition.</p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-600">
                    <TrendingUp className="w-4 h-4" /> Bulk
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-green-600">{Math.round(result.targets.bulk)}</p>
                  <p className="text-xs text-muted-foreground">kcal/day · 12.5% surplus</p>
                  <p className="mt-2 text-xs text-muted-foreground">Build muscle with a controlled lean surplus.</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground text-center">
                Treat these as starting points. Adjust by ~100 kcal after 2–3 weeks based on real-world results.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}