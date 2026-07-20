"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { parseNumber } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  RefreshCw,
  Loader2,
  Baby,
  Scale,
  TrendingUp,
  Info,
  Table as TableIcon,
  Target,
  CalendarClock,
  PieChart,
} from "lucide-react";

// --- TYPES & CONSTANTS ---
type UnitSystem = "metric" | "imperial";

// IOM Guidelines Data
const GUIDELINES = {
  underweight: { min: 12.5, max: 18.0, label: "Underweight (BMI < 18.5)" }, // kg
  normal: { min: 11.5, max: 16.0, label: "Normal Weight (BMI 18.5–24.9)" },
  overweight: { min: 7.0, max: 11.5, label: "Overweight (BMI 25.0–29.9)" },
  obese: { min: 5.0, max: 9.0, label: "Obese (BMI ≥ 30.0)" },
  twins_normal: { min: 17, max: 25, label: "Twins (Normal BMI)" },
  twins_overweight: { min: 14, max: 23, label: "Twins (Overweight BMI)" },
  twins_obese: { min: 11, max: 19, label: "Twins (Obese BMI)" },
};

const formSchema = z.object({
  units: z.enum(["metric", "imperial"]),
  pregnancyType: z.enum(["single", "twins"]),
  currentWeek: z.string().refine((val) => {
    const n = parseInt(val);
    return !isNaN(n) && n >= 0 && n <= 40;
  }, "Week must be between 0 and 40"),
  height: z.string().min(1, "Height is required"), // stored as cm or ft.in (5.10)
  weightBefore: z.string().min(1, "Pre-pregnancy weight is required"),
  weightCurrent: z.string().optional(), // Optional: to track current progress
});

// --- CHART COMPONENT ---
const WeightGainChart = ({
  data,
  currentWeek,
  currentWeightGain,
  units,
}: {
  data: { week: number; min: number; max: number }[];
  currentWeek: number;
  currentWeightGain: number | null;
  units: UnitSystem;
}) => {
  // Simple responsive SVG Line Chart
  const width = 100; // viewBox units
  const height = 50;
  const padding = 10;
  
  const maxWeek = 40;
  const maxWeight = Math.max(...data.map((d) => d.max)) * 1.1; // Add 10% headroom

  const getX = (week: number) => padding + (week / maxWeek) * (width - padding * 2);
  const getY = (weight: number) => height - padding - (weight / maxWeight) * (height - padding * 2);

  const minPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.week)},${getY(d.min)}`).join(" ");
  const maxPath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.week)},${getY(d.max)}`).join(" ");
  
  // Create area shape
  const areaPath = `
    ${maxPath}
    L ${getX(data[data.length - 1].week)},${getY(data[data.length - 1].min)}
    ${data.slice().reverse().map(d => `L ${getX(d.week)},${getY(d.min)}`).join(" ")}
    Z
  `;

  return (
    <div className="w-full h-full min-h-[300px] relative select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grid Lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="0.5" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="0.5" />

        {/* Labels */}
        <text x={width/2} y={height} fontSize="3" textAnchor="middle" fill="#6b7280">Weeks of Pregnancy</text>
        <text x={2} y={height/2} fontSize="3" textAnchor="middle" transform={`rotate(-90 2,${height/2})`} fill="#6b7280">Weight Gain ({units === 'metric' ? 'kg' : 'lbs'})</text>

        {/* The Range Area */}
        <path d={areaPath} fill="currentColor" className="text-primary/20" />
        
        {/* The Lines */}
        <path d={minPath} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" strokeDasharray="1,1" />
        <path d={maxPath} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />

        {/* Current User Dot */}
        {currentWeightGain !== null && currentWeek > 0 && (
            <g>
                <circle cx={getX(currentWeek)} cy={getY(currentWeightGain)} r="1.5" className="fill-blue-500 stroke-white stroke-[0.5]" />
                <text x={getX(currentWeek)} y={getY(currentWeightGain) - 3} fontSize="2.5" textAnchor="middle" className="fill-blue-600 font-bold">You</text>
            </g>
        )}
      </svg>
    </div>
  );
};

