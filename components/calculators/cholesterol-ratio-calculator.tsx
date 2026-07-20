"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HeartPulse, TestTube, Activity, ShieldCheck, Calculator as CalculatorIcon, Target, AlertTriangle } from "lucide-react"
import { parseNumber } from "@/lib/utils"

// Define validation schema
const formSchema = z.object({
  unit: z.enum(["mg/dL", "mmol/L"]),
  totalCholesterol: z.string().min(1, "Total Cholesterol is required"),
  hdl: z.string().min(1, "HDL is required"),
  ldl: z.string().optional(),
  triglycerides: z.string().min(1, "Triglycerides is required"),
})

// Define an interface for the shape of the results state
interface ResultsState {
  tcHdlRatio: string;
  ldlHdlRatio: string;
  tgHdlRatio: string;
  vldl: string;
  calculatedLdl: string | null;
}

// ─── ADDITIVE FEATURE TYPES ───────────────────────────────────────────────────
// Optimal (ideal) target for each of the three key ratios.
const RATIO_TARGETS = {
  tcHdl: 3.5,
  ldlHdl: 2.0,
  tgHdl: 2.0,
} as const;

type RatioKey = "tcHdl" | "ldlHdl" | "tgHdl";

interface RatioSnapshot {
  key: RatioKey;
  label: string;
  value: number;        // computed ratio
  target: number;       // ideal ceiling
  withinRange: boolean; // value < target
  overBy: number;       // how far above target (0 if within)
  excessPct: number;    // % above target, used to find the "worst" ratio
}

// Builds the three-ratio overview and flags the single ratio furthest outside
// its healthy range (Feature 1).
function buildRatioSnapshots(tcHdl: number, ldlHdl: number, tgHdl: number) {
  const defs: { key: RatioKey; label: string; value: number; target: number }[] = [
    { key: "tcHdl", label: "TC / HDL", value: tcHdl, target: RATIO_TARGETS.tcHdl },
    { key: "ldlHdl", label: "LDL / HDL", value: ldlHdl, target: RATIO_TARGETS.ldlHdl },
    { key: "tgHdl", label: "TG / HDL", value: tgHdl, target: RATIO_TARGETS.tgHdl },
  ];

  const snapshots: RatioSnapshot[] = defs.map((d) => {
    const overBy = Math.max(0, d.value - d.target);
    return {
      ...d,
      withinRange: d.value < d.target,
      overBy,
      excessPct: (overBy / d.target) * 100,
    };
  });

  // The ratio to fix = the one with the greatest % excess over its target.
  let worstKey: RatioKey | null = null;
  let worstExcess = 0;
  for (const s of snapshots) {
    if (s.excessPct > worstExcess) {
      worstExcess = s.excessPct;
      worstKey = s.key;
    }
  }

  return { snapshots, worstKey };
}

// Numeric snapshot used by the additive feature cards (Features 1 & 2).
interface FeatureData {
  unit: string;
  tc: number;
  hdl: number;
  ldl: number;
  tg: number;
  tcHdl: number;
  ldlHdl: number;
  tgHdl: number;
}

