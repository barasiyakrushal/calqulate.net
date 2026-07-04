"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Syringe, Scale, Utensils, Activity, FlaskConical, List, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { DeleteEntryButton } from "./DeleteEntryButton";
import type { Glp1EntityName } from "@/lib/glp1/schemas";

export type HistoryCategory = "medication" | "progress" | "lifestyle" | "symptom" | "lab";

export interface HistoryItem {
  entity: Glp1EntityName;
  id: string;
  when: string; // ISO
  category: HistoryCategory;
  title: string;
  detail: string;
}
export interface WeightPoint {
  id: string;
  when: string;
  lb: number;
}

const CATS: Record<HistoryCategory, { label: string; Icon: typeof Syringe; dot: string; text: string; chipOn: string }> = {
  medication: { label: "Medication", Icon: Syringe, dot: "bg-emerald-500", text: "text-emerald-700", chipOn: "bg-emerald-600 text-white" },
  progress: { label: "Progress & body", Icon: Scale, dot: "bg-blue-500", text: "text-blue-700", chipOn: "bg-blue-600 text-white" },
  lifestyle: { label: "Check-in & lifestyle", Icon: Utensils, dot: "bg-amber-500", text: "text-amber-700", chipOn: "bg-amber-500 text-white" },
  symptom: { label: "Symptoms", Icon: Activity, dot: "bg-rose-500", text: "text-rose-700", chipOn: "bg-rose-600 text-white" },
  lab: { label: "Labs & biomarkers", Icon: FlaskConical, dot: "bg-violet-500", text: "text-violet-700", chipOn: "bg-violet-600 text-white" },
};
const CAT_ORDER: HistoryCategory[] = ["medication", "progress", "lifestyle", "symptom", "lab"];

const PERIODS = [
  { key: "1m", label: "1M", days: 30 },
  { key: "3m", label: "3M", days: 90 },
  { key: "6m", label: "6M", days: 180 },
  { key: "all", label: "All", days: Infinity },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];

const DAY_MS = 24 * 3_600_000;
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA"); // YYYY-MM-DD, local

export function Glp1History({ items, weightPoints }: { items: HistoryItem[]; weightPoints: WeightPoint[] }) {
  const [cat, setCat] = useState<HistoryCategory | "all">("all");
  const [period, setPeriod] = useState<PeriodKey>("3m");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [highlight, setHighlight] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const periodDays = PERIODS.find((p) => p.key === period)!.days;
  const cutoff = periodDays === Infinity ? -Infinity : Date.now() - periodDays * DAY_MS;

  const filtered = useMemo(
    () => items.filter((it) => Date.parse(it.when) >= cutoff && (cat === "all" || it.category === cat)),
    [items, cutoff, cat],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0 };
    for (const it of items) {
      if (Date.parse(it.when) < cutoff) continue;
      c.all = (c.all ?? 0) + 1;
      c[it.category] = (c[it.category] ?? 0) + 1;
    }
    return c;
  }, [items, cutoff]);

  // Deep-link from the weight chart to a weigh-in entry.
  function jumpTo(id: string) {
    setView("list");
    setCat("all");
    setHighlight(id);
  }
  useEffect(() => {
    if (!highlight) return;
    const el = document.getElementById(`h-${highlight}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setHighlight(null), 2200);
    return () => clearTimeout(t);
  }, [highlight, view]);

  const chartData = useMemo(
    () => weightPoints.filter((p) => Date.parse(p.when) >= cutoff).map((p) => ({ ...p, t: Date.parse(p.when) })),
    [weightPoints, cutoff],
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Period */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${period === p.key ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* View toggle */}
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
          <button onClick={() => setView("list")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${view === "list" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            <List className="h-4 w-4" /> List
          </button>
          <button onClick={() => setView("calendar")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${view === "calendar" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            <CalendarDays className="h-4 w-4" /> Calendar
          </button>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={cat === "all"} onClick={() => setCat("all")} label="All" count={counts.all ?? 0} activeCls="bg-gray-900 text-white" />
        {CAT_ORDER.map((k) => {
          const C = CATS[k];
          return (
            <Chip key={k} active={cat === k} onClick={() => setCat(k)} label={C.label} count={counts[k] ?? 0} activeCls={C.chipOn} icon={<C.Icon className="h-3.5 w-3.5" />} dot={C.dot} />
          );
        })}
      </div>

      {/* Interactive weight chart — click a point to jump to that weigh-in */}
      {chartData.length >= 2 && (cat === "all" || cat === "progress") && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Weight trend</h3>
            <span className="text-xs text-gray-400">Tap a point to open its log</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={chartData}
              margin={{ top: 6, right: 10, left: 0, bottom: 0 }}
              onClick={(st: any) => {
                const p = st?.activePayload?.[0]?.payload;
                if (p?.id) jumpTo(p.id);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })} fontSize={11} stroke="#9ca3af" minTickGap={26} />
              <YAxis fontSize={11} width={34} stroke="#9ca3af" domain={["auto", "auto"]} unit=" lb" />
              <Tooltip labelFormatter={(v) => new Date(Number(v)).toLocaleDateString()} formatter={(val: any) => [`${val} lb`, "Weight"]} />
              <Line type="monotone" dataKey="lb" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, cursor: "pointer" }} activeDot={{ r: 5, cursor: "pointer" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Body */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Nothing logged in this period. Try a longer range or a different category.
        </div>
      ) : view === "list" ? (
        <div ref={listRef}>
          <ListView items={filtered} highlight={highlight} />
        </div>
      ) : (
        <CalendarView items={filtered} highlight={highlight} setHighlight={setHighlight} />
      )}
    </div>
  );
}

function Chip({ active, onClick, label, count, activeCls, icon, dot }: { active: boolean; onClick: () => void; label: string; count: number; activeCls: string; icon?: React.ReactNode; dot?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${active ? `${activeCls} ring-transparent` : "bg-white text-gray-600 ring-gray-200 hover:bg-gray-50"}`}
    >
      {icon ?? (dot ? <span className={`h-2 w-2 rounded-full ${dot}`} /> : null)}
      {label}
      <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{count}</span>
    </button>
  );
}

