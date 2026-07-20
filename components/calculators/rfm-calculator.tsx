"use client"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, RefreshCw, BarChart2, Loader2, ArrowDown, Info, CircleHelp } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { parseNumber } from "@/lib/utils"

// Define validation schema
const formSchema = z.object({
  height: z.string().min(1, "Height is required"),
  waist: z.string().min(1, "Waist circumference is required"),
  sex: z.enum(["male", "female", "other"], { required_error: "Sex is required" }),
  age: z.string().optional(), // Optional now
  weight: z.string().optional(), // Optional now
  ethnicity: z.string().optional(), // Optional
  activityLevel: z.enum(["sedentary", "moderate", "active"]).optional(), // Optional
  goal: z.enum(["fat_loss", "maintenance", "muscle_gain"]).optional(), // Optional
  unitSystem: z.enum(["metric", "imperial"]), // Renamed from 'units' for clarity
})

type UnitSystem = "metric" | "imperial"

// RFM Category & Ideal Ranges (simplified for example, full ranges would be larger)
const rfmCategories = {
  male: {
    underfat: { min: 0, max: 5.9 }, // Adjusted example for context
    healthy: { min: 6, max: 18 },
    overfat: { min: 18.1, max: 25 },
    obese: { min: 25.1, max: 100 },
  },
  female: {
    underfat: { min: 0, max: 17.9 }, // Adjusted example for context
    healthy: { min: 18, max: 30 },
    overfat: { min: 30.1, max: 35 },
    obese: { min: 35.1, max: 100 },
  },
};

const idealRfmRanges = {
    male: (age: number) => {
        if (age < 30) return { min: 8, max: 14 };
        if (age < 50) return { min: 10, max: 17 };
        return { min: 12, max: 19 };
    },
    female: (age: number) => {
        if (age < 30) return { min: 20, max: 26 };
        if (age < 50) return { min: 23, max: 29 };
        return { min: 25, max: 32 };
    },
};

interface RFMCalculationResult {
  rfm: number
  rfmCategory: string
  bmi?: number // Optional
  fatMassKg?: number // Optional
  leanMassKg?: number // Optional
  idealRfmRange: { min: number; max: number } | null
  healthRiskSummary: string
  actionableTips: string
  rfmColor: string // For visual feedback
  bmiCategory?: string // New: BMI category
  // FEATURE 1 — No-calipers quick body-fat estimate (height + waist only)
  bodyFatCategoryLabel: string
  bodyFatCategoryColor: string
  bodyFatCategoryDescription: string
  // FEATURE 2 — Skinny-fat (normal BMI but high RFM) detection
  skinnyFat?: {
    isSkinnyFat: boolean
    headline: string
    message: string
    tone: "alert" | "ok"
  }
}

// FEATURE 1 — Map an RFM body-fat % to a clear, no-calipers category.
// Uses the same ACE/AHA-style bands already shown in the page's interpretation table.
const getBodyFatCategory = (
  rfm: number,
  sex: "male" | "female" | "other"
): { label: string; color: string; description: string } => {
  // Treat "other" with the male band set (matches the RFM formula default used above).
  if (sex === "female") {
    if (rfm < 14) return { label: "Essential / Very Lean", color: "text-blue-500", description: "Below the typical healthy range for women — body fat this low can affect hormones and energy." };
    if (rfm < 21) return { label: "Athletic", color: "text-emerald-600", description: "A lean, athletic body-fat level typical of active women." };
    if (rfm < 25) return { label: "Fitness", color: "text-green-600", description: "A fit, healthy body-fat level for women." };
    if (rfm < 32) return { label: "Average", color: "text-yellow-600", description: "An average body-fat level for women — small reductions can still benefit health." };
    return { label: "High", color: "text-red-500", description: "Above the average range for women — consider sustainable fat-loss habits." };
  }
  if (rfm < 6) return { label: "Essential / Very Lean", color: "text-blue-500", description: "Below the typical healthy range for men — body fat this low can affect performance and recovery." };
  if (rfm < 14) return { label: "Athletic", color: "text-emerald-600", description: "A lean, athletic body-fat level typical of active men." };
  if (rfm < 18) return { label: "Fitness", color: "text-green-600", description: "A fit, healthy body-fat level for men." };
  if (rfm < 25) return { label: "Average", color: "text-yellow-600", description: "An average body-fat level for men — small reductions can still benefit health." };
  return { label: "High", color: "text-red-500", description: "Above the average range for men — consider sustainable fat-loss habits." };
};

