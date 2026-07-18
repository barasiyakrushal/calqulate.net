"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight, ArrowLeft, Check, Loader2, Sparkles, Syringe, Activity,
  Target, CalendarClock, Dumbbell, Trophy,
} from "lucide-react";
import { createRecord, ApiError } from "@/lib/glp1/client";
import { proteinTarget } from "@/lib/glp1";
import { Glp1LoggingPanel } from "@/components/glp1/Glp1LoggingPanel";
import { track } from "@/lib/analytics/track";

const LB = 2.2046226218;
const lb2kg = (lb: number) => lb / LB;
const round = (n: number, d = 0) => { const f = 10 ** d; return Math.round(n * f) / f; };

const COMPOUNDS = [
  { value: "semaglutide", label: "Semaglutide (Ozempic / Wegovy)", ladder: ["0.25", "0.5", "1.0", "1.7", "2.4"] },
  { value: "tirzepatide", label: "Tirzepatide (Mounjaro / Zepbound)", ladder: ["2.5", "5", "7.5", "10", "12.5", "15"] },
  { value: "liraglutide", label: "Liraglutide (Saxenda / Victoza)", ladder: ["0.6", "1.2", "1.8", "2.4", "3.0"] },
  { value: "dulaglutide", label: "Dulaglutide (Trulicity)", ladder: ["0.75", "1.5", "3.0", "4.5"] },
  { value: "retatrutide", label: "Retatrutide", ladder: ["2", "4", "8", "12"] },
];

const STEPS = ["Profile", "Medication", "Lifestyle", "Prediction", "Weekly plan", "Unlock"];

/**
 * 6-step first-time setup. Each step returns immediate insight, then the final
 * step persists (medication + first weight + first dose) via the durable API and
 * stores the goal in localStorage. All numbers are ESTIMATES for guidance — the
 * disclaimer makes that explicit, and dose info always defers to the prescriber.
 */