// ── List view (grouped by day) ─────────────────────────────────────────────────
function ListView({ items, highlight }: { items: HistoryItem[]; highlight: string | null }) {
  const groups = useMemo(() => {
    const m = new Map<string, HistoryItem[]>();
    for (const it of items) {
      const k = dayKey(it.when);
      (m.get(k) ?? m.set(k, []).get(k)!).push(it);
    }
    return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [items]);

  return (
    <div className="space-y-5">
      {groups.map(([day, dayItems]) => (
        <div key={day}>
          <div className="sticky top-0 z-10 bg-[#F7F8FA] py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            {new Date(day + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
          </div>
          <ul className="mt-1 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {dayItems.map((it) => (
              <EntryRow key={`${it.entity}-${it.id}`} item={it} highlighted={highlight === it.id} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function EntryRow({ item, highlighted }: { item: HistoryItem; highlighted: boolean }) {
  const C = CATS[item.category];
  return (
    <li id={`h-${item.id}`} className={`flex items-center gap-3 px-4 py-3 transition-colors ${highlighted ? "bg-blue-50 ring-2 ring-inset ring-blue-300" : ""}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray-100">
        <C.Icon className={`h-4 w-4 ${C.text}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
        {item.detail ? <p className="truncate text-xs text-gray-500">{item.detail}</p> : null}
      </div>
      <span className="shrink-0 text-xs text-gray-400">{new Date(item.when).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
      <DeleteEntryButton entity={item.entity} id={item.id} />
    </li>
  );
}

// ── Calendar view ──────────────────────────────────────────────────────────────
function CalendarView({ items, highlight, setHighlight }: { items: HistoryItem[]; highlight: string | null; setHighlight: (id: string | null) => void }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const m = new Map<string, HistoryItem[]>();
    for (const it of items) {
      const k = dayKey(it.when);
      (m.get(k) ?? m.set(k, []).get(k)!).push(it);
    }
    return m;
  }, [items]);

  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDow = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = dayKey(new Date().toISOString());
  const selectedItems = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => setMonth(new Date(year, mon - 1, 1))} aria-label="Previous month" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
          <h3 className="text-sm font-bold text-gray-900">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
          <button onClick={() => setMonth(new Date(year, mon + 1, 1))} aria-label="Next month" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-gray-400">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day == null) return <div key={i} />;
            const key = dayKey(new Date(year, mon, day).toISOString());
            const dayItems = byDay.get(key) ?? [];
            const cats = [...new Set(dayItems.map((it) => it.category))];
            const isSel = selected === key;
            const isToday = key === todayKey;
            return (
              <button
                key={i}
                onClick={() => setSelected(isSel ? null : key)}
                className={`flex aspect-square flex-col items-center justify-start rounded-lg border p-1 text-xs transition ${isSel ? "border-gray-900 bg-gray-900 text-white" : dayItems.length ? "border-gray-200 hover:border-gray-400" : "border-transparent text-gray-400"} ${isToday && !isSel ? "ring-1 ring-emerald-400" : ""}`}
              >
                <span className={isSel ? "font-bold" : ""}>{day}</span>
                {cats.length > 0 && (
                  <span className="mt-auto flex flex-wrap justify-center gap-0.5 pb-0.5">
                    {CAT_ORDER.filter((c) => cats.includes(c)).map((c) => (
                      <span key={c} className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white" : CATS[c].dot}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-3">
          {CAT_ORDER.map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className={`h-2 w-2 rounded-full ${CATS[c].dot}`} /> {CATS[c].label}
            </span>
          ))}
        </div>
      </div>

      {/* Selected-day journal */}
      {selected && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-gray-900">
            {new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            <span className="ml-2 font-normal text-gray-400">{selectedItems.length} entr{selectedItems.length === 1 ? "y" : "ies"}</span>
          </h3>
          {selectedItems.length === 0 ? (
            <p className="rounded-2xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">Nothing logged this day.</p>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {selectedItems.sort((a, b) => Date.parse(b.when) - Date.parse(a.when)).map((it) => (
                <EntryRow key={`${it.entity}-${it.id}`} item={it} highlighted={highlight === it.id} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
