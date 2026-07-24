import type { ReactNode } from "react";

export interface CompareColumn {
  /** Short brand/label shown at the top of the column, e.g. "Wegovy". */
  label: string;
  /** Optional one-line sub-label, e.g. "For weight loss". */
  sublabel?: string;
  /** Tailwind text color class for the header, e.g. "text-emerald-700". */
  accent?: string;
}

export interface CompareRow {
  feature: string;
  left: ReactNode;
  right: ReactNode;
  /** Which side, if either, "wins" this row — subtly tints that cell. */
  winner?: "left" | "right";
}

/**
 * Responsive head-to-head comparison table.
 *
 * Desktop: a 3-column table (feature | left | right) with a sticky-feeling
 * header. Mobile: each row collapses into a card — the feature on its own line,
 * then the two values side by side, each with its own column label — so nothing
 * is cramped into three narrow columns on a phone.
 */
export function CompareTable({
  left,
  right,
  rows,
}: {
  left: CompareColumn;
  right: CompareColumn;
  rows: CompareRow[];
}) {
  const cellTone = (win: boolean) =>
    win ? "bg-emerald-50/70 dark:bg-emerald-900/20" : "";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-800">
      {/* Header — desktop only (mobile repeats labels per cell) */}
      <div className="hidden bg-slate-50 sm:grid sm:grid-cols-[1.1fr_1fr_1fr] dark:bg-slate-800/50">
        <div className="px-4 py-3" />
        <div className="border-l border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className={`font-bold ${left.accent ?? "text-slate-900 dark:text-white"}`}>{left.label}</p>
          {left.sublabel && <p className="text-xs text-slate-500">{left.sublabel}</p>}
        </div>
        <div className="border-l border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className={`font-bold ${right.accent ?? "text-slate-900 dark:text-white"}`}>{right.label}</p>
          {right.sublabel && <p className="text-xs text-slate-500">{right.sublabel}</p>}
        </div>
      </div>

      <div className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 sm:grid-cols-[1.1fr_1fr_1fr] sm:gap-y-0 sm:px-0 sm:py-0"
          >
            {/* Feature */}
            <div className="col-span-2 text-sm font-bold text-slate-900 sm:col-span-1 sm:flex sm:items-center sm:px-4 sm:py-4 dark:text-white">
              {row.feature}
            </div>
            {/* Left value */}
            <div
              className={`text-sm text-slate-600 sm:flex sm:items-center sm:border-l sm:border-slate-100 sm:px-4 sm:py-4 dark:text-slate-300 dark:sm:border-slate-800 ${cellTone(
                row.winner === "left"
              )}`}
            >
              <span className={`mb-0.5 block text-xs font-bold sm:hidden ${left.accent ?? "text-slate-500"}`}>
                {left.label}
              </span>
              {row.left}
            </div>
            {/* Right value */}
            <div
              className={`text-sm text-slate-600 sm:flex sm:items-center sm:border-l sm:border-slate-100 sm:px-4 sm:py-4 dark:text-slate-300 dark:sm:border-slate-800 ${cellTone(
                row.winner === "right"
              )}`}
            >
              <span className={`mb-0.5 block text-xs font-bold sm:hidden ${right.accent ?? "text-slate-500"}`}>
                {right.label}
              </span>
              {row.right}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompareTable;
