import Link from "next/link";
import { Calendar, Pill, Repeat, Syringe, ArrowRight, RotateCw } from "lucide-react";

/**
 * Right-rail dashboard cards for the GLP-1 Tracker: Next Dose, Current Cycle
 * (ring) and Plan Summary. Pure presentational + server-renderable — every value
 * is derived on the page and passed in. Buttons are anchor links (no client JS).
 */

// ── Next Dose ────────────────────────────────────────────────────────────────
export function NextDoseCard({
  label,
  dueDate,
  overdue,
}: {
  label: string | null;
  dueDate: string | null;
  overdue: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2 text-gray-500">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
          <Calendar className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-gray-900">Next Dose</span>
      </div>
      <div className={`mt-3 text-2xl font-extrabold ${overdue ? "text-red-600" : "text-emerald-600"}`}>
        {label ?? "—"}
      </div>
      {dueDate && (
        <p className="mt-1 text-xs text-gray-500">
          {overdue ? "Past due" : "Due"}: {dueDate}
        </p>
      )}
      <Link
        href="#log"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
      >
        Log Dose Now
      </Link>
    </div>
  );
}

// ── Current Cycle (progress ring) ────────────────────────────────────────────
export function CurrentCycleCard({
  dayOfCycle,
  cycleLengthDays,
  cycleFraction,
  phaseLabel,
  overdue,
  startedDate,
}: {
  dayOfCycle: number;
  cycleLengthDays: number;
  cycleFraction: number;
  phaseLabel: string;
  overdue: boolean;
  startedDate: string | null;
}) {
  const R = 34;
  const C = 2 * Math.PI * R;
  const pct = Math.max(0, Math.min(1, cycleFraction));
  const dash = C * pct;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-semibold text-gray-900">Current Cycle</div>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-20 w-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="#e5e7eb" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke="#059669"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="text-xl font-extrabold text-gray-900">{dayOfCycle}</span>
            <span className="text-[10px] text-gray-400">of {cycleLengthDays}</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-gray-900">Day {dayOfCycle}</div>
          <div className="text-xs text-gray-400">Today</div>
          <div className={`mt-1 text-sm font-semibold ${overdue ? "text-red-600" : "text-emerald-600"}`}>
            {phaseLabel}
          </div>
        </div>
      </div>
      {startedDate && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
          <RotateCw className="h-3.5 w-3.5" /> Started: {startedDate}
        </p>
      )}
    </div>
  );
}

// ── Plan Summary ─────────────────────────────────────────────────────────────
export function PlanSummaryCard({
  medication,
  dose,
  frequency,
}: {
  medication: string;
  dose: string;
  frequency: string;
}) {
  const rows = [
    { icon: Syringe, label: "Medication", value: medication },
    { icon: Pill, label: "Dose", value: dose },
    { icon: Repeat, label: "Frequency", value: frequency },
  ];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-semibold text-gray-900">Plan Summary</div>
      <ul className="mt-4 space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-gray-50 text-gray-500">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-gray-400">{label}</div>
              <div className="truncate text-sm font-semibold text-gray-900">{value}</div>
            </div>
          </li>
        ))}
      </ul>
      <Link
        href="#log"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        View Plan Details <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