export default function CholesterolRatioCalculator() {
  const [results, setResults] = useState<ResultsState | null>(null)
  const [featureData, setFeatureData] = useState<FeatureData | null>(null)
  const [error, setError] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: "mg/dL",
      totalCholesterol: "",
      hdl: "",
      ldl: "",
      triglycerides: "",
    },
  })

  const calculateRatios = (values: z.infer<typeof formSchema>) => {
    setError("")
    setResults(null)
    setFeatureData(null)

    const tc = parseNumber(values.totalCholesterol)
    const hdlVal = parseNumber(values.hdl)
    let ldlVal = values.ldl ? parseNumber(values.ldl) : NaN
    const tg = parseNumber(values.triglycerides)

    if (isNaN(tc) || isNaN(hdlVal) || isNaN(tg)) {
      setError("Please enter valid numbers for all required fields.")
      return
    }

    if (tc <= 0 || hdlVal <= 0 || tg <= 0) {
      setError("Cholesterol and triglyceride values must be positive numbers.")
      return
    }

    let calculatedLdl = ldlVal
    if (isNaN(ldlVal)) {
      if (values.unit === "mg/dL" && tg >= 400) {
        setError("LDL cannot be calculated accurately when triglycerides are 400 mg/dL or higher. Please enter a measured LDL value.")
        return
      }
      calculatedLdl = tc - hdlVal - tg / 5
      if (calculatedLdl <= 0) {
        setError("Calculated LDL is not a valid positive number. Please check your inputs or provide a measured LDL value.")
        return
      }
    }

    const tcHdlRatio = tc / hdlVal
    const ldlHdlRatio = calculatedLdl / hdlVal
    const tgHdlRatio = tg / hdlVal
    const vldl = tg / 5

    setResults({
      tcHdlRatio: tcHdlRatio.toFixed(2),
      ldlHdlRatio: ldlHdlRatio.toFixed(2),
      tgHdlRatio: tgHdlRatio.toFixed(2),
      vldl: vldl.toFixed(2),
      calculatedLdl: isNaN(ldlVal) ? calculatedLdl.toFixed(2) : null,
    })

    // Additive: store the numeric snapshot used by the feature cards.
    setFeatureData({
      unit: values.unit,
      tc,
      hdl: hdlVal,
      ldl: calculatedLdl,
      tg,
      tcHdl: tcHdlRatio,
      ldlHdl: ldlHdlRatio,
      tgHdl: tgHdlRatio,
    })
  }

  // Add explicit types for the function parameters
  const getInterpretation = (ratio: 'tcHdl' | 'ldlHdl' | 'tgHdl', value: number) => {
    if (ratio === "tcHdl") {
      if (value < 3.5) return { text: "Low Risk", color: "text-green-600" }
      if (value >= 3.5 && value <= 5) return { text: "Average Risk", color: "text-yellow-600" }
      return { text: "High Risk", color: "text-red-600" }
    }
    if (ratio === "ldlHdl") {
      if (value < 2.0) return { text: "Healthy", color: "text-green-600" }
      if (value >= 2.0 && value <= 3.5) return { text: "Acceptable", color: "text-yellow-600" }
      return { text: "High Risk", color: "text-red-600" }
    }
    if (ratio === "tgHdl") {
      if (value < 2.0) return { text: "Ideal", color: "text-green-600" }
      if (value >= 2.0 && value <= 4.0) return { text: "Borderline High", color: "text-yellow-600" }
      return { text: "High Risk", color: "text-red-600" }
    }
    return { text: "", color: "" }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Cholesterol Ratio Calculator</CardTitle>
        <CardDescription>Enter your cholesterol values to assess your heart health.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(calculateRatios)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mg/dL">mg/dL</SelectItem>
                          <SelectItem value="mmol/L">mmol/L</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalCholesterol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Cholesterol (TC)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={`e.g., 180 ${form.watch("unit")}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hdl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HDL (Good Cholesterol)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={`e.g., 65 ${form.watch("unit")}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ldl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LDL (Bad Cholesterol)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={`e.g., 90 ${form.watch("unit")}`} {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">Leave blank to calculate automatically.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="triglycerides"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Triglycerides (TG)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={`e.g., 120 ${form.watch("unit")}`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Calculate Ratios
                </Button>
              </form>
            </Form>
          </div>

          <div className="mt-6 md:mt-0">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {results && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-center text-gray-800">Your Results</h3>
                {results.calculatedLdl && (
                  <div className="p-3 bg-blue-100 border-l-4 border-blue-500 rounded-md">
                    <p className="text-sm font-medium">
                      Estimated LDL Cholesterol: <span className="font-bold">{results.calculatedLdl} {form.watch("unit")}</span>
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cholesterol / HDL Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">{results.tcHdlRatio}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getInterpretation("tcHdl", parseNumber(results.tcHdlRatio)).color} bg-opacity-20`}>
                    {getInterpretation("tcHdl", parseNumber(results.tcHdlRatio)).text}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-gray-600">LDL / HDL Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">{results.ldlHdlRatio}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getInterpretation("ldlHdl", parseNumber(results.ldlHdlRatio)).color} bg-opacity-20`}>
                    {getInterpretation("ldlHdl", parseNumber(results.ldlHdlRatio)).text}
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Triglyceride / HDL Ratio</p>
                    <p className="text-2xl font-bold text-gray-900">{results.tgHdlRatio}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getInterpretation("tgHdl", parseNumber(results.tgHdlRatio)).color} bg-opacity-20`}>
                    {getInterpretation("tgHdl", parseNumber(results.tgHdlRatio)).text}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-600">
                    Estimated VLDL: <span className="font-bold text-gray-900">{results.vldl} {form.watch("unit")}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ADDITIVE FEATURE CARDS ──────────────────────────────────────────── */}
        {featureData && (() => {
          const { snapshots, worstKey } = buildRatioSnapshots(
            featureData.tcHdl,
            featureData.ldlHdl,
            featureData.tgHdl,
          )
          const unit = featureData.unit

          // Feature 2: change to underlying numbers to hit each ratio's target.
          const fmt = (n: number) => (Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(1))
          const targetActions = snapshots.map((s) => {
            if (s.withinRange) {
              return { ...s, message: null as string | null }
            }
            // To reach target ratio R at the current numerator, HDL must rise to
            // numerator / R. Alternatively the numerator must fall to HDL * R.
            let message = ""
            if (s.key === "tcHdl") {
              const hdlNeeded = featureData.tc / s.target
              const tcNeeded = featureData.hdl * s.target
              message = `Raise HDL by ${fmt(hdlNeeded - featureData.hdl)} ${unit} (to ${fmt(hdlNeeded)}) or lower Total Cholesterol by ${fmt(featureData.tc - tcNeeded)} ${unit} (to ${fmt(tcNeeded)}).`
            } else if (s.key === "ldlHdl") {
              const hdlNeeded = featureData.ldl / s.target
              const ldlNeeded = featureData.hdl * s.target
              message = `Raise HDL by ${fmt(hdlNeeded - featureData.hdl)} ${unit} (to ${fmt(hdlNeeded)}) or lower LDL by ${fmt(featureData.ldl - ldlNeeded)} ${unit} (to ${fmt(ldlNeeded)}).`
            } else {
              const hdlNeeded = featureData.tg / s.target
              const tgNeeded = featureData.hdl * s.target
              message = `Raise HDL by ${fmt(hdlNeeded - featureData.hdl)} ${unit} (to ${fmt(hdlNeeded)}) or lower Triglycerides by ${fmt(featureData.tg - tgNeeded)} ${unit} (to ${fmt(tgNeeded)}).`
            }
            return { ...s, message }
          })

          return (
            <div className="mt-8 space-y-6">
              {/* FEATURE 1 — All three ratios at once + the one to fix */}
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                    <Activity className="w-5 h-5" />
                    All Three Ratios at a Glance
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your TC/HDL, LDL/HDL and TG/HDL ratios checked against recognised
                    cardiac targets — colour-coded so you can see what is on track.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {snapshots.map((s) => {
                      const isWorst = s.key === worstKey
                      return (
                        <div
                          key={s.key}
                          className={`rounded-xl border p-4 ${
                            s.withinRange
                              ? "border-emerald-200 bg-emerald-50"
                              : isWorst
                              ? "border-red-300 bg-red-50 ring-2 ring-red-200"
                              : "border-yellow-200 bg-yellow-50"
                          }`}
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {s.label}
                          </p>
                          <p
                            className={`text-2xl font-bold ${
                              s.withinRange
                                ? "text-emerald-700"
                                : isWorst
                                ? "text-red-600"
                                : "text-yellow-700"
                            }`}
                          >
                            {s.value.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Ideal &lt; {s.target.toFixed(1)}
                          </p>
                          <p
                            className={`text-xs font-semibold mt-1 ${
                              s.withinRange ? "text-emerald-700" : isWorst ? "text-red-600" : "text-yellow-700"
                            }`}
                          >
                            {s.withinRange ? "Within range" : `${s.overBy.toFixed(2)} over target`}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {worstKey ? (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4">
                      <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                      <p className="text-sm text-slate-700">
                        The ratio furthest outside its healthy range is{" "}
                        <strong className="text-red-600">
                          {snapshots.find((s) => s.key === worstKey)?.label}
                        </strong>
                        . Focus here first for the biggest improvement to your cardiovascular profile.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <p className="text-sm text-slate-700">
                        All three ratios fall within their healthy targets. Keep up your current habits and re-check periodically.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* FEATURE 2 — Optimal targets + change needed in the numbers */}
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                    <Target className="w-5 h-5" />
                    Your Targets &amp; What It Takes to Get There
                  </CardTitle>
                  <CardDescription className="text-sm">
                    The optimal target for each ratio and the change in your actual
                    cholesterol numbers needed to reach it at your current values.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {targetActions.map((s) => (
                    <div
                      key={s.key}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-800">{s.label}</p>
                        <span className="text-xs font-semibold text-emerald-700 whitespace-nowrap">
                          Now {s.value.toFixed(2)} → Target &lt; {s.target.toFixed(1)}
                        </span>
                      </div>
                      {s.message ? (
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.message}</p>
                      ) : (
                        <p className="text-sm text-emerald-700 mt-2 leading-relaxed">
                          Already at or below target — no change needed.
                        </p>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    These figures show the single-variable change needed at your current
                    numbers. In practice, improving diet, activity and weight shifts several
                    values together — use this as a guide, not medical advice.
                  </p>
                </CardContent>
              </Card>
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}