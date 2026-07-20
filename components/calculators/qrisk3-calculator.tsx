"use client";

import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Calculator, RefreshCw, Loader2, Heart, AlertCircle, Info, TrendingUp, TrendingDown, CheckCircle2, History, ChevronRight, BarChart3, Users, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { parseNumber } from "@/lib/utils"

// --- FORM SCHEMA ---
const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 25 && num <= 84;
  }, { message: "Age must be between 25 and 84 for Qrisk3." }),
  ethnicity: z.string({ required_error: "Ethnicity is required" }),
  smokingStatus: z.enum(["0", "1", "2", "3", "4"], { required_error: "Smoking status is required" }),
  diabetes: z.enum(["no", "type1", "type2"], { required_error: "Diabetes status is required" }),
  familyHistory: z.boolean().default(false),
  ckd: z.boolean().default(false),
  atrialFibrillation: z.boolean().default(false),
  bpTreatment: z.boolean().default(false),
  rheumatoidArthritis: z.boolean().default(false),
  height: z.string().min(1, "Height is required"),
  weight: z.string().min(1, "Weight is required"),
  systolicBP: z.string().min(1, "Systolic BP is required (e.g. 120)"),
  cholesterolRatio: z.string().min(1, "Cholesterol/HDL ratio is required (e.g. 4.0)"),
});

// --- TYPES ---
// Each contributing factor and roughly how much it pushes the risk up or down.
interface RiskFactor {
  label: string;
  // Multiplier applied to the running risk (1.0 = neutral, >1 raises, <1 lowers).
  multiplier: number;
  // Human-readable "+25%" / "−15%" / "baseline" style delta derived from multiplier.
  effectLabel: string;
  direction: "up" | "down" | "neutral";
  detail: string;
}

interface QriskResult {
  score: number;
  heartAge: number;
  bmi: number;
  riskLevel: "Low" | "Moderate" | "High";
  riskColor: string;
  recommendations: string[];
  // FEATURE 1 — per-factor breakdown of what drove the score.
  baseRisk: number;
  factors: RiskFactor[];
  // FEATURE 2 — relative / equivalent risk read vs a healthy peer.
  healthyReferenceRisk: number;
  relativeRisk: number;
  age: number;
  gender: "male" | "female";
}

// Convert a risk multiplier into a readable "+/-%" delta + direction for the breakdown.
const effectFrom = (multiplier: number): { effectLabel: string; direction: "up" | "down" | "neutral" } => {
  const pct = Math.round((multiplier - 1) * 100);
  if (pct > 0) return { effectLabel: `+${pct}%`, direction: "up" };
  if (pct < 0) return { effectLabel: `${pct}%`, direction: "down" };
  return { effectLabel: "no change", direction: "neutral" };
};

