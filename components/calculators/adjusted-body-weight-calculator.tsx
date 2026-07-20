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
import { Calculator, RefreshCw, Loader2, Target, CheckCircle2 } from "lucide-react"
import { parseNumber } from "@/lib/utils"

// ─── VALIDATION SCHEMA ────────────────────────────────────────────────────────
const formSchema = z.object({
  weight: z.string().min(1, "Actual weight is required"),
  height: z.string().min(1, "Height is required"),
  gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
  units: z.enum(["metric", "imperial"]),
})

type UnitSystem = "metric" | "imperial"

interface CalculationResult {
  actualWeight: number
  idealBodyWeight: number
  adjustedBodyWeight: number
  bmi: number
  bmiCategory: string
  dosingLabel: "Actual" | "Ideal" | "Adjusted"
  dosingWeight: number
  dosingReason: string
  unit: string
}

// ─── UNIT CONVERSION ──────────────────────────────────────────────────────────
const cmToInches = (cm: number) => cm / 2.54
const inchesToCm = (inches: number) => inches * 2.54
const kgToLbs = (kg: number) => kg * 2.20462
const lbsToKg = (lbs: number) => lbs / 2.20462

// ─── DOSING WEIGHT RECOMMENDATION ─────────────────────────────────────────────
// Mirrors standard clinical practice: obese/overweight → adjusted, normal → actual, low → ideal.
function recommendDosingWeight(
  bmi: number,
  actual: number,
  ibw: number,
  ajbw: number,
): { label: "Actual" | "Ideal" | "Adjusted"; weight: number; reason: string } {
  if (bmi >= 25) {
    return {
      label: "Adjusted",
      weight: ajbw,
      reason: "Your BMI is in the overweight or obese range, so excess fat would inflate a dose based on actual weight. Adjusted body weight is the safer dosing figure.",
    }
  }
  if (bmi >= 18.5) {
    return {
      label: "Actual",
      weight: actual,
      reason: "Your BMI is in the normal range, so no adjustment is needed. Actual body weight is the correct dosing weight.",
    }
  }
  return {
    label: "Ideal",
    weight: ibw,
    reason: "Your BMI is below the normal range. Adjustment is not indicated here, so ideal body weight is typically used to avoid underdosing.",
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdjustedBodyWeightCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [units, setUnits] = useState<UnitSystem>("metric")
  const [isLoading, setIsLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { weight: "", height: "", gender: "male", units: "metric" },
  })

  const handleUnitChange = (newUnit: UnitSystem) => {
    const current = form.getValues()
    const updated: Record<string, string> = { ...current }

    if (current.height) {
      const h = parseNumber(current.height)
      if (!isNaN(h)) updated.height = newUnit === "imperial" ? cmToInches(h).toFixed(1) : inchesToCm(h).toFixed(1)
    }
    if (current.weight) {
      const wt = parseNumber(current.weight)
      if (!isNaN(wt)) updated.weight = newUnit === "imperial" ? kgToLbs(wt).toFixed(1) : lbsToKg(wt).toFixed(1)
    }

    updated.units = newUnit
    form.reset(updated)
    setUnits(newUnit)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setResult(null)

    setTimeout(() => {
      const weight = parseNumber(values.weight)
      const height = parseNumber(values.height)
      const gender = values.gender

      const weightInKg = units === "metric" ? weight : lbsToKg(weight)
      const heightInCm = units === "metric" ? height : inchesToCm(height)
      const heightInInches = heightInCm / 2.54
      const inchesOver5Feet = Math.max(0, heightInInches - 60)

      // Ideal Body Weight (Devine formula)
      const idealBodyWeight = gender === "male" ? 50 + 2.3 * inchesOver5Feet : 45.5 + 2.3 * inchesOver5Feet

      // Adjusted Body Weight: only above IBW; otherwise actual weight stands
      const adjustedBodyWeight =
        weightInKg > idealBodyWeight ? idealBodyWeight + 0.4 * (weightInKg - idealBodyWeight) : weightInKg

      // Convert to display units
      const finalActual = weight
      const finalIdeal = units === "metric" ? idealBodyWeight : kgToLbs(idealBodyWeight)
      const finalAdjusted = units === "metric" ? adjustedBodyWeight : kgToLbs(adjustedBodyWeight)

      const heightInM = heightInCm / 100
      const bmi = weightInKg / (heightInM * heightInM)
      const bmiCategory = bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obese"
      const dosing = recommendDosingWeight(bmi, finalActual, finalIdeal, finalAdjusted)

      setResult({
        actualWeight: finalActual,
        idealBodyWeight: finalIdeal,
        adjustedBodyWeight: finalAdjusted,
        bmi,
        bmiCategory,
        dosingLabel: dosing.label,
        dosingWeight: dosing.weight,
        dosingReason: dosing.reason,
        unit: units === "metric" ? "kg" : "lbs",
      })
      setIsLoading(false)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150)
    }, 500)
  }

  const resetCalculator = () => {
    form.reset({ weight: "", height: "", gender: "male", units: "metric" })
    setResult(null)
  }

  const weights = result
    ? [
        { key: "Actual", label: "Actual weight", value: result.actualWeight },
        { key: "Ideal", label: "Ideal body weight", value: result.idealBodyWeight },
        { key: "Adjusted", label: "Adjusted body weight", value: result.adjustedBodyWeight },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* ── CALCULATOR ─────────────────────────────────────────────────────────── */}
      <Card className="mx-auto max-w-3xl border-t-4 border-t-emerald-600 shadow-sm">
        <CardHeader className="border-b pb-6">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calculator className="h-6 w-6 text-emerald-700" />
            Adjusted Body Weight Calculator
          </CardTitle>
          <CardDescription className="mt-1">
            Enter your height and weight to get your Ideal (IBW) and Adjusted (AjBW) body weight.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="units"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-sm font-semibold">Units</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value: UnitSystem) => {
                          field.onChange(value)
                          handleUnitChange(value)
                        }}
                        value={field.value}
                        className="flex items-center gap-6"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="metric" /></FormControl>
                          <FormLabel className="cursor-pointer font-normal">Metric (cm, kg)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl><RadioGroupItem value="imperial" /></FormControl>
                          <FormLabel className="cursor-pointer font-normal">Imperial (in, lbs)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Sex</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Height ({units === "metric" ? "cm" : "inches"})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder={units === "metric" ? "e.g. 178" : "e.g. 70"} {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Actual weight ({units === "metric" ? "kg" : "lbs"})</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder={units === "metric" ? "e.g. 95" : "e.g. 210"} {...field} className="h-12 text-lg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Button type="submit" size="lg" className="h-14 flex-1 bg-emerald-700 text-lg font-bold text-white hover:bg-emerald-800" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Calculator className="mr-2 h-5 w-5" />}
                  {isLoading ? "Calculating..." : "Calculate AjBW"}
                </Button>
                <Button type="button" variant="outline" size="lg" className="h-14 text-lg sm:w-40" onClick={resetCalculator} disabled={isLoading}>
                  <RefreshCw className="mr-2 h-5 w-5" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── UNDERSTAND YOUR RESULT ──────────────────────────────────────────────── */}
      <div ref={resultsRef} className="scroll-mt-16">
        {result && (
          <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Understand your result</h2>
              <p className="mt-1 text-sm text-slate-500">Your three weights, and the one to use for dosing.</p>
            </div>

            {/* Three weights */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {weights.map((w) => {
                const isAdjusted = w.key === "Adjusted"
                return (
                  <div
                    key={w.key}
                    className={`rounded-2xl border p-5 text-center ${
                      isAdjusted ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{w.label}</p>
                    <p className={`mt-2 text-3xl font-bold tabular-nums ${isAdjusted ? "text-emerald-700" : "text-slate-900"}`}>
                      {w.value.toFixed(1)}
                      <span className="ml-1 text-base font-normal text-slate-400">{result.unit}</span>
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Plain-language meaning */}
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-700">
              Your adjusted body weight is the value commonly used for medication dosing and nutrition calculations when
              actual body weight would overestimate metabolic needs. It adds 40% of your excess weight back to your
              ideal body weight.
            </p>

            {/* Recommended dosing weight */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Recommended dosing weight</h3>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center sm:min-w-[170px]">
                  <p className="text-3xl font-bold tabular-nums text-emerald-700">
                    {result.dosingWeight.toFixed(1)}
                    <span className="ml-1 text-base font-normal text-slate-400">{result.unit}</span>
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {result.dosingLabel} body weight
                  </p>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600">
                  Based on your BMI of <span className="font-semibold text-slate-900">{result.bmi.toFixed(1)}</span>{" "}
                  ({result.bmiCategory}), {result.dosingReason}
                </p>
              </div>
            </div>

            <p className="text-center text-xs leading-relaxed text-slate-400">
              Educational tool. Adjusted body weight is a dosing model, not a diagnosis or a weight goal. Always confirm
              clinical dosing with a pharmacist or physician.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
