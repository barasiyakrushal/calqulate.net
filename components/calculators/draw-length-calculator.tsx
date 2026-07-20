"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ClickableImage } from "@/components/ui/image-lightbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// Updated icon import: Replaced Calculator with Target
import { Target, RefreshCw, Loader2, ArrowDown, Ruler, Crosshair, GraduationCap, Trophy } from "lucide-react"
import { parseNumber } from "@/lib/utils"

// Define validation schema for draw length (no changes here)
const formSchema = z.object({
  wingspan: z.string().min(1, "Wingspan measurement is required"),
  units: z.enum(["metric", "imperial"]),
})

type UnitSystem = "metric" | "imperial"

interface CalculationResult {
  drawLengthInches: number
  drawLengthCm: number
  rangeStart: number
  rangeEnd: number
  // Feature 1 — bow & arrow recommendations derived from the result
  arrowLengthMin: number
  arrowLengthMax: number
  recommendedAtA: string
  bowSizeNote: string
}

// Simple conversion helpers (no changes here)
const cmToInches = (cm: number) => cm / 2.54;
const inchesToCm = (inches: number) => inches * 2.54;

export default function DrawLengthCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [units, setUnits] = useState<UnitSystem>("imperial")
  const [isLoading, setIsLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { wingspan: "", units: "imperial" },
  })

  // Function to handle unit system changes and convert input values (no changes here)
  const handleUnitChange = (newUnit: UnitSystem) => {
    const currentWingspan = form.getValues("wingspan");
    if (currentWingspan) {
      const wingspanValue = parseNumber(currentWingspan);
      if (!isNaN(wingspanValue)) {
        const convertedWingspan = newUnit === "imperial" 
          ? cmToInches(wingspanValue).toFixed(1) 
          : inchesToCm(wingspanValue).toFixed(1);
        form.setValue("wingspan", convertedWingspan);
      }
    }
    setUnits(newUnit);
  };

  // onSubmit function logic remains the same
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setTimeout(() => {
        const wingspan = parseNumber(values.wingspan)
        const wingspanInInches = units === "imperial" ? wingspan : cmToInches(wingspan)
        const calculatedDrawLength = wingspanInInches / 2.5

        // ── FEATURE 1: bow size (AMO / axle-to-axle) + arrow length guidance ──
        // Arrow length is typically draw length + 1 to 2 inches for safe clearance.
        const arrowLengthMin = calculatedDrawLength + 1
        const arrowLengthMax = calculatedDrawLength + 2

        // AMO / axle-to-axle bow length guidance scaled to draw length.
        let recommendedAtA = ""
        let bowSizeNote = ""
        if (calculatedDrawLength < 26) {
          recommendedAtA = "62–66\" (recurve) · 28–31\" ATA (compound)"
          bowSizeNote = "A shorter draw length pairs well with a more compact bow for easy handling and control."
        } else if (calculatedDrawLength <= 28) {
          recommendedAtA = "66–68\" (recurve) · 31–33\" ATA (compound)"
          bowSizeNote = "A mid-range draw length fits the most common bow sizes — easy to find and forgiving to shoot."
        } else {
          recommendedAtA = "68–72\" (recurve) · 33\"+ ATA (compound)"
          bowSizeNote = "A longer draw length benefits from a longer bow for a smoother draw cycle and a more stable anchor."
        }

        setResult({
          drawLengthInches: calculatedDrawLength,
          drawLengthCm: inchesToCm(calculatedDrawLength),
          rangeStart: calculatedDrawLength - 0.5,
          rangeEnd: calculatedDrawLength + 0.5,
          arrowLengthMin,
          arrowLengthMax,
          recommendedAtA,
          bowSizeNote,
        })
        setIsLoading(false)
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100)
    }, 500);
  }

  const resetCalculator = () => {
    form.reset({ wingspan: "", units: "imperial" })
    setResult(null)
    setUnits("imperial");
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto" id="calculator">
        <CardHeader>
            {/* --- MODIFIED: Changed icon in the title --- */}
            <CardTitle className="flex items-center gap-2"><Target className="w-6 h-6 text-primary" /> Draw Length Calculator</CardTitle>
            <CardDescription>Enter your wingspan measurement below to get an accurate estimate of your ideal draw length.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* --- NEW: Two-column grid for inputs and image --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Column 1: Form Inputs */}
                <div className="space-y-6">
                  <FormField
                    control={form.control} name="units" render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Unit of Measurement</FormLabel>
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
                              <FormControl><RadioGroupItem value="imperial" /></FormControl>
                              <FormLabel className="font-normal">Imperial (inches)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl><RadioGroupItem value="metric" /></FormControl>
                              <FormLabel className="font-normal">Metric (cm)</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField 
                    control={form.control} 
                    name="wingspan" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Wingspan ({units === 'imperial' ? 'inches' : 'cm'})</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder={units === 'imperial' ? "e.g., 70.1" : "e.g., 178"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </div>
                {/* Column 2: Informative Image */}
                <div className=" flex flex-col items-center">
                  <ClickableImage 
                    src="/draw-length-visual.webp"
                    alt="Diagram showing how to measure wingspan for archery draw length"
                    width={300}
                    height={200}
                    className="rounded-md"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Measure your wingspan from the tip of one middle finger to the other.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* --- MODIFIED: Replaced Calculator icon with Target icon --- */}
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
                  {isLoading ? 'Calculating...' : 'Calculate Draw Length'}
                </Button>
                <Button type="button" variant="outline" onClick={resetCalculator} className="flex-1" disabled={isLoading}><RefreshCw className="h-4 w-4 mr-2" /> Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* The results section remains unchanged */}
      <div ref={resultsRef}>
        {result && (
          <Card className="max-w-4xl mx-auto mt-8 border-primary/20">
            <CardHeader>
                <CardTitle className="text-2xl">Your Estimated Draw Length</CardTitle>
                <CardDescription>This is an excellent starting point. Use the guides on this page to fine-tune your final setting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-lg bg-muted border">
                  <p className="text-sm font-semibold text-muted-foreground">Your Calculated Draw Length Is</p>
                  <p className="text-4xl md:text-5xl font-bold text-primary my-2">{result.drawLengthInches.toFixed(2)} inches</p>
                  <p className="text-lg text-muted-foreground">({result.drawLengthCm.toFixed(2)} cm)</p>
                </div>
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Target className="w-8 h-8 text-blue-500" />
                        <div>
                            <CardTitle className="text-lg">Recommended Setup Range</CardTitle>
                            <CardDescription>Most bows adjust in half-inch increments. You should start by setting your bow between <strong>{result.rangeStart.toFixed(1)}"</strong> and <strong>{result.rangeEnd.toFixed(1)}"</strong> and test your form.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
                {/* ── FEATURE 1: Bow size & arrow length recommendations ── */}
                <Card className="border-emerald-200 bg-emerald-50/60 dark:bg-emerald-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-emerald-700">
                          <Crosshair className="w-5 h-5" /> Recommended Bow & Arrow Setup
                        </CardTitle>
                        <CardDescription>
                          Matched to your {result.drawLengthInches.toFixed(1)}" draw length using the wingspan method.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border bg-white dark:bg-slate-950 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                                  <Ruler className="w-3.5 h-3.5" /> Recommended Bow Size
                                </p>
                                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{result.recommendedAtA}</p>
                                <p className="text-sm text-muted-foreground mt-2">{result.bowSizeNote}</p>
                            </div>
                            <div className="rounded-xl border bg-white dark:bg-slate-950 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5" /> Suggested Arrow Length
                                </p>
                                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                                  {result.arrowLengthMin.toFixed(1)}" – {result.arrowLengthMax.toFixed(1)}"
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                  Arrows are typically cut to your draw length plus 1–2 inches for safe clearance past the rest.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── FEATURE 2: Beginner vs competition tuning notes ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <GraduationCap className="w-5 h-5 text-primary" /> Tuning Notes for Your Setup
                        </CardTitle>
                        <CardDescription>How to adapt your {result.drawLengthInches.toFixed(1)}" baseline depending on your level.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border bg-white dark:bg-slate-950 p-4">
                                <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                                  <GraduationCap className="w-4 h-4" /> Beginners
                                </p>
                                <ul className="text-sm text-muted-foreground mt-2 space-y-1.5 list-disc pl-5">
                                  <li>Cut arrows slightly longer (toward {result.arrowLengthMax.toFixed(1)}") for extra safety margin.</li>
                                  <li>Start with a lighter draw weight so you can hold steady at full draw without strain.</li>
                                  <li>If between sizes, round down to the shorter draw length to build consistent form first.</li>
                                </ul>
                            </div>
                            <div className="rounded-xl border bg-white dark:bg-slate-950 p-4">
                                <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                                  <Trophy className="w-4 h-4" /> Competition
                                </p>
                                <ul className="text-sm text-muted-foreground mt-2 space-y-1.5 list-disc pl-5">
                                  <li>Tune arrow length precisely (nearer {result.arrowLengthMin.toFixed(1)}") to optimise spine and speed.</li>
                                  <li>Dial in brace height within the bow's spec window for a quieter, more forgiving release.</li>
                                  <li>Confirm your draw length against your anchor point at full draw, not just the wingspan estimate.</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center pt-4">
                    <h3 className="text-lg font-semibold">What's Next?</h3>
                    <p className="text-muted-foreground mt-1">Scroll down to learn how to verify this measurement by checking your form and making micro-adjustments for perfect accuracy.</p>
                    <Button variant="outline" className="mt-4" onClick={() => document.querySelector('.prose')?.scrollIntoView({ behavior: 'smooth' })}>
                        <ArrowDown className="h-4 w-4 mr-2" />
                        Go to Fine-Tuning Guide
                    </Button>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}