export function Onboarding({ paid = false }: { paid?: boolean }) {
  const [skipped, setSkipped] = useState(false);

  // ── form state ──
  const [step, setStep] = useState(0);
  const [currentLb, setCurrentLb] = useState("");
  const [targetLb, setTargetLb] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("female");

  const [compound, setCompound] = useState("semaglutide");
  const [doseMg, setDoseMg] = useState("");
  const [injDate, setInjDate] = useState(new Date().toISOString().slice(0, 10));

  const [exerciseDays, setExerciseDays] = useState(2);
  const [proteinG, setProteinG] = useState("");
  const [waterCups, setWaterCups] = useState(6);
  const [sleepH, setSleepH] = useState(7);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Records every step the user reaches, so the funnel shows exactly where the
  // 6-step setup loses people. Must sit above the `skipped` early-return.
  useEffect(() => {
    track("onboarding_step", {
      step_index: step + 1,
      step_name: STEPS[step],
      step_total: STEPS.length,
    });
  }, [step]);

  if (skipped) {
    // Manual path — the existing add-medication + logging panel.
    return <Glp1LoggingPanel medications={[]} />;
  }

  // ── derived estimates ──
  const currentKg = currentLb ? lb2kg(Number(currentLb)) : 0;
  const targetKg = targetLb ? lb2kg(Number(targetLb)) : 0;
  const lostLb = currentLb && targetLb ? Math.max(0, Number(currentLb) - Number(targetLb)) : 0;
  const lostKg = lb2kg(lostLb);
  const pt = currentKg ? proteinTarget(currentKg) : null;
  const ladder = COMPOUNDS.find((c) => c.value === compound)?.ladder ?? [];

  // timeline at ~0.45–0.9 kg/week
  const weeksFast = lostKg > 0 ? Math.round(lostKg / 0.9) : 0;
  const weeksSlow = lostKg > 0 ? Math.round(lostKg / 0.45) : 0;
  const monthsFast = round(weeksFast / 4.33, 0);
  const monthsSlow = round(weeksSlow / 4.33, 0);
  const fatLostLb = round(lostLb * 0.8, 1);
  const muscleLoLb = round(lostLb * 0.1, 1);
  const muscleHiLb = round(lostLb * 0.2, 1);
  const nextIncrease = new Date(Date.parse(injDate) + 28 * 24 * 3_600_000).toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // lifestyle preview
  const sNutrition = pt ? Math.min(100, Math.round(((Number(proteinG) || 0) / pt.minG) * 100)) : 0;
  const sExercise = Math.min(100, Math.round((exerciseDays / 4) * 100));
  const sWater = Math.min(100, Math.round((waterCups / 10) * 100));
  const sSleep = Math.min(100, Math.round((sleepH / 8) * 100));

  // Only block on what we genuinely cannot compute without.
  //   Step 0: current weight is the anchor for every estimate. A target is
  //           optional, because people maintaining or unsure of a goal were
  //           previously locked out entirely.
  //   Step 1: the compound alone is enough to start a medication record; dose
  //           can be added on the first log, so people who have not started or
  //           do not know their dose yet are no longer stuck.
  const canNext =
    step === 0 ? Boolean(currentLb)
    : step === 1 ? Boolean(compound)
    : true;

  /** Shown inline when a target is present but not below current weight. */
  const targetAboveCurrent =
    Boolean(currentLb && targetLb) && Number(targetLb) >= Number(currentLb);

  // Commit phase: we always save their plan first (so nothing is lost), then send
  // them either straight into the tracker (free path) or to the premium paywall.
  async function finish(dest: "tracker" | "premium" = "tracker") {
    setSaving(true);
    setError("");
    try {
      const med = (await createRecord("medication", {
        kind: "glp1",
        compound,
        brandName: null,
        customName: null,
        startDate: injDate,
        doseIntervalHours: 168,
      })) as { id: string };
      await createRecord("weightLog", { takenAt: new Date().toISOString(), weightKg: round(currentKg, 3) });
      if (Number(doseMg) > 0) {
        await createRecord("doseLog", { medicationId: med.id, takenAt: new Date(injDate).toISOString(), amountMg: Number(doseMg) });
      }
      if (targetKg > 0) window.localStorage.setItem("glp1_goal_kg", String(round(targetKg, 1)));
      // full reload → fresh dashboard, or the paywall framed around their goal
      window.location.href = dest === "premium" ? "/pricing?feature=glp1-tracker" : "/dashboard/glp1";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header / progress */}
      <div className="rounded-t-2xl border border-b-0 border-gray-200 bg-emerald-600 px-5 py-4 text-white sm:px-6">
        <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4" /> Welcome to your GLP-1 journey</div>
        <p className="mt-0.5 text-xs text-emerald-100">Let&rsquo;s build your personalized plan — about 2 minutes.</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] font-medium text-emerald-100">Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
          <div className="flex flex-1 gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-b-2xl border border-gray-200 bg-white p-5 sm:p-6">
        {/* ── Step 1: Profile ── */}
        {step === 0 && (
          <Step title="Tell us about you" sub="The basics that personalize your plan.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="cw" label="Current weight (lb)"><Input id="cw" type="number" min="0" value={currentLb} onChange={(e) => setCurrentLb(e.target.value)} placeholder="210" /></Field>
              <Field id="tw" label="Target weight (lb, optional)"><Input id="tw" type="number" min="0" value={targetLb} onChange={(e) => setTargetLb(e.target.value)} placeholder="170" /></Field>
              <Field id="ht" label="Height (inches)"><Input id="ht" type="number" min="0" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="66" /></Field>
              <Field id="ag" label="Age"><Input id="ag" type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} placeholder="44" /></Field>
              <Field id="gn" label="Gender">
                <select id="gn" value={gender} onChange={(e) => setGender(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="female">Female</option><option value="male">Male</option><option value="other">Prefer not to say</option>
                </select>
              </Field>
            </div>
            {lostLb > 0 && (
              <Insight tone="ok">
                Goal locked in. Losing <b>{round(lostLb, 0)} lb</b> at a healthy pace is realistic — most people get there in roughly <b>{monthsFast}–{monthsSlow} months</b>.
              </Insight>
            )}
            {targetAboveCurrent && (
              <Insight tone="warn">
                Your target is at or above your current weight, so we will not show a loss timeline. That is fine
                if you are maintaining — everything else still works.
              </Insight>
            )}
          </Step>
        )}

        {/* ── Step 2: Medication ── */}
        {step === 1 && (
          <Step title="Your medication" sub="So we can set reminders and your free medication-level curve.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="cmp" label="Which GLP-1?">
                <select id="cmp" value={compound} onChange={(e) => setCompound(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  {COMPOUNDS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field id="ds" label="Current dose (mg)"><Input id="ds" type="number" step="0.01" min="0" value={doseMg} onChange={(e) => setDoseMg(e.target.value)} placeholder="0.5" /></Field>
              <Field id="id" label="Last / first injection date"><Input id="id" type="date" value={injDate} onChange={(e) => setInjDate(e.target.value)} /></Field>
            </div>
            {doseMg && (
              <Insight tone="info">
                You&rsquo;re taking <b>{doseMg} mg</b>. Typical escalation: {ladder.join(" → ")} mg (about 4 weeks each).
                A possible next increase would be around <b>{nextIncrease}</b>. <span className="text-gray-500">Your prescriber&rsquo;s plan always comes first.</span>
              </Insight>
            )}
          </Step>
        )}

        {/* ── Step 3: Lifestyle ── */}
        {step === 2 && (
          <Step title="Your lifestyle" sub="A quick snapshot — you can refine it anytime.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Slider id="ex" label={`Exercise: ${exerciseDays} days/week`} min={0} max={7} value={exerciseDays} onChange={setExerciseDays} />
              <Field id="pr" label="Protein (g/day, estimate)"><Input id="pr" type="number" min="0" value={proteinG} onChange={(e) => setProteinG(e.target.value)} placeholder="90" /></Field>
              <Slider id="wt" label={`Water: ${waterCups} cups/day`} min={0} max={12} value={waterCups} onChange={setWaterCups} />
              <Slider id="sl" label={`Sleep: ${sleepH} h/night`} min={3} max={10} value={sleepH} onChange={setSleepH} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Bar label="Nutrition" pct={sNutrition} /><Bar label="Exercise" pct={sExercise} />
              <Bar label="Hydration" pct={sWater} /><Bar label="Sleep" pct={sSleep} />
            </div>
            {pt && sNutrition < 80 && (
              <Insight tone="warn">Bumping protein toward <b>{pt.minG}–{pt.maxG} g/day</b> could help preserve muscle while you lose fat.</Insight>
            )}
          </Step>
        )}

        {/* ── Step 4: Prediction ── */}
        {step === 3 && (
          <Step title="Your estimated journey" sub="Estimates for guidance — not guarantees.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Weight to lose" value={`${round(lostLb, 0)} lb`} />
              <Stat label="Expected fat loss" value={`~${fatLostLb} lb`} tone="ok" />
              <Stat label="Est. muscle loss" value={`${muscleLoLb}–${muscleHiLb} lb`} />
              <Stat label="Timeline" value={`${weeksFast}–${weeksSlow} wks`} />
              <Stat label="Avg deficit" value="~500 kcal/day" />
              <Stat label="Protein goal" value={pt ? `${pt.minG} g/day` : "—"} tone="ok" />
            </div>
            <Insight tone="info">With enough protein and resistance training, most of your loss can be fat. We&rsquo;ll track fat vs. muscle so you can prove it.</Insight>
          </Step>
        )}

        {/* ── Step 5: Weekly plan ── */}
        {step === 4 && (
          <Step title="Your week 1 plan" sub="A simple, repeatable rhythm to start.">
            <ul className="space-y-2">
              {[
                { icon: Syringe, t: `Inject ${compound} (${doseMg || "your"} mg) on your usual day` },
                { icon: Dumbbell, t: `Resistance or brisk walk — ${Math.max(3, exerciseDays)} days this week` },
                { icon: Target, t: pt ? `Hit ~${pt.minG} g protein per day` : "Protein with every meal" },
                { icon: Activity, t: "Water goal: ~8 cups/day" },
                { icon: CalendarClock, t: "Weigh in Sunday morning (same time, same scale)" },
              ].map((r) => (
                <li key={r.t} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-sm text-gray-800">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><r.icon className="h-4 w-4" /></span>
                  {r.t}
                </li>
              ))}
            </ul>
          </Step>
        )}

        {/* ── Step 6: Commit — soft paywall framed around their goal (free users) ── */}
        {step === 5 && (
          <Step title="You're all set" sub={paid ? "Your plan is ready. Head to your dashboard." : "Your plan is ready. Start free, or unlock the features that protect your results."}>
            <div className="rounded-2xl bg-emerald-50 p-5 text-center">
              <Trophy className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-2 text-sm text-gray-700">
                Tracking <b>{COMPOUNDS.find((c) => c.value === compound)?.label.split(" (")[0]}</b>
                {targetLb && !targetAboveCurrent ? <>, goal <b>{targetLb} lb</b></> : null}.
                Your coach, medication-level curve and weekly plan are ready.
              </p>
            </div>

            {!paid && (
              <div className="mt-4 rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-amber-50 to-white p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span className="text-sm font-bold uppercase tracking-wide text-gold-ink">
                    {targetLb && !targetAboveCurrent ? `Premium, to hit ${targetLb} lb the right way` : "Premium, to protect your results"}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {[
                    `Fat vs. muscle tracking, so your ${round(lostLb, 0) || ""} lb comes off as fat`,
                    "Adaptive titration that holds when side effects spike",
                    "Find out why your progress slowed, and when to raise your dose",
                    "Doctor-ready PDF report and rebound-risk view",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
          </Step>
        )}

        {/* Footer nav */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={saving}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
          ) : (
            <button onClick={() => setSkipped(true)} className="text-sm font-medium text-gray-400 hover:text-gray-700">Skip setup</button>
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="bg-emerald-600 hover:bg-emerald-700">
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            // Finishing setup is the activation moment, so the free path is the
            // primary action. Premium stays available as a quieter secondary.
            <div className="flex items-center gap-3">
              {!paid && (
                <button
                  type="button"
                  onClick={() => finish("premium")}
                  disabled={saving}
                  className="text-sm font-medium text-gray-500 underline underline-offset-4 hover:text-gold-ink disabled:opacity-60"
                >
                  See Premium
                </button>
              )}
              <Button onClick={() => finish("tracker")} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {paid ? "Go to dashboard" : "Start free"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-gray-400">
        Estimates for guidance only — individual results vary, and dose information always defers to your prescriber. Not medical advice.
      </p>
    </div>
  );
}

// ── small presentational helpers ──
function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-0.5 text-sm text-gray-500">{sub}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div><Label htmlFor={id}>{label}</Label><div className="mt-1">{children}</div></div>;
}
function Slider({ id, label, min, max, value, onChange }: { id: string; label: string; min: number; max: number; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-emerald-600" />
    </div>
  );
}
function Insight({ tone, children }: { tone: "ok" | "info" | "warn"; children: React.ReactNode }) {
  const c = tone === "warn" ? "bg-amber-50 text-amber-900" : tone === "info" ? "bg-sky-50 text-sky-900" : "bg-emerald-50 text-emerald-900";
  return <p className={`mt-4 rounded-xl px-4 py-3 text-sm leading-relaxed ${c}`}>💡 {children}</p>;
}
function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-center">
      <div className={`text-lg font-extrabold ${tone === "ok" ? "text-emerald-600" : "text-gray-900"}`}>{value}</div>
      <div className="text-[11px] text-gray-400">{label}</div>
    </div>
  );
}
function Bar({ label, pct }: { label: string; pct: number }) {
  const tone = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div>
      <div className="flex items-center justify-between text-xs"><span className="font-medium text-gray-600">{label}</span><span className="text-gray-400">{pct}%</span></div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${tone} transition-all duration-500`} style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
