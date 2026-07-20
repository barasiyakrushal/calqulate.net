"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Heart, Flame, Zap, Timer, Info } from "lucide-react"
import { parseNumber } from "@/lib/utils"

// Define validation schema
const formSchema = z.object({
  age: z.string().min(1, "Age is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 120, "Enter a valid age"),
  restingHeartRate: z.string().optional(),
  formula: z.enum(["standard", "tanaka"]), // Standard (220-age) or Tanaka (208 - 0.7*age)
})

// Define interface for zone data
interface ZoneResult {
  zone: number;
  name: string;
  range: string;
  description: string;
  color: string;
  icon: React.ElementType;
  // ── Additive: intensity bracket (% of HRmax / HRR) for this zone ──
  intensity: string;
  // ── Additive: concrete example workouts for training in this zone ──
  workouts: string;
  // ── Additive: flags the Zone 2 fat-burning range ──
  fatBurn?: boolean;
}

// Define interface for results state
interface ResultsState {
  maxHeartRate: number;
  heartRateReserve: number | null;
  methodUsed: "Basic (MHR %)" | "Karvonen (HRR)";
  zones: ZoneResult[];
}

export default function HeartRateCalculator() {
  const [results, setResults] = useState<ResultsState | null>(null)
  const [error, setError] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: "",
      restingHeartRate: "",
      formula: "standard",
    },
  })

  const calculateHeartRate = (values: z.infer<typeof formSchema>) => {
    setError("")
    setResults(null)

    const age = parseNumber(values.age)
    const rhr = values.restingHeartRate ? parseNumber(values.restingHeartRate) : NaN
    
    // 1. Calculate Max Heart Rate (MHR)
    let mhr = 0
    if (values.formula === "tanaka") {
      mhr = 208 - (0.7 * age)
    } else {
      mhr = 220 - age
    }
    mhr = Math.round(mhr)

    // Validation
    if (rhr >= mhr) {
      setError("Resting heart rate cannot be higher than maximum heart rate.")
      return
    }

    // 2. Determine Method (Karvonen if RHR exists, otherwise Standard)
    const useKarvonen = !isNaN(rhr) && rhr > 0
    const hrr = useKarvonen ? mhr - rhr : null

    // 3. Helper to calculate BPM for a specific percentage
    const getBpm = (percent: number) => {
      if (useKarvonen && hrr !== null) {
        // Karvonen Formula: ((MHR - RHR) * %Intensity) + RHR
        return Math.round((hrr * percent) + rhr)
      } else {
        // Standard Formula: MHR * %Intensity
        return Math.round(mhr * percent)
      }
    }

    // 4. Generate Zones
    const zones: ZoneResult[] = [
      {
        zone: 1,
        name: "Warm Up / Recovery",
        range: `${getBpm(0.50)} - ${getBpm(0.60)} bpm`,
        description: "Very light effort. Improves overall health and helps recovery.",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: Activity,
        intensity: "50-60%",
        workouts: "Easy walking, gentle stretching, foam rolling, light yoga, cool-downs.",
      },
      {
        zone: 2,
        name: "Fat Burn / Endurance",
        range: `${getBpm(0.60) + 1} - ${getBpm(0.70)} bpm`,
        description: "Light effort. Best for burning fat and building basic endurance.",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Flame,
        intensity: "60-70%",
        workouts: "Easy jog, brisk walk, steady cycling, long conversational runs, hiking.",
        fatBurn: true,
      },
      {
        zone: 3,
        name: "Aerobic / Cardio",
        range: `${getBpm(0.70) + 1} - ${getBpm(0.80)} bpm`,
        description: "Moderate effort. Improves aerobic fitness and blood circulation.",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: Heart,
        intensity: "70-80%",
        workouts: "Steady-state runs, group cardio classes, moderate cycling, swimming laps.",
      },
      {
        zone: 4,
        name: "Anaerobic / Hard",
        range: `${getBpm(0.80) + 1} - ${getBpm(0.90)} bpm`,
        description: "Hard effort. Increases speed and lactate tolerance.",
        color: "bg-orange-50 text-orange-700 border-orange-200",
        icon: Timer,
        intensity: "80-90%",
        workouts: "Tempo intervals, threshold runs, hill repeats, hard spin intervals.",
      },
      {
        zone: 5,
        name: "VO2 Max / Peak",
        range: `${getBpm(0.90) + 1} - ${mhr} bpm`,
        description: "Maximum effort. Develops peak performance and speed.",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: Zap,
        intensity: "90-100%",
        workouts: "All-out sprints, short HIIT bursts, max-effort hill sprints, race finishes.",
      }
    ]

    setResults({
      maxHeartRate: mhr,
      heartRateReserve: hrr,
      methodUsed: useKarvonen ? "Karvonen (HRR)" : "Basic (MHR %)",
      zones: zones
    })
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Target Heart Rate Calculator
        </CardTitle>
        <CardDescription>
          Find your optimal training zones for fat loss, endurance, and cardiovascular health.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(calculateHeartRate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 35" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="restingHeartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resting Heart Rate (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 60 bpm" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Enter this for the advanced <strong>Karvonen Formula</strong> calculation.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="formula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Heart Rate Formula</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Formula" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard (220 - Age)</SelectItem>
                          <SelectItem value="tanaka">Tanaka (208 - 0.7 × Age)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Tanaka is generally considered more accurate for adults over 40.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Calculate Zones
                </Button>
              </form>
            </Form>

            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" /> Why add Resting Heart Rate?
              </p>
              <p>
                Without it, we guess your zones based solely on age. Adding your RHR unlocks the 
                <strong> Karvonen Method</strong>, which tailors zones to your specific fitness level.
              </p>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {results ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* ── UNDERSTAND YOUR RESULTS ─────────────────────────────────── */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Understand your results</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-900 p-4 text-center text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">Max heart rate</p>
                      <p className="mt-1 text-3xl font-bold tabular-nums">
                        {results.maxHeartRate}
                        <span className="ml-1 text-sm font-normal text-white/60">bpm</span>
                      </p>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Recommended Zone 2</p>
                      <p className="mt-1 text-lg font-bold text-red-700">{results.zones[1].range}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Best for</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">Fat burning &amp; endurance</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Heart rate reserve</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {results.heartRateReserve !== null ? `${results.heartRateReserve} bpm` : "Add resting HR"}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-4 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Training method</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{results.methodUsed}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    {results.methodUsed === "Karvonen (HRR)"
                      ? "Your zones use the Karvonen method, blending your max and resting heart rate for a personalised range."
                      : "Your zones use % of max heart rate. Add your resting heart rate above to unlock the more personalised Karvonen method."}
                  </p>
                </div>

                {/* ── YOUR TRAINING ZONES (single consolidated list) ──────────── */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-slate-900">Your training zones</h3>
                  {results.zones.map((zone) => (
                    <div
                      key={zone.zone}
                      className={`rounded-lg border-l-4 p-4 shadow-sm ${zone.color} ${
                        zone.fatBurn ? "ring-1 ring-emerald-300" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-base font-bold">
                          <zone.icon className="h-5 w-5 opacity-80" />
                          Zone {zone.zone}: {zone.name}
                          <span className="text-xs font-normal opacity-80">· {zone.intensity}</span>
                          {zone.fatBurn && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              <Flame className="h-3 w-3" /> Fat burn
                            </span>
                          )}
                        </p>
                        <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold shadow-sm">
                          {zone.range}
                        </span>
                      </div>
                      <p className="mt-2 text-xs opacity-90">
                        <strong>Try:</strong> {zone.workouts}
                      </p>
                    </div>
                  ))}
                  <p className="text-xs leading-relaxed text-slate-500">
                    Spend most easy training in Zone 2, the aerobic base range where your body uses fat most efficiently.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                <Activity className="mb-4 h-16 w-16 opacity-20" />
                <p>Enter your details to see your zones</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}