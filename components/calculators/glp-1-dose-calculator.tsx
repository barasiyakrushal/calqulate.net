"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Syringe, Ruler, CalendarClock, ShieldAlert } from "lucide-react"
import { parseNumber } from "@/lib/utils"

// ─── TITRATION SCHEDULES (general reference, NOT a prescription) ──────────────
// Source: FDA prescribing information for Wegovy (semaglutide) & Zepbound (tirzepatide).
const TITRATION_SCHEDULES: Record<
  "semaglutide" | "tirzepatide",
  { label: string; steps: { weeks: string; dose: string }[] }
> = {
  semaglutide: {
    label: "Semaglutide (e.g. Wegovy)",
    steps: [
      { weeks: "Weeks 1–4", dose: "0.25 mg once weekly" },
      { weeks: "Weeks 5–8", dose: "0.5 mg once weekly" },
      { weeks: "Weeks 9–12", dose: "1.0 mg once weekly" },
      { weeks: "Weeks 13–16", dose: "1.7 mg once weekly" },
      { weeks: "Week 17 and beyond", dose: "2.4 mg once weekly (maintenance)" },
    ],
  },
  tirzepatide: {
    label: "Tirzepatide (e.g. Zepbound / Mounjaro)",
    steps: [
      { weeks: "Weeks 1–4", dose: "2.5 mg once weekly" },
      { weeks: "Weeks 5–8", dose: "5 mg once weekly" },
      { weeks: "Weeks 9–12", dose: "7.5 mg once weekly" },
      { weeks: "Weeks 13–16", dose: "10 mg once weekly" },
      { weeks: "Weeks 17–20", dose: "12.5 mg once weekly" },
      { weeks: "Week 21 and beyond", dose: "15 mg once weekly (maximum)" },
    ],
  },
}

type Medication = "semaglutide" | "tirzepatide"

export default function GLP1DoseCalculator() {
  const [dose, setDose] = useState("")
  const [concentration, setConcentration] = useState("")
  const [medication, setMedication] = useState<Medication>("semaglutide")
  const [result, setResult] = useState<{
    units: number
    volume: number
    // additive: precise (unrounded) values for the syringe-units feature
    exactUnits: number
    exactVolume: number
    medication: Medication
  } | null>(null)

  const calculate = () => {
    const d = parseNumber(dose)
    const c = parseNumber(concentration)
    if (d > 0 && c > 0) {
      const units = (d / c) * 100
      const volume = d / c
      setResult({
        units: Math.round(units),
        volume: Math.round(volume * 100) / 100,
        exactUnits: units,
        exactVolume: volume,
        medication,
      })
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Syringe className="h-6 w-6" />
          GLP-1 Dose Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="dose">Prescribed Dose (mg)</Label>
          <Input
            id="dose"
            type="number"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="e.g., 1.0"
          />
        </div>
        <div>
          <Label htmlFor="concentration">Vial Concentration (mg/mL)</Label>
          <Input
            id="concentration"
            type="number"
            value={concentration}
            onChange={(e) => setConcentration(e.target.value)}
            placeholder="e.g., 2.0"
          />
        </div>
        {/* Optional, non-breaking: lets the titration reference match the right ladder */}
        <div>
          <Label htmlFor="medication">Medication (optional, for titration reference)</Label>
          <select
            id="medication"
            value={medication}
            onChange={(e) => setMedication(e.target.value as Medication)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="semaglutide">Semaglutide (Wegovy / Ozempic)</option>
            <option value="tirzepatide">Tirzepatide (Zepbound / Mounjaro)</option>
          </select>
        </div>
        <Button onClick={calculate} className="w-full">
          Calculate Units
        </Button>
        {result && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold">Units to Draw: {result.units}</p>
              <p className="text-sm text-gray-600">Volume: {result.volume} mL</p>
            </div>

            {/* ── FEATURE 1: Exact syringe units (U-100) ─────────────────────── */}
            <Card className="border-emerald-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-5 w-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Exact Syringe Units (U-100 insulin syringe)
                  </h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  On a standard U-100 insulin syringe, draw to the{" "}
                  <strong className="text-emerald-700">
                    {result.exactUnits.toFixed(1)}-unit
                  </strong>{" "}
                  mark — that is{" "}
                  <strong className="text-emerald-700">
                    {result.exactVolume.toFixed(3)} mL
                  </strong>{" "}
                  of your {parseNumber(concentration)} mg/mL vial for a{" "}
                  {parseNumber(dose)} mg dose. One unit equals 0.01 mL.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border bg-slate-50 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      Rounded units
                    </p>
                    <p className="text-lg font-black text-slate-800 mt-1">{result.units}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-bold">
                      Exact units
                    </p>
                    <p className="text-lg font-black text-emerald-700 mt-1">
                      {result.exactUnits.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-3 text-center">
                    <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      Volume (mL)
                    </p>
                    <p className="text-lg font-black text-slate-800 mt-1">
                      {result.exactVolume.toFixed(3)}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  Always read the units against the markings on your specific syringe and confirm
                  the concentration on your current vial label before drawing.
                </p>
              </CardContent>
            </Card>

            {/* ── FEATURE 2: Typical week-by-week titration schedule ──────────── */}
            <Card className="border-emerald-100">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarClock className="h-5 w-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Typical Titration Schedule
                  </h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  {TITRATION_SCHEDULES[result.medication].label} — a general step-up reference,
                  not a prescription. Doses usually increase every 4 weeks when the current dose is
                  well tolerated.
                </p>
                <ul className="space-y-2">
                  {TITRATION_SCHEDULES[result.medication].steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-sm font-medium text-slate-600">{step.weeks}</span>
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                        {step.dose}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Safety reminder:</strong> This schedule is a general reference based on
                    public prescribing information, not medical advice. Your prescriber may hold you
                    at a dose longer or use different steps. Always follow your prescriber and verify
                    units with your pharmacist before injecting.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
