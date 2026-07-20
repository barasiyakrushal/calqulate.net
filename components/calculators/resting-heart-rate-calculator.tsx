"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Activity, Timer, RefreshCw, Zap, ShieldCheck, Info, Award, BarChart3, History, Save, CheckCircle2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import Link from "next/link";
import { parseNumber } from "@/lib/utils";

// ─── FEATURE 1: AGE & SEX HEALTHY-RANGE BANDS ────────────────────────────────
// Reference resting-heart-rate fitness bands (bpm) sourced from widely used
// age × sex normative tables. Lower RHR generally indicates better fitness.
type Sex = "male" | "female";

interface RhrCategory {
  label: "Athlete" | "Excellent" | "Good" | "Average" | "Poor";
  color: string;     // hex accent
  textClass: string; // tailwind text colour
  bgClass: string;   // tailwind soft background
  blurb: string;
}

// Returns the upper bpm cutoffs for each fitness tier for a given age/sex.
// Order: [athleteMax, excellentMax, goodMax, averageMax] — above averageMax = Poor.
function getRhrBands(age: number, sex: Sex): [number, number, number, number] {
  // Bands loosely follow standard cardio fitness charts; men trend a touch lower.
  const tables: Record<Sex, { maxAge: number; bands: [number, number, number, number] }[]> = {
    male: [
      { maxAge: 25, bands: [55, 61, 65, 73] },
      { maxAge: 35, bands: [54, 61, 65, 74] },
      { maxAge: 45, bands: [56, 62, 66, 75] },
      { maxAge: 55, bands: [57, 63, 67, 76] },
      { maxAge: 65, bands: [56, 61, 67, 75] },
      { maxAge: 200, bands: [55, 61, 65, 73] },
    ],
    female: [
      { maxAge: 25, bands: [60, 65, 69, 78] },
      { maxAge: 35, bands: [59, 64, 68, 76] },
      { maxAge: 45, bands: [60, 64, 69, 78] },
      { maxAge: 55, bands: [61, 65, 69, 77] },
      { maxAge: 65, bands: [60, 64, 68, 76] },
      { maxAge: 200, bands: [60, 64, 68, 76] },
    ],
  };
  const row = tables[sex].find((r) => age <= r.maxAge) ?? tables[sex][tables[sex].length - 1];
  return row.bands;
}

function categorizeRhr(rhr: number, age: number, sex: Sex): RhrCategory {
  const [athlete, excellent, good, average] = getRhrBands(age, sex);
  if (rhr <= athlete)
    return { label: "Athlete", color: "#2563eb", textClass: "text-blue-700", bgClass: "bg-blue-50 border-blue-200", blurb: "Your heart is highly efficient — a hallmark of well-trained, athletic conditioning." };
  if (rhr <= excellent)
    return { label: "Excellent", color: "#15803d", textClass: "text-emerald-700", bgClass: "bg-emerald-50 border-emerald-200", blurb: "Excellent cardiovascular fitness for your age and sex. Keep up your training." };
  if (rhr <= good)
    return { label: "Good", color: "#16a34a", textClass: "text-green-700", bgClass: "bg-green-50 border-green-200", blurb: "A healthy, above-average resting heart rate. A little more cardio could push you higher." };
  if (rhr <= average)
    return { label: "Average", color: "#ca8a04", textClass: "text-yellow-700", bgClass: "bg-yellow-50 border-yellow-200", blurb: "A typical resting heart rate. Regular aerobic exercise can gradually lower it." };
  return { label: "Poor", color: "#dc2626", textClass: "text-red-700", bgClass: "bg-red-50 border-red-200", blurb: "Higher than ideal for your age and sex. Building aerobic fitness — and ruling out stress, caffeine or illness — can help bring it down." };
}

// ─── FEATURE 2: LOCAL-STORAGE READING HISTORY ────────────────────────────────
const RHR_STORAGE_KEY = "calqulate_rhr_history";

interface RhrEntry {
  date: string;
  rhr: number;
  age: number;
  sex: Sex;
  category: string;
}

