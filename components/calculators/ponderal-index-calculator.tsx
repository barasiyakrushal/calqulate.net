"use client"

import { SyncPrompt } from "@/components/marketing/SyncPrompt";
import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calculator, RefreshCw, Loader2, User, Baby, CheckCircle2, History, ChevronRight, Ruler, ScrollText } from "lucide-react"
import { parseNumber } from "@/lib/utils"

// Define validation schema
const formSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  height: z.string().min(1, "Height is required"),
  userType: z.enum(["adult", "child"], { required_error: "Please select one" }),
  units: z.enum(["metric", "imperial"]),
})

type UnitSystem = "metric" | "imperial"
type UserType = "adult" | "child"

interface CalculationResult {
  pi: number
  category: string
  interpretation: string
  categoryColor: string
  userType: UserType
  unitLabel: string
  // Corpulence Index feature — adult BMI comparison (kg/m²). null for child/infant.
  bmi: number | null
  bmiCategory: string | null
}

// Data for ADULTS using PI = Weight (kg) / Height (m)³
const adultPiData = [
  { range: "< 11", status: "Underweight", notes: "Indicates body mass is lower than the healthy range for your height." },
  { range: "11 - 15", status: "Normal Weight", notes: "Congratulations! You fall within the healthy, balanced range." },
  { range: "> 15", status: "Overweight", notes: "Indicates body mass is higher than the healthy range for your height." },
];

// Data for CHILDREN using Corpulence Index = (Weight (g) / Height (cm)³) * 100
const childPiData = [
  { range: "< 2.2", status: "Underweight", notes: "Lower body density for height — may indicate thin build or undernutrition." },
  { range: "2.2 – 3.0", status: "Normal Weight", notes: "Healthy proportionality between height and weight for age." },
  { range: "> 3.0", status: "Overweight / Obese", notes: "Indicates higher body density — possible excess fat accumulation." },
];

interface SavedEntry {
  date: string
  pi: number
  category: string
  interpretation: string
  userType: UserType
  unitLabel: string
  weight: string
  height: string
  units: UnitSystem
}

const STORAGE_KEY = "calqulate_pi_history"

