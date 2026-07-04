import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getAccess, hasPaidAccess } from "@/lib/auth";
import { listRecords } from "@/lib/glp1/repository";
import {
  currentLevelStatus,
  bodyComp,
  bodyCompChange,
  benchmark,
  proteinTarget,
  detectPlateau,
  weightTrajectory,
  doseSweetSpot,
  weeklyCorrelations,
  todayForecast,
  type Medication,
  type DoseLog,
  type WeightLog,
  type BodyCompositionLog,
  type LabResult,
  type ExerciseLog,
  type SideEffectLog,
  type CheckIn,
  type FoodLog,
} from "@/lib/glp1";
import { computeNextLevers } from "@/lib/vitals/nextLever";
import type { VitalsReport } from "@/types/vitals";
import { Glp1ReportPdf, type Glp1ReportSummary, type ReportFlag } from "@/lib/report/Glp1ReportPdf";

export const runtime = "nodejs";

const LB = 2.2046226218;
const WEEK_MS = 7 * 24 * 3_600_000;
const lb = (kg: number) => Math.round(kg * LB * 10) / 10;
const clean = (v: string | null, max = 80) => (v ? v.replace(/[\r\n]+/g, " ").trim().slice(0, max) : null);
const LAB_LABELS: Record<string, string> = {
  a1c: "A1c", "fasting-glucose": "Fasting glucose", "total-cholesterol": "Total cholesterol",
  ldl: "LDL", hdl: "HDL", triglycerides: "Triglycerides", "systolic-bp": "Systolic BP", "diastolic-bp": "Diastolic BP",
};