export default function PregnancyWeightGainCalculator() {
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      units: "metric",
      pregnancyType: "single",
      currentWeek: "12",
      height: "",
      weightBefore: "",
      weightCurrent: "",
    },
  });

  const { getValues, setValue, watch } = form;
  const units = watch("units");

  // Handle unit conversion logic
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = getValues("units");
    if (newUnit === currentUnit) return;

    // Convert Height
    const h = getValues("height");
    if (h) {
      if (newUnit === "metric") {
         // ft -> cm
         setValue("height", (parseNumber(h) * 30.48).toFixed(1));
      } else {
         // cm -> ft
         setValue("height", (parseNumber(h) / 30.48).toFixed(1));
      }
    }

    // Convert Weights
    const conversion = 2.20462;
    ["weightBefore", "weightCurrent"].forEach((key: any) => {
      const val = getValues(key);
      if (val) {
        if (newUnit === "metric") {
            // lbs -> kg
            setValue(key, (parseNumber(val) / conversion).toFixed(1));
        } else {
            // kg -> lbs
            setValue(key, (parseNumber(val) * conversion).toFixed(1));
        }
      }
    });

    setValue("units", newUnit);
  };

  const calculate = (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    setTimeout(() => {
      // 1. Normalize to Metric for Calculation
      let heightM = 0;
      let weightBeforeKg = 0;
      let weightCurrentKg = 0;

      if (values.units === "metric") {
        heightM = parseNumber(values.height) / 100;
        weightBeforeKg = parseNumber(values.weightBefore);
        weightCurrentKg = values.weightCurrent ? parseNumber(values.weightCurrent) : weightBeforeKg;
      } else {
        heightM = parseNumber(values.height) * 0.3048; // ft to m approx
        weightBeforeKg = parseNumber(values.weightBefore) / 2.20462;
        weightCurrentKg = values.weightCurrent ? (parseNumber(values.weightCurrent) / 2.20462) : weightBeforeKg;
      }

      // 2. Calculate BMI
      const bmi = weightBeforeKg / (heightM * heightM);
      let bmiCategory = "normal";
      
      // 3. Determine Guidelines based on BMI & Pregnancy Type
      let guideline = GUIDELINES.normal;
      
      if (values.pregnancyType === "single") {
        if (bmi < 18.5) { bmiCategory = "underweight"; guideline = GUIDELINES.underweight; }
        else if (bmi >= 30) { bmiCategory = "obese"; guideline = GUIDELINES.obese; }
        else if (bmi >= 25) { bmiCategory = "overweight"; guideline = GUIDELINES.overweight; }
      } else {
         // Twins logic (simplified based on IOM)
         if (bmi >= 30) { bmiCategory = "obese"; guideline = GUIDELINES.twins_obese; }
         else if (bmi >= 25) { bmiCategory = "overweight"; guideline = GUIDELINES.twins_overweight; }
         else { bmiCategory = "normal"; guideline = GUIDELINES.twins_normal; }
      }

      // 4. Generate Graph Data (The Trajectory)
      // Assumption: Gain 1-2kg (2-4.4lbs) in first trimester (week 0-13), then linear.
      const chartData = [];
      const totalGainMin = guideline.min;
      const totalGainMax = guideline.max;
      
      // Calculate gain rate per week for 2nd/3rd trimester (weeks 14-40)
      const weeksRemaining = 40 - 13;
      const firstTriGainMin = 0.5; // kg
      const firstTriGainMax = 2.0; // kg
      
      const weeklyRateMin = (totalGainMin - firstTriGainMin) / weeksRemaining;
      const weeklyRateMax = (totalGainMax - firstTriGainMax) / weeksRemaining;

      for (let i = 0; i <= 40; i++) {
        let minW = 0;
        let maxW = 0;

        if (i <= 13) {
            // First Trimester: Slow gain
            minW = (i / 13) * firstTriGainMin;
            maxW = (i / 13) * firstTriGainMax;
        } else {
            // 2nd & 3rd: Linear gain
            minW = firstTriGainMin + ((i - 13) * weeklyRateMin);
            maxW = firstTriGainMax + ((i - 13) * weeklyRateMax);
        }

        // Convert back to Imperial if needed for display
        if (values.units === "imperial") {
            minW *= 2.20462;
            maxW *= 2.20462;
        }

        chartData.push({
            week: i,
            min: parseNumber(minW.toFixed(1)),
            max: parseNumber(maxW.toFixed(1))
        });
      }

      // 4b. ADDITIVE FEATURE 1 — Healthy total weight-gain range from pre-pregnancy BMI (IOM)
      // Reuses the BMI + guideline already computed above. We surface the underlying single
      // (non-twin) range and flag whether the active guideline is doubled for twins.
      const singleGuidelineMap: Record<string, { min: number; max: number }> = {
        underweight: { min: GUIDELINES.underweight.min, max: GUIDELINES.underweight.max },
        normal: { min: GUIDELINES.normal.min, max: GUIDELINES.normal.max },
        overweight: { min: GUIDELINES.overweight.min, max: GUIDELINES.overweight.max },
        obese: { min: GUIDELINES.obese.min, max: GUIDELINES.obese.max },
      };
      const singleRange = singleGuidelineMap[bmiCategory] || singleGuidelineMap.normal;
      const isTwins = values.pregnancyType === "twins";
      const toDisplay = (kg: number) => (values.units === "imperial" ? kg * 2.20462 : kg);
      const iomBmiLabelMap: Record<string, string> = {
        underweight: "Underweight (BMI below 18.5)",
        normal: "Healthy weight (BMI 18.5–24.9)",
        overweight: "Overweight (BMI 25.0–29.9)",
        obese: "Obese (BMI 30.0 or above)",
      };

      // 4c. ADDITIVE FEATURE 2 — Week-by-week pace targets + where the weight goes
      // Trimester pacing derived from the same first-trimester + linear model used for the chart.
      const t2t3WeeklyMin = ((totalGainMin - firstTriGainMin) / weeksRemaining);
      const t2t3WeeklyMax = ((totalGainMax - firstTriGainMax) / weeksRemaining);
      const phaseTargets = [
        {
          phase: "First trimester (weeks 1–13)",
          detail: `Slow, steady start — about ${toDisplay(firstTriGainMin).toFixed(1)}–${toDisplay(firstTriGainMax).toFixed(1)} ${values.units === "metric" ? "kg" : "lbs"} total. Gaining little, none, or even losing a bit with nausea is common.`,
        },
        {
          phase: "Second & third trimester (weeks 14–40)",
          detail: `A consistent pace of roughly ${toDisplay(t2t3WeeklyMin).toFixed(2)}–${toDisplay(t2t3WeeklyMax).toFixed(2)} ${values.units === "metric" ? "kg" : "lbs"} per week as your baby grows fastest.`,
        },
      ];
      // Where the gained weight is distributed (proportions of a typical full-term gain).
      const distribution = [
        { part: "Baby", pct: 27 },
        { part: "Fat & nutrient stores", pct: 25 },
        { part: "Blood volume", pct: 14 },
        { part: "Fluids & tissue", pct: 14 },
        { part: "Uterus & breast tissue", pct: 13 },
        { part: "Placenta & amniotic fluid", pct: 7 },
      ];

      // 5. Current Status Logic
      const currentWeekInt = parseInt(values.currentWeek);
      const currentGainRaw = weightCurrentKg - weightBeforeKg;
      const currentGainDisplay = values.units === 'imperial' ? currentGainRaw * 2.20462 : currentGainRaw;

      // Find min/max for CURRENT week
      const currentWeekData = chartData[currentWeekInt];
      
      let status = "On Track";
      let statusColor = "text-green-600";
      if (values.weightCurrent) {
        if (currentGainDisplay < currentWeekData.min - 1) { status = "Below Recommended Range"; statusColor = "text-yellow-600"; }
        else if (currentGainDisplay > currentWeekData.max + 1) { status = "Above Recommended Range"; statusColor = "text-orange-600"; }
      }

      setResult({
        bmi: bmi.toFixed(1),
        bmiCategory,
        guidelineLabel: guideline.label,
        totalMin: values.units === 'imperial' ? (guideline.min * 2.20462).toFixed(1) : guideline.min,
        totalMax: values.units === 'imperial' ? (guideline.max * 2.20462).toFixed(1) : guideline.max,
        chartData,
        currentWeek: currentWeekInt,
        currentGain: values.weightCurrent ? currentGainDisplay : null,
        targetMinCurrent: currentWeekData.min,
        targetMaxCurrent: currentWeekData.max,
        status,
        statusColor,
        // Additive feature data
        units: values.units,
        isTwins,
        iomBmiLabel: iomBmiLabelMap[bmiCategory] || iomBmiLabelMap.normal,
        singleRangeMin: toDisplay(singleRange.min).toFixed(1),
        singleRangeMax: toDisplay(singleRange.max).toFixed(1),
        phaseTargets,
        distribution,
      });

      setIsLoading(false);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, 600);
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-6 h-6 text-primary" /> Pregnancy Weight Gain Calculator
          </CardTitle>
          <CardDescription>
            Calculate your recommended weight gain based on IOM guidelines and track your pregnancy progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(calculate)} className="space-y-6">
              
              {/* Top Row: Units & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units</FormLabel>
                      <RadioGroup
                        onValueChange={(val: any) => handleUnitChange(val)}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="metric" /></FormControl>
                          <FormLabel className="font-normal cursor-pointer">Metric (kg/cm)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="imperial" /></FormControl>
                          <FormLabel className="font-normal cursor-pointer">Imperial (lbs/ft)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pregnancyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pregnancy Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single Baby</SelectItem>
                          <SelectItem value="twins">Twins</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Middle Row: Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                  control={form.control}
                  name="currentWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Week (1-40)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="40" placeholder="e.g. 20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height ({units === 'metric' ? 'cm' : 'ft.in'})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder={units === 'metric' ? "165" : "5.5"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weightBefore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-Pregnancy Weight</FormLabel>
                      <FormControl>
                         <div className="relative">
                             <Input type="number" step="0.1" placeholder={units === 'metric' ? 'e.g. 70' : 'e.g. 154'} {...field} />
                             <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">{units === 'metric' ? 'kg' : 'lbs'}</span>
                          </div>
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>

              {/* Optional Current Weight */}
              <div className="md:w-1/3">
                 <FormField
                  control={form.control}
                  name="weightCurrent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">Current Weight <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Input type="number" step="0.1" placeholder={units === 'metric' ? 'e.g. 75' : 'e.g. 165'} {...field} />
                            <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">{units === 'metric' ? 'kg' : 'lbs'}</span>
                         </div>
                      </FormControl>
                      <FormDescription>Enter this to see if you are on track.</FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                  Calculate Weight Gain
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => { form.reset(); setResult(null); }}>
                   <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- RESULTS SECTION --- */}
      <div ref={resultsRef}>
        {result && (
          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-6xl mx-auto">
            
            {/* Left Col: Summary Card */}
            <Card className="md:col-span-1 border-primary/20 shadow-lg">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="text-lg flex items-center gap-2"><Info className="w-5 h-5 text-primary"/> Your Pregnancy Profile</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Pre-Pregnancy BMI</p>
                        <p className="text-2xl font-bold">{result.bmi} <span className="text-base font-normal text-muted-foreground capitalize">({result.bmiCategory})</span></p>
                    </div>
                    <div className="border-t pt-4">
                         <p className="text-sm text-muted-foreground">Recommended Total Gain</p>
                         <p className="text-3xl font-bold text-primary">{result.totalMin} - {result.totalMax} <span className="text-base font-normal">{units === 'metric' ? 'kg' : 'lbs'}</span></p>
                         <p className="text-xs text-muted-foreground mt-1">Based on {result.guidelineLabel}</p>
                    </div>
                    <div className="border-t pt-4">
                         <p className="text-sm text-muted-foreground">At Week {result.currentWeek}, you should have gained:</p>
                         <p className="text-xl font-semibold">{result.targetMinCurrent} - {result.targetMaxCurrent} {units === 'metric' ? 'kg' : 'lbs'}</p>
                    </div>
                    {result.currentGain !== null && (
                         <div className={`p-4 rounded-lg bg-muted/50 border ${result.statusColor.replace('text', 'border')}`}>
                            <p className="text-sm font-medium mb-1">Current Status:</p>
                            <p className={`font-bold text-lg ${result.statusColor}`}>{result.status}</p>
                            <p className="text-xs mt-1">Actual Gain: {result.currentGain.toFixed(1)} {units === 'metric' ? 'kg' : 'lbs'}</p>
                         </div>
                    )}
                </CardContent>
            </Card>

            {/* Right Col: Visuals */}
            <div className="md:col-span-2 space-y-8">
                
                {/* 1. Graph */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500"/> Weight Gain Trajectory</CardTitle>
                        <CardDescription>The shaded area shows your recommended weight gain range by week.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] md:h-[400px] p-2 md:p-6">
                        <WeightGainChart 
                            data={result.chartData} 
                            currentWeek={result.currentWeek} 
                            currentWeightGain={result.currentGain}
                            units={units}
                        />
                    </CardContent>
                </Card>

                {/* 2. Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><TableIcon className="w-5 h-5 text-gray-500"/> Weekly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-background z-10">
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium text-muted-foreground">Week</th>
                                    <th className="text-right py-2 font-medium text-muted-foreground">Min Gain</th>
                                    <th className="text-right py-2 font-medium text-muted-foreground">Max Gain</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.chartData.map((row: any) => (
                                    <tr key={row.week} className={`border-b hover:bg-muted/50 ${row.week === result.currentWeek ? 'bg-primary/10 font-medium' : ''}`}>
                                        <td className="py-2">Week {row.week} {row.week === result.currentWeek && "(Current)"}</td>
                                        <td className="text-right py-2">{row.min} {units === 'metric' ? 'kg' : 'lbs'}</td>
                                        <td className="text-right py-2">{row.max} {units === 'metric' ? 'kg' : 'lbs'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

            </div>

            {/* --- ADDITIVE FEATURE CARDS (full width) --- */}
            <div className="md:col-span-3 space-y-8">

              {/* FEATURE 1: Healthy total weight-gain range (IOM, BMI-based) */}
              <Card className="border-emerald-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                    <Target className="w-5 h-5" /> Your Healthy Weight-Gain Range
                  </CardTitle>
                  <CardDescription>
                    Set from your pre-pregnancy BMI using recognised IOM guidelines.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      {result.iomBmiLabel}
                      {result.isTwins && " · carrying twins"}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-emerald-700">
                      {result.totalMin} – {result.totalMax}{" "}
                      <span className="text-base font-normal text-slate-600">
                        {result.units === "metric" ? "kg" : "lbs"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">recommended total gain across your pregnancy</p>
                  </div>
                  {result.isTwins && (
                    <div className="rounded-lg bg-slate-50 border p-3 text-sm text-slate-600">
                      For a single baby at this BMI the range would be{" "}
                      <span className="font-semibold text-slate-800">
                        {result.singleRangeMin} – {result.singleRangeMax} {result.units === "metric" ? "kg" : "lbs"}
                      </span>
                      . Carrying twins increases your healthy range, as shown above.
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    These are supportive guidelines, not strict limits — every pregnancy is unique. Your midwife or
                    obstetrician will personalise your target at your appointments.
                  </p>
                </CardContent>
              </Card>

              {/* FEATURE 2: Week-by-week pace + where the weight goes */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                      <CalendarClock className="w-5 h-5" /> Week-by-Week Target Pace
                    </CardTitle>
                    <CardDescription>How your gain is expected to be spread over time.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.phaseTargets.map((p: { phase: string; detail: string }) => (
                      <div key={p.phase} className="rounded-xl border bg-muted/30 p-4">
                        <p className="text-sm font-semibold text-slate-800">{p.phase}</p>
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{p.detail}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                      <PieChart className="w-5 h-5" /> Where the Weight Goes
                    </CardTitle>
                    <CardDescription>It is far more than body fat — it is your baby's support system.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.distribution.map((d: { part: string; pct: number }) => (
                      <div key={d.part}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700">{d.part}</span>
                          <span className="font-semibold text-emerald-700">{d.pct}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded-full bg-emerald-100">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <p className="pt-1 text-xs text-muted-foreground leading-relaxed">
                      Approximate proportions of a typical full-term gain (baby, placenta, fluid, blood, breast tissue
                      and fat stores).
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}