function getRhrStorage(): RhrEntry[] {
  try {
    const raw = localStorage.getItem(RHR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRhrEntry(entry: RhrEntry) {
  try {
    const existing = getRhrStorage();
    existing.unshift(entry);
    localStorage.setItem(RHR_STORAGE_KEY, JSON.stringify(existing.slice(0, 10)));
  } catch {
    /* ignore */
  }
}

// --- HELPERS ---
const calculateZones = (age: number, rhr: number) => {
  const maxHR = 220 - age;
  const hrr = maxHR - rhr; // Heart Rate Reserve

  const zones = [
    { label: "Very Light", range: "50-60%", color: "bg-yellow-100 border-yellow-400", text: "text-yellow-700" },
    { label: "Light", range: "60-70%", color: "bg-orange-100 border-orange-400", text: "text-orange-700" },
    { label: "Moderate", range: "70-80%", color: "bg-orange-200 border-orange-500", text: "text-orange-800" },
    { label: "Hard", range: "80-90%", color: "bg-red-100 border-red-400", text: "text-red-700" },
    { label: "VO2 Max (Maximum)", range: "90-100%", color: "bg-red-600 border-red-700", text: "text-white" },
  ];

  return zones.map((z) => {
    const lowPerc = parseInt(z.range.split("-")[0]) / 100;
    const highPerc = parseInt(z.range.split("-")[1]) / 100;
    const lowBpm = Math.round(hrr * lowPerc + rhr);
    const highBpm = Math.round(hrr * highPerc + rhr);
    return { ...z, bpmRange: `${lowBpm} - ${highBpm}` };
  });
};

const HeartRateGauge = ({ bpm }: { bpm: number }) => {
  const getPosition = (val: number) => {
    const min = 40;
    const max = 110;
    const percent = ((val - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, percent));
  };

  const getStatus = (val: number) => {
    if (val < 60) return { label: "Athletic / Excellent", color: "text-blue-600" };
    if (val <= 75) return { label: "Good / Healthy", color: "text-green-600" };
    if (val <= 85) return { label: "Average", color: "text-yellow-600" };
    return { label: "Above Average / High", color: "text-red-600" };
  };

  const status = getStatus(bpm);

  return (
    <div className="w-full py-4">
      <div className="relative w-full h-3 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500 rounded-full">
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-4 border-primary rounded-full shadow-md transition-all duration-500"
          style={{ left: `${getPosition(bpm)}%` }}
        />
      </div>
      <p className={`text-center mt-3 font-bold ${status.color}`}>{status.label}</p>
    </div>
  );
};

export default function RestingHeartRateCalculator() {
  const [age, setAge] = useState<number | "">(30);
  const [sex, setSex] = useState<Sex>("male");
  const [bpmInput, setBpmInput] = useState<number | "">("");
  const [result, setResult] = useState<{ rhr: number; age: number; sex: Sex } | null>(null);
  const [taps, setTaps] = useState<number[]>([]);
  const [isTapping, setIsTapping] = useState(false);
  const [history, setHistory] = useState<RhrEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setHistory(getRhrStorage());
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bpmInput && age) setResult({ rhr: Number(bpmInput), age: Number(age), sex });
  };

  const handleSave = () => {
    if (!result) return;
    const cat = categorizeRhr(result.rhr, result.age, result.sex);
    saveRhrEntry({
      date: new Date().toISOString(),
      rhr: result.rhr,
      age: result.age,
      sex: result.sex,
      category: cat.label,
    });
    setHistory(getRhrStorage());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(RHR_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setHistory([]);
    setShowHistory(false);
  };

  const handleTap = () => {
    const now = Date.now();
    setIsTapping(true);
    setTaps((prev) => {
      const newTaps = [...prev, now].slice(-10);
      if (newTaps.length >= 2) {
        const intervals = [];
        for (let i = 1; i < newTaps.length; i++) intervals.push(newTaps[i] - newTaps[i - 1]);
        const avg = intervals.reduce((a, b) => a + b) / intervals.length;
        setBpmInput(Math.round(60000 / avg));
      }
      return newTaps;
    });
    setTimeout(() => setIsTapping(false), 100);
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-4xl mx-auto border-t-4 border-t-red-500 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="text-red-500 animate-pulse" /> Pulse & Training Zone Expert</CardTitle>
          <CardDescription>Measure your resting pulse to generate a personalized aerobic exercise blueprint.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 w-full">
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Your Age</label>
                <Input type="number" value={age} onChange={(e) => setAge(e.target.value === "" ? "" : parseNumber(e.target.value))} className="text-lg" placeholder="e.g. 35" />
             </div>
             <div className="flex-1 w-full">
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Sex</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["male", "female"] as Sex[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`rounded-md border-2 py-2 text-sm font-semibold capitalize transition-all ${
                        sex === s
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-muted bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
             </div>
             <p className="text-xs text-muted-foreground md:max-w-[200px]">Age and sex are used for Target Heart Rate zones and your healthy-range fitness band.</p>
          </div>

          <Tabs defaultValue="manual">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="tap">Tap Live Pulse</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resting BPM</label>
                <div className="relative">
                   <Input type="number" placeholder="Enter your RHR" value={bpmInput} onChange={(e) => setBpmInput(e.target.value === "" ? "" : parseNumber(e.target.value))} className="text-xl py-6 pr-16" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">BPM</span>
                </div>
              </div>
              <Button onClick={() => bpmInput && age && setResult({rhr: Number(bpmInput), age: Number(age), sex})} className="w-full h-12 text-lg bg-red-600 hover:bg-red-700">Calculate My Profile</Button>
            </TabsContent>

            <TabsContent value="tap" className="text-center space-y-4">
               <div className="py-8 border-2 border-dashed rounded-xl bg-slate-50/50">
                  <div className="text-5xl font-black text-red-600 mb-6">{bpmInput || "--"} <span className="text-lg font-normal text-muted-foreground">BPM</span></div>
                  <button 
                    onMouseDown={handleTap} 
                    className={`w-28 h-28 rounded-full shadow-xl transition-all flex items-center justify-center border-4 ${isTapping ? "scale-90 bg-red-500 border-red-200" : "bg-white border-slate-100 hover:border-red-200"}`}
                  >
                    <Zap className={`w-10 h-10 ${isTapping ? "text-white" : "text-red-500"}`} />
                  </button>
                  <p className="mt-4 text-sm text-muted-foreground italic">Tap your screen in time with your pulse</p>
               </div>
               <Button disabled={!bpmInput} onClick={() => bpmInput && age && setResult({rhr: Number(bpmInput), age: Number(age), sex})} className="w-full">Analyze This Pulse</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="overflow-hidden border-none shadow-xl">
            <div className="bg-slate-900 text-white p-8 text-center">
               <h3 className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-2">Resting Heart Rate Analysis</h3>
               <div className="flex items-center justify-center gap-4">
                  <span className="text-7xl font-black">{result.rhr}</span>
                  <div className="text-left">
                    <div className="text-xl font-bold leading-tight">BPM</div>
                    <div className="text-red-400 text-sm">Beats Per Minute</div>
                  </div>
               </div>
               <div className="max-w-xs mx-auto mt-4">
                 <HeartRateGauge bpm={result.rhr} />
               </div>
            </div>

            <CardContent className="p-0">
               <div className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-red-500 w-5 h-5" />
                    <h3 className="text-xl font-bold">
                      Your Personalized{" "}
                      <Link
                        href="/health/heart-rate-calculator"
                        className="hover:underline hover:text-green-700 transition-colors"
                      >
                        Target Heart Rate
                      </Link>{" "}
                      Zones
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    Based on your age of <strong>{result.age}</strong> and RHR of <strong>{result.rhr}</strong>, here are your optimal zones for aerobic exercise calculated using the Karvonen formula:
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase">
                        <th className="p-4 font-bold border-b">
                          <Link
                            href="/health/calories-burned-calculator"
                            className="hover:underline hover:text-green-700 transition-colors"
                          >
                            Exercise Intensity
                          </Link>
                        </th>
                          <th className="p-4 font-bold border-b">Heart Rate Reserve</th>
                          <th className="p-4 font-bold border-b">Target Range (BPM)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculateZones(result.age, result.rhr).map((zone, i) => (
                          <tr key={i} className={`border-b last:border-0 hover:bg-slate-50 transition-colors`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${zone.color.split(' ')[0]}`} />
                                <span className="font-bold text-slate-800">{zone.label}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">{zone.range}</td>
                            <td className={`p-4 font-black text-lg ${zone.text}`}>{zone.bpmRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-8">
                    <div className="flex gap-4 p-4 bg-blue-50 rounded-xl">
                       <ShieldCheck className="text-blue-600 w-6 h-6 shrink-0" />
                       <div>
                          <p className="font-bold text-blue-900 text-sm">Health Insight</p>
                          <p className="text-xs text-blue-700 mt-1">Consistency is key. Aim for Zone 2-3 (Light to Moderate) for at least 150 minutes per week to strengthen your heart and lower your RHR.</p>
                       </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-amber-50 rounded-xl">
                       <Timer className="text-amber-600 w-6 h-6 shrink-0" />
                       <div>
                          <p className="font-bold text-amber-900 text-sm">Measurement Tip</p>
                          <p className="text-xs text-amber-700 mt-1">For maximum accuracy, take this measurement again tomorrow morning immediately after waking up, while still in bed.</p>
                       </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" onClick={() => setResult(null)} className="w-full mt-6 text-slate-400">
                    <RefreshCw className="w-4 h-4 mr-2" /> Recalculate
                  </Button>
               </div>
            </CardContent>
          </Card>

          {/* ── FEATURE 1: HEALTHY RANGE BY AGE & SEX (colour-cued category) ── */}
          {(() => {
            const cat = categorizeRhr(result.rhr, result.age, result.sex);
            const [athlete, excellent, good, average] = getRhrBands(result.age, result.sex);
            const tiers = [
              { name: "Athlete", range: `≤ ${athlete}`, color: "#2563eb" },
              { name: "Excellent", range: `${athlete + 1}–${excellent}`, color: "#15803d" },
              { name: "Good", range: `${excellent + 1}–${good}`, color: "#16a34a" },
              { name: "Average", range: `${good + 1}–${average}`, color: "#ca8a04" },
              { name: "Poor", range: `> ${average}`, color: "#dc2626" },
            ];
            return (
              <Card className="border shadow-md">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <h3 className="text-base font-bold">Your Fitness Band — by Age &amp; Sex</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For a{" "}
                    <strong className="text-slate-700 capitalize">{result.sex}</strong> aged{" "}
                    <strong className="text-slate-700">{result.age}</strong>, a resting heart rate of{" "}
                    <strong className="text-slate-700">{result.rhr} BPM</strong> is rated{" "}
                    <span className={`font-bold ${cat.textClass}`}>{cat.label}</span>.
                  </p>

                  <div className={`mt-4 rounded-xl border p-4 flex items-start gap-3 ${cat.bgClass}`}>
                    <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: cat.color }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: cat.color }}>{cat.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{cat.blurb}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {tiers.map((t) => (
                      <div
                        key={t.name}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                          t.name === cat.label ? "ring-2 ring-offset-1" : "opacity-80"
                        }`}
                        style={{
                          background: `${t.color}12`,
                          ...(t.name === cat.label ? { boxShadow: `0 0 0 2px ${t.color}` } : {}),
                        }}
                      >
                        <span className="flex items-center gap-2 font-semibold" style={{ color: t.color }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                          {t.name}
                        </span>
                        <span className="font-mono text-xs text-slate-600">{t.range} BPM</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
                    Bands are age- and sex-matched normative fitness ranges. Tip: use the “Tap Live Pulse” tool above (or
                    count beats for 15 seconds and multiply by 4) to capture your reading, then re-check first thing in the morning.
                  </p>
                </CardContent>
              </Card>
            );
          })()}

          {/* ── FEATURE 2: READINGS OVER TIME (localStorage trend + signals) ── */}
          <Card className="border shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold">Track Your Readings Over Time</h3>
              </div>

              {/* Trend vs previous saved reading */}
              {(() => {
                const previous = history[0];
                if (!previous) {
                  return (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                      Save this reading to start tracking your resting heart rate. Stored privately in your browser — no
                      account or cookies.
                    </p>
                  );
                }
                const delta = result.rhr - previous.rhr;
                const improving = delta < 0;
                const flat = delta === 0;
                return (
                  <div
                    className={`mt-2 rounded-xl border p-4 flex items-start gap-3 ${
                      flat ? "bg-slate-50 border-slate-200" : improving ? "bg-emerald-50 border-emerald-200" : "bg-orange-50 border-orange-200"
                    }`}
                  >
                    {flat ? (
                      <Activity className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    ) : improving ? (
                      <TrendingDown className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-bold ${flat ? "text-slate-700" : improving ? "text-emerald-700" : "text-orange-700"}`}>
                        {flat
                          ? "No change since your last reading."
                          : improving
                          ? `Down ${Math.abs(delta)} BPM since your last reading — a lower resting rate often signals improving fitness.`
                          : `Up ${delta} BPM since your last reading.`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Compared to {previous.rhr} BPM on{" "}
                        {new Date(previous.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* What a rising resting rate can signal */}
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed">
                  <p className="font-bold mb-1">Why a rising resting heart rate matters</p>
                  A steady climb in your morning resting rate can be an early warning sign of{" "}
                  <strong>overtraining</strong>, an oncoming <strong>illness or infection</strong>, elevated{" "}
                  <strong>stress</strong>, poor sleep, or <strong>dehydration</strong>. Track it daily — a jump of 5–10 BPM
                  above your baseline is a cue to rest, hydrate, and recover.
                </div>
              </div>

              {/* Save / show / clear controls */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saved}
                  className="flex-1 h-11 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save This Reading
                    </>
                  )}
                </Button>
                {history.length > 0 && (
                  <Button
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    {showHistory ? "Hide History" : `Show History (${history.length})`}
                  </Button>
                )}
              </div>

              {/* History list */}
              {showHistory && history.length > 0 && (
                <div className="mt-5 space-y-2">
                  {history.map((entry, i) => {
                    const next = history[i + 1];
                    const d = next ? entry.rhr - next.rhr : null;
                    return (
                      <div
                        key={entry.date}
                        className="flex items-center justify-between p-3 border-b last:border-0 border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold">
                            #{history.length - i}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{entry.rhr} BPM · {entry.category}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ·{" "}
                              <span className="capitalize">{entry.sex}</span>, age {entry.age}
                            </p>
                          </div>
                        </div>
                        {d !== null && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              d < 0 ? "bg-emerald-50 text-emerald-700" : d > 0 ? "bg-orange-50 text-orange-700" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {d < 0 ? "▼" : d > 0 ? "▲" : "─"} {Math.abs(d)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <button
                    onClick={clearHistory}
                    className="mt-3 text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Clear history from this browser
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}