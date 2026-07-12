import { getAccess, hasPaidAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listRecords } from "@/lib/glp1/repository";
import {
  currentLevelStatus,
  bodyComp,
  bodyCompChange,
  computeNextDoseMs,
  describeDueIn,
  benchmark,
  todayForecast,
  detectPlateau,
  weeklyCorrelations,
  doseSweetSpot,
  journeyMetrics,
  weeklyHealthScore,
  buildScorecard,
  coachMessages,
  type Medication,
  type DoseLog,
  type WeightLog,
  type FoodLog,
  type SideEffectLog,
  type CheckIn,
  type BodyCompositionLog,
  type LabResult,
  type ExerciseLog,
  type Reminder,
  type Refill,
} from "@/lib/glp1";
import { Glp1LoggingPanel } from "@/components/glp1/Glp1LoggingPanel";
import { TrackMore } from "@/components/glp1/TrackMore";
import { CoachBanner } from "@/components/glp1/CoachBanner";
import { JourneyCoach } from "@/components/glp1/JourneyCoach";
import { Onboarding } from "@/components/glp1/Onboarding";
import { DeleteEntryButton } from "@/components/glp1/DeleteEntryButton";
import { DoseReminderCard } from "@/components/glp1/DoseReminderCard";
import { Glp1ReportButton } from "@/components/glp1/Glp1ReportButton";
import { ReconstitutionCalculator } from "@/components/glp1/ReconstitutionCalculator";
import { RefillTracker } from "@/components/glp1/RefillTracker";
import { SweetSpotCard } from "@/components/glp1/SweetSpotCard";
import { WeightTrendChart } from "@/components/glp1/WeightTrendChart";
import { TodayForecastCard } from "@/components/glp1/TodayForecastCard";
import { ShareScorecard } from "@/components/glp1/ShareScorecard";
import { CorrelationInsights } from "@/components/glp1/CorrelationInsights";
import { NextDoseCard, CurrentCycleCard, PlanSummaryCard } from "@/components/glp1/DashboardRail";
import { PremiumGate, LockBadge } from "@/components/vitals/PremiumGate";
import type { Glp1EntityName } from "@/lib/glp1/schemas";
import Link from "next/link";
import { Activity, Syringe, Scale, Utensils, Target, Bell, HelpCircle, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type TimelineIcon = "dose" | "weight" | "food" | "symptom" | "checkin" | "lab" | "exercise" | "bodycomp";
type TimelineItem = { entity: Glp1EntityName; id: string; when: string; icon: TimelineIcon; text: string };

export default async function Glp1TrackerPage() {
  const access = await getAccess();
  const supabase = await createClient();
  const userId = access.userId!;

  // Durable reads through the shared repository (one source of truth).
  const [meds, doses, weights, foods, symptoms, checkins, bodyComps, labs, exercises, reminders, refills, prefsRes] = await Promise.all([
    listRecords<Medication>(supabase, "medication", userId, { limit: 10 }),
    listRecords<DoseLog>(supabase, "doseLog", userId, { limit: 50 }),
    listRecords<WeightLog>(supabase, "weightLog", userId, { limit: 365 }),
    listRecords<FoodLog>(supabase, "foodLog", userId, { limit: 20 }),
    listRecords<SideEffectLog>(supabase, "sideEffect", userId, { limit: 20 }),
    listRecords<CheckIn>(supabase, "checkIn", userId, { limit: 20 }),
    listRecords<BodyCompositionLog>(supabase, "bodyComposition", userId, { limit: 30 }),
    listRecords<LabResult>(supabase, "labResult", userId, { limit: 20 }),
    listRecords<ExerciseLog>(supabase, "exerciseLog", userId, { limit: 20 }),
    listRecords<Reminder>(supabase, "reminder", userId, { limit: 20 }),
    listRecords<Refill>(supabase, "refill", userId, { limit: 20 }),
    supabase.from("notification_prefs").select("push_enabled").eq("user_id", userId).maybeSingle(),
  ]);

  const activeMed = meds.find((m) => m.active) ?? meds[0];
  const pushEnabled = Boolean((prefsRes.data as { push_enabled?: boolean } | null)?.push_enabled);
  const paid = hasPaidAccess(access);

  // ── Clinical-study benchmark ("Am I on track?") — GLP-1 compounds only ────────
  let bench: ReturnType<typeof benchmark> | null = null;
  if (activeMed?.compound && weights.length >= 1) {
    const weeks = Math.max(0, Math.floor((Date.now() - Date.parse(activeMed.startDate)) / (7 * 24 * 3_600_000)));
    if (weeks >= 1) {
      bench = benchmark({
        compound: activeMed.compound,
        baselineKg: weights[weights.length - 1].weightKg,
        currentKg: weights[0].weightKg,
        weeks,
      });
    }
  }

  // ── Plateau prediction (used by the shareable scorecard) ─────────────────────
  const plateau = detectPlateau(weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })), Date.now());

  // ── Personal correlation engine ("what moves your results", research #9) ─────
  const correlations = weeklyCorrelations({
    weights: weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })),
    checkins: checkins.map((c) => ({ loggedAt: c.loggedAt, sleepHours: c.sleepHours, craving: c.craving })),
    foods: foods.map((f) => ({ loggedAt: f.loggedAt, proteinG: f.proteinG })),
    exercises: exercises.map((e) => ({ loggedAt: e.loggedAt })),
    sideEffects: symptoms.map((s) => ({ loggedAt: s.loggedAt, noSymptoms: s.noSymptoms, severity: s.severity })),
    doses: doses.map((d) => ({ takenAt: d.takenAt, injectionSite: d.injectionSite, skipped: d.skipped })),
    nowMs: Date.now(),
  });

  // ── "Today" dose-cycle forecast (daily-open hook) — GLP-1 compounds only ─────
  const forecast = activeMed?.compound
    ? todayForecast({
        doses: doses.filter((d) => d.medicationId === activeMed.id && !d.skipped).map((d) => ({ takenAt: d.takenAt, amountMg: d.amountMg })),
        compound: activeMed.compound,
        intervalHours: activeMed.doseIntervalHours,
        nowMs: Date.now(),
      })
    : null;

  // ── Dose reminder + next-dose computation ────────────────────────────────────
  const doseReminder = reminders.find((r) => r.kind === "dose" && r.medicationId === activeMed?.id) ?? null;
  let nextDoseLabel: string | null = null;
  let nextDoseDueSoon = false;
  let nextDoseMs: number | null = null;
  if (activeMed) {
    const medDoses = doses.filter((d) => d.medicationId === activeMed.id && !d.skipped);
    nextDoseMs = computeNextDoseMs({
      startMs: Date.parse(activeMed.startDate),
      intervalMs: activeMed.doseIntervalHours * 3_600_000,
      lastDoseMs: medDoses[0] ? Date.parse(medDoses[0].takenAt) : null,
    });
    nextDoseLabel = describeDueIn(nextDoseMs, Date.now());
    nextDoseDueSoon = nextDoseMs - Date.now() <= 36 * 3_600_000; // due within ~1.5 days
  }

  // ── Medication-level (PK) — free differentiator, GLP-1 compounds only ─────────
  let pk: { currentPct: number; nextDosePct: number | null } | null = null;
  if (activeMed?.compound && doses.length > 0) {
    pk = currentLevelStatus(
      doses.filter((d) => !d.skipped).map((d) => ({ takenAt: d.takenAt, amountMg: d.amountMg })),
      activeMed.compound,
      Date.now(),
    );
  }

  // ── Body composition trend (oldest vs newest) ────────────────────────────────
  let comp: ReturnType<typeof bodyCompChange> | null = null;
  if (bodyComps.length >= 2) {
    const latest = bodyComps[0];
    const baseline = bodyComps[bodyComps.length - 1];
    comp = bodyCompChange(
      bodyComp(baseline.weightKg, baseline.bodyFatPct),
      bodyComp(latest.weightKg, latest.bodyFatPct),
    );
  }

  // ── Dosing sweet spot (most loss for least side effects, from logged history) ─
  const sweet = doseSweetSpot({
    doses: doses.filter((d) => !d.skipped).map((d) => ({ takenAt: d.takenAt, amountMg: d.amountMg })),
    weights: weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })),
    bodyComps: bodyComps.map((b) => ({ takenAt: b.takenAt, weightKg: b.weightKg, bodyFatPct: b.bodyFatPct })),
    sideEffects: symptoms.map((s) => ({ loggedAt: s.loggedAt, noSymptoms: s.noSymptoms, severity: s.severity })),
    nowMs: Date.now(),
  });
  const showSweetSpot = sweet.sweetSpot != null || sweet.levels.length >= 2;

  const latestWeight = weights[0];

  // ── Coaching layer (presentation-only, derived from loaded data) ─────────────
  const journey = journeyMetrics(
    weights.map((w) => ({ takenAt: w.takenAt, weightKg: w.weightKg })),
    activeMed?.startDate,
  );
  const weekly = journey
    ? weeklyHealthScore({
        currentKg: journey.currentKg,
        bodyFatPct: bodyComps[0]?.bodyFatPct,
        foods: foods.map((f) => ({ loggedAt: f.loggedAt, proteinG: f.proteinG })),
        water: [], // water logs aren't loaded on this view; treated as 0 until logged
        exercises: exercises.map((e) => ({ loggedAt: e.loggedAt })),
        checkins: checkins.map((c) => ({ loggedAt: c.loggedAt, sleepHours: c.sleepHours })),
      })
    : null;
  const coach = coachMessages({
    journey,
    weekly,
    nextDoseLabel,
    nextDoseDueSoon,
    muscleFlag: comp?.level ?? null,
    hasMedication: Boolean(activeMed),
    hasWeights: weights.length > 0,
  });

  // ── Shareable weekly scorecard (organic growth loop) ─────────────────────────
  const medLabelForCard =
    activeMed?.brandName ??
    (activeMed?.compound ? activeMed.compound[0].toUpperCase() + activeMed.compound.slice(1) : activeMed?.customName ?? "GLP-1");
  const scorecard =
    journey && weights.length >= 2
      ? buildScorecard({
          lostLb: journey.lostLb,
          paceKgPerWeek: journey.paceKgPerWeek,
          weeksOnMed: journey.weeksOnMed,
          medLabel: medLabelForCard,
          weeklyScore: weekly?.overall ?? null,
          benchmark: bench ? { status: bench.status, deltaPct: bench.deltaPct, trial: bench.trial } : null,
          plateau: plateau.status,
        })
      : null;

  // ── Merged recent timeline ───────────────────────────────────────────────────
  const timeline: TimelineItem[] = [
    ...doses.map((d): TimelineItem => ({ entity: "doseLog", id: d.id, when: d.takenAt, icon: "dose", text: `${d.amountMg} mg dose${d.injectionSite ? ` · ${d.injectionSite.replace(/-/g, " ")}` : ""}` })),
    ...weights.map((w): TimelineItem => ({ entity: "weightLog", id: w.id, when: w.takenAt, icon: "weight", text: `Weight ${(w.weightKg * 2.2046226218).toFixed(1)} lb (${w.weightKg.toFixed(1)} kg)` })),
    ...foods.map((f): TimelineItem => ({ entity: "foodLog", id: f.id, when: f.loggedAt, icon: "food", text: `${f.label} · ${f.proteinG}g protein, ${f.fiberG}g fiber` })),
    ...symptoms.map((s): TimelineItem => ({ entity: "sideEffect", id: s.id, when: s.loggedAt, icon: "symptom", text: s.noSymptoms ? "No symptoms today" : `${s.type?.replace(/-/g, " ")} · severity ${s.severity}/5` })),
    ...checkins.map((c): TimelineItem => ({ entity: "checkIn", id: c.id, when: c.loggedAt, icon: "checkin", text: `Check-in · mood ${c.mood ?? "—"}, energy ${c.energy ?? "—"}, cravings ${c.craving ?? "—"}` })),
    ...labs.map((l): TimelineItem => ({ entity: "labResult", id: l.id, when: l.takenAt, icon: "lab", text: `${l.type.replace(/-/g, " ")} · ${l.value} ${l.unit}` })),
    ...exercises.map((x): TimelineItem => ({ entity: "exerciseLog", id: x.id, when: x.loggedAt, icon: "exercise", text: `${x.type} · ${x.label}${x.durationMin ? ` · ${x.durationMin} min` : ""}` })),
    ...bodyComps.map((b): TimelineItem => ({ entity: "bodyComposition", id: b.id, when: b.takenAt, icon: "bodycomp", text: `Body comp · ${b.bodyFatPct}% fat (${(b.weightKg * 2.2046226218).toFixed(1)} lb)` })),
  ]
    .sort((a, b) => Date.parse(b.when) - Date.parse(a.when))
    .slice(0, 20);

  const medOptions = meds.map((m) => ({ id: m.id, compound: m.compound, customName: m.customName, brandName: m.brandName }));
  const activeMedName = activeMed ? (activeMed.brandName ?? activeMed.customName ?? activeMed.compound ?? "Medication") : null;
  const latestRefill = activeMed ? refills.find((r) => r.medicationId === activeMed.id) ?? null : null;

  // ── Right-rail display values (Next Dose · Current Cycle · Plan Summary) ──────
  const nextDoseOverdue = nextDoseMs != null && nextDoseMs < Date.now();
  const nextDoseDate = nextDoseMs != null ? fmtDate(nextDoseMs) : null;
  const latestDoseAmt = doses.find((d) => !d.skipped)?.amountMg ?? null;
  const planDose = latestDoseAmt != null ? `${latestDoseAmt} mg` : "—";
  const planFrequency = activeMed ? frequencyLabel(activeMed.doseIntervalHours) : "—";
  const startedDate = activeMed?.startDate ? fmtDate(Date.parse(activeMed.startDate)) : null;

  // First-time experience: no medication yet → guided 6-step setup instead of an empty dashboard.
  if (!activeMed) {
    return (
      <div className="py-2">
        <Onboarding paid={paid} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">GLP-1 Tracker</h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              Active Plan
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Log in seconds. Everything is saved durably the moment you hit save — and recoverable if you delete it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/settings" aria-label="Notification settings" className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/dashboard/guide" aria-label="Help guide" className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700">
            <HelpCircle className="h-5 w-5" />
          </Link>
          <span id="report" className="scroll-mt-24"><Glp1ReportButton enabled={paid} /></span>
        </div>
      </div>

      {/* Coaching banner — turns the dashboard from passive into a guide */}
      <CoachBanner messages={coach} />

      {/* ── Two-column dashboard: main content + right rail ─────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* MAIN COLUMN */}
        <div className="space-y-5 lg:col-span-2">
          {/* "Today" forecast (Premium) */}
          {forecast?.available && (
            <div id="today" className="scroll-mt-24">
              <PremiumGate locked={!paid} feature="Today’s forecast" description="Your appetite, energy and side-effect forecast for today’s dose-cycle day." blur>
                <TodayForecastCard forecast={forecast} />
              </PremiumGate>
            </div>
          )}

          {/* Summary cards */}
          <div id="vitals" className="grid gap-4 scroll-mt-24 sm:grid-cols-3">
            <SummaryCard
              icon={<Activity className="h-5 w-5" />}
              label="Medication level now"
              value={pk ? `${pk.currentPct}%` : "—"}
              sub={pk?.nextDosePct != null ? `~${pk.nextDosePct}% active just before your next dose — cravings often return here` : "Log a dose to see your curve"}
            />
            <SummaryCard
              icon={<Scale className="h-5 w-5" />}
              label="Latest weight"
              value={latestWeight ? `${(latestWeight.weightKg * 2.2046226218).toFixed(1)} lb` : "—"}
              sub={journey?.projectedNextKg ? `Projected next week ~${(journey.projectedNextKg * 2.2046226218).toFixed(1)} lb` : latestWeight ? `${latestWeight.weightKg.toFixed(1)} kg` : "No weight logged yet"}
              tone={journey && journey.lostKg > 0 ? "ok" : undefined}
            />
            {paid ? (
              <SummaryCard
                icon={<Syringe className="h-5 w-5" />}
                label="Fat vs. muscle"
                value={comp ? `${comp.leanLossPct}% lean` : "—"}
                sub={comp ? comp.message : "Add 2+ body-composition entries"}
                tone={comp?.level === "high" ? "warn" : comp?.level === "watch" ? "caution" : "ok"}
              />
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2 text-gray-400"><Syringe className="h-5 w-5" /><span className="text-xs font-medium uppercase tracking-wide">Fat vs. muscle</span></div>
                <div className="mt-2"><LockBadge feature="Fat-vs-muscle trend" /></div>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">Muscle-loss protection insight is a Premium feature.</p>
              </div>
            )}
          </div>

          {/* Weight Trend — graph over the selected period; full analytics live in
              the dedicated Weight Tracker (goals, insights, projections). */}
          <div id="weight-trend" className="scroll-mt-24 space-y-3">
            <WeightTrendChart
              points={weights.map((w) => ({ t: Date.parse(w.takenAt), kg: w.weightKg }))}
              nowMs={Date.now()}
              unit="lb"
            />
            <Link
              href="/dashboard/weight"
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Open full Weight Tracker — goals, insights &amp; projections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="space-y-5">
          <NextDoseCard label={nextDoseLabel} dueDate={nextDoseDate} overdue={nextDoseOverdue} />
          {forecast?.available && (
            <CurrentCycleCard
              dayOfCycle={forecast.dayOfCycle}
              cycleLengthDays={forecast.cycleLengthDays}
              cycleFraction={forecast.cycleFraction}
              phaseLabel={nextDoseOverdue ? "Dose overdue" : forecast.phaseLabel}
              overdue={nextDoseOverdue}
              startedDate={startedDate}
            />
          )}
          <PlanSummaryCard medication={medLabelForCard} dose={planDose} frequency={planFrequency} />
        </div>
      </div>

      {/* ── COMMIT: soft paywall framed around their own results (free members) ── */}
      {!paid && (
        <div className="overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-amber-700">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Protect your results</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-gray-900">
                {journey && journey.lostLb > 0
                  ? `You're down ${Math.round(journey.lostLb)} lb. Make sure it's fat, not muscle.`
                  : "Make sure the weight you lose is fat, not muscle."}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Premium shows you whether you are losing fat or muscle, why your progress slowed, when you are ready to
                raise your dose, and gives you a report your doctor can actually use.
              </p>
            </div>
            <Link
              href="/pricing?feature=glp1-tracker"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" /> See Premium plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Personal correlation engine (Premium) — which of your habits move your weekly loss */}
      {correlations.confidence !== "insufficient" && (
        <div id="drivers" className="scroll-mt-24">
          <PremiumGate locked={!paid} feature="Find out why your progress slowed" description="Which of your own habits, from sleep to protein to injection site, actually move your weekly loss." blur>
            <CorrelationInsights result={correlations} />
          </PremiumGate>
        </div>
      )}

      {/* Interactive journey + weekly health score */}
      {journey && <JourneyCoach journey={journey} weekly={weekly} />}

      {/* Shareable branded scorecard — Reddit / Facebook / Instagram / doctor */}
      {scorecard && (
        <div id="share" className="scroll-mt-24">
          <ShareScorecard data={scorecard} />
        </div>
      )}

      {/* Dose reminders + refills */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DoseReminderCard
          medication={activeMed ? { id: activeMed.id, name: activeMedName! } : null}
          reminder={doseReminder ? { id: doseReminder.id, enabled: doseReminder.enabled, leadMinutes: doseReminder.leadMinutes, channel: doseReminder.channel } : null}
          nextDoseLabel={nextDoseLabel}
          pushEnabled={pushEnabled}
        />
        <PremiumGate locked={!paid} feature="Never run out of medication" description="Supply projection, copay and prior-authorisation tracking.">
          <RefillTracker
            medication={activeMed ? { id: activeMed.id, name: activeMedName!, doseIntervalHours: activeMed.doseIntervalHours } : null}
            latestRefill={latestRefill ? { filledDate: latestRefill.filledDate, dosesSupplied: latestRefill.dosesSupplied, pharmacy: latestRefill.pharmacy, copayUsd: latestRefill.copayUsd, priorAuthStatus: latestRefill.priorAuthStatus } : null}
          />
        </PremiumGate>
      </div>

      {/* Clinical-study benchmark */}
      {bench && (
        <div id="benchmark" className={`scroll-mt-24 rounded-2xl border p-5 ${
          bench.status === "behind" ? "border-amber-200 bg-amber-50/60"
            : bench.status === "ahead" ? "border-emerald-200 bg-emerald-50/60"
            : "border-gray-200 bg-white"
        }`}>
          <div className="flex items-center gap-2 text-gray-500">
            <Target className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">Am I on track? · {bench.trial} ({bench.dose})</span>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <div className="text-2xl font-extrabold text-gray-900">{bench.actualPct}%</div>
              <div className="text-xs text-gray-500">your loss</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-gray-400">{bench.expectedPct}%</div>
              <div className="text-xs text-gray-500">trial average</div>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              bench.status === "ahead" ? "bg-emerald-100 text-emerald-700"
                : bench.status === "behind" ? "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              {bench.status.replace("-", " ")}
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">{bench.message}</p>
        </div>
      )}

      {/* Dosing sweet spot (Premium) — most loss for the least side effects, from your data */}
      {showSweetSpot && (
        <div id="sweet-spot" className="scroll-mt-24">
          <PremiumGate locked={!paid} feature="Know when to raise your dose" description="The dose that gave you the most loss for the least side effects, from your own data." blur>
            <SweetSpotCard result={sweet} />
          </PremiumGate>
        </div>
      )}

      {/* Logging */}
      <div id="log" className="scroll-mt-24">
        <Glp1LoggingPanel medications={medOptions} />
      </div>

      {/* Body comp / labs / exercise */}
      <div id="track-more" className="scroll-mt-24">
        <TrackMore />
      </div>

      {/* Reconstitution calculator (compounded vials) */}
      <ReconstitutionCalculator />

      {/* Recent timeline */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 sm:px-6">
          <Utensils className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Recent entries</h2>
        </div>
        {timeline.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500 sm:px-6">Nothing logged yet — use the panel above to start.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {timeline.map((t) => (
              <li key={`${t.entity}-${t.id}`} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <p className="truncate text-sm text-gray-800">{t.text}</p>
                  <p className="text-xs text-gray-400">{new Date(t.when).toLocaleString()}</p>
                </div>
                <DeleteEntryButton entity={t.entity} id={t.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon, label, value, sub, tone = "ok",
}: {
  icon: React.ReactNode; label: string; value: string; sub: string; tone?: "ok" | "caution" | "warn";
}) {
  const toneCls = tone === "warn" ? "text-red-600" : tone === "caution" ? "text-amber-600" : "text-emerald-600";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 text-gray-400">{icon}<span className="text-xs font-medium uppercase tracking-wide">{label}</span></div>
      <div className={`mt-2 text-2xl font-extrabold ${toneCls}`}>{value}</div>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{sub}</p>
    </div>
  );
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function frequencyLabel(hours: number): string {
  if (hours === 168) return "Weekly";
  if (hours === 24) return "Daily";
  if (hours === 336) return "Every 2 weeks";
  if (hours % 168 === 0) return `Every ${hours / 168} weeks`;
  if (hours % 24 === 0) return `Every ${hours / 24} days`;
  return `Every ${hours} h`;
}
