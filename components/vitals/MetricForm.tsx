"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import type { MeasurementInput, VitalsReport } from "@/types/vitals";
import type { ProtocolItem } from "@/lib/protocol";
import { ScoreGauge } from "./ScoreGauge";
import { ProtocolCard } from "./ProtocolCard";
import { lbToKg, inToCm, type UnitSystem } from "@/lib/units";

const schema = z.object({
  age: z.coerce.number().min(18).max(100),
  sex: z.enum(["male", "female"]),
  race: z.enum(["white", "black", "other"]).optional(),
  heightCm: z.coerce.number().min(120).max(230),
  weightKg: z.coerce.number().min(30).max(300),
  waistCm: z.coerce.number().optional(),
  systolicBp: z.coerce.number().optional(),
  totalCholesterol: z.coerce.number().optional(),
  hdl: z.coerce.number().optional(),
  smoker: z.boolean().optional(),
  diabetes: z.boolean().optional(),
  familyDiabetes: z.boolean().optional(),
  physicallyActive: z.boolean().optional(),
});

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-base";

export function MetricForm({
  productSlug,
  persist = false,
  onSaved,
  focus = "metabolic",
}: {
  productSlug?: string;
  persist?: boolean;
  onSaved?: () => void;
  /** Which result to foreground, so each tracker page shows its own metric. */
  focus?: "metabolic" | "heartAge" | "glp1";
}) {
  const [report, setReport] = useState<VitalsReport | null>(null);
  const [protocol, setProtocol] = useState<ProtocolItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [units, setUnits] = useState<UnitSystem>("us");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("calq-units") as UnitSystem | null) : null;
    if (saved === "us" || saved === "metric") setUnits(saved);
  }, []);
  function chooseUnits(u: UnitSystem) {
    setUnits(u);
    try { localStorage.setItem("calq-units", u); } catch {}
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const num = (v: FormDataEntryValue | null) => (v != null && v !== "" ? Number(v) : undefined);
    // Inputs are in the chosen display units; storage is always metric.
    const wIn = num(fd.get("weightKg"));
    const hIn = num(fd.get("heightCm"));
    const waIn = num(fd.get("waistCm"));
    const raw = {
      age: fd.get("age"),
      sex: fd.get("sex"),
      race: fd.get("race") || undefined,
      heightCm: hIn != null ? (units === "us" ? inToCm(hIn) : hIn) : undefined,
      weightKg: wIn != null ? (units === "us" ? lbToKg(wIn) : wIn) : undefined,
      waistCm: waIn != null ? (units === "us" ? inToCm(waIn) : waIn) : undefined,
      systolicBp: fd.get("systolicBp") || undefined,
      totalCholesterol: fd.get("totalCholesterol") || undefined,
      hdl: fd.get("hdl") || undefined,
      smoker: fd.get("smoker") === "on",
      diabetes: fd.get("diabetes") === "on",
      familyDiabetes: fd.get("familyDiabetes") === "on",
      physicallyActive: fd.get("physicallyActive") === "on",
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      return;
    }

    setBusy(true);
    try {
      const endpoint = persist ? "/api/vitals/measurements" : "/api/vitals/compute";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data as MeasurementInput),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setReport(data.report);
      setProtocol(data.protocol ?? []);
      onSaved?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-200 p-6">
        {/* Units toggle (USA default) */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Units</span>
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 text-sm">
            <button type="button" onClick={() => chooseUnits("us")}
              className={`rounded-md px-3 py-1 font-medium ${units === "us" ? "bg-blue-600 text-white" : "text-gray-600"}`}>
              US (lb/in)
            </button>
            <button type="button" onClick={() => chooseUnits("metric")}
              className={`rounded-md px-3 py-1 font-medium ${units === "metric" ? "bg-blue-600 text-white" : "text-gray-600"}`}>
              Metric (kg/cm)
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">Age<input name="age" type="number" required className={field} placeholder="e.g. 45" /></label>
          <label className="flex flex-col gap-1 text-sm">Sex
            <select name="sex" required className={field}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">Height ({units === "us" ? "in" : "cm"})<input name="heightCm" type="number" step="any" required className={field} placeholder={units === "us" ? "e.g. 70" : "e.g. 178"} /></label>
          <label className="flex flex-col gap-1 text-sm">Weight ({units === "us" ? "lb" : "kg"})<input name="weightKg" type="number" step="any" required className={field} placeholder={units === "us" ? "e.g. 200" : "e.g. 90"} /></label>
          <label className="flex flex-col gap-1 text-sm">Waist ({units === "us" ? "in" : "cm"})<input name="waistCm" type="number" step="any" className={field} placeholder={units === "us" ? "e.g. 38" : "e.g. 94"} /></label>
          <label className="flex flex-col gap-1 text-sm">Systolic BP<input name="systolicBp" type="number" className={field} placeholder="e.g. 120" /></label>
          <label className="flex flex-col gap-1 text-sm">Total chol (mg/dL)<input name="totalCholesterol" type="number" className={field} placeholder="e.g. 180" /></label>
          <label className="flex flex-col gap-1 text-sm">HDL (mg/dL)<input name="hdl" type="number" className={field} placeholder="e.g. 50" /></label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">Race/ethnicity (for ASCVD)
            <select name="race" className={field}>
              <option value="white">White / other</option>
              <option value="black">Black / African American</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="smoker" /> Smoker</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="diabetes" /> Diabetes</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="familyDiabetes" /> Family diabetes</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="physicallyActive" /> Active daily</label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? "Calculating…" : persist ? "Save measurement" : "Calculate my score"}
        </button>
        <p className="text-xs text-gray-400">Lab values are optional but unlock the heart and cardiovascular scores.</p>
      </form>

      <div className="rounded-2xl border border-gray-200 p-6">
        {!report ? (
          <p className="text-sm text-gray-500">Your results will appear here.</p>
        ) : (
          <div className="space-y-5">
            {focus === "heartAge" ? (
              <HeartAgeHero report={report} />
            ) : focus === "glp1" ? (
              <Glp1Hero report={report} />
            ) : (
              <>
                <ScoreGauge score={report.composite.score} grade={report.composite.grade} />
                <div className="grid grid-cols-1 gap-3 text-center text-sm sm:grid-cols-3">
                  <Stat label="ASCVD 10-yr" value={report.ascvd.tenYearRiskPercent != null ? `${report.ascvd.tenYearRiskPercent}%` : "—"} />
                  <Stat label="Heart age" value={report.heartAge.heartAge != null ? `${report.heartAge.heartAge}` : "—"} />
                  <Stat label="Diabetes 10-yr" value={report.diabetes.tenYearRiskPercent != null ? `${report.diabetes.tenYearRiskPercent}%` : "—"} />
                </div>
              </>
            )}
            <div>
              <h4 className="mb-2 font-semibold">Your next lever</h4>
              <ProtocolCard items={protocol} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

/** Heart Age Tracker hero — foregrounds heart age vs. real age. */
function HeartAgeHero({ report }: { report: VitalsReport }) {
  const ha = report.heartAge;
  const available = ha.available && ha.heartAge != null;
  const delta = ha.delta ?? 0;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-6 text-center">
        <div className="text-sm font-medium text-gray-500">Your heart age</div>
        <div className="mt-1 text-5xl font-extrabold text-rose-700">
          {available ? ha.heartAge : "—"}
          {available && <span className="text-xl font-bold text-rose-400"> yrs</span>}
        </div>
        {available ? (
          <p className={`mt-2 text-sm font-medium ${delta > 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {delta === 0 ? "Right on your real age" : `${delta > 0 ? "+" : ""}${delta} years vs your real age (${ha.chronologicalAge})`}
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-500">Add total cholesterol, HDL and systolic BP to calculate heart age.</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 text-center text-sm sm:grid-cols-3">
        <Stat label="10-yr heart risk" value={report.ascvd.tenYearRiskPercent != null ? `${report.ascvd.tenYearRiskPercent}%` : "—"} />
        <Stat label="Health score" value={`${report.composite.score}`} />
        <Stat label="Diabetes 10-yr" value={report.diabetes.tenYearRiskPercent != null ? `${report.diabetes.tenYearRiskPercent}%` : "—"} />
      </div>
    </div>
  );
}

/** GLP-1 Progress Tracker hero — foregrounds body composition / lean mass. */
function Glp1Hero({ report }: { report: VitalsReport }) {
  const b = report.body;
  const bodyFat = b.navyBodyFatPercent ?? b.rfmPercent;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
        <div className="text-center text-sm font-medium text-gray-500">Body composition — track muscle, not just the scale</div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-center">
          <Stat label="Lean body mass" value={b.leanBodyMassKg != null ? `${b.leanBodyMassKg} kg` : "—"} />
          <Stat label="Body fat" value={bodyFat != null ? `${bodyFat}%` : "—"} />
          <Stat label="BMI" value={`${b.bmi}`} />
          <Stat label="Waist-to-height" value={b.waistToHeight != null ? `${b.waistToHeight}` : "—"} />
        </div>
        <p className="mt-3 text-center text-xs text-gray-500">
          Save measurements to watch lean mass hold steady while fat falls — your insurance against the rebound.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 text-center text-sm sm:grid-cols-3">
        <Stat label="10-yr heart risk" value={report.ascvd.tenYearRiskPercent != null ? `${report.ascvd.tenYearRiskPercent}%` : "—"} />
        <Stat label="Diabetes 10-yr" value={report.diabetes.tenYearRiskPercent != null ? `${report.diabetes.tenYearRiskPercent}%` : "—"} />
        <Stat label="Health score" value={`${report.composite.score}`} />
      </div>
    </div>
  );
}
