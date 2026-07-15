"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  differenceInYears, differenceInMonths, differenceInDays, differenceInWeeks,
  isValid, differenceInHours, differenceInMinutes,
} from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Calculator, RefreshCw, Loader2, CalendarDays, Clock, PartyPopper,
  Hourglass, Sun, Cake,
} from "lucide-react";

// ─── FORM SCHEMA ──────────────────────────────────────────────────────────────
const formSchema = z.object({
  dob: z.string().refine((val) => isValid(new Date(val)), {
    message: "Please enter a valid date of birth.",
  }),
  targetDate: z.string().refine((val) => isValid(new Date(val)), {
    message: "Please enter a valid target date.",
  }),
});

// Result shape for calculated age
interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  nextBirthday: {
    daysAway: number;
    weekday: string;
    date: string;
  };
  dayBorn: string;
  leapYears: number;
  birthdays: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
/** Parse a yyyy-mm-dd string into a LOCAL date so weekdays never shift by timezone. */
function parseLocalDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** How many February 29ths the person has actually lived through. */
function countLeapDaysLived(birth: Date, target: Date): number {
  let count = 0;
  for (let y = birth.getFullYear(); y <= target.getFullYear(); y++) {
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    if (!isLeap) continue;
    const feb29 = new Date(y, 1, 29);
    if (feb29 >= birth && feb29 <= target) count++;
  }
  return count;
}

