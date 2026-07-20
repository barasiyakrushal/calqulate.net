"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, RefreshCw, Loader2, Droplet, Clock, Utensils, CupSoda, Sun, Activity, ThermometerSun, Dumbbell, Sliders, GlassWater, Milk } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  units: z.enum(["metric", "imperial"]),
  gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
  weight: z.string().min(1, "Weight is required."),
  exerciseMinutes: z.string().min(1, "Daily exercise minutes are required. Enter 0 if none."),
  isHotClimate: z.boolean().default(false),
  pregnancyStatus: z.enum(["none", "pregnant", "lactating"]).default("none"),
  // OPTIONAL, non-breaking personalisation selectors
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]).default("sedentary"),
  climate: z.enum(["temperate", "warm", "hot"]).default("temperate"),
  wakingHours: z.string().default("16"),
});

// Optional activity multipliers applied to the weight-based base requirement.
const ACTIVITY_FACTORS: Record<string, { factor: number; label: string }> = {
  sedentary: { factor: 1.0, label: "Sedentary (mostly sitting)" },
  light: { factor: 1.05, label: "Lightly active" },
  moderate: { factor: 1.12, label: "Moderately active" },
  active: { factor: 1.2, label: "Very active / athlete" },
};

// Optional climate adjustments (added on top of the legacy hot-climate checkbox).
const CLIMATE_FACTORS: Record<string, { add: number; label: string }> = {
  temperate: { add: 0, label: "Temperate / mild" },
  warm: { add: 350, label: "Warm" },
  hot: { add: 600, label: "Hot / humid" },
};

type UnitSystem = "metric" | "imperial";

// --- RESULT TYPE INTERFACE ---
interface CalculationResult {
  totalMl: number;
  totalOz: number;
  fluidMl: number;
  fluidOz: number;
  foodMl: number;
  foodOz: number;
  glasses: number;
  hourlyOz: number;
  hourlyMl: number;
  // --- FEATURE 1: personalised adjustment breakdown ---
  baseMl: number;
  activityAddMl: number;
  climateAddMl: number;
  exerciseAddMl: number;
  conditionAddMl: number;
  activityLabel: string;
  climateLabel: string;
  // --- FEATURE 2: cups, bottles & schedule ---
  cups250: number;
  bottles500: number;
  wakingHours: number;
  schedule: { label: string; ml: number; cups: number }[];
}

// --- VISUAL COMPONENTS ---

const GlassesVisualizer = ({ count }: { count: number }) => {
  const roundedCount = Math.round(count);
  const maxDisplay = 16; 
  const displayCount = Math.min(roundedCount, maxDisplay);
  const hasMore = roundedCount > maxDisplay;

  return (
    <div className="mt-4">
      <p className="text-sm text-muted-foreground font-medium mb-3 text-center md:text-left">
        Equivalent to about <strong className="text-foreground text-lg">{roundedCount}</strong> standard 8oz (250ml) glasses per day:
      </p>
      <div className="flex flex-wrap justify-center md:justify-start gap-2">
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i} className="flex flex-col items-center animate-in fade-in zoom-in duration-500" style={{ animationDelay: `${i * 50}ms` }}>
            <CupSoda className="w-8 h-8 text-blue-500 fill-blue-100 dark:fill-blue-900/30" />
          </div>
        ))}
        {hasMore && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold">
            +{roundedCount - maxDisplay}
          </div>
        )}
      </div>
    </div>
  );
};