// Function to calculate BMI category
const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    if (bmi >= 18.5 && bmi < 25) return "Normal weight";
    if (bmi >= 25 && bmi < 30) return "Overweight";
    return "Obese";
};

// Simple Gauge Chart for RFM and BMI
const RFMBMIGaugeChart = ({ rfm, bmi }: { rfm: number; bmi?: number }) => {
    const rfmPercent = Math.min(100, Math.max(0, (rfm / 40) * 100)); // Assuming max RFM of ~40% for visual
    const bmiPercent = bmi ? Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100)) : 0; // Assuming BMI range 15-40

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">RFM vs. BMI Gauge</h3>
            <div>
                <p className="text-sm font-medium mb-1">Relative Fat Mass (RFM): {rfm.toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${rfmPercent}%` }}></div>
                </div>
            </div>
            {bmi !== undefined && (
                <div>
                    <p className="text-sm font-medium mb-1">Body Mass Index (BMI): {bmi.toFixed(1)}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${bmiPercent}%` }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple Body Composition Chart (Pie/Donut)
const BodyCompositionChart = ({ fatMass, leanMass, totalWeight }: { fatMass: number; leanMass: number; totalWeight: number }) => {
    if (!totalWeight || totalWeight === 0) return null;

    const fatPercent = (fatMass / totalWeight) * 100;
    const leanPercent = (leanMass / totalWeight) * 100;
    const waterPercent = (leanMass * 0.73 / totalWeight) * 100; // Approx 73% of lean mass is water
    const bonePercent = (totalWeight * 0.15 / totalWeight) * 100; // Approx 15% of body weight is bone (very rough estimate)

    // Adjust to make sure percentages add up to 100, prioritizing fat/lean accuracy
    const otherPercent = 100 - fatPercent - leanPercent; 
    const finalWater = waterPercent; // For simplicity in this example
    const finalBone = bonePercent; // For simplicity in this example

    // A simple visual representation, not a true SVG chart
    return (
        <div className="space-y-2">
            <h3 className="text-lg font-semibold text-center">Estimated Body Composition</h3>
            <div className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full relative overflow-hidden shadow-lg">
                    {/* Fat */}
                    <div className="absolute inset-0 bg-red-400" style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.sin(2 * Math.PI * fatPercent / 100) * 50}% ${50 - Math.cos(2 * Math.PI * fatPercent / 100) * 50}%, 50% 50%)` }}></div>
                    {/* Lean */}
                    <div className="absolute inset-0 bg-blue-400" style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.sin(2 * Math.PI * (fatPercent + leanPercent) / 100) * 50}% ${50 - Math.cos(2 * Math.PI * (fatPercent + leanPercent) / 100) * 50}%, 50% 50%)` }}></div>
                     {/* Water - simplified */}
                    <div className="absolute inset-0 bg-green-400" style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.sin(2 * Math.PI * (fatPercent + leanPercent + waterPercent) / 100) * 50}% ${50 - Math.cos(2 * Math.PI * (fatPercent + leanPercent + waterPercent) / 100) * 50}%, 50% 50%)` }}></div>
                     {/* Bone - simplified */}
                    <div className="absolute inset-0 bg-yellow-400" style={{ clipPath: `polygon(50% 50%, 50% 0%, 50% 0%, 50% 50%)` }}></div> {/* Remaining part */}
                    <div className="absolute inset-0 bg-yellow-400" style={{
                         clipPath: `polygon(50% 50%, 50% 0%, ${50 + Math.sin(2 * Math.PI * (fatPercent + leanPercent + waterPercent + bonePercent) / 100) * 50}% ${50 - Math.cos(2 * Math.PI * (fatPercent + leanPercent + waterPercent + bonePercent) / 100) * 50}%, 50% 50%)`
                    }}></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center"><span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>Fat Mass ({fatPercent.toFixed(1)}%)</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>Lean Mass ({leanPercent.toFixed(1)}%)</div>
                    {/* <div className="flex items-center"><span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>Water ({finalWater.toFixed(1)}%)</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>Bone ({finalBone.toFixed(1)}%)</div> */}
                </div>
            </div>
             <p className="text-sm text-muted-foreground text-center mt-2">
                (Note: This is a simplified visual. Exact percentages for water/bone require advanced body composition analysis.)
            </p>
        </div>
    );
};


export default function RFMCalculator() {
  const [result, setResult] = useState<RFMCalculationResult | null>(null)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric")
  // --- Conversion helpers ---
  const cmToInches = (cm: number) => cm / 2.54;
  const inchesToCm = (inches: number) => inches * 2.54;
  const kgToLbs = (kg: number) => kg * 2.20462;
  const lbsToKg = (lbs: number) => lbs / 2.20462;

  // --- Convert all relevant form values when switching systems ---
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentValues = form.getValues();
    const updatedValues: Record<string, any> = { ...currentValues };

    // Convert height, waist, and weight
    if (currentValues.height) {
      const h = parseNumber(currentValues.height);
      updatedValues.height =
        newUnit === "imperial" ? cmToInches(h).toFixed(1) : inchesToCm(h).toFixed(1);
    }

    if (currentValues.waist) {
      const w = parseNumber(currentValues.waist);
      updatedValues.waist =
        newUnit === "imperial" ? cmToInches(w).toFixed(1) : inchesToCm(w).toFixed(1);
    }

    if (currentValues.weight) {
      const wt = parseNumber(currentValues.weight);
      updatedValues.weight =
        newUnit === "imperial" ? kgToLbs(wt).toFixed(1) : lbsToKg(wt).toFixed(1);
    }

    updatedValues.unitSystem = newUnit;

    // Apply the new converted values to the form
    form.reset(updatedValues);
    setUnitSystem(newUnit);
  };
  const [isLoading, setIsLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      height: "",
      waist: "",
      sex: "male",
      age: "",
      weight: "",
      ethnicity: "white",
      activityLevel: "moderate",
      goal: "maintenance",
      unitSystem: "metric"
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    setTimeout(() => { // Simulate calculation delay
        const heightInput = parseNumber(values.height);
        const waistInput = parseNumber(values.waist);
        const sex = values.sex;
        const age = values.age ? parseInt(values.age) : undefined;
        const weightInput = values.weight ? parseNumber(values.weight) : undefined;
        const activityLevel = values.activityLevel;
        const goal = values.goal;

        // Convert inputs to cm for height and waist, kg for weight if imperial
        const heightCm = unitSystem === "metric" ? heightInput : heightInput * 2.54;
        const waistCm = unitSystem === "metric" ? waistInput : waistInput * 2.54;
        const weightKg = weightInput ? (unitSystem === "metric" ? weightInput : weightInput * 0.453592) : undefined;
        const heightM = heightCm / 100;

        let rfm = 0;
        let genderFactor = 0; // 0 for male, 12 for female

        if (sex === "female") {
            genderFactor = 12;
            rfm = 64 - (20 * (heightCm / waistCm)) + genderFactor;
        } else if (sex === "male") {
            genderFactor = 0; // RFM formula for males doesn't typically add a gender factor.
            rfm = 64 - (20 * (heightCm / waistCm));
        } else {
             // For "Other", we can use an average or require specific input.
             // For now, let's use the male formula as a default for "Other" if no specific guidance.
             // In a real app, you might guide the user towards "male" or "female" if their body shape aligns.
             rfm = 64 - (20 * (heightCm / waistCm));
        }

        rfm = Math.max(0, Math.min(100, rfm)); // Clamp RFM between 0 and 100

        // RFM Category
        let rfmCategory = "";
        let rfmColor = "";
        const sexCategoryData = sex === "female" ? rfmCategories.female : rfmCategories.male; // Default to male for 'other'
        if (rfm < sexCategoryData.underfat.max) {
            rfmCategory = "Underfat";
            rfmColor = "text-blue-500";
        } else if (rfm >= sexCategoryData.healthy.min && rfm <= sexCategoryData.healthy.max) {
            rfmCategory = "Healthy";
            rfmColor = "text-green-500";
        } else if (rfm > sexCategoryData.overfat.min && rfm <= sexCategoryData.overfat.max) {
            rfmCategory = "Overfat";
            rfmColor = "text-orange-500";
        } else {
            rfmCategory = "Obese";
            rfmColor = "text-red-500";
        }

        let bmi: number | undefined = undefined;
        let bmiCategory: string | undefined = undefined;
        let fatMassKg: number | undefined = undefined;
        let leanMassKg: number | undefined = undefined;

        if (weightKg !== undefined && heightM > 0) {
            bmi = weightKg / (heightM * heightM);
            bmiCategory = getBMICategory(bmi);

            // Estimated Fat Mass & Lean Mass
            fatMassKg = (rfm / 100) * weightKg;
            leanMassKg = weightKg - fatMassKg;
        }

        // Ideal RFM Range
        let idealRfmRange: { min: number; max: number } | null = null;
        if (age !== undefined) {
            if (sex === "female" && idealRfmRanges.female) {
                 idealRfmRange = idealRfmRanges.female(age);
            } else if (sex === "male" && idealRfmRanges.male) {
                 idealRfmRange = idealRfmRanges.male(age);
            } else {
                // For "Other", you might use a general range or prompt for more info
                idealRfmRange = { min: 10, max: 25 }; // Generic for 'Other'
            }
        }


        // Health Risk Summary (AI-style feedback)
        let healthRiskSummary = `Based on your RFM of ${rfm.toFixed(1)}%, you are in the ${rfmCategory} category. `;
        if (bmi !== undefined) {
            healthRiskSummary += `Your BMI of ${bmi.toFixed(1)} (${bmiCategory}) also provides context. `;
            if (rfmCategory === "Healthy" && bmiCategory !== "Normal weight") {
                healthRiskSummary += "It's interesting that your RFM is healthy while your BMI is not. This could indicate higher muscle mass, but further assessment is always good.";
            } else if (rfmCategory !== "Healthy" && bmiCategory === "Normal weight") {
                 healthRiskSummary += "Your RFM indicates a higher body fat percentage despite a normal BMI. This suggests 'normal weight obesity' or 'TOFI' (Thin Outside, Fat Inside), highlighting the importance of body composition beyond just weight.";
            } else if (rfmCategory !== "Healthy" && bmiCategory !== "Normal weight") {
                 healthRiskSummary += "Both your RFM and BMI suggest areas for improvement regarding body composition and overall health risk.";
            } else {
                 healthRiskSummary += "Both your RFM and BMI are in healthy ranges, which is excellent!";
            }
        }
        healthRiskSummary += " Maintaining a healthy waist-to-height ratio (ideally below 0.5) is also crucial for cardiovascular health.";


        // Actionable Tips
        let actionableTips = "";
        if (goal === "fat_loss") {
            actionableTips += "To support your fat loss goal, aim for a consistent calorie deficit (e.g., 300-500 kcal per day) and integrate a mix of strength training and cardiovascular exercise.";
        } else if (goal === "muscle_gain") {
            actionableTips += "For muscle gain, focus on progressive overload in strength training and ensure adequate protein intake (1.6-2.2g per kg body weight) with a slight calorie surplus.";
        } else { // Maintenance or no goal
            actionableTips += "To maintain your current body composition, continue with a balanced diet and regular physical activity. If your RFM is high, consider incorporating more activity or small dietary adjustments.";
        }

        if (rfmCategory === "Overfat" || rfmCategory === "Obese") {
             actionableTips += " Prioritize reducing your body fat percentage through sustainable lifestyle changes. Consult a healthcare professional or a registered dietitian for personalized guidance.";
        } else if (rfmCategory === "Underfat") {
            actionableTips += " Ensure you're consuming enough calories and nutrients to support your body's needs. If this is unintentional, consider consulting a professional.";
        }


        // ── FEATURE 1: No-calipers body-fat category from height & waist only ──
        const bodyFat = getBodyFatCategory(rfm, sex);

        // ── FEATURE 2: Skinny-fat detection (normal BMI but high RFM) ──────────
        let skinnyFat: RFMCalculationResult["skinnyFat"] = undefined;
        if (bmi !== undefined && bmiCategory !== undefined) {
            const isBmiNormal = bmiCategory === "Normal weight";
            const rfmIsHigh = rfmCategory === "Overfat" || rfmCategory === "Obese";
            if (isBmiNormal && rfmIsHigh) {
                skinnyFat = {
                    isSkinnyFat: true,
                    tone: "alert",
                    headline: "Possible 'skinny-fat' pattern detected",
                    message: `Your BMI of ${bmi.toFixed(1)} looks normal, but your RFM of ${rfm.toFixed(1)}% falls in the ${rfmCategory.toLowerCase()} range. This mismatch is the classic 'skinny-fat' (normal weight obesity / TOFI) profile — the scale looks fine while body fat is higher than ideal. Strength training plus adequate protein usually helps more than just losing weight.`,
                };
            } else if (isBmiNormal && rfmCategory === "Healthy") {
                skinnyFat = {
                    isSkinnyFat: false,
                    tone: "ok",
                    headline: "BMI and RFM agree",
                    message: `Both your BMI (${bmi.toFixed(1)}, normal) and your RFM (${rfm.toFixed(1)}%, healthy) point the same way — no hidden 'skinny-fat' discrepancy. Your weight and your body-fat estimate tell a consistent story.`,
                };
            } else if (!isBmiNormal && rfmCategory === "Healthy") {
                skinnyFat = {
                    isSkinnyFat: false,
                    tone: "ok",
                    headline: "Higher BMI, healthy body fat",
                    message: `Your BMI of ${bmi.toFixed(1)} reads as ${bmiCategory?.toLowerCase()}, yet your RFM of ${rfm.toFixed(1)}% is in the healthy range. BMI can over-flag muscular builds — your body-fat estimate suggests this may be muscle, not excess fat.`,
                };
            }
        }

        setResult({
          rfm,
          rfmCategory,
          bmi,
          bmiCategory,
          fatMassKg,
          leanMassKg,
          idealRfmRange,
          healthRiskSummary,
          actionableTips,
          rfmColor,
          bodyFatCategoryLabel: bodyFat.label,
          bodyFatCategoryColor: bodyFat.color,
          bodyFatCategoryDescription: bodyFat.description,
          skinnyFat,
        })
        setIsLoading(false)

        setTimeout(() => { // Scroll after state update
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100)
    }, 500); // 500ms delay
  }

  const resetCalculator = () => {
    form.reset()
    setResult(null)
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto" id="calculator">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="w-6 h-6 text-primary" /> Relative Fat Mass (RFM) Calculator</CardTitle>
            <CardDescription>
                Calculate your Relative Fat Mass (RFM) and get insights into your body composition.
                RFM is considered a reliable indicator of body fat percentage, using only height and waist circumference.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control} name="unitSystem" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Unit System</FormLabel>
                    <FormControl>
                      <RadioGroup
                          onValueChange={(value: UnitSystem) => {
                            field.onChange(value);
                            handleUnitChange(value);
                          }}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="metric" /></FormControl>
                          <FormLabel className="font-normal">Metric (cm, kg)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="imperial" /></FormControl>
                          <FormLabel className="font-normal">Imperial (inches, lbs)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Height ({unitSystem === 'metric' ? 'cm' : 'inches'})</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder={unitSystem === 'metric' ? "e.g., 175" : "e.g., 69"} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="waist" render={({ field }) => (
                    <FormItem>
                        <FormLabel className="flex items-center">
                            Waist Circumference ({unitSystem === 'metric' ? 'cm' : 'inches'})
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-pointer" />
                                </PopoverTrigger>
                                <PopoverContent className="w-80 text-sm">
                                    Measure at the narrowest point between your ribs and hips. Do not suck in your stomach.
                                     
                                </PopoverContent>
                            </Popover>
                        </FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder={unitSystem === 'metric' ? "e.g., 85" : "e.g., 34"} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="sex" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Age (Optional)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weight (Optional) ({unitSystem === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                        <FormControl><Input type="number" step="0.1" placeholder={unitSystem === 'metric' ? "e.g., 70" : "e.g., 155"} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="ethnicity" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ethnicity (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select ethnicity" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="white">White</SelectItem>
                                <SelectItem value="asian">Asian</SelectItem>
                                <SelectItem value="black">Black</SelectItem>
                                <SelectItem value="hispanic">Hispanic</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Activity Level (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select activity level" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                                <SelectItem value="moderate">Moderate (light exercise 1-3 days/week)</SelectItem>
                                <SelectItem value="active">Active (moderate exercise 3-5 days/week)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="goal" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Goal (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="fat_loss">Fat Loss</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate RFM'}
                </Button>
                <Button type="button" variant="outline" onClick={resetCalculator} className="flex-1" disabled={isLoading}><RefreshCw className="h-4 w-4 mr-2" /> Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- RFM Results Block --- */}
      <div ref={resultsRef}>
        {result && (
          <Card className="max-w-4xl mx-auto mt-8">
            <CardHeader>
                <CardTitle className="text-2xl">Your RFM Results & Insights</CardTitle>
                <CardDescription>Here's a detailed breakdown of your body composition metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center p-4 rounded-lg bg-muted border">
                  <p className="text-sm font-semibold text-muted-foreground">Your Relative Fat Mass (RFM) is</p>
                  <p className={`text-5xl font-bold ${result.rfmColor}`}>{result.rfm.toFixed(1)}%</p>
                  <p className="text-lg text-muted-foreground mt-1">({result.rfmCategory})</p>
                  {form.getValues("sex") !== "other" && (
                    <p className="text-sm text-muted-foreground mt-2">
                        {form.getValues("sex") === "male" ? "Healthy range for men: 6–18%" : "Healthy range for women: 18–30%"}
                    </p>
                  )}
                </div>

                {/* FEATURE 1 — No-calipers quick body-fat estimate */}
                <Card className="border rounded-xl bg-emerald-50/60 border-emerald-100">
                    <CardContent className="p-5 md:p-6">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart2 className="w-5 h-5 text-emerald-700" />
                            <h3 className="text-base font-bold text-emerald-700">No-Calipers Body-Fat Estimate</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Using just your height and waist, your estimated body fat is{" "}
                            <span className={`font-bold ${result.rfmColor}`}>{result.rfm.toFixed(1)}%</span>, which sits in the{" "}
                            <span className={`font-bold ${result.bodyFatCategoryColor}`}>{result.bodyFatCategoryLabel}</span> range.
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                            {result.bodyFatCategoryDescription}
                        </p>
                        <p className="text-xs text-muted-foreground mt-3">
                            No skinfold calipers, scales or scans needed — just a tape measure. Because it relies only on height and waist, it is quick and easy to repeat week to week to track your progress.
                        </p>
                    </CardContent>
                </Card>

                {/* FEATURE 2 — Skinny-fat (normal BMI but high RFM) detection */}
                {result.skinnyFat && (
                    <Card
                        className={`border rounded-xl ${
                            result.skinnyFat.tone === "alert"
                                ? "bg-orange-50/70 border-orange-200"
                                : "bg-emerald-50/60 border-emerald-100"
                        }`}
                    >
                        <CardContent className="p-5 md:p-6">
                            <div className="flex items-center gap-2 mb-1">
                                {result.skinnyFat.tone === "alert" ? (
                                    <Info className="w-5 h-5 text-orange-600" />
                                ) : (
                                    <Info className="w-5 h-5 text-emerald-700" />
                                )}
                                <h3
                                    className={`text-base font-bold ${
                                        result.skinnyFat.tone === "alert" ? "text-orange-700" : "text-emerald-700"
                                    }`}
                                >
                                    RFM vs. BMI: {result.skinnyFat.headline}
                                </h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {result.skinnyFat.message}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {result.bmi === undefined && (
                    <p className="text-xs text-muted-foreground -mt-2">
                        Tip: add your optional <span className="font-semibold">weight</span> above to unlock the RFM-vs-BMI
                        check that reveals hidden &lsquo;skinny-fat&rsquo; cases.
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    {result.bmi !== undefined && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-semibold">Your BMI</h4>
                            <p className="text-2xl text-primary">{result.bmi.toFixed(1)}</p>
                            <p className="text-sm text-muted-foreground">({result.bmiCategory})</p>
                        </div>
                    )}
                    {result.fatMassKg !== undefined && result.leanMassKg !== undefined && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-semibold">Estimated Body Mass Breakdown</h4>
                            <p className="text-lg text-red-500">Fat Mass: {result.fatMassKg.toFixed(1)} kg</p>
                            <p className="text-lg text-blue-500">Lean Mass: {result.leanMassKg.toFixed(1)} kg</p>
                        </div>
                    )}
                     {result.idealRfmRange && (
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg col-span-1 md:col-span-2">
                            <h4 className="font-semibold">Ideal RFM Range for Your Age & Sex</h4>
                            <p className="text-2xl text-green-600">{result.idealRfmRange.min.toFixed(0)}% - {result.idealRfmRange.max.toFixed(0)}%</p>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-blue-500" /> Health Risk Summary</h3>
                    <p className="text-muted-foreground mt-1">{result.healthRiskSummary}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><ArrowDown className="h-5 w-5 text-purple-500" /> Actionable Tips</h3>
                    <p className="text-muted-foreground mt-1">{result.actionableTips}</p>
                </div>
                
                {/* Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t pt-6">
                    <div className="flex flex-col items-center">
                        <RFMBMIGaugeChart rfm={result.rfm} bmi={result.bmi} />
                    </div>
                     {result.fatMassKg !== undefined && result.leanMassKg !== undefined && form.getValues("weight") && (
                        <div className="flex flex-col items-center">
                            <BodyCompositionChart
                                fatMass={result.fatMassKg}
                                leanMass={result.leanMassKg}
                                totalWeight={parseNumber(form.getValues("weight") || "")}
                            />
                        </div>
                    )}
                </div>

                <p className="text-sm text-muted-foreground text-center mt-8">
                    Disclaimer: This calculator provides estimations based on standard formulas. For personalized health advice,
                    consult a qualified healthcare professional or dietitian.
                </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}