"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookmarkPlus,
  Check,
  TrendingDown,
  Activity,
  ArrowRight,
  CloudUpload,
  Trash2,
} from "lucide-react";

/**
 * Save-progress panel for the weight-loss-percentage result.
 *
 * The flagship calculator "ends with a number rather than a saved trend." This
 * turns that number into a saved reading: one tap stores it on-device and builds
 * a running trend (weight, % lost, change since last reading), then routes into
 * the body-composition tracker and cross-device sync. Storage mirrors the BMI
 * calculator's local-history pattern.
 */

const STORAGE_KEY = "calqulate_wlp_history_v1";
const MAX_ENTRIES = 12;

interface Reading {
  id: string;
  dateLabel: string;
  weight: number;
  unit: string;
  pct: number;
  lost: number;
}

export function SaveProgressPanel({
  weight,
  unit,
  pct,
  lost,
}: {
  weight: number;
  unit: string;
  pct: number;
  lost: number;
}) {
  const [history, setHistory] = useState<Reading[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  const persist = (next: Reading[]) => {
    setHistory(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — non-fatal */
    }
  };

  const save = () => {
    const now = new Date();
    const dateLabel = now.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const last = history[0];
    // Skip an exact duplicate of the most recent reading.
    if (last && last.weight === weight && last.pct === pct) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      return;
    }
    const entry: Reading = {
      id: now.toISOString(),
      dateLabel,
      weight,
      unit,
      pct,
      lost,
    };
    persist([entry, ...history].slice(0, MAX_ENTRIES));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const clear = () => persist([]);

  return (
    <div className="border-t border-line px-5 py-6 sm:px-8">
      <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-800">
              <TrendingDown className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">Save this reading to start a trend</p>
              <p className="mt-0.5 text-sm text-copy">
                One number is a snapshot. Save it and your next weigh-in becomes a line, not a guess.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900"
          >
            {justSaved ? (
              <>
                <Check className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <BookmarkPlus className="h-4 w-4" /> Save this reading
              </>
            )}
          </button>
        </div>

        {/* Saved trend */}
        {hydrated && history.length > 0 && (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-faint">
                Your saved trend ({history.length})
              </p>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-1 text-xs font-semibold text-faint transition hover:text-copy"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
              {history.map((r, i) => {
                const older = history[i + 1];
                const delta = older ? Math.round((r.weight - older.weight) * 10) / 10 : null;
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="w-14 flex-shrink-0 text-faint">{r.dateLabel}</span>
                    <span className="font-semibold text-ink">
                      {r.weight} {r.unit}
                    </span>
                    <span className="font-bold text-brand-800">−{r.pct}%</span>
                    <span className="w-16 flex-shrink-0 text-right text-xs font-semibold">
                      {delta === null ? (
                        <span className="text-faint">start</span>
                      ) : delta < 0 ? (
                        <span className="text-brand-800">{delta} {r.unit}</span>
                      ) : delta > 0 ? (
                        <span className="text-amber-700">+{delta} {r.unit}</span>
                      ) : (
                        <span className="text-faint">±0</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-faint">
              Saved on this device only. Sign in to keep your trend across devices — and see fat vs. muscle, not
              just weight.
            </p>
          </div>
        )}

        {/* Routes: body composition + sync */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/health/glp-1-dose-calculator"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-300 bg-white px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
          >
            <Activity className="h-4 w-4" /> Check fat vs. muscle
          </Link>
          <Link
            href="/signup?next=/dashboard/glp1"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            <CloudUpload className="h-4 w-4" /> Save my trend across devices
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SaveProgressPanel;