export default function DailyWaterIntakeCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: "metric",
      gender: "male",
      weight: "",
      exerciseMinutes: "0",
      isHotClimate: false,
      pregnancyStatus: "none",
      activityLevel: "sedentary",
      climate: "temperate",
      wakingHours: "16",
    },
  });

  const { getValues, setValue, watch } = form;
  const units = watch("units");
  const gender = watch("gender");

  // --- Unit Conversion Handler ---
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;
    
    const weightVal = getValues("weight");
    if (weightVal && !isNaN(parseNumber(weightVal))) {
      // 1 kg = 2.20462 lbs
      if (newUnit === "imperial") {
        setValue("weight", (parseNumber(weightVal) * 2.20462).toFixed(1));
      } else {
        setValue("weight", (parseNumber(weightVal) / 2.20462).toFixed(1));
      }
    }
    setValue("units", newUnit);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    setTimeout(() => {
      // 1. Normalize weight to kg
      let weightKg = parseNumber(values.weight);
      if (values.units === "imperial") {
        weightKg = weightKg / 2.20462;
      }

      // 2. Base Calculation (Standard clinical: 35ml per kg of body weight)
      // Cap weight at 150kg for linear scaling to prevent excessive recommendations
      const effectiveWeightKg = Math.min(weightKg, 150);
      const baseMl = effectiveWeightKg * 35;
      let totalRequirementMl = baseMl;

      // 2b. FEATURE 1 — Activity-level multiplier (optional, non-breaking).
      // Scales the weight-based base instead of relying on a generic rule.
      const activityInfo = ACTIVITY_FACTORS[values.activityLevel] ?? ACTIVITY_FACTORS.sedentary;
      const activityAddMl = baseMl * (activityInfo.factor - 1);
      totalRequirementMl += activityAddMl;

      // 3. Exercise adjustment: Add ~350ml (12oz) per 30 mins of exercise
      const exerciseMins = parseNumber(values.exerciseMinutes) || 0;
      const exerciseAddMl = (exerciseMins / 30) * 350;
      totalRequirementMl += exerciseAddMl;

      // 4. Climate adjustment.
      // Legacy hot-climate checkbox (+500ml) is preserved, plus the new optional
      // climate selector so the total reflects warm/hot conditions explicitly.
      let climateAddMl = 0;
      if (values.isHotClimate) {
        climateAddMl += 500;
      }
      const climateInfo = CLIMATE_FACTORS[values.climate] ?? CLIMATE_FACTORS.temperate;
      climateAddMl += climateInfo.add;
      totalRequirementMl += climateAddMl;

      // 5. Gender & Condition adjustment
      let conditionAddMl = 0;
      if (values.gender === "female") {
        if (values.pregnancyStatus === "pregnant") {
          conditionAddMl += 300;
        } else if (values.pregnancyStatus === "lactating") {
          conditionAddMl += 700;
        }
      }
      totalRequirementMl += conditionAddMl;

      // 6. Split into Drink vs Food (80% / 20% rule)
      const fluidMl = totalRequirementMl * 0.8;
      const foodMl = totalRequirementMl * 0.2;

      // 7. Calculate conversions
      const mlToOz = 0.033814;
      
      const totalOz = totalRequirementMl * mlToOz;
      const fluidOz = fluidMl * mlToOz;
      const foodOz = foodMl * mlToOz;
      
      // Standard glass = 8 oz or ~240ml
      const glasses = fluidMl / 240;

      // FEATURE 2 — present the drinking goal as cups (250ml) and bottles (500ml)
      const cups250 = fluidMl / 250;
      const bottles500 = fluidMl / 500;

      // Hourly calculation across the user's waking hours (defaults to 16)
      const wakingHoursParsed = parseInt(values.wakingHours, 10);
      const wakingHours = Math.min(20, Math.max(8, isNaN(wakingHoursParsed) ? 16 : wakingHoursParsed));
      const hourlyMl = fluidMl / wakingHours;
      const hourlyOz = fluidOz / wakingHours;

      // FEATURE 2 — build a simple, follow-along drinking schedule.
      // Spread the drinking goal across waking hours in a few practical blocks.
      const blocks = [
        { label: "Wake up", share: 0.12 },
        { label: "Mid-morning", share: 0.18 },
        { label: "Lunchtime", share: 0.2 },
        { label: "Afternoon", share: 0.2 },
        { label: "Evening", share: 0.18 },
        { label: "Before bed", share: 0.12 },
      ];
      const schedule = blocks.map((b) => {
        const ml = fluidMl * b.share;
        return { label: b.label, ml, cups: ml / 250 };
      });

      setResult({
        totalMl: totalRequirementMl,
        totalOz: totalOz,
        fluidMl: fluidMl,
        fluidOz: fluidOz,
        foodMl: foodMl,
        foodOz: foodOz,
        glasses: glasses,
        hourlyMl: hourlyMl,
        hourlyOz: hourlyOz,
        baseMl,
        activityAddMl,
        climateAddMl,
        exerciseAddMl,
        conditionAddMl,
        activityLabel: activityInfo.label,
        climateLabel: climateInfo.label,
        cups250,
        bottles500,
        wakingHours,
        schedule,
      });
      
      setIsLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 600); // slight delay for UX
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto border-blue-100 shadow-md" id="calculator">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-b rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Droplet className="w-6 h-6 fill-current" /> 
            Advanced Water Intake Calculator
          </CardTitle>
          <CardDescription>
            Get a medically aligned daily water requirement tailored to your body, activity, and climate.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Top Row: Units & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem className="bg-muted/30 p-4 rounded-lg border">
                      <FormLabel className="text-base font-semibold">Measurement System</FormLabel>
                      <RadioGroup
                        onValueChange={(value) => handleUnitChange(value as UnitSystem)}
                        value={field.value}
                        className="flex items-center space-x-6 pt-3"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="metric" /></FormControl>
                          <FormLabel className="font-medium cursor-pointer">Metric (kg, ml)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="imperial" /></FormControl>
                          <FormLabel className="font-medium cursor-pointer">Imperial (lbs, oz)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="bg-muted/30 p-4 rounded-lg border">
                      <FormLabel className="text-base font-semibold">Biological Sex</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex items-center space-x-6 pt-3"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="male" /></FormControl>
                          <FormLabel className="font-medium cursor-pointer">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="female" /></FormControl>
                          <FormLabel className="font-medium cursor-pointer">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </div>

              {/* Middle Row: Weight & Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Body Weight</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" step="0.1" placeholder={units === 'metric' ? "75" : "165"} className="pl-4 pr-12 text-lg" {...field} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            {units === 'metric' ? 'kg' : 'lbs'}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exerciseMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        <Link
                          href="/health/calories-burned-calculator"
                          className="hover:underline hover:text-green-700 transition-colors"
                        >
                          Daily Exercise Duration
                        </Link>
                      </FormLabel>
                      <FormControl>
                         <div className="relative">
                          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input type="number" placeholder="30" className="pl-9 pr-16 text-lg" {...field} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            mins
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">Estimate average daily sweat-inducing activity.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Bottom Row: Environment & Conditions */}
              <div className="bg-orange-50/50 dark:bg-orange-950/10 p-5 rounded-lg border border-orange-100 dark:border-orange-900/30 space-y-6">
                <h4 className="font-semibold text-orange-800 dark:text-orange-400 flex items-center gap-2">
                  <Sun className="w-5 h-5" /> Lifestyle Variables
                </h4>
                
                {/* FEATURE 1 — optional personalisation: activity level & climate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border bg-white dark:bg-background p-3">
                        <FormLabel className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                          <Dumbbell className="w-4 h-4" /> Activity Level
                        </FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="sedentary">Sedentary (mostly sitting)</option>
                            <option value="light">Lightly active</option>
                            <option value="moderate">Moderately active</option>
                            <option value="active">Very active / athlete</option>
                          </select>
                        </FormControl>
                        <p className="mt-1 text-xs text-muted-foreground">Optional — scales your base need by daily movement.</p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="climate"
                    render={({ field }) => (
                      <FormItem className="rounded-lg border bg-white dark:bg-background p-3">
                        <FormLabel className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                          <ThermometerSun className="w-4 h-4" /> Climate
                        </FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="temperate">Temperate / mild</option>
                            <option value="warm">Warm (+350 ml)</option>
                            <option value="hot">Hot / humid (+600 ml)</option>
                          </select>
                        </FormControl>
                        <p className="mt-1 text-xs text-muted-foreground">Optional — adds fluid for sweat loss in heat.</p>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="wakingHours"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border bg-white dark:bg-background p-3 md:max-w-xs">
                      <FormLabel className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
                        <Clock className="w-4 h-4" /> Waking Hours
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" min={8} max={20} placeholder="16" className="pr-14" {...field} />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">hrs</span>
                        </div>
                      </FormControl>
                      <p className="mt-1 text-xs text-muted-foreground">Optional — used to pace your hourly schedule.</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isHotClimate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer font-medium">I live in a hot or humid climate</FormLabel>
                        <p className="text-sm text-muted-foreground">Requires additional fluid intake to compensate for natural sweat.</p>
                      </div>
                    </FormItem>
                  )}
                />

                {gender === "female" && (
                  <FormField
                    control={form.control}
                    name="pregnancyStatus"
                    render={({ field }) => (
                      <FormItem className="pt-2 border-t border-orange-200/50 dark:border-orange-900/50">
                        <FormLabel className="font-medium mb-3 block">Pregnancy / Lactation Status</FormLabel>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col sm:flex-row gap-4">
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-white dark:bg-background px-3 py-2 border rounded-md">
                            <FormControl><RadioGroupItem value="none" /></FormControl>
                            <FormLabel className="cursor-pointer font-normal">None</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-white dark:bg-background px-3 py-2 border rounded-md">
                            <FormControl><RadioGroupItem value="pregnant" /></FormControl>
                            <FormLabel className="cursor-pointer font-normal">Pregnant</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0 bg-white dark:bg-background px-3 py-2 border rounded-md">
                            <FormControl><RadioGroupItem value="lactating" /></FormControl>
                            <FormLabel className="cursor-pointer font-normal">Breastfeeding</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Calculator className="h-5 w-5 mr-2" />}
                  {isLoading ? 'Calculating Hydration Needs...' : 'Calculate My Water Intake'}
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
          <div className="max-w-4xl mx-auto mt-10 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-center mb-6">Your Personalized Hydration Profile</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Main Goal Card */}
              <Card className="md:col-span-3 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg border-0 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Droplet className="w-48 h-48" />
                </div>
                <CardContent className="p-8 md:p-10 relative z-10 text-center">
                  <p className="text-blue-100 font-medium uppercase tracking-wider mb-2">Total Daily Water Requirement</p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-4">
                    <div className="text-center">
                      <span className="text-6xl font-extrabold block">{(result.totalMl / 1000).toFixed(1)} <span className="text-3xl font-medium">L</span></span>
                      <span className="text-blue-100 text-sm mt-1 block">({Math.round(result.totalMl)} ml)</span>
                    </div>
                    <div className="h-16 w-px bg-blue-400/50 hidden md:block"></div>
                    <div className="text-center">
                      <span className="text-6xl font-extrabold block">{Math.round(result.totalOz)} <span className="text-3xl font-medium">oz</span></span>
                      <span className="text-blue-100 text-sm mt-1 block">Ounces per day</span>
                    </div>
                  </div>
                  <p className="mt-6 text-blue-50 max-w-2xl mx-auto">
                    This is your absolute total required intake, but you don't need to drink all of it. See the 80/20 breakdown below.
                  </p>
                </CardContent>
              </Card>

              {/* The 80/20 Breakdown Cards */}
              <Card className="md:col-span-2 shadow-sm border-blue-100">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-4 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CupSoda className="w-5 h-5 text-blue-500" />
                    Actual Drinking Goal (80%)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      {(result.fluidMl / 1000).toFixed(1)} <span className="text-xl text-muted-foreground font-medium">L</span>
                    </div>
                    <div className="text-2xl font-semibold text-muted-foreground">
                      {Math.round(result.fluidOz)} <span className="text-base font-normal">oz</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This is the amount of water you should actively consume through drinking water, teas, or other fluids.
                  </p>
                  
                  <GlassesVisualizer count={result.glasses} />
                </CardContent>
              </Card>

              <Card className="shadow-sm border-emerald-100">
                <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 pb-4 border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-500" />
                    From Food (20%)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                    {Math.round(result.foodMl)} <span className="text-lg text-muted-foreground font-medium">ml</span>
                  </div>
                  <div className="text-lg font-semibold text-muted-foreground mb-4">
                    {Math.round(result.foodOz)} <span className="text-sm font-normal">oz</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Automatically absorbed through foods like fruits, vegetables, and soups in a standard diet.
                  </p>
                </CardContent>
              </Card>

              {/* Hourly Routine */}
              <Card className="md:col-span-3 border-dashed border-2 bg-muted/30">
                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold mb-2">Pace Yourself: Hourly Goal</h3>
                    <p className="text-muted-foreground mb-2">
                      To prevent bloating and ensure optimal absorption, spread your fluid intake evenly over a typical 16-hour waking day.
                    </p>
                    <p className="text-lg">
                      Drink roughly <strong className="text-blue-600 dark:text-blue-400">{Math.round(result.hourlyOz)} oz</strong> ({Math.round(result.hourlyMl)} ml) every hour across your {result.wakingHours} waking hours.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* FEATURE 1 — Personalised target breakdown (weight + activity + climate) */}
              <Card className="md:col-span-3 shadow-sm border-emerald-100">
                <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 pb-4 border-b">
                  <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Sliders className="w-5 h-5" />
                    How Your Target Was Personalised
                  </CardTitle>
                  <CardDescription>
                    Built from your weight, activity and climate — not a generic “8 glasses” rule.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {[
                    { label: "Base (35 ml × body weight)", icon: <Droplet className="w-4 h-4 text-blue-500" />, value: result.baseMl, note: "" },
                    { label: `Activity — ${result.activityLabel}`, icon: <Dumbbell className="w-4 h-4 text-emerald-600" />, value: result.activityAddMl, note: "" },
                    { label: `Climate — ${result.climateLabel}`, icon: <ThermometerSun className="w-4 h-4 text-orange-500" />, value: result.climateAddMl, note: "" },
                    { label: "Exercise sessions", icon: <Activity className="w-4 h-4 text-cyan-600" />, value: result.exerciseAddMl, note: "" },
                    { label: "Pregnancy / breastfeeding", icon: <Utensils className="w-4 h-4 text-pink-500" />, value: result.conditionAddMl, note: "" },
                  ]
                    .filter((row) => row.value > 0 || row.label.startsWith("Base"))
                    .map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-3 text-sm border-b last:border-0 border-dashed border-gray-100 dark:border-gray-800 pb-2 last:pb-0">
                        <span className="flex items-center gap-2 text-muted-foreground">{row.icon}{row.label}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {row.label.startsWith("Base") ? "" : "+"}{Math.round(row.value)} ml
                        </span>
                      </div>
                    ))}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Personalised daily total</span>
                    <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                      {Math.round(result.totalMl)} ml
                      <span className="text-sm font-medium text-muted-foreground"> ({(result.totalMl / 1000).toFixed(1)} L)</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* FEATURE 2 — Cups, bottles & follow-along drinking schedule */}
              <Card className="md:col-span-3 shadow-sm border-blue-100">
                <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 pb-4 border-b">
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <GlassWater className="w-5 h-5" />
                    Cups, Bottles & Your Drinking Schedule
                  </CardTitle>
                  <CardDescription>
                    Your {(result.fluidMl / 1000).toFixed(1)} L drinking goal made easy to follow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Cups & bottles summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-blue-50/40 dark:bg-blue-950/20 p-4 text-center">
                      <CupSoda className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                      <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{Math.round(result.cups250)}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">cups (250 ml each)</p>
                    </div>
                    <div className="rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/20 p-4 text-center">
                      <Milk className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                      <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">{result.bottles500.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">bottles (500 ml each)</p>
                    </div>
                  </div>

                  {/* Hourly / time-block schedule */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" /> Suggested schedule across the day
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {result.schedule.map((slot) => (
                        <div key={slot.label} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-background px-3 py-2.5">
                          <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{slot.label}</p>
                            <p className="text-xs text-muted-foreground">{Math.round(slot.cups)} cup{Math.round(slot.cups) === 1 ? "" : "s"}</p>
                          </div>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{Math.round(slot.ml)} ml</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Sip steadily — about {Math.round(result.hourlyMl)} ml every hour — rather than gulping large amounts at once.
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </>
  );
}