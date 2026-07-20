// components/calculator/creatinine-clearence-calcualtor.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, RefreshCw, Activity, AlertCircle, Loader2, Info, GitCompareArrows, Layers } from "lucide-react"

// --- helpers & constants ---
const MGDL_TO_UMOL = 88.4
const KG_TO_LBS = 2.20462
const PRECISION_WEIGHT = 1   // 1 decimal for weight
const PRECISION_SCR_MGDL = 2 // 2 decimals for mg/dL
const PRECISION_SCR_UMOL = 0 // integer for µmol/L
const PRECISION_BSA = 2
const PRECISION_BMI = 1

function parseNumberSafe(value?: string | null, fallback = NaN) {
  if (value === undefined || value === null) return fallback
  const v = Number(String(value).trim())
  return Number.isFinite(v) ? v : fallback
}

function kgToLbs(kg: number) {
  return kg * KG_TO_LBS
}
function lbsToKg(lbs: number) {
  return lbs / KG_TO_LBS
}
function mgdlToUmol(val: number) {
  return val * MGDL_TO_UMOL
}
function umolToMgdl(val: number) {
  return val / MGDL_TO_UMOL
}
function round(v: number, p = 2) {
  if (!isFinite(v)) return NaN
  const f = Math.pow(10, p)
  return Math.round(v * f) / f
}

// --- schema (height optional) ---
const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  age: z.string()
    .min(1, "Age is required")
    .refine(val => {
      const n = Number(val)
      return Number.isFinite(n) && n >= 18 && n <= 120
    }, { message: "Age must be between 18 and 120" }),
  weight: z.string().min(1, "Weight is required").refine(v => Number(v) > 0, { message: "Weight must be valid" }),
  creatinine: z.string().min(1, "Creatinine is required").refine(v => Number(v) > 0, { message: "Creatinine must be valid" }),
  weightUnit: z.enum(["kg", "lbs"]),
  creatinineUnit: z.enum(["mgdl", "umol"]),
  // NEW optional height fields
  height: z.string().optional(),
  heightUnit: z.enum(["cm", "in"]).optional(),
})

interface CalculationResult {
  crClActual: number;    // CrCl using actual body weight
  crClIBW?: number;      // CrCl using ideal body weight
  crClABW?: number;      // CrCl using adjusted body weight
  ibw?: number;          // Ideal body weight
  abw?: number;          // Adjusted body weight
  weightKg: number;      // Weight in kg used for calculation
  bmi?: number;
  bsa?: number;
  stage: string;
  description: string;
  color: string;
  // ── ADDITIVE FEATURE 1: CKD / kidney-function stage (KDIGO G-stages) ──
  ckdStage: string;          // e.g. "G2"
  ckdLabel: string;          // e.g. "Mildly Decreased"
  ckdRange: string;          // e.g. "60–89 mL/min"
  ckdBadgeClasses: string;   // colour cue classes for the badge
  ckdBarPercent: number;     // 0–100 position on the stage spectrum
  // ── ADDITIVE FEATURE 2: eGFR cross-check vs Cockcroft-Gault ──
  egfr?: number;             // CKD-EPI 2021 eGFR (mL/min/1.73m²) when computable
  egfrVsCrclDiff?: number;   // CrCl(actual) − eGFR
}