/** Doctor-shareable GLP-1 clinical report (5 sections). Paid feature. */
export async function GET(req: NextRequest) {
  const access = await getAccess();
  if (!access.userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!hasPaidAccess(access)) {
    return NextResponse.json({ error: "Doctor reports require Calqulate Vitals." }, { status: 402 });
  }
  const supabase = await createClient();
  const userId = access.userId;
  const nowMs = Date.now();
  const cutoff30 = nowMs - 30 * 24 * 3_600_000;

  // Optional, user-supplied context (never stored).
  const patientName = clean(req.nextUrl.searchParams.get("name"));
  const clinician = clean(req.nextUrl.searchParams.get("clinician"));

  const [meds, doses, weights, bodyComps, labs, exercises, symptoms, checkins, foods, riskRes] = await Promise.all([
    listRecords<Medication>(supabase, "medication", userId, { limit: 10 }),
    listRecords<DoseLog>(supabase, "doseLog", userId, { limit: 400 }),
    listRecords<WeightLog>(supabase, "weightLog", userId, { limit: 400 }),
    listRecords<BodyCompositionLog>(supabase, "bodyComposition", userId, { limit: 100 }),
    listRecords<LabResult>(supabase, "labResult", userId, { limit: 200 }),
    listRecords<ExerciseLog>(supabase, "exerciseLog", userId, { limit: 200 }),
    listRecords<SideEffectLog>(supabase, "sideEffect", userId, { limit: 200 }),
    listRecords<CheckIn>(supabase, "checkIn", userId, { limit: 200 }),
    listRecords<FoodLog>(supabase, "foodLog", userId, { limit: 200 }),
    supabase.from("risk_results").select("composite_score,composite_grade,report_json,computed_at").eq("user_id", userId).order("computed_at", { ascending: false }).limit(1),
  ]);

  const activeMed = meds.find((m) => m.active) ?? meds[0] ?? null;
  const weeksOnTherapy = activeMed ? Math.max(0, Math.floor((nowMs - Date.parse(activeMed.startDate)) / WEEK_MS)) : 0;
  const activeDoses = doses.filter((x) => (!activeMed || x.medicationId === activeMed.id) && !x.skipped);

  // ── Metabolic score + BMI + waist + next-levers from the latest vitals measurement ──
  const riskRow = (riskRes.data as { composite_score: number; composite_grade: string; report_json: unknown }[] | null)?.[0];
  const vr = riskRow?.report_json as VitalsReport | undefined;
  const metabolicScore = riskRow ? { score: Math.round(riskRow.composite_score), grade: riskRow.composite_grade } : null;
  const bmi = vr?.body ? { value: Math.round(vr.body.bmi * 10) / 10, category: vr.body.bmiCategory } : null;

  // ── Weight (oldest = baseline, newest = current) ──
  const wSorted = [...weights].sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));
  let weight: Glp1ReportSummary["weight"] = null;
  if (wSorted.length >= 1) {
    const baseline = wSorted[0], current = wSorted[wSorted.length - 1];
    const changePct = baseline.weightKg > 0 ? Math.round(((baseline.weightKg - current.weightKg) / baseline.weightKg) * 1000) / 10 : 0;
    weight = { baselineLb: lb(baseline.weightKg), currentLb: lb(current.weightKg), changeLb: Math.round((lb(baseline.weightKg) - lb(current.weightKg)) * 10) / 10, changePct };
  }

  // ── Trajectory + plateau ──
  const traj = weightTrajectory({ weights: weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })), compound: activeMed?.compound ?? null, nowMs });
  const plateau = detectPlateau(weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })), nowMs);
  const weeklyLossPct = weight && traj.paceKgPerWeek != null && wSorted.length > 0 && wSorted[0].weightKg > 0
    ? Math.abs((traj.paceKgPerWeek / wSorted[0].weightKg) * 100)
    : null;

  // ── FLAG: response (low-responder vs excessive loss) ──
  let responseFlag: ReportFlag | null = null;
  if (weight) {
    if (bmi && bmi.value < 18.5) {
      responseFlag = { level: "alert", label: "Excessive loss", detail: "BMI below 18.5 — assess for over-treatment." };
    } else if (weeklyLossPct != null && weeklyLossPct > 1 && weeksOnTherapy >= 4) {
      responseFlag = { level: "watch", label: "Rapid loss (>1%/wk)", detail: "Faster than the recommended ~0.5–1%/week — monitor tolerability and lean mass." };
    } else if (weeksOnTherapy >= 12 && weight.changePct < 5) {
      responseFlag = { level: "alert", label: "Low responder (<5% at ≥12 wk)", detail: "Below the ~5% threshold — review adherence, titration and lifestyle levers." };
    } else if (weight.changePct > 0) {
      responseFlag = { level: "ok", label: "Responding", detail: `Down ${weight.changePct}% of body weight.` };
    }
  }

  // ── FLAG: plateau ──
  const plateauFlag: ReportFlag | null =
    plateau.status === "plateau" ? { level: "alert", label: "Plateau detected", detail: plateau.message }
    : plateau.status === "slowing" ? { level: "watch", label: "Loss slowing", detail: plateau.message }
    : plateau.status === "regaining" ? { level: "watch", label: "Slight regain", detail: plateau.message }
    : plateau.status === "losing" ? { level: "ok", label: "Losing steadily", detail: plateau.message }
    : null;

  // ── Body composition + muscle flag ──
  let bc: Glp1ReportSummary["bodyComp"] = null;
  let muscleFlag: ReportFlag | null = null;
  if (bodyComps.length >= 1) {
    const bcSorted = [...bodyComps].sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));
    const latest = bcSorted[bcSorted.length - 1];
    const p = bodyComp(latest.weightKg, latest.bodyFatPct);
    let leanLossPct: number | null = null, message: string | null = null;
    if (bcSorted.length >= 2) {
      const change = bodyCompChange(bodyComp(bcSorted[0].weightKg, bcSorted[0].bodyFatPct), p);
      leanLossPct = change.leanLossPct;
      message = change.message;
      muscleFlag =
        change.level === "high" ? { level: "alert", label: "Muscle loss detected", detail: `~${change.leanLossPct}% of recent loss is lean mass.` }
        : change.level === "watch" ? { level: "watch", label: "Watch muscle", detail: `~${change.leanLossPct}% of recent loss is lean mass.` }
        : { level: "ok", label: "Muscle preserved", detail: "Most recent loss is fat mass." };
    }
    bc = { fatMassLb: lb(p.fatMassKg), leanMassLb: lb(p.leanMassKg), bodyFatPct: p.bodyFatPct, waistToHeight: vr?.body?.waistToHeight ?? null, leanLossPct, message };
  }

  // ── Benchmark ──
  let bench: Glp1ReportSummary["trialBenchmark"] = null;
  if (activeMed?.compound && wSorted.length >= 1 && weeksOnTherapy >= 1) {
    const r = benchmark({ compound: activeMed.compound, baselineKg: wSorted[0].weightKg, currentKg: wSorted[wSorted.length - 1].weightKg, weeks: weeksOnTherapy });
    bench = { trial: r.trial, dose: r.dose, expectedPct: r.expectedPct, actualPct: r.actualPct, status: r.status, message: r.message };
  }

  // ── Medication level (PK) ──
  const medicationLevelPct = activeMed?.compound && activeDoses.length > 0
    ? currentLevelStatus(activeDoses.map((x) => ({ takenAt: x.takenAt, amountMg: x.amountMg })), activeMed.compound, nowMs).currentPct
    : null;

  // ── Weight trend (sampled for the chart) ──
  const weightTrend = sample(wSorted.map((w) => ({ t: Date.parse(w.takenAt), lb: lb(w.weightKg) })), 16);

  // ── Latest lab per type ──
  const seen = new Set<string>();
  const latestLabs: { label: string; value: string }[] = [];
  for (const l of labs) {
    if (seen.has(l.type)) continue;
    seen.add(l.type);
    latestLabs.push({ label: LAB_LABELS[l.type] ?? l.type, value: `${l.value} ${l.unit}` });
  }

  // ── Adherence ──
  const doseIntervalDays = activeMed ? Math.max(1, Math.round(activeMed.doseIntervalHours / 24)) : 7;
  const dosesLast30 = activeDoses.filter((x) => Date.parse(x.takenAt) >= cutoff30).length;
  const expectedDosesLast30 = Math.max(1, Math.round(30 / doseIntervalDays));
  const siteCounts = new Map<string, number>();
  for (const x of activeDoses.filter((x) => Date.parse(x.takenAt) >= nowMs - 60 * 24 * 3_600_000 && x.injectionSite)) {
    siteCounts.set(x.injectionSite!, (siteCounts.get(x.injectionSite!) ?? 0) + 1);
  }
  const adherence = {
    dosesLast30,
    expectedDosesLast30,
    missedApprox: Math.max(0, expectedDosesLast30 - dosesLast30),
    resistanceSessionsLast30: exercises.filter((e) => e.type === "resistance" && Date.parse(e.loggedAt) >= cutoff30).length,
    siteRotation: [...siteCounts.entries()].map(([site, count]) => ({ site, count })).sort((a, b) => b.count - a.count),
    symptomDaysLast30: symptoms.filter((x) => !x.noSymptoms && Date.parse(x.loggedAt) >= cutoff30).length,
    noSymptomDaysLast30: symptoms.filter((x) => x.noSymptoms && Date.parse(x.loggedAt) >= cutoff30).length,
  };

  // ── Symptom breakdown ──
  const symAgg = new Map<string, { count: number; sev: number[] }>();
  for (const x of symptoms.filter((x) => !x.noSymptoms && x.type && Date.parse(x.loggedAt) >= cutoff30)) {
    const a = symAgg.get(x.type!) ?? { count: 0, sev: [] };
    a.count += 1;
    if (x.severity != null) a.sev.push(x.severity);
    symAgg.set(x.type!, a);
  }
  const symptomList = [...symAgg.entries()]
    .map(([type, a]) => ({ type, count: a.count, avgSeverity: a.sev.length ? Math.round((a.sev.reduce((s, v) => s + v, 0) / a.sev.length) * 10) / 10 : null }))
    .sort((a, b) => b.count - a.count);

  // ── Today's forecast ──
  let todayF: Glp1ReportSummary["todayForecast"] = null;
  if (activeMed?.compound && activeDoses.length > 0) {
    const f = todayForecast({ doses: activeDoses.map((x) => ({ takenAt: x.takenAt, amountMg: x.amountMg })), compound: activeMed.compound, intervalHours: activeMed.doseIntervalHours, nowMs });
    if (f.available) {
      todayF = { phaseLabel: f.phaseLabel, dayOfCycle: f.dayOfCycle, cycleLengthDays: f.cycleLengthDays, metrics: f.metrics.map((mt) => ({ label: mt.label, value: mt.value })) };
    }
  }

  // ── Correlation levers ──
  const corr = weeklyCorrelations({
    weights: weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })),
    checkins: checkins.map((c) => ({ loggedAt: c.loggedAt, sleepHours: c.sleepHours, craving: c.craving })),
    foods: foods.map((f) => ({ loggedAt: f.loggedAt, proteinG: f.proteinG })),
    exercises: exercises.map((e) => ({ loggedAt: e.loggedAt })),
    sideEffects: symptoms.map((x) => ({ loggedAt: x.loggedAt, noSymptoms: x.noSymptoms, severity: x.severity })),
    doses: activeDoses.map((x) => ({ takenAt: x.takenAt, injectionSite: x.injectionSite, skipped: false })),
    nowMs,
  });
  const correlations = corr.confidence === "insufficient" ? [] : corr.insights.slice(0, 3).map((c) => ({ label: c.label, message: c.message, favorable: c.favorable }));

  // ── Dosing sweet-spot ──
  const sweet = doseSweetSpot({
    doses: activeDoses.map((x) => ({ takenAt: x.takenAt, amountMg: x.amountMg })),
    weights: weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })),
    bodyComps: bodyComps.map((b) => ({ takenAt: b.takenAt, weightKg: b.weightKg, bodyFatPct: b.bodyFatPct })),
    sideEffects: symptoms.map((x) => ({ loggedAt: x.loggedAt, noSymptoms: x.noSymptoms, severity: x.severity })),
    nowMs,
  });
  const sweetSpot = sweet.sweetSpot ? { doseMg: sweet.sweetSpot.amountMg, message: sweet.message } : null;

  // ── Next-levers (metabolic simulator) ──
  // Helvetica (built-in PDF font) can't render "→"; swap for an ASCII form.
  const noArrow = (s: string) => s.replace(/\s*→\s*/g, " to ");
  const nextLevers = vr?.input ? computeNextLevers(vr.input, 3).map((l) => ({ label: l.label, change: noArrow(l.change), action: noArrow(l.action) })) : [];

  // ── Maintenance outlook ──
  const maintenanceOutlook = traj.projectedKg != null
    ? { projectedLb: lb(traj.projectedKg), note: `At the current trend, projected ~${lb(traj.projectedKg)} lb in 8 weeks. Weight regain is common after discontinuation — plan a maintenance strategy (protein, resistance training, tapered follow-up) before stopping.` }
    : { projectedLb: null, note: "Insufficient trend data to project maintenance yet — a few more weigh-ins will enable an 8-week projection." };

  // ── Protein target ──
  const protein = wSorted.length >= 1 ? (() => { const t = proteinTarget(wSorted[wSorted.length - 1].weightKg, bodyComps[0]?.bodyFatPct); return { minG: t.minG, maxG: t.maxG }; })() : null;

  // ── Section 5: impression + review cadence ──
  const anyAlert = [responseFlag, plateauFlag, muscleFlag].some((f) => f?.level === "alert");
  const clinicalImpression =
    responseFlag?.label === "Excessive loss" ? "Monitor — rapid/excessive loss"
    : responseFlag?.label.startsWith("Low responder") ? "Low responder — optimize before dose decisions"
    : plateauFlag?.level === "alert" ? "Plateauing"
    : muscleFlag?.level === "alert" ? "Responding, but muscle-loss risk"
    : weight && weight.changePct > 0 ? "On track"
    : "Early — insufficient data";
  const nextReviewSuggestion =
    anyAlert ? "2–4 weeks (flagged items to review)"
    : weeksOnTherapy < 20 ? "4 weeks (dose-escalation phase)"
    : "3 months (maintenance)";

  const summary: Glp1ReportSummary = {
    patientName,
    patientEmail: access.email ?? "",
    clinician,
    generatedAt: new Date(nowMs).toISOString(),
    medication: activeMed
      ? {
          name: activeMed.brandName ?? activeMed.customName ?? activeMed.compound ?? "Medication",
          compound: activeMed.compound ?? activeMed.customName ?? "—",
          currentDoseMg: activeDoses[0]?.amountMg ?? null,
          startDate: activeMed.startDate,
          weeksOnTherapy,
          doseIntervalDays,
        }
      : null,
    metabolicScore,
    weight,
    bmi,
    responseFlag,
    plateauFlag,
    muscleFlag,
    bodyComp: bc,
    weightTrend,
    trialBenchmark: bench,
    labs: latestLabs,
    medicationLevelPct,
    adherence,
    symptoms: symptomList,
    todayForecast: todayF,
    correlations,
    sweetSpot,
    nextLevers,
    maintenanceOutlook,
    clinicalImpression,
    nextReviewSuggestion,
    proteinTarget: protein,
  };

  const buffer = await renderToBuffer(React.createElement(Glp1ReportPdf, { summary }) as any);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="calqulate-glp1-clinical-report.pdf"`,
    },
  });
}

/** Evenly sample a series down to at most `max` points (keeps first & last). */
function sample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const out: T[] = [];
  const step = (arr.length - 1) / (max - 1);
  for (let i = 0; i < max; i++) out.push(arr[Math.round(i * step)]);
  return out;
}