// --- CALCULATION LOGIC (SIMULATION) ---
// Note: The actual Qrisk3 algorithm uses a proprietary coefficient table with thousands of data points.
// This function SIMULATES the weighting logic for educational purposes.
const calculateRisk = (values: z.infer<typeof formSchema>): QriskResult => {
  const age = parseNumber(values.age);
  const height = parseNumber(values.height) / 100; // convert to m
  const weight = parseNumber(values.weight);
  const bmi = weight / (height * height);
  const sbp = parseNumber(values.systolicBP);
  const ratio = parseNumber(values.cholesterolRatio);

  // 1. Base Risk (Exponential age curve)
  // Male starts higher, Female catches up post-menopause
  let risk = values.gender === 'male'
    ? 0.05 * Math.exp(0.06 * (age - 25))
    : 0.03 * Math.exp(0.065 * (age - 25));

  // FEATURE 1 — capture the age-driven baseline before any modifiers apply.
  const baseRisk = risk;
  const factors: RiskFactor[] = [];

  // 2. Ethnicity Multipliers (Specific for UK/UAE populations)
  // South Asians have higher CVD risk
  let ethnicityMult = 1.0;
  switch (values.ethnicity) {
    case "indian":
    case "pakistani":
    case "bangladeshi":
      ethnicityMult = 1.5;
      break;
    case "black_african":
    case "black_caribbean":
      ethnicityMult = 0.85; // Often lower CHD risk but higher Stroke risk - averaged here
      break;
    case "chinese":
      ethnicityMult = 0.7;
      break;
    default:
      ethnicityMult = 1.0; // White/Other stays baseline
  }
  risk *= ethnicityMult;
  if (ethnicityMult !== 1.0) {
    factors.push({
      label: "Ethnicity",
      multiplier: ethnicityMult,
      ...effectFrom(ethnicityMult),
      detail: ethnicityMult > 1 ? "Higher background CVD risk in this group." : "Lower background CVD risk in this group.",
    });
  }

  // 3. Clinical Factors
  // Smoking is massive
  const smokingMultipliers = [1.0, 1.2, 1.5, 2.0, 2.5]; // Non, Ex, Light, Mod, Heavy
  const smokingMult = smokingMultipliers[parseInt(values.smokingStatus)];
  risk *= smokingMult;
  if (smokingMult !== 1.0) {
    factors.push({
      label: "Smoking",
      multiplier: smokingMult,
      ...effectFrom(smokingMult),
      detail: "Tobacco exposure accelerates arterial damage — the most modifiable factor here.",
    });
  }

  // Diabetes
  const diabetesMult = values.diabetes === 'type1' ? 2.5 : values.diabetes === 'type2' ? 1.8 : 1.0;
  if (values.diabetes === 'type1') risk *= 2.5;
  if (values.diabetes === 'type2') risk *= 1.8;
  if (diabetesMult !== 1.0) {
    factors.push({
      label: values.diabetes === 'type1' ? "Type 1 Diabetes" : "Type 2 Diabetes",
      multiplier: diabetesMult,
      ...effectFrom(diabetesMult),
      detail: "Raised blood glucose damages blood vessels over time.",
    });
  }

  // Family History
  if (values.familyHistory) risk *= 1.5;
  if (values.familyHistory) {
    factors.push({
      label: "Family History",
      multiplier: 1.5,
      ...effectFrom(1.5),
      detail: "A first-degree relative with early heart disease raises inherited risk.",
    });
  }

  // Comorbidities
  if (values.ckd) risk *= 1.4;
  if (values.atrialFibrillation) risk *= 1.6;
  if (values.rheumatoidArthritis) risk *= 1.3;
  if (values.ckd) factors.push({ label: "Chronic Kidney Disease", multiplier: 1.4, ...effectFrom(1.4), detail: "Reduced kidney function is independently linked to cardiovascular events." });
  if (values.atrialFibrillation) factors.push({ label: "Atrial Fibrillation", multiplier: 1.6, ...effectFrom(1.6), detail: "Irregular heart rhythm increases the chance of clot-related stroke." });
  if (values.rheumatoidArthritis) factors.push({ label: "Rheumatoid Arthritis", multiplier: 1.3, ...effectFrom(1.3), detail: "Chronic systemic inflammation contributes to arterial plaque." });

  // 4. Measurements
  // BMI Impact (Risk increases significantly over 30)
  if (bmi > 25) {
    const bmiMult = 1 + ((bmi - 25) * 0.02);
    risk *= bmiMult;
    factors.push({
      label: `BMI (${bmi.toFixed(1)})`,
      multiplier: bmiMult,
      ...effectFrom(bmiMult),
      detail: "Excess body weight above a BMI of 25 adds metabolic strain.",
    });
  }

  // Blood Pressure (Standard ~120)
  if (sbp > 120) {
    // If on treatment, risk is higher because underlying pathology exists
    const treatmentFactor = values.bpTreatment ? 1.2 : 1.0;
    const bpMult = (1 + ((sbp - 120) * 0.015)) * treatmentFactor;
    risk *= bpMult;
    factors.push({
      label: `Blood Pressure (${sbp} mmHg)`,
      multiplier: bpMult,
      ...effectFrom(bpMult),
      detail: values.bpTreatment
        ? "Systolic pressure above 120 mmHg, with existing BP treatment, raises risk."
        : "Systolic pressure above 120 mmHg increases load on artery walls.",
    });
  }

  // Cholesterol Ratio (Standard ~4.0)
  let cholMult: number;
  if (ratio > 4) {
    cholMult = 1 + ((ratio - 4) * 0.1);
    risk *= cholMult;
  } else {
    cholMult = 1 - ((4 - ratio) * 0.05);
    risk *= cholMult;
  }
  if (Math.abs(cholMult - 1) > 0.0001) {
    factors.push({
      label: `Cholesterol Ratio (${ratio.toFixed(1)})`,
      multiplier: cholMult,
      ...effectFrom(cholMult),
      detail: cholMult > 1
        ? "A Total:HDL ratio above 4.0 favours plaque build-up."
        : "A Total:HDL ratio below 4.0 is protective and lowers risk.",
    });
  }

  // Cap risk at 99% and Floor at 0.1%
  let finalScore = Math.min(99, Math.max(0.1, risk));
  
  // Calculate Heart Age (Heuristic)
  // If score matches average for age, heart age = age. If higher, heart age > age.
  const expectedRisk = values.gender === 'male' 
    ? 0.05 * Math.exp(0.06 * (age - 25))
    : 0.03 * Math.exp(0.065 * (age - 25));
  
  const ageDiff = (Math.log(finalScore / expectedRisk) / 0.06); 
  // Clamp heart age between Age and Age + 20
  let heartAge = Math.round(age + Math.max(0, ageDiff));
  if (heartAge > 95) heartAge = 95;

  // Recommendations
  let level: "Low" | "Moderate" | "High" = "Low";
  let color = "text-green-600";
  const recs = [];

  if (finalScore >= 20) {
    level = "High";
    color = "text-red-600";
    recs.push("Consult your GP immediately regarding Statin therapy.");
    recs.push("Strict blood pressure control is required.");
  } else if (finalScore >= 10) {
    level = "Moderate";
    color = "text-yellow-600";
    recs.push("Consider lifestyle changes to lower cholesterol.");
    recs.push("Monitor blood pressure regularly.");
  } else {
    recs.push("Maintain your current healthy lifestyle.");
  }

  if (parseInt(values.smokingStatus) > 0) recs.push("Stopping smoking is the single best thing you can do to lower this score.");
  if (bmi > 30) recs.push("Weight reduction will significantly improve your heart age.");
  if (ratio > 5) recs.push("Your cholesterol ratio is high - consider dietary changes.");

  // FEATURE 2 — equivalent / relative risk read.
  // expectedRisk is the age/sex baseline of a healthy peer (non-smoker, no comorbidities,
  // normal BMI/BP and an ideal cholesterol ratio) — i.e. an optimal reference person.
  const healthyReferenceRisk = Math.min(99, Math.max(0.1, expectedRisk));
  const relativeRisk = healthyReferenceRisk > 0 ? finalScore / healthyReferenceRisk : 1;

  return {
    score: parseNumber(finalScore.toFixed(1)),
    heartAge,
    bmi: parseNumber(bmi.toFixed(1)),
    riskLevel: level,
    riskColor: color,
    recommendations: recs,
    baseRisk: parseNumber(baseRisk.toFixed(1)),
    factors,
    healthyReferenceRisk: parseNumber(healthyReferenceRisk.toFixed(1)),
    relativeRisk: parseNumber(relativeRisk.toFixed(1)),
    age,
    gender: values.gender,
  };
};