// ── ADDITIVE FEATURE 1 HELPER: map a clearance value to a KDIGO G-stage ──
function getCkdStage(value: number): {
  ckdStage: string
  ckdLabel: string
  ckdRange: string
  ckdBadgeClasses: string
  ckdBarPercent: number
} {
  // Position on a 0–120 visual spectrum (capped) for the colour bar.
  const ckdBarPercent = Math.min(100, Math.max(0, (value / 120) * 100))
  if (value >= 90)
    return { ckdStage: "G1", ckdLabel: "Normal or High", ckdRange: "≥90 mL/min", ckdBadgeClasses: "bg-green-50 text-green-700 border-green-200", ckdBarPercent }
  if (value >= 60)
    return { ckdStage: "G2", ckdLabel: "Mildly Decreased", ckdRange: "60–89 mL/min", ckdBadgeClasses: "bg-lime-50 text-lime-700 border-lime-200", ckdBarPercent }
  if (value >= 45)
    return { ckdStage: "G3a", ckdLabel: "Mild–Moderate Decrease", ckdRange: "45–59 mL/min", ckdBadgeClasses: "bg-yellow-50 text-yellow-700 border-yellow-200", ckdBarPercent }
  if (value >= 30)
    return { ckdStage: "G3b", ckdLabel: "Moderate–Severe Decrease", ckdRange: "30–44 mL/min", ckdBadgeClasses: "bg-orange-50 text-orange-700 border-orange-200", ckdBarPercent }
  if (value >= 15)
    return { ckdStage: "G4", ckdLabel: "Severely Decreased", ckdRange: "15–29 mL/min", ckdBadgeClasses: "bg-red-50 text-red-700 border-red-200", ckdBarPercent }
  return { ckdStage: "G5", ckdLabel: "Kidney Failure (ESRD)", ckdRange: "<15 mL/min", ckdBadgeClasses: "bg-red-100 text-red-800 border-red-300", ckdBarPercent }
}