function getStorage(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(entry: SavedEntry) {
  try {
    const existing = getStorage()
    existing.unshift(entry)
    const trimmed = existing.slice(0, 10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // ignore storage errors
  }
}

function getPiDeltaLabel(current: { pi: number; category: string }, previous: SavedEntry) {
  const categoryWeights: Record<string, number> = {
    "Underweight": 0,
    "Normal Weight": 1,
    "Overweight": 2,
    "Overweight / Obese": 3,
  }

  const currentIndex = categoryWeights[current.category] ?? 1
  const previousIndex = categoryWeights[previous.category] ?? 1

  if (currentIndex < previousIndex) {
    return { label: `Your current PI category improved from ${previous.category} to ${current.category}.`, positive: true }
  }
  if (currentIndex > previousIndex) {
    return { label: `Your current PI category moved from ${previous.category} to ${current.category}.`, positive: false }
  }

  const delta = Number((current.pi - previous.pi).toFixed(3))
  if (delta < 0) {
    return { label: `Your PI decreased by ${Math.abs(delta)} compared to the last saved result.`, positive: true }
  }
  if (delta > 0) {
    return { label: `Your PI increased by ${delta} compared to the last saved result.`, positive: false }
  }

  return { label: "No meaningful change from your last saved result.", positive: true }
}

const PonderalIndexCalculator = () => {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [units, setUnits] = useState<UnitSystem>("metric")
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<SavedEntry[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHistory(getStorage())
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { weight: "", height: "", userType: "adult", units: "metric" },
  })

  // --- Conversion helpers ---
  const cmToInches = (cm: number) => cm / 2.54
  const inchesToCm = (inches: number) => inches * 2.54
  const kgToLbs = (kg: number) => kg * 2.20462
  const lbsToKg = (lbs: number) => lbs / 2.20462

  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentValues = form.getValues()
    const updatedValues: Record<string, any> = { ...currentValues }

    if (currentValues.height) {
      const h = parseNumber(currentValues.height)
      updatedValues.height = newUnit === "imperial" ? cmToInches(h).toFixed(1) : inchesToCm(h).toFixed(1)
    }

    if (currentValues.weight) {
      const wt = parseNumber(currentValues.weight)
      updatedValues.weight = newUnit === "imperial" ? kgToLbs(wt).toFixed(1) : lbsToKg(wt).toFixed(1)
    }

    updatedValues.units = newUnit
    form.reset(updatedValues)
    setUnits(newUnit)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    setTimeout(() => {
      const weightInput = parseNumber(values.weight)
      const heightInput = parseNumber(values.height)
      const userType = values.userType

      let pi: number;
      let category: string = "";
      let interpretation: string = "";
      let categoryColor: string = "";
      let unitLabel: string = "";
      let bmi: number | null = null;
      let bmiCategory: string | null = null;

      if (userType === 'adult') {
        const weightInKg = units === "metric" ? weightInput : lbsToKg(weightInput);
        const heightInM = units === "metric" ? heightInput / 100 : inchesToCm(heightInput) / 100;

        pi = weightInKg / Math.pow(heightInM, 3);
        unitLabel = "kg/m³";

        // Corpulence Index feature: compute BMI (height²) so we can contrast it
        // with the Ponderal Index (height³) for tall/short builds.
        bmi = weightInKg / Math.pow(heightInM, 2);
        bmiCategory =
          bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

        if (pi < 11) {
            category = "Underweight";
            categoryColor = "text-blue-500";
            interpretation = adultPiData[0].notes;
        } else if (pi >= 11 && pi <= 15) {
            category = "Normal Weight";
            categoryColor = "text-green-500";
            interpretation = adultPiData[1].notes;
        } else { // pi > 15
            category = "Overweight";
            categoryColor = "text-red-500";
            interpretation = adultPiData[2].notes;
        }

      } else { // Child/Infant
        const weightInGrams = units === "metric" ? weightInput * 1000 : lbsToKg(weightInput) * 1000;
        const heightInCm = units === "metric" ? heightInput : inchesToCm(heightInput);

        // CORRECTED CHILD FORMULA: (Weight (g) / Height (cm)³) * 100
        pi = (weightInGrams / Math.pow(heightInCm, 3)) * 100;
        unitLabel = "Index Value"; // A neutral label for the scaled result

        if (pi < 2.2) {
            category = "Underweight";
            categoryColor = "text-blue-500";
            interpretation = childPiData[0].notes;
        } else if (pi >= 2.2 && pi <= 3.0) {
            category = "Normal Weight";
            categoryColor = "text-green-500";
            interpretation = childPiData[1].notes;
        } else { // pi > 3.0
            category = "Overweight / Obese";
            categoryColor = "text-red-500";
            interpretation = childPiData[2].notes;
        }
      }
      
      setResult({ pi, category, interpretation, categoryColor, userType, unitLabel, bmi, bmiCategory });
      setIsLoading(false);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 500);
  }
  
  const handleSave = () => {
    if (!result) return

    const values = form.getValues()
    const entry: SavedEntry = {
      date: new Date().toISOString(),
      pi: result.pi,
      category: result.category,
      interpretation: result.interpretation,
      userType: result.userType,
      unitLabel: result.unitLabel,
      weight: values.weight,
      height: values.height,
      units: values.units,
    }

    saveToStorage(entry)
    setHistory(getStorage())
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
    setShowHistory(false)
  }

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  }

  const lastSaved = history[0]
  const currentDeltaInfo = result && lastSaved ? getPiDeltaLabel({ pi: result.pi, category: result.category }, lastSaved) : null

  const getSpectrumPosition = () => {
    if (!result) return '0%';
    const { userType, pi } = result;
    let value;
    if (userType === 'adult') {
        // Normalize adult PI (e.g., from 8 to 18)
        value = ((pi - 8) / (18 - 8)) * 100;
    } else {
        // Normalize child PI (e.g., from 1.8 to 3.5)
        value = ((pi - 1.8) / (3.5 - 1.8)) * 100;
    }
    return `${Math.min(100, Math.max(0, value))}%`;
  };

  return (
    <>
      <Card className="max-w-4xl mx-auto" id="calculator">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" /> Ponderal Index (PI) Calculator
          </CardTitle>
          <CardDescription>
            Accurately assess body composition for adults and children using scientifically distinct formulas for each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <FormField
                  control={form.control} name="userType" render={({ field }) => (
                    <FormItem className="space-y-3 md:col-span-2">
                      <FormLabel>1. Who are you calculating for?</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4">
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="adult" /></FormControl>
                            <FormLabel className="font-normal flex items-center gap-2"><User className="w-4 h-4" /> Adult</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl><RadioGroupItem value="child" /></FormControl>
                            <FormLabel className="font-normal flex items-center gap-2"><Baby className="w-4 h-4" /> Child / Infant</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control} name="units" render={({ field }) => (
                    <FormItem className="space-y-3 md:col-span-2">
                        <FormLabel>2. Choose your unit system</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={(value: UnitSystem) => { field.onChange(value); handleUnitChange(value); }} defaultValue={field.value} className="flex items-center space-x-4">
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="metric" /></FormControl>
                              <FormLabel className="font-normal">Metric (kg, cm)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="imperial" /></FormControl>
                              <FormLabel className="font-normal">Imperial (lbs, in)</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                  control={form.control} name="weight" render={({ field }) => (
                    <FormItem>
                      <FormLabel>3. Enter Weight ({units === 'metric' ? 'kg' : 'lbs'})</FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder={units === 'metric' ? "e.g., 70" : "e.g., 155"} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="height" render={({ field }) => (
                    <FormItem>
                      <FormLabel>4. Enter Height ({units === 'metric' ? 'cm' : 'in'})</FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder={units === 'metric' ? "e.g., 175" : "e.g., 69"} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate PI'}
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
            <Card className="max-w-4xl mx-auto mt-8">
              <CardHeader>
                <CardTitle className="text-2xl">Your Ponderal Index Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Save this result to compare it with your previous Ponderal Index results.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleSave} className="flex-1 sm:flex-none">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Save Result
                    </Button>
                    <Button variant="secondary" onClick={() => setShowHistory((value) => !value)} className="flex-1 sm:flex-none">
                      <History className="h-4 w-4 mr-2" /> {showHistory ? "Hide History" : "Show History"}
                    </Button>
                  </div>
                </div>

                {saved && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    Saved successfully! Your latest Ponderal Index result is now stored locally.
                  </div>
                )}

                {currentDeltaInfo && (
                  <div className={`rounded-2xl border p-4 ${currentDeltaInfo.positive ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <p className="text-sm font-semibold">Comparison with last saved result</p>
                    <p className="mt-2 text-sm">{currentDeltaInfo.label}</p>
                  </div>
                )}

                {showHistory && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-base font-semibold">Saved Ponderal Index History</h4>
                        <p className="text-sm text-muted-foreground">Review recent saved results and compare your latest PI value.</p>
                        <SyncPrompt ctaId="sync_prompt_ponderal_index" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearHistory}>
                        Clear History
                      </Button>
                    </div>
                    {history.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No saved results yet. Save a result to build history.</p>
                    ) : (
                      <div className="space-y-3">
                        {history.map((entry) => (
                          <div key={entry.date} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold">{entry.category}</p>
                                <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">{entry.pi.toFixed(3)}</p>
                                <p className="text-xs text-gray-500">{entry.unitLabel}</p>
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                              <div>Weight: {entry.weight} {entry.units === 'metric' ? 'kg' : 'lbs'}</div>
                              <div>Height: {entry.height} {entry.units === 'metric' ? 'cm' : 'in'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center p-6 rounded-lg bg-muted border">
                    <p className="text-base font-semibold text-muted-foreground">Your Ponderal Index ({result.unitLabel})</p>
                    <p className="text-5xl font-bold text-primary my-2">{result.pi.toFixed(3)}</p>
                    <p className={`text-2xl font-semibold ${result.categoryColor}`}>{result.category}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Interpretation</h3>
                    <p className="text-muted-foreground">{result.interpretation}</p>
                </div>

                {/* FEATURE 1 — Corpulence Index vs BMI ───────────────────────────── */}
                <Card className="border border-emerald-100 bg-emerald-50/40 rounded-xl shadow-none">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <Ruler className="w-5 h-5 text-emerald-700" />
                      <h3 className="text-base font-bold text-emerald-700">Corpulence Index — Why It Beats BMI for Your Build</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your <strong>Corpulence Index (Ponderal Index)</strong> is{" "}
                      <strong className="text-emerald-700">{result.pi.toFixed(2)} {result.unitLabel}</strong>{" "}
                      — weight divided by height <strong>cubed</strong> (m³). Because it scales with body
                      <em> volume</em> rather than area, it stays accurate at the height extremes where BMI
                      (which uses height <strong>squared</strong>) systematically distorts the result.
                    </p>

                    {result.userType === 'adult' && result.bmi !== null ? (
                      <>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="rounded-xl border border-emerald-200 bg-white p-4 text-center">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Ponderal Index</p>
                            <p className="text-2xl font-black text-emerald-700 mt-1">{result.pi.toFixed(2)}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">kg/m³ · {result.category}</p>
                          </div>
                          <div className="rounded-xl border bg-white p-4 text-center">
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">Your BMI</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{result.bmi.toFixed(1)}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">kg/m² · {result.bmiCategory}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                          {result.category === result.bmiCategory
                            ? `For your build, the Ponderal Index (${result.category}) and BMI (${result.bmiCategory}) agree — typical for average heights, where both metrics track closely.`
                            : `Notice the difference: BMI labels you "${result.bmiCategory}", while the volume-based Ponderal Index reads "${result.category}". For very tall builds BMI overstates body mass, and for very short builds it understates it — the cubed-height PI corrects this, giving a more honest read for your frame.`}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                        For infants and children the index uses grams over height in cm³, so a standard
                        adult BMI comparison does not apply here. The cubed-height approach still captures
                        proportional growth more faithfully than height-squared metrics.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* FEATURE 2 — Reference ranges: adult, child, infant ─────────────── */}
                <Card className="border border-emerald-100 rounded-xl shadow-none">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <ScrollText className="w-5 h-5 text-emerald-700" />
                      <h3 className="text-base font-bold text-emerald-700">Reference Ranges — Where Your Value Falls</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ponderal Index thresholds differ by life stage. The normal range for adults is
                      roughly <strong>11–15 kg/m³</strong>. Your result of{" "}
                      <strong className="text-emerald-700">{result.pi.toFixed(2)} {result.unitLabel}</strong>{" "}
                      sits in the{" "}
                      <strong className={result.categoryColor}>{result.category.toLowerCase()}</strong>{" "}
                      band for{" "}
                      {result.userType === 'adult' ? "adults" : "infants and children"}.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      {[
                        { stage: "Adults", normal: "11 – 15 kg/m³", note: "Weight ÷ height³ in metres. Standard Rohrer adult band.", active: result.userType === 'adult' },
                        { stage: "Children", normal: "2.2 – 3.0", note: "Pediatric Corpulence Index (g ÷ cm³, scaled). Tracks proportional growth.", active: result.userType === 'child' },
                        { stage: "Infants / Newborns", normal: "2.32 – 2.85 g/cm³", note: "Neonatal PI. Low values flag IUGR; high values flag macrosomia.", active: result.userType === 'child' },
                      ].map((r) => (
                        <div
                          key={r.stage}
                          className={`rounded-xl border p-4 ${r.active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-800">{r.stage}</p>
                            {r.active && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white border border-emerald-200 rounded-full px-2 py-0.5">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-emerald-700 mt-1">{r.normal}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.note}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                      Adult and pediatric formulas use different units and are not directly comparable. This
                      is a screening reference, not a diagnosis — discuss out-of-range values with a clinician.
                    </p>
                  </CardContent>
                </Card>

                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-center">Ponderal Index Reference Chart ({result.userType === 'adult' ? 'Adults' : 'Children'})</h3>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Ponderal Index (PI) Range</TableHead>
                                <TableHead>Weight Status</TableHead>
                                <TableHead className="hidden md:table-cell">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(result.userType === 'adult' ? adultPiData : childPiData).map((row) => (
                                <TableRow key={row.status} className={result.category.includes(row.status.split(' ')[0]) ? "bg-primary/10" : ""}>
                                    <TableCell className="font-medium">{row.range}</TableCell>
                                    <TableCell>{row.status}</TableCell>
                                    <TableCell className="hidden md:table-cell">{row.notes}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 text-center">Your Result on the Health Spectrum</h3>
                    <div className="relative w-full h-4 bg-gradient-to-r from-blue-400 via-green-400 to-red-500 rounded-full">
                        <div className="absolute top-1/2 h-6 w-6 rounded-full bg-white border-2 border-primary shadow-lg -translate-y-1/2 -translate-x-1/2" style={{ left: getSpectrumPosition() }} title={`Your PI: ${result.pi.toFixed(2)}`}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded">You</div>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                        <span>Underweight</span>
                        <span>Normal</span>
                        <span>Overweight</span>
                    </div>
                </div>
              </CardContent>
            </Card>
        )}
      </div>
    </>
  )
}

export default PonderalIndexCalculator