// ─── MAIN EXPORT COMPONENT ────────────────────────────────────────────────────
export default function AgeCalculator() {
  const [result, setResult] = useState<AgeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dob: "",
      targetDate: todayStr,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const birthDate = parseLocalDate(values.dob);
      const targetDate = parseLocalDate(values.targetDate);

      // Core age: full years, months, then remaining days
      let years = differenceInYears(targetDate, birthDate);
      let months = differenceInMonths(targetDate, birthDate) % 12;

      const tempDate = new Date(birthDate);
      tempDate.setFullYear(tempDate.getFullYear() + years);
      tempDate.setMonth(tempDate.getMonth() + months);
      let days = differenceInDays(targetDate, tempDate);

      if (days < 0) {
        months -= 1;
        const previousMonthDate = new Date(birthDate);
        previousMonthDate.setFullYear(previousMonthDate.getFullYear() + years);
        previousMonthDate.setMonth(previousMonthDate.getMonth() + months);
        days = differenceInDays(targetDate, previousMonthDate);
      }

      // Totals: the same age expressed in a single unit
      const totalMonths = differenceInMonths(targetDate, birthDate);
      const totalWeeks = differenceInWeeks(targetDate, birthDate);
      const totalDays = differenceInDays(targetDate, birthDate);
      const totalHours = differenceInHours(targetDate, birthDate);
      const totalMinutes = differenceInMinutes(targetDate, birthDate);

      // Next birthday
      const currentYear = targetDate.getFullYear();
      const nextBday = new Date(birthDate);
      nextBday.setFullYear(currentYear);
      if (nextBday < targetDate) {
        nextBday.setFullYear(currentYear + 1);
      }
      const nextBirthdayDaysAway = differenceInDays(nextBday, targetDate);
      const nextBirthdayWeekday = nextBday.toLocaleDateString("en-US", { weekday: "long" });
      const nextBirthdayDateStr = nextBday.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const dayBorn = birthDate.toLocaleDateString("en-US", { weekday: "long" });
      const leapYears = countLeapDaysLived(birthDate, targetDate);

      setResult({
        years,
        months,
        days,
        totalMonths,
        totalWeeks,
        totalDays,
        totalHours,
        totalMinutes,
        nextBirthday: {
          daysAway: nextBirthdayDaysAway,
          weekday: nextBirthdayWeekday,
          date: nextBirthdayDateStr,
        },
        dayBorn,
        leapYears,
        birthdays: Math.max(0, years),
      });

      setIsLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }, 400);
  }

  // Highlight stats: the numbers people came for
  const highlights = result
    ? [
        { icon: CalendarDays, label: "Days lived", value: result.totalDays.toLocaleString() },
        { icon: Clock, label: "Hours lived", value: result.totalHours.toLocaleString() },
        { icon: PartyPopper, label: "Next birthday", value: `In ${result.nextBirthday.daysAway} days` },
        { icon: Sun, label: "Day of birth", value: result.dayBorn },
      ]
    : [];

  // Age expressed entirely in each single unit
  const breakdown = result
    ? [
        { label: "Years", value: result.years.toLocaleString() },
        { label: "Months", value: result.totalMonths.toLocaleString() },
        { label: "Weeks", value: result.totalWeeks.toLocaleString() },
        { label: "Days", value: result.totalDays.toLocaleString() },
        { label: "Hours", value: result.totalHours.toLocaleString() },
        { label: "Minutes", value: result.totalMinutes.toLocaleString() },
      ]
    : [];

  return (
    <div className="space-y-8 text-left">
      {/* ── CALCULATOR ─────────────────────────────────────────────────────────── */}
      <Card className="max-w-3xl mx-auto shadow-lg border-t-4 border-t-emerald-600" id="calculator">
        <CardHeader className="pb-6 border-b">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Hourglass className="w-6 h-6 text-emerald-700" />
            Age Calculator
          </CardTitle>
          <CardDescription className="mt-1">
            Enter your date of birth to see your exact age in years, months, and days.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-12 text-lg" max={todayStr} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Age at Date (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" className="h-12 text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" size="lg" className="flex-1 text-lg h-14 font-bold bg-emerald-700 text-white hover:bg-emerald-800" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Calculator className="mr-2 h-5 w-5" />}
                  {isLoading ? "Calculating..." : "Calculate Age"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="sm:w-40 text-lg h-14"
                  onClick={() => {
                    form.reset();
                    setResult(null);
                  }}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-5 w-5" /> Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* ── RESULTS ────────────────────────────────────────────────────────────── */}
      <div ref={resultsRef} className="scroll-mt-16">
        {result && (
          <div className="max-w-3xl mx-auto mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Understand your results: the headline number */}
            <Card className="overflow-hidden border-emerald-200 shadow-xl">
              <div className="bg-emerald-50 p-8 md:p-10 text-center">
                <p className="text-base text-slate-500 font-medium mb-3">You are exactly</p>
                <div className="flex flex-wrap justify-center items-baseline gap-x-3 gap-y-1 text-emerald-700">
                  <span className="text-5xl md:text-6xl font-bold tabular-nums">{result.years}</span>
                  <span className="text-lg md:text-xl font-medium text-slate-500">years,</span>
                  <span className="text-5xl md:text-6xl font-bold tabular-nums">{result.months}</span>
                  <span className="text-lg md:text-xl font-medium text-slate-500">months,</span>
                  <span className="text-5xl md:text-6xl font-bold tabular-nums">{result.days}</span>
                  <span className="text-lg md:text-xl font-medium text-slate-500">days old</span>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-100 text-sm font-medium text-slate-600">
                  <Cake className="w-4 h-4 text-emerald-700" /> Born on a {result.dayBorn}
                </div>
              </div>
            </Card>

            {/* Highlight stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {highlights.map((h) => (
                <div key={h.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <h.icon className="w-5 h-5 text-emerald-700 mx-auto mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums leading-tight">{h.value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{h.label}</p>
                </div>
              ))}
            </div>

            {/* Age breakdown: the same age in every unit */}
            <Card className="border shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <Hourglass className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">Your age breakdown</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  The same age expressed in years, months, weeks, days, hours, and minutes.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
                  {breakdown.map((b) => (
                    <div key={b.label} className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
                      <p className="text-xl md:text-2xl font-bold tabular-nums text-emerald-700 leading-none">{b.value}</p>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">{b.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* A few fun facts */}
            <Card className="border shadow-md">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-1">
                  <PartyPopper className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900">A few things about your life so far</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Personal statistics counted from the day you were born.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                  <div className="rounded-xl border bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold tabular-nums text-slate-900 leading-none">{result.birthdays.toLocaleString()}</p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">Birthdays celebrated</p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold tabular-nums text-slate-900 leading-none">{result.leapYears.toLocaleString()}</p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">Leap days lived</p>
                  </div>
                  <div className="rounded-xl border bg-slate-50 p-4 text-center">
                    <p className="text-lg font-bold text-slate-900 leading-tight">{result.nextBirthday.date}</p>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">
                      Next birthday ({result.nextBirthday.weekday})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pb-2">
              <Button
                variant="outline"
                className="h-12"
                onClick={() => {
                  form.reset();
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Calculate another age
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