// --- main component ---
export default function CreatinineClearanceCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [calcError, setCalcError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "male",
      age: "",
      weight: "",
      creatinine: "",
      weightUnit: "kg",
      creatinineUnit: "mgdl",
      height: "",
      heightUnit: "cm",
    },
  })

  // watches for placeholders / UI; we'll not use direct watch for conversion logic
  const weightUnitWatched = form.watch("weightUnit")
  const creatinineUnitWatched = form.watch("creatinineUnit")
  const heightUnitWatched = form.watch("heightUnit")

  // --- conversion handlers that also update the input value live ---
  const handleWeightUnitChange = (newUnit: "kg" | "lbs") => {
    const curUnit = form.getValues("weightUnit")
    if (newUnit === curUnit) {
      form.setValue("weightUnit", newUnit)
      return
    }
    const curValStr = form.getValues("weight")
    const curVal = parseNumberSafe(curValStr)
    if (isFinite(curVal) && curVal > 0) {
      let converted = curVal
      if (newUnit === "lbs" && curUnit === "kg") converted = kgToLbs(curVal)
      else if (newUnit === "kg" && curUnit === "lbs") converted = lbsToKg(curVal)
      form.setValue("weight", round(converted, PRECISION_WEIGHT).toString(), { shouldValidate: true, shouldDirty: true })
    }
    form.setValue("weightUnit", newUnit)
  }

  const handleCreatinineUnitChange = (newUnit: "mgdl" | "umol") => {
    const curUnit = form.getValues("creatinineUnit")
    if (newUnit === curUnit) {
      form.setValue("creatinineUnit", newUnit)
      return
    }
    const curValStr = form.getValues("creatinine")
    const curVal = parseNumberSafe(curValStr)
    if (isFinite(curVal) && curVal > 0) {
      let converted = curVal
      if (newUnit === "umol" && curUnit === "mgdl") converted = mgdlToUmol(curVal)
      else if (newUnit === "mgdl" && curUnit === "umol") converted = umolToMgdl(curVal)
      const prec = newUnit === "umol" ? PRECISION_SCR_UMOL : PRECISION_SCR_MGDL
      form.setValue("creatinine", round(converted, prec).toString(), { shouldValidate: true, shouldDirty: true })
    }
    form.setValue("creatinineUnit", newUnit)
  }

  const handleHeightUnitChange = (newUnit: "cm" | "in") => {
    const curUnit = form.getValues("heightUnit")
    if (newUnit === curUnit) {
      form.setValue("heightUnit", newUnit)
      return
    }
    const curValStr = form.getValues("height")
    const curVal = parseNumberSafe(curValStr)
    if (isFinite(curVal) && curVal > 0) {
      let converted = curVal
      if (newUnit === "in" && curUnit === "cm") converted = curVal / 2.54
      else if (newUnit === "cm" && curUnit === "in") converted = curVal * 2.54
      form.setValue("height", round(converted, 1).toString(), { shouldValidate: true, shouldDirty: true })
    }
    form.setValue("heightUnit", newUnit)
  }

  // onSubmit with safe parsing and optional height handling
  function onSubmit(values: z.infer<typeof formSchema>) {
    setCalcError(null)
    setIsLoading(true)
    setResult(null)

    setTimeout(() => {
      // parse numeric inputs safely
      const age = parseNumberSafe(values.age)
      let weight = parseNumberSafe(values.weight)
      let creatinine = parseNumberSafe(values.creatinine)
      const weightUnit = values.weightUnit
      const creatUnit = values.creatinineUnit
      const heightProvided = values.height !== undefined && values.height !== ""
      const height = heightProvided ? parseNumberSafe(values.height) : NaN
      const heightUnit = values.heightUnit ?? "cm"

      // basic validation
      if (!isFinite(age) || age <= 0) {
        setCalcError("Please enter a valid age.")
        setIsLoading(false)
        return
      }
      if (!isFinite(weight) || weight <= 0) {
        setCalcError("Please enter a valid weight.")
        setIsLoading(false)
        return
      }
      if (!isFinite(creatinine) || creatinine <= 0) {
        setCalcError("Please enter a valid serum creatinine (> 0).")
        setIsLoading(false)
        return
      }

      // Convert to standard units: kg & mg/dL
      if (weightUnit === "lbs") weight = lbsToKg(weight)
      if (creatUnit === "umol") creatinine = umolToMgdl(creatinine)

      // Cockcroft-Gault (uses weight in kg and Scr in mg/dL)
      const isFemale = values.gender === "female"
      
      // Calculate CrCl for a given weight
      const calculateCrCl = (w: number) => {
        const base = ((140 - age) * w) / (72 * creatinine)
        return isFemale ? base * 0.85 : base
      }
      
      // CrCl using actual body weight
      let crClActual = calculateCrCl(weight)
      
      // safety if something odd
      if (!isFinite(crClActual) || crClActual <= 0) {
        setCalcError("Unable to calculate with given inputs. Check values.")
        setIsLoading(false)
        return
      }

      // Calculate IBW (Devine formula) if height provided
      let ibw: number | undefined = undefined
      let crClIBW: number | undefined = undefined
      let abw: number | undefined = undefined
      let crClABW: number | undefined = undefined
      
      if (heightProvided && isFinite(height) && height > 0) {
        const heightInches = heightUnit === "in" ? height : height / 2.54
        
        // Devine formula for IBW
        if (values.gender === "male") {
          ibw = 50 + 2.3 * (heightInches - 60)
        } else {
          ibw = 45.5 + 2.3 * (heightInches - 60)
        }
        
        // CrCl using IBW
        crClIBW = calculateCrCl(ibw)
        
        // Adjusted Body Weight (ABW) = IBW + 0.4 * (Actual - IBW)
        abw = ibw + 0.4 * (weight - ibw)
        
        // CrCl using ABW
        crClABW = calculateCrCl(abw)
      }

      // Optional BMI & BSA if height provided
      let bmi: number | undefined = undefined
      let bsa: number | undefined = undefined
      if (heightProvided && isFinite(height) && height > 0) {
        const heightCm = heightUnit === "in" ? height * 2.54 : height
        const heightM = heightCm / 100
        bmi = round(weight / (heightM * heightM), PRECISION_BMI)
        // DuBois BSA
        bsa = round(0.007184 * Math.pow(weight, 0.425) * Math.pow(heightCm, 0.725), PRECISION_BSA)
      }

      // round output for UI - use actual body weight CrCl as primary
      const crClActualRounded = round(crClActual, 1)

      // ── ADDITIVE FEATURE 1: KDIGO G-stage for the primary clearance value ──
      const ckd = getCkdStage(crClActualRounded)

      // ── ADDITIVE FEATURE 2: eGFR cross-check (CKD-EPI 2021, race-free) ──
      // Inputs already available: age, sex, serum creatinine (mg/dL).
      // eGFR = 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^-1.200 × 0.9938^Age × (1.012 if female)
      let egfr: number | undefined = undefined
      let egfrVsCrclDiff: number | undefined = undefined
      if (isFinite(creatinine) && creatinine > 0 && isFinite(age) && age > 0) {
        const kappa = isFemale ? 0.7 : 0.9
        const alpha = isFemale ? -0.241 : -0.302
        const scrK = creatinine / kappa
        const egfrRaw =
          142 *
          Math.pow(Math.min(scrK, 1), alpha) *
          Math.pow(Math.max(scrK, 1), -1.2) *
          Math.pow(0.9938, age) *
          (isFemale ? 1.012 : 1)
        if (isFinite(egfrRaw) && egfrRaw > 0) {
          egfr = round(egfrRaw, 1)
          egfrVsCrclDiff = round(crClActualRounded - egfr, 1)
        }
      }

      // Interpretation using KDIGO ranges but applied for CrCl here (simple rule-of-thumb)
      let stage = ""
      let description = ""
      let color = ""

      if (crClActualRounded >= 90) {
        stage = "Normal Kidney Function"
        description = "Your calculated clearance suggests normal or high kidney function."
        color = "text-green-600 dark:text-green-400"
      } else if (crClActualRounded >= 60) {
        stage = "Mild Impairment"
        description = "Slightly decreased kidney function. Monitor changes over time."
        color = "text-yellow-600 dark:text-yellow-400"
      } else if (crClActualRounded >= 30) {
        stage = "Moderate Impairment"
        description = "Moderately decreased kidney function. Medical consultation recommended."
        color = "text-orange-600 dark:text-orange-400"
      } else if (crClActualRounded >= 15) {
        stage = "Severe Impairment"
        description = "Severely decreased kidney function. Requires medical attention."
        color = "text-red-600 dark:text-red-400"
      } else {
        stage = "Kidney Failure"
        description = "Critical level. Immediate medical intervention is likely required."
        color = "text-red-700 dark:text-red-500 font-bold"
      }

      setResult({
        crClActual: crClActualRounded,
        crClIBW: crClIBW !== undefined ? round(crClIBW, 1) : undefined,
        crClABW: crClABW !== undefined ? round(crClABW, 1) : undefined,
        ibw: ibw !== undefined ? round(ibw, 1) : undefined,
        abw: abw !== undefined ? round(abw, 1) : undefined,
        weightKg: round(weight, 1),
        bmi: bmi,
        bsa: bsa,
        stage,
        description,
        color,
        ckdStage: ckd.ckdStage,
        ckdLabel: ckd.ckdLabel,
        ckdRange: ckd.ckdRange,
        ckdBadgeClasses: ckd.ckdBadgeClasses,
        ckdBarPercent: ckd.ckdBarPercent,
        egfr,
        egfrVsCrclDiff,
      })

      setIsLoading(false)
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }, 350)
  }

  const resetCalculator = () => {
    form.reset()
    setResult(null)
    setCalcError(null)
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto shadow-lg" id="calculator">
        <CardHeader className="bg-muted/30 pb-8">
            <CardTitle className="flex items-center gap-2 text-2xl"><Activity className="w-6 h-6 text-primary" /> Creatinine Clearance Calculator</CardTitle>
            <CardDescription>Estimate kidney function (GFR) using the Cockcroft-Gault equation.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Gender Selection */}
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Biological Sex</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Male</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">Female</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Age */}
                <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Age (years)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 45" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                {/* Weight with Unit Toggle (uses conversion handler) */}
                <div className="flex gap-2">
                    <FormField control={form.control} name="weight" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Weight</FormLabel>
                            <FormControl><Input type="number" step="0.1" placeholder={weightUnitWatched === "kg" ? "e.g., 70" : "e.g., 154"} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormItem className="w-24">
                      <FormLabel>&nbsp;</FormLabel>
                      <Select onValueChange={(val) => handleWeightUnitChange(val as "kg" | "lbs")} defaultValue={form.getValues("weightUnit")}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lbs">lbs</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                </div>

                {/* Optional Height field */}
                <div className="flex gap-2">
                  <FormField control={form.control} name="height" render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Height <span className="text-xs text-muted-foreground">(optional)</span></FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder={heightUnitWatched === "cm" ? "e.g., 175" : "e.g., 69"} {...field} /></FormControl>
                      <FormDescription className="text-xs text-muted-foreground">Provide height to view BMI and BSA (optional).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormItem className="w-24">
                    <FormLabel>&nbsp;</FormLabel>
                    <Select onValueChange={(val) => handleHeightUnitChange(val as "cm" | "in")} defaultValue={form.getValues("heightUnit") ?? "cm"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>

                {/* Creatinine with Unit Toggle */}
                <div className="flex gap-2 md:col-span-2">
                    <FormField control={form.control} name="creatinine" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Serum Creatinine</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder={creatinineUnitWatched === "mgdl" ? "e.g., 1.2" : "e.g., 106"} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormItem className="w-32">
                      <FormLabel>&nbsp;</FormLabel>
                      <Select onValueChange={(val) => handleCreatinineUnitChange(val as "mgdl" | "umol")} defaultValue={form.getValues("creatinineUnit")}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="mgdl">mg/dL</SelectItem>
                            <SelectItem value="umol">µmol/L</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                </div>
              </div>

              {calcError && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{calcError}</div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate Creatinine Clearance'}
                </Button>
                <Button type="button" variant="outline" onClick={resetCalculator} className="flex-1" disabled={isLoading}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef}>
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 border-primary/20 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-primary/5">
                <CardTitle className="text-2xl text-center">Your Estimated Creatinine Clearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="text-6xl font-extrabold text-primary tracking-tighter">
                        {result.crClActual}
                    </div>
                    <div className="text-muted-foreground font-medium mt-1">mL/min</div>
                    <div className="text-sm text-muted-foreground mt-1">using Actual Body Weight ({result.weightKg} kg)</div>
                </div>

                {/* CrCl Comparison Cards - only show when height is provided */}
                {(typeof result.crClIBW !== "undefined" || typeof result.crClABW !== "undefined") && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-center">Creatinine Clearance Comparison</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 dark:text-green-300 mb-1">Using Actual Weight</div>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">{result.crClActual} mL/min</div>
                      </div>
                      {typeof result.crClIBW !== "undefined" && (
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
                          <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Using IBW ({result.ibw} kg)</div>
                          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{result.crClIBW} mL/min</div>
                        </div>
                      )}
                      {typeof result.crClABW !== "undefined" && (
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200">
                          <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Using ABW ({result.abw} kg)</div>
                          <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">{result.crClABW} mL/min</div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      For obese patients (BMI ≥30 or {">"}20% above IBW), use Adjusted Body Weight (ABW). For normal/underweight patients, use Actual Body Weight.
                    </p>
                  </div>
                )}

                {/* BMI & BSA cards: only show when present */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {typeof result.bmi !== "undefined" && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">BMI</div>
                      <div className="font-bold text-lg">{result.bmi?.toFixed(1)}</div>
                    </div>
                  )}
                  {typeof result.bsa !== "undefined" && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">BSA (m²)</div>
                      <div className="font-bold text-lg">{result.bsa?.toFixed(2)}</div>
                    </div>
                  )}
                  {typeof result.ibw !== "undefined" && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Ideal Body Weight</div>
                      <div className="font-bold text-lg">{result.ibw?.toFixed(1)} kg</div>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-muted/50 rounded-xl border text-center">
                    <h4 className="text-sm uppercase tracking-wide text-muted-foreground font-semibold mb-2">Interpretation</h4>
                    <p className={`text-2xl font-bold ${result.color} mb-2`}>{result.stage}</p>
                    <p className="text-muted-foreground">{result.description}</p>
                </div>

                {/* ── ADDITIVE FEATURE 1: Kidney-function / CKD stage ── */}
                <div className="rounded-xl border bg-card p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-base font-bold text-emerald-700">Kidney Function Stage (KDIGO)</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A clearance of <strong className="text-foreground">{result.crClActual} mL/min</strong> places this
                    result in stage{" "}
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${result.ckdBadgeClasses}`}>
                      {result.ckdStage} · {result.ckdLabel}
                    </span>{" "}
                    (the {result.ckdRange} band), giving the number immediate clinical meaning.
                  </p>

                  {/* Stage spectrum bar */}
                  <div className="relative mt-5 w-full h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500">
                    <div
                      className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-700 shadow-lg transition-all duration-700"
                      style={{ left: `${result.ckdBarPercent}%` }}
                      title={`${result.crClActual} mL/min`}
                    />
                  </div>
                  <div className="mt-2 flex justify-between px-1 text-[11px] font-semibold text-muted-foreground">
                    <span>G5 (&lt;15)</span>
                    <span>G3 (30–59)</span>
                    <span>G1 (≥90)</span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    G1 and G2 are only classified as chronic kidney disease when other evidence of kidney damage
                    (e.g. albuminuria) is present. Staging here is for context, not diagnosis.
                  </p>
                </div>

                {/* ── ADDITIVE FEATURE 2: Cockcroft-Gault vs eGFR cross-check ── */}
                <div className="rounded-xl border bg-card p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <GitCompareArrows className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-base font-bold text-emerald-700">Cockcroft-Gault vs eGFR Cross-Check</h4>
                  </div>

                  {typeof result.egfr !== "undefined" ? (
                    <>
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-lg border bg-muted/40 p-4 text-center">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cockcroft-Gault CrCl</div>
                          <div className="mt-1 text-2xl font-bold text-foreground">{result.crClActual}</div>
                          <div className="text-xs text-muted-foreground">mL/min</div>
                        </div>
                        <div className="rounded-lg border bg-muted/40 p-4 text-center">
                          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">CKD-EPI eGFR</div>
                          <div className="mt-1 text-2xl font-bold text-foreground">{result.egfr}</div>
                          <div className="text-xs text-muted-foreground">mL/min/1.73m²</div>
                        </div>
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
                          <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">Difference</div>
                          <div className="mt-1 text-2xl font-bold text-emerald-700">
                            {result.egfrVsCrclDiff !== undefined && result.egfrVsCrclDiff > 0 ? "+" : ""}
                            {result.egfrVsCrclDiff}
                          </div>
                          <div className="text-xs text-emerald-700/80">CrCl − eGFR</div>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                        The two estimates can diverge because they normalise differently. Cockcroft-Gault scales clearance
                        to <strong className="text-foreground">body weight</strong>, so it tends to read higher in heavier or
                        more muscular people and lower with low muscle mass. CKD-EPI eGFR is normalised to a standard{" "}
                        <strong className="text-foreground">1.73 m² body surface area</strong> and ignores weight, so it
                        reflects "average-sized" kidney function. Most drug labels are written against Cockcroft-Gault CrCl,
                        while eGFR is the standard for CKD staging — checking both reduces dosing surprises.
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      eGFR could not be estimated from the current inputs. Conceptually, Cockcroft-Gault CrCl normalises
                      clearance to <strong className="text-foreground">body weight</strong> (so it shifts with body size and
                      muscle mass), whereas CKD-EPI eGFR normalises to a standard{" "}
                      <strong className="text-foreground">1.73 m² body surface area</strong> and ignores weight. That is why
                      the two methods can report different numbers for the same patient — and why drug labels (Cockcroft-Gault)
                      and CKD staging (eGFR) often quote each separately.
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                        <strong>Note:</strong> This result is based on the Cockcroft-Gault equation. It is an estimation of Glomerular Filtration Rate (GFR). Do not use this calculator for dosing dangerous medications without consulting a medical professional.
                    </p>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
