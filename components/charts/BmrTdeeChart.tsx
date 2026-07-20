// components/charts/BmrTdeeChart.tsx
"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { activityLevels } from "@/lib/blog/bmr-tdee-data";

/**
 * Shows the BMR vs TDEE relationship as a stacked bar.
 * - The dark base bar is BMR, the same at every activity level (your floor).
 * - The green stack on top is the activity calories that turn BMR into TDEE.
 * - The total height of each bar is your TDEE at that activity level.
 *
 * Type a different BMR to see your own numbers. recharts keeps it sharp and
 * fully responsive without any extra work.
 */
export default function BmrTdeeChart() {
  const [bmr, setBmr] = useState(1500);

  const safeBmr = Number.isFinite(bmr) && bmr > 0 ? bmr : 1500;

  const data = activityLevels.map((a) => {
    const tdee = Math.round(safeBmr * a.multiplier);
    return {
      name: a.name.replace(" active", ""),
      bmr: safeBmr,
      activity: tdee - safeBmr,
      tdee,
    };
  });

  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-6 ring-1 ring-slate-200 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 md:text-2xl">
            How BMR Becomes TDEE
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Your BMR is the dark floor and stays the same all day. Activity
            stacks the green calories on top. The full bar is your TDEE.
          </p>
        </div>

        {/* BMR input */}
        <label className="shrink-0 rounded-xl bg-white p-3 text-sm ring-1 ring-slate-200">
          <span className="mr-2 font-semibold text-slate-600">Your BMR</span>
          <input
            type="number"
            value={bmr}
            min={800}
            max={3000}
            step={10}
            onChange={(e) => setBmr(parseInt(e.target.value, 10))}
            className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
            placeholder="e.g. 1650"
          />
          <span className="ml-1 text-slate-500">kcal</span>
        </label>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 24, right: 16, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#475569" }}
              interval={0}
              height={40}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={48}
              label={{
                value: "kcal/day",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#94a3b8" },
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
              contentStyle={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                fontSize: 13,
              }}
              formatter={(value: number, name: string) => {
                if (name === "BMR (floor)") return [`${value} kcal`, "BMR"];
                return [`+${value} kcal`, "Activity"];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="bmr" stackId="e" name="BMR (floor)" fill="#0f172a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="activity" stackId="e" name="Activity → TDEE" fill="#10b981" radius={[6, 6, 0, 0]}>
              <LabelList
                dataKey="tdee"
                position="top"
                formatter={(v: number) => `${v}`}
                style={{ fontSize: 11, fontWeight: 700, fill: "#0f172a" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Numbers on top of each bar are your TDEE at that activity level. Defaults
        to a sample BMR of 1,500 kcal. Multipliers are 1.2, 1.375, 1.55, 1.725,
        and 1.9. Estimates carry about a 10% margin, so treat them as a starting
        point.
      </p>
    </div>
  );
}
