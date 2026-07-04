import { getAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listRecords } from "@/lib/glp1/repository";
import {
  bodyComp,
  type Medication,
  type DoseLog,
  type WeightLog,
  type BodyCompositionLog,
  type FoodLog,
  type WaterLog,
  type ExerciseLog,
  type CheckIn,
  type SideEffectLog,
  type LabResult,
} from "@/lib/glp1";
import { Glp1History, type HistoryItem, type WeightPoint } from "@/components/glp1/Glp1History";

export const dynamic = "force-dynamic";

const LB = 2.2046226218;
const lb = (kg: number) => Math.round(kg * LB * 10) / 10;
const LAB_LABELS: Record<string, string> = {
  a1c: "A1c", "fasting-glucose": "Fasting glucose", "total-cholesterol": "Total cholesterol",
  ldl: "LDL", hdl: "HDL", triglycerides: "Triglycerides", "systolic-bp": "Systolic BP", "diastolic-bp": "Diastolic BP",
};

export default async function HistoryPage() {
  const access = await getAccess();
  const supabase = await createClient();
  const userId = access.userId!;

  const [meds, doses, weights, bodyComps, foods, waters, exercises, checkins, symptoms, labs, riskRes] = await Promise.all([
    listRecords<Medication>(supabase, "medication", userId, { limit: 20 }),
    listRecords<DoseLog>(supabase, "doseLog", userId, { limit: 500 }),
    listRecords<WeightLog>(supabase, "weightLog", userId, { limit: 500 }),
    listRecords<BodyCompositionLog>(supabase, "bodyComposition", userId, { limit: 300 }),
    listRecords<FoodLog>(supabase, "foodLog", userId, { limit: 500 }),
    listRecords<WaterLog>(supabase, "waterLog", userId, { limit: 300 }),
    listRecords<ExerciseLog>(supabase, "exerciseLog", userId, { limit: 300 }),
    listRecords<CheckIn>(supabase, "checkIn", userId, { limit: 300 }),
    listRecords<SideEffectLog>(supabase, "sideEffect", userId, { limit: 300 }),
    listRecords<LabResult>(supabase, "labResult", userId, { limit: 300 }),
    supabase.from("risk_results").select("composite_score,composite_grade,ascvd_percent,diabetes_percent,heart_age,computed_at").eq("user_id", userId).order("computed_at", { ascending: false }),
  ]);

  const medName = (id: string) => {
    const m = meds.find((x) => x.id === id);
    return m ? (m.brandName ?? m.customName ?? m.compound ?? "Medication") : "Medication";
  };

  // ── Unified, category-tagged history items ──────────────────────────────────
  const items: HistoryItem[] = [
    ...doses.map((d): HistoryItem => ({
      entity: "doseLog", id: d.id, when: d.takenAt, category: "medication",
      title: d.skipped ? "Dose skipped" : `${d.amountMg} mg dose`,
      detail: [medName(d.medicationId), d.injectionSite?.replace(/-/g, " "), d.notes].filter(Boolean).join(" · "),
    })),
    ...weights.map((w): HistoryItem => ({
      entity: "weightLog", id: w.id, when: w.takenAt, category: "progress",
      title: `${lb(w.weightKg)} lb`, detail: `${w.weightKg.toFixed(1)} kg`,
    })),
    ...bodyComps.map((b): HistoryItem => {
      const c = bodyComp(b.weightKg, b.bodyFatPct);
      return {
        entity: "bodyComposition", id: b.id, when: b.takenAt, category: "progress",
        title: `${b.bodyFatPct}% body fat`,
        detail: `${lb(b.weightKg)} lb · lean ${lb(c.leanMassKg)} lb · fat ${lb(c.fatMassKg)} lb`,
      };
    }),
    ...foods.map((f): HistoryItem => ({
      entity: "foodLog", id: f.id, when: f.loggedAt, category: "lifestyle",
      title: f.label,
      detail: [`${f.proteinG}g protein`, `${f.fiberG}g fiber`, f.calories != null ? `${f.calories} cal` : null, f.carbsG != null ? `${f.carbsG}g carbs` : null, f.fatG != null ? `${f.fatG}g fat` : null].filter(Boolean).join(" · "),
    })),
    ...waters.map((w): HistoryItem => ({
      entity: "waterLog", id: w.id, when: w.loggedAt, category: "lifestyle",
      title: `${w.volumeMl} ml water`, detail: "Hydration",
    })),
    ...exercises.map((x): HistoryItem => ({
      entity: "exerciseLog", id: x.id, when: x.loggedAt, category: "lifestyle",
      title: `${x.type} · ${x.label}`,
      detail: [x.durationMin ? `${x.durationMin} min` : null, x.sets ? `${x.sets}×${x.reps ?? "?"}` : null].filter(Boolean).join(" · ") || "Workout",
    })),
    ...checkins.map((c): HistoryItem => ({
      entity: "checkIn", id: c.id, when: c.loggedAt, category: "lifestyle",
      title: "Daily check-in",
      detail: [c.mood != null ? `mood ${c.mood}/5` : null, c.energy != null ? `energy ${c.energy}/5` : null, c.craving != null ? `food noise ${c.craving}/5` : null, c.sleepHours != null ? `${c.sleepHours}h sleep` : null].filter(Boolean).join(" · ") || "Logged",
    })),
    ...symptoms.map((s): HistoryItem => ({
      entity: "sideEffect", id: s.id, when: s.loggedAt, category: "symptom",
      title: s.noSymptoms ? "No symptoms" : (s.type?.replace(/-/g, " ") ?? "Symptom"),
      detail: s.noSymptoms ? "Symptom-free day" : [s.severity != null ? `severity ${s.severity}/5` : null, s.notes].filter(Boolean).join(" · "),
    })),
    ...labs.map((l): HistoryItem => ({
      entity: "labResult", id: l.id, when: l.takenAt, category: "lab",
      title: LAB_LABELS[l.type] ?? l.type.replace(/-/g, " "),
      detail: `${l.value} ${l.unit}`,
    })),
  ].sort((a, b) => Date.parse(b.when) - Date.parse(a.when));

  const weightPoints: WeightPoint[] = weights
    .map((w) => ({ id: w.id, when: w.takenAt, lb: lb(w.weightKg) }))
    .sort((a, b) => Date.parse(a.when) - Date.parse(b.when));

  const metabolic = riskRes.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">History</h1>
        <p className="mt-1 text-sm text-gray-500">Every log, organized by category. Filter by period, browse the calendar, and edit anything — nothing is ever really deleted.</p>
      </div>

      <Glp1History items={items} weightPoints={weightPoints} />

      {/* Metabolic measurements (existing) */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-gray-900">Metabolic measurements</h2>
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Heart age</th>
                <th className="px-4 py-3">ASCVD %</th>
                <th className="px-4 py-3">Diabetes %</th>
              </tr>
            </thead>
            <tbody>
              {metabolic.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No measurements yet.</td></tr>
              )}
              {metabolic.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-3">{new Date(r.computed_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold">{r.composite_score}</td>
                  <td className="px-4 py-3">{r.composite_grade}</td>
                  <td className="px-4 py-3">{r.heart_age ?? "—"}</td>
                  <td className="px-4 py-3">{r.ascvd_percent ?? "—"}</td>
                  <td className="px-4 py-3">{r.diabetes_percent ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
