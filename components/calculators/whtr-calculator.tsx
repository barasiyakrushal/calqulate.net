"use client"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { parseNumber } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Calculator,
  RefreshCw,
  Loader2,
  Target,
  TrendingDown,
  AlertTriangle,
  Info,
  Heart,
  ShieldCheck,
  CheckCircle2
} from "lucide-react"

const formSchema = z.object({
  gender: z.enum(["male", "female"], { required_error: "Please select a gender." }),
  height: z.string().min(1, "Height is required."),
  waist: z.string().min(1, "Waist measurement is required."),
  units: z.enum(["metric", "imperial"]),
})

type UnitSystem = "metric" | "imperial"

export default function WHtRCalculator() {
  const [result, setResult] = useState<{
    ratio: number;
    category: string;
    description: string;
    targetWaist: number;
    color: string;
    stringTest: string;
    // FEATURE 1 — "waist under half your height" rule + risk tier
    tier: string;
    tierColor: string;
    tierBg: string;
    tierBorder: string;
    halfHeight: number;
    rulePass: boolean;
    ruleMessage: string;
    // FEATURE 2 — exact waist reduction to reach the healthy range (ratio 0.5)
    healthyWaist: number;
    waistToLose: number;
    alreadyHealthy: boolean;
    currentWaist: number;
    unitLabel: string;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { gender: "female", height: "", waist: "", units: "metric" },
  })

  const units = form.watch("units")

  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentUnit = form.getValues("units")
    if (newUnit === currentUnit) return

    const height = parseNumber(form.getValues("height"))
    const waist = parseNumber(form.getValues("waist"))

    if (height) {
      const newHeight = newUnit === "imperial" ? height / 2.54 : height * 2.54
      form.setValue("height", newHeight.toFixed(1))
    }
    if (waist) {
      const newWaist = newUnit === "imperial" ? waist / 2.54 : waist * 2.54
      form.setValue("waist", newWaist.toFixed(1))
    }
    form.setValue("units", newUnit)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setTimeout(() => {
      const h = parseNumber(values.height)
      const w = parseNumber(values.waist)
      const ratio = w / h

      let category = ""
      let description = ""
      let color = ""
      let stringTest = ""

      if (ratio < 0.35) {
        category = "Abnormally Slim"
        description = "Your waist is significantly less than half your height. This may indicate being underweight."
        color = "text-blue-600"
        stringTest = "Pass (Plenty of room left)"
      } else if (ratio < 0.5) {
        category = "Healthy"
        description = "Perfect! Your waist is less than half your height. This is the optimal range for heart health."
        color = "text-green-600"
        stringTest = "Pass (The string fits easily)"
      } else if (ratio < 0.6) {
        category = "Increased Risk"
        description = "Your waist is slightly over half your height. This indicates some carry of visceral fat."
        color = "text-orange-500"
        stringTest = "Fail (The string doesn't quite meet)"
      } else {
        category = "High Risk"
        description = "Your ratio indicates a high level of abdominal obesity. Consider consulting a doctor."
        color = "text-red-600"
        stringTest = "Fail (Significant gap in string test)"
      }

      const targetWaist = h * 0.45 // Mid-range of healthy

      // ── FEATURE 1: "Keep your waist under half your height" rule + risk tier ──
      const unitLabel = values.units === "metric" ? "cm" : "in"
      const halfHeight = h * 0.5
      const rulePass = w < halfHeight
      const ruleMessage = rulePass
        ? `Your waist (${w.toFixed(1)} ${unitLabel}) is under half your height (${halfHeight.toFixed(1)} ${unitLabel}). You pass the '<0.5' rule.`
        : `Your waist (${w.toFixed(1)} ${unitLabel}) is over half your height (${halfHeight.toFixed(1)} ${unitLabel}). You're above the '<0.5' rule.`

      let tier = ""
      let tierColor = ""
      let tierBg = ""
      let tierBorder = ""
      if (ratio < 0.4) {
        tier = "Underweight signal"
        tierColor = "text-blue-600"
        tierBg = "bg-blue-50"
        tierBorder = "border-blue-200"
      } else if (ratio < 0.5) {
        tier = "Healthy"
        tierColor = "text-emerald-700"
        tierBg = "bg-emerald-50"
        tierBorder = "border-emerald-200"
      } else if (ratio < 0.6) {
        tier = "Increased risk"
        tierColor = "text-orange-600"
        tierBg = "bg-orange-50"
        tierBorder = "border-orange-200"
      } else {
        tier = "High risk"
        tierColor = "text-red-600"
        tierBg = "bg-red-50"
        tierBorder = "border-red-200"
      }

      // ── FEATURE 2: Exact waist reduction to reach the healthy range (ratio 0.5) ──
      const healthyWaist = h * 0.5 // waist that yields WHtR = 0.5
      const waistToLose = w - healthyWaist // positive ⇒ trim needed
      const alreadyHealthy = waistToLose <= 0

      setResult({
        ratio, category, description, targetWaist, color, stringTest,
        tier, tierColor, tierBg, tierBorder, halfHeight, rulePass, ruleMessage,
        healthyWaist, waistToLose, alreadyHealthy, currentWaist: w, unitLabel,
      })
      setIsLoading(false)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }, 600)
  }

  return (
    <div className="space-y-8">
      <Card className="border-green-100 shadow-lg">
        <CardHeader className="bg-green-50/50">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" /> Professional WHtR Tool
          </CardTitle>
          <CardDescription>Enter your height and waist to see your health score.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500">Unit System</FormLabel>
                      <RadioGroup
                        onValueChange={(v) => handleUnitChange(v as UnitSystem)}
                        defaultValue={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="metric" id="metric" />
                          <label htmlFor="metric" className="text-sm font-medium">Metric (cm)</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="imperial" id="imperial" />
                          <label htmlFor="imperial" className="text-sm font-medium">Imperial (in)</label>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-gray-500">Gender</FormLabel>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <label htmlFor="female" className="text-sm font-medium">Female</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <label htmlFor="male" className="text-sm font-medium">Male</label>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Height ({units === "metric" ? "cm" : "inches"})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g. 175" {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waist Circumference ({units === "metric" ? "cm" : "inches"})</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g. 85" {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Calculator className="mr-2 h-5 w-5" />}
                  {isLoading ? "Analyzing..." : "Calculate My Risk"}
                </Button>
                <Button type="button" variant="outline" className="h-12 px-6" onClick={() => { form.reset(); setResult(null); }}>
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div ref={resultsRef}>
        {result && (
          <div className="grid gap-6">
            <Card className="border-2 border-green-500 overflow-hidden">
              <div className="bg-green-600 p-4 text-white text-center">
                <p className="text-sm uppercase font-bold tracking-widest opacity-80">Your WHtR Score</p>
                <p className="text-6xl font-black">{result.ratio.toFixed(2)}</p>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className={`text-3xl font-bold ${result.color}`}>{result.category}</h3>
                  <p className="text-gray-600 max-w-md mx-auto">{result.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <Target className="w-5 h-5 mx-auto text-green-600 mb-2" />
                    <p className="text-xs font-bold text-gray-400 uppercase">Target Waist</p>
                    <p className="text-lg font-bold text-gray-800">{result.targetWaist.toFixed(1)} {units === "metric" ? "cm" : "in"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <TrendingDown className="w-5 h-5 mx-auto text-blue-600 mb-2" />
                    <p className="text-xs font-bold text-gray-400 uppercase">String Test</p>
                    <p className="text-lg font-bold text-gray-800">{result.stringTest}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <Heart className="w-5 h-5 mx-auto text-red-500 mb-2" />
                    <p className="text-xs font-bold text-gray-400 uppercase">Heart Stress</p>
                    <p className="text-lg font-bold text-gray-800">{result.ratio > 0.5 ? "Elevated" : "Optimal"}</p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="flex items-center gap-2 font-bold mb-2">
                        <Info className="w-4 h-4 text-green-400" /> Pro Insight
                      </h4>
                      <p className="text-sm text-slate-300">
                        Studies indicate that for every 0.1 increase in WHtR above 0.5, your lifespan can potentially decrease by several years due to metabolic stress. Keeping this number low is the best insurance for your 60s and 70s.
                      </p>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* FEATURE 1 — "Waist under half your height" rule & risk tier */}
            <Card className={`border ${result.tierBorder} shadow-md`}>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-emerald-700">The &apos;Half Your Height&apos; Rule</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {result.ruleMessage}
                </p>

                <div className={`mt-5 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border ${result.tierBorder} ${result.tierBg} p-4`}>
                  <div className="flex items-center gap-2">
                    {result.rulePass ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 text-orange-500" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Risk tier</span>
                  </div>
                  <span className={`text-lg font-black ${result.tierColor}`}>{result.tier}</span>
                </div>

                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  Tiers: below 0.40 underweight signal · 0.40–0.49 healthy · 0.50–0.59 increased · 0.60+ high.
                  Keeping your waist below half your height (WHtR &lt; 0.50) is the simplest evidence-backed target.
                </p>
              </CardContent>
            </Card>

            {/* FEATURE 2 — Exact waist reduction to reach the healthy range */}
            <Card className="border border-emerald-100 shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-emerald-700">Your Healthy Waist Target</h3>
                </div>

                {result.alreadyHealthy ? (
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Great news — your waist is already at or below{" "}
                    <strong className="text-emerald-700">{result.healthyWaist.toFixed(1)} {result.unitLabel}</strong>,
                    the threshold for a healthy ratio (WHtR 0.50). Maintain it with your current habits and re-check every few weeks.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      To move into the healthy range, aim for a waist of about{" "}
                      <strong className="text-emerald-700">{result.healthyWaist.toFixed(1)} {result.unitLabel}</strong>{" "}
                      (0.5 &times; your height) — a reduction of{" "}
                      <strong className="text-emerald-700">{result.waistToLose.toFixed(1)} {result.unitLabel}</strong>{" "}
                      from where you are now.
                    </p>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Current</p>
                        <p className="text-lg font-black text-slate-800 mt-1">{result.currentWaist.toFixed(1)} {result.unitLabel}</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                          <TrendingDown className="w-3.5 h-3.5" /> Lose
                        </div>
                        <p className="text-lg font-black text-emerald-700 mt-1">{result.waistToLose.toFixed(1)} {result.unitLabel}</p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Target</p>
                        <p className="text-lg font-black text-slate-800 mt-1">{result.healthyWaist.toFixed(1)} {result.unitLabel}</p>
                      </div>
                    </div>
                  </>
                )}
                <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                  Target shown in your chosen units ({result.unitLabel}). Use it as a motivating first milestone, not a medical prescription.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}