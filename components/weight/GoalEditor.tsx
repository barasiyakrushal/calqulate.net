"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, Pencil, Loader2, FileText } from "lucide-react";
import { parseNumber } from "@/lib/utils"

const LB_PER_KG = 2.2046226218;

/** "Goal Weight" KPI card with inline edit that persists to /api/weight/goal. */
export function GoalEditor({ goalKg, unit = "lb" }: { goalKg: number | null; unit?: "lb" | "kg" }) {
  const router = useRouter();
  const toDisplay = (kg: number) => (unit === "lb" ? kg * LB_PER_KG : kg);
  const display = goalKg != null ? toDisplay(goalKg).toFixed(1) : null;

  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(display ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const n = parseNumber(val);
    if (!Number.isFinite(n) || n <= 0) { setErr("Enter a valid weight"); return; }
    const goalKgToSave = unit === "lb" ? n / LB_PER_KG : n;
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/weight/goal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalKg: goalKgToSave }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setErr(d.error ?? "Could not save your goal.");
        setSaving(false);
        return;
      }
      setEditing(false);
      setSaving(false);
      router.refresh();
    } catch {
      setErr("Could not save your goal.");
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-gray-400">
        <Target className="h-4 w-4" />
        <span className="text-[11px] font-medium uppercase tracking-wide">Goal Weight</span>
      </div>
      {editing ? (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-24 rounded-lg border border-gray-300 px-2 py-1 text-lg font-bold text-gray-900 focus:border-emerald-500 focus:outline-none"
              autoFocus
              placeholder="e.g. 170"
            />
            <span className="text-sm text-gray-400">{unit}</span>
          </div>
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
          <div className="mt-2 flex gap-2">
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />} Save
            </button>
            <button onClick={() => { setEditing(false); setErr(null); }} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{display ? `${display} ${unit}` : "—"}</div>
          <button onClick={() => setEditing(true)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline">
            <Pencil className="h-3 w-3" /> {display ? "Edit Goal" : "Set Goal"}
          </button>
        </>
      )}
    </div>
  );
}

/** Header "Export PDF" — prints the page (browser save-as-PDF). */
export function ExportPdfButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
    >
      <FileText className="h-4 w-4" /> Export PDF
    </button>
  );
}