interface SavedEntry {
  date: string;
  score: number;
  heartAge: number;
  bmi: number;
  riskLevel: "Low" | "Moderate" | "High";
  riskColor: string;
  recommendations: string[];
  gender: string;
  age: string;
  ethnicity: string;
  smokingStatus: string;
  diabetes: string;
  familyHistory: boolean;
  ckd: boolean;
  atrialFibrillation: boolean;
  bpTreatment: boolean;
  rheumatoidArthritis: boolean;
  systolicBP: string;
  cholesterolRatio: string;
}

const STORAGE_KEY = "calqulate_qrisk3_history";

function getStorage(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(entry: SavedEntry) {
  try {
    const existing = getStorage();
    existing.unshift(entry);
    const trimmed = existing.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore storage errors
  }
}

function getQriskDeltaLabel(current: SavedEntry, previous: SavedEntry) {
  if (current.riskLevel !== previous.riskLevel) {
    return {
      label: `Risk category changed from ${previous.riskLevel} to ${current.riskLevel}.`,
      positive: current.riskLevel === "Low" || (current.riskLevel === "Moderate" && previous.riskLevel === "High"),
    };
  }

  const delta = Number((current.score - previous.score).toFixed(1));
  if (delta < 0) {
    return { label: `Your risk improved by ${Math.abs(delta)} points compared to the last saved result.`, positive: true };
  }
  if (delta > 0) {
    return { label: `Your risk increased by ${delta} points compared to the last saved result.`, positive: false };
  }
  return { label: "No meaningful change from your last saved result.", positive: true };
}

// --- COMPONENT ---

export default function Qrisk3Calculator() {
  const [result, setResult] = useState<QriskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<SavedEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getStorage());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "female",
      age: "",
      ethnicity: "",
      smokingStatus: "0",
      diabetes: "no",
      familyHistory: false,
      ckd: false,
      atrialFibrillation: false,
      bpTreatment: false,
      rheumatoidArthritis: false,
      height: "",
      weight: "",
      systolicBP: "",
      cholesterolRatio: "",
    },
  });

  const handleSave = () => {
    if (!result) return;

    const values = form.getValues();
    const entry: SavedEntry = {
      date: new Date().toISOString(),
      score: result.score,
      heartAge: result.heartAge,
      bmi: result.bmi,
      riskLevel: result.riskLevel,
      riskColor: result.riskColor,
      recommendations: result.recommendations,
      gender: values.gender,
      age: values.age,
      ethnicity: values.ethnicity,
      smokingStatus: values.smokingStatus,
      diabetes: values.diabetes,
      familyHistory: values.familyHistory,
      ckd: values.ckd,
      atrialFibrillation: values.atrialFibrillation,
      bpTreatment: values.bpTreatment,
      rheumatoidArthritis: values.rheumatoidArthritis,
      systolicBP: values.systolicBP,
      cholesterolRatio: values.cholesterolRatio,
    };

    saveToStorage(entry);
    setHistory(getStorage());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
    setShowHistory(false);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const calcResult = calculateRisk(values);
      setResult(calcResult);
      setIsLoading(false);
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 800);
  }

  const lastSaved = history[0];
  const currentDeltaInfo = result && lastSaved ? getQriskDeltaLabel({
    date: "",
    score: result.score,
    heartAge: result.heartAge,
    bmi: result.bmi,
    riskLevel: result.riskLevel,
    riskColor: result.riskColor,
    recommendations: result.recommendations,
    gender: form.getValues('gender'),
    age: form.getValues('age'),
    ethnicity: form.getValues('ethnicity'),
    smokingStatus: form.getValues('smokingStatus'),
    diabetes: form.getValues('diabetes'),
    familyHistory: form.getValues('familyHistory'),
    ckd: form.getValues('ckd'),
    atrialFibrillation: form.getValues('atrialFibrillation'),
    bpTreatment: form.getValues('bpTreatment'),
    rheumatoidArthritis: form.getValues('rheumatoidArthritis'),
    systolicBP: form.getValues('systolicBP'),
    cholesterolRatio: form.getValues('cholesterolRatio'),
  }, lastSaved) : null;

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b pb-6">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Activity className="w-6 h-6 text-red-500" /> 
            Qrisk3 Calculator (UK/UAE)
          </CardTitle>
          <CardDescription className="text-base">
            Complete the form below to estimate your 10-year risk of heart disease or stroke.
            <br/>
            <span className="text-xs text-muted-foreground italic">*This tool uses a simulation algorithm for educational purposes.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* SECTION 1: PERSONAL DETAILS */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                   1. Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="female" /></FormControl>
                              <FormLabel className="font-normal">Female</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="male" /></FormControl>
                              <FormLabel className="font-normal">Male</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age (25-84)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ethnicity"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Ethnicity (UK/UAE Categories)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your ethnic background" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="white">White or not stated</SelectItem>
                            <SelectItem value="indian">Indian</SelectItem>
                            <SelectItem value="pakistani">Pakistani</SelectItem>
                            <SelectItem value="bangladeshi">Bangladeshi</SelectItem>
                            <SelectItem value="other_asian">Other Asian</SelectItem>
                            <SelectItem value="black_caribbean">Black Caribbean</SelectItem>
                            <SelectItem value="black_african">Black African</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Ethnicity significantly impacts heart risk calculations in this region.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* SECTION 2: CLINICAL MEASUREMENTS */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                   2. Clinical Measurements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="175" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl><Input type="number" placeholder="75" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="systolicBP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Systolic BP (mmHg)</FormLabel>
                        <FormControl><Input type="number" placeholder="120" {...field} /></FormControl>
                        <FormDescription className="text-xs">Top number of reading</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cholesterolRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cholesterol/HDL Ratio</FormLabel>
                        <FormControl><Input type="number" placeholder="4.0" step="0.1" {...field} /></FormControl>
                        <FormDescription className="text-xs">Total Chol divided by HDL</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* SECTION 3: MEDICAL HISTORY */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2">
                   3. Medical History & Lifestyle
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="smokingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Smoking Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Non-smoker</SelectItem>
                            <SelectItem value="1">Ex-smoker</SelectItem>
                            <SelectItem value="2">Light smoker (&lt;10/day)</SelectItem>
                            <SelectItem value="3">Moderate smoker (10-19/day)</SelectItem>
                            <SelectItem value="4">Heavy smoker (20+/day)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diabetes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diabetes Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no">No Diabetes</SelectItem>
                            <SelectItem value="type1">Type 1</SelectItem>
                            <SelectItem value="type2">Type 2</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                   {/* Checkboxes for boolean values */}
                   <FormField
                    control={form.control}
                    name="familyHistory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Angina/Heart attack in 1st degree relative &lt; 60?</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="atrialFibrillation"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Atrial Fibrillation</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bpTreatment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>On Blood Pressure Treatment</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ckd"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Chronic Kidney Disease (Stage 3+)</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rheumatoidArthritis"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Rheumatoid Arthritis</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                  {isLoading ? 'Calculating Risk...' : 'Calculate QRISK3 Score'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { form.reset(); setResult(null); }}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Reset Form
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

      {/* --- RESULTS SECTION --- */}
      <div ref={resultsRef} className="scroll-mt-20">
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 border-2 border-primary/10 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className={`h-3 w-full ${result.riskLevel === 'High' ? 'bg-red-500' : result.riskLevel === 'Moderate' ? 'bg-yellow-500' : 'bg-green-500'}`} />
            
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold text-gray-800">Your Results</CardTitle>
              <CardDescription>Based on the Qrisk3 (UK/UAE) estimation logic</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8 space-y-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Save this result to compare against your previous QRISK3 scores later.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSave} disabled={!result} className="flex-1 sm:flex-none">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Save Result
                  </Button>
                  <Button variant="secondary" onClick={() => setShowHistory((current) => !current)} className="flex-1 sm:flex-none">
                    <History className="h-4 w-4 mr-2" /> {showHistory ? 'Hide History' : 'Show History'}
                  </Button>
                </div>
              </div>

              {saved && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  Saved successfully! Your latest result is stored locally in your browser.
                </div>
              )}

              {showHistory && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-base font-semibold">Saved QRISK3 History</h4>
                      <p className="text-sm text-muted-foreground">Review your most recent saved scores and compare with the current result.</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      Clear History
                    </Button>
                  </div>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved history yet. Save a result to build your history.</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((entry, index) => (
                        <div key={entry.date} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">{new Date(entry.date).toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{entry.riskLevel} risk — {entry.score}%</p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                              {entry.heartAge} heart age
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                            <div>Age: {entry.age}</div>
                            <div>BMI: {entry.bmi}</div>
                            <div>Systolic BP: {entry.systolicBP}</div>
                            <div>Chol/HDL: {entry.cholesterolRatio}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PRIMARY SCORES */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                
                {/* 1. Risk Score Card */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 shadow-inner">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">10-Year Cardiovascular Risk</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`text-6xl font-black ${result.riskColor}`}>
                      {result.score}%
                    </span>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mt-4 ${result.riskLevel === 'High' ? 'bg-red-100 text-red-700' : result.riskLevel === 'Moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {result.riskLevel} Risk
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 px-4">
                    This means there is a {result.score}% chance of having a heart attack or stroke in the next 10 years.
                  </p>
                </div>

                {/* 2. Heart Age Card */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200 shadow-inner">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Heart Age</p>
                  <div className="flex items-center justify-center gap-2">
                    <Heart className={`w-12 h-12 ${result.heartAge > parseInt(form.getValues('age')) ? 'text-red-500' : 'text-green-500'}`} fill="currentColor" />
                    <span className="text-6xl font-black text-gray-800">
                      {result.heartAge}
                    </span>
                  </div>
                  <p className="text-sm font-medium mt-4 text-gray-600">
                     Real Age: <span className="text-gray-900">{form.getValues('age')}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 px-4">
                    {result.heartAge > parseInt(form.getValues('age')) 
                      ? "Your heart age is higher than your actual age. Lifestyle changes can help reverse this."
                      : "Great! Your heart age is consistent with or better than your actual age."}
                  </p>
                </div>
              </div>

              {/* BMI INFO */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-blue-600 w-5 h-5" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Your Calculated BMI:</span>
                </div>
                <span className="font-bold text-xl text-blue-700 dark:text-blue-200">{result.bmi}</span>
              </div>

              {/* FEATURE 1 — FACTOR BREAKDOWN ──────────────────────────────── */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">What's Driving Your Score</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Everyone starts from an age-and-sex baseline of{" "}
                  <span className="font-bold text-emerald-700">{result.baseRisk}%</span>. Each factor below then
                  pushes your 10-year risk up or down to reach{" "}
                  <span className="font-bold text-emerald-700">{result.score}%</span>.
                </p>

                <div className="mt-5 space-y-2.5">
                  {/* Baseline row */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Age &amp; Sex Baseline</p>
                        <p className="text-xs text-slate-500">Starting point for a healthy person your age and sex.</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{result.baseRisk}%</span>
                  </div>

                  {result.factors.length === 0 ? (
                    <p className="px-1 text-sm text-slate-500">
                      No additional risk factors moved your score — your result is driven almost entirely by age and sex.
                    </p>
                  ) : (
                    result.factors.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div className="flex items-center gap-2.5">
                          {f.direction === "up" ? (
                            <TrendingUp className="w-4 h-4 text-red-500 flex-shrink-0" />
                          ) : f.direction === "down" ? (
                            <TrendingDown className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Minus className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                            <p className="text-xs text-slate-500 leading-snug">{f.detail}</p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold whitespace-nowrap ${
                            f.direction === "up"
                              ? "text-red-600"
                              : f.direction === "down"
                              ? "text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          {f.effectLabel}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
                  Percentages show roughly how much each factor multiplies your risk relative to baseline. Combined effects compound, so the total is not a simple sum.
                </p>
              </div>

              {/* FEATURE 2 — RELATIVE / EQUIVALENT RISK READ ───────────────── */}
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 md:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">Your Risk in Context</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A healthy {result.age}-year-old {result.gender === "male" ? "man" : "woman"} with no risk factors has
                  an estimated 10-year risk of{" "}
                  <span className="font-bold text-emerald-700">{result.healthyReferenceRisk}%</span>.
                  {result.relativeRisk > 1.05 ? (
                    <>
                      {" "}Yours is{" "}
                      <span className="font-bold text-red-600">{result.relativeRisk}× higher</span> than that healthy peer.
                    </>
                  ) : result.relativeRisk < 0.95 ? (
                    <>
                      {" "}Yours is actually{" "}
                      <span className="font-bold text-emerald-700">lower</span> than that reference — a strong profile.
                    </>
                  ) : (
                    <>
                      {" "}Yours is{" "}
                      <span className="font-bold text-emerald-700">about the same</span> as that healthy peer.
                    </>
                  )}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Healthy Peer</p>
                    <p className="text-2xl font-black text-slate-700 mt-1">{result.healthyReferenceRisk}%</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">You</p>
                    <p className={`text-2xl font-black mt-1 ${result.riskColor}`}>{result.score}%</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                  <Heart className={`w-4 h-4 ${result.heartAge > result.age ? "text-red-500" : "text-emerald-600"}`} fill="currentColor" />
                  <span className="text-sm text-slate-600">
                    Equivalent heart age:{" "}
                    <span className="font-bold text-slate-900">{result.heartAge}</span>{" "}
                    vs real age <span className="font-bold text-slate-900">{result.age}</span>
                  </span>
                </div>
                <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
                  The relative read keeps your percentage meaningful: a small absolute number can still be several times a healthy peer's, while a high number at older ages may be closer to expected.
                </p>
              </div>

              {currentDeltaInfo && (
                <div className={`rounded-2xl p-4 ${currentDeltaInfo.positive ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'} border`}>
                  <p className="text-sm font-semibold">Comparison with last saved result</p>
                  <p className="mt-2 text-sm">{currentDeltaInfo.label}</p>
                </div>
              )}

              {/* RECOMMENDATIONS */}
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800 border-b pb-2">
                  <Info className="w-5 h-5 text-primary" /> Personalized Recommendations
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-700">
                      <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm md:text-base leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MEDICAL DISCLAIMER FOOTER */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start mt-4">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-tight">
                  <strong>Disclaimer:</strong> This calculator is an educational tool based on the Qrisk3 methodology. It does not replace a professional medical consultation. In the UK and UAE, clinical decisions should be made by a doctor using official NHS/DHA approved systems.
                </p>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}