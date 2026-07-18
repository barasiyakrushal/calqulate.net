import "server-only";
import { calcLongevityIndex, calcBiologicalAge, type HealthInput } from "@/lib/healthCalculations";
import { computeNextLevers } from "@/lib/vitals/nextLever";
import type { VitalsReport } from "@/types/vitals";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net";

export interface DigestRow {
  composite_score: number | null;
  composite_grade: string | null;
  ascvd_percent: number | null;
  diabetes_percent: number | null;
  heart_age: number | null;
  report_json?: VitalsReport | null;
  computed_at: string;
}

export interface WeeklyDigestData {
  email: string;
  score: number;
  grade: string;
  prevScore: number | null;
  scoreDelta: number | null;
  longevityIndex: number;
  band: string;
  bioAgeDelta: number | null;
  heartAge: number | null;
  ascvd: number | null;
  diabetes: number | null;
  topLever: { label: string; action: string } | null;
  weeksTracked: number;
  spark: number[];
}

/** Build the digest payload from a user's risk_results history. */
export function buildDigestData(history: DigestRow[], email: string): WeeklyDigestData | null {
  const rows = [...history].filter((r) => r.composite_score != null).sort((a, b) => +new Date(a.computed_at) - +new Date(b.computed_at));
  if (rows.length === 0) return null;
  const latest = rows[rows.length - 1];

  // Previous = closest measurement at least ~6 days before latest, else prior row.
  const cutoff = +new Date(latest.computed_at) - 6 * 86_400_000;
  const earlier = rows.filter((r) => +new Date(r.computed_at) <= cutoff);
  const prev = earlier.length ? earlier[earlier.length - 1] : rows.length > 1 ? rows[rows.length - 2] : null;

  const score = Math.round(latest.composite_score ?? 0);
  const prevScore = prev?.composite_score != null ? Math.round(prev.composite_score) : null;
  const scoreDelta = prevScore != null ? score - prevScore : null;

  const input = latest.report_json?.input as HealthInput | undefined;
  const longevity = input ? calcLongevityIndex(input) : null;
  const bioAge = input ? calcBiologicalAge(input) : null;
  const lever = input ? computeNextLevers(input, 1)[0] : null;

  return {
    email,
    score,
    grade: latest.composite_grade ?? "—",
    prevScore,
    scoreDelta,
    longevityIndex: longevity?.index ?? 0,
    band: longevity?.band ?? "—",
    bioAgeDelta: bioAge?.delta ?? null,
    heartAge: latest.heart_age,
    ascvd: latest.ascvd_percent,
    diabetes: latest.diabetes_percent,
    topLever: lever && lever.factor !== "maintain" ? { label: lever.label, action: lever.action } : null,
    weeksTracked: rows.length,
    spark: rows.slice(-8).map((r) => Math.round(r.composite_score ?? 0)),
  };
}

const C = { brand: "#059669", dark: "#0b1220", ink: "#111827", sub: "#6b7280", line: "#e5e7eb", good: "#059669", warn: "#d97706", bg: "#f3f4f6" };

function deltaChip(delta: number | null, lowerBetter = false): string {
  if (delta == null || delta === 0) return `<span style="color:${C.sub};font-size:13px;">no change yet</span>`;
  const up = delta > 0;
  const good = lowerBetter ? !up : up;
  const arrow = up ? "▲" : "▼";
  const color = good ? C.good : C.warn;
  return `<span style="color:${color};font-weight:700;font-size:13px;">${arrow} ${up ? "+" : ""}${delta} this week</span>`;
}

function statTile(label: string, value: string): string {
  return `<td align="center" style="padding:10px;background:#ffffff;border:1px solid ${C.line};border-radius:10px;">
    <div style="font-size:20px;font-weight:800;color:${C.ink};">${value}</div>
    <div style="font-size:11px;color:${C.sub};text-transform:uppercase;letter-spacing:.04em;">${label}</div>
  </td>`;
}

function bar(pct: number, color: string): string {
  const w = Math.max(0, Math.min(100, pct));
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.line};border-radius:999px;"><tr><td style="background:${color};height:10px;border-radius:999px;width:${w}%;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function sparkBars(values: number[]): string {
  if (values.length < 2) return "";
  const max = Math.max(...values), min = Math.min(...values), range = max - min || 1;
  const cells = values
    .map((v) => {
      const h = 8 + Math.round(((v - min) / range) * 30);
      return `<td valign="bottom" style="padding:0 2px;"><div style="width:14px;height:${h}px;background:${C.brand};border-radius:3px;"></div></td>`;
    })
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

/** Render the week-on-week email — includes a dynamic mini score dashboard. */
export function renderWeeklyDigestHtml(d: WeeklyDigestData): string {
  const dashboardUrl = `${SITE}/dashboard`;
  const futureUrl = `${SITE}/dashboard/future`;
  const prefsUrl = `${SITE}/dashboard/settings`;

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your Calqulate weekly update</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- Brand header (name above the fold) -->
      <tr><td style="background:${C.dark};border-radius:16px 16px 0 0;padding:22px 28px;">
        <div style="color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-.01em;">Calqulate<span style="color:${C.brand};">.net</span></div>
        <div style="color:#9ca3af;font-size:13px;margin-top:2px;">Your weekly health update</div>
      </td></tr>

      <!-- Score dashboard -->
      <tr><td style="background:#ffffff;padding:28px;">
        <div style="font-size:13px;color:${C.sub};text-transform:uppercase;letter-spacing:.05em;">Metabolic Health Score</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
          <tr>
            <td valign="bottom"><span style="font-size:52px;font-weight:800;color:${C.ink};line-height:1;">${d.score}</span><span style="font-size:16px;color:${C.sub};"> / 100 · Grade ${d.grade}</span></td>
            <td align="right" valign="bottom">${deltaChip(d.scoreDelta)}</td>
          </tr>
        </table>
        <div style="margin-top:12px;">${bar(d.score, C.brand)}</div>

        <!-- Week trend sparkline -->
        ${d.spark.length > 1 ? `<div style="margin-top:18px;font-size:12px;color:${C.sub};">Last ${d.spark.length} measurements</div><div style="margin-top:6px;">${sparkBars(d.spark)}</div>` : ""}

        <!-- Stat tiles -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
          <tr>
            ${statTile("Heart age", d.heartAge != null ? `${d.heartAge}` : "—")}
            <td style="width:10px;"></td>
            ${statTile("10-yr heart", d.ascvd != null ? `${d.ascvd}%` : "—")}
            <td style="width:10px;"></td>
            ${statTile("10-yr diabetes", d.diabetes != null ? `${d.diabetes}%` : "—")}
          </tr>
        </table>

        <!-- Longevity index -->
        <div style="margin-top:22px;font-size:13px;color:${C.sub};text-transform:uppercase;letter-spacing:.05em;">Longevity Index</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;"><tr>
          <td><span style="font-size:24px;font-weight:800;color:${C.ink};">${d.longevityIndex}</span><span style="font-size:13px;color:${C.sub};"> / 1000 · ${d.band}</span></td>
          ${d.bioAgeDelta != null ? `<td align="right" style="font-size:13px;color:${d.bioAgeDelta <= 0 ? C.good : C.warn};font-weight:700;">Bio age ${d.bioAgeDelta > 0 ? "+" : ""}${d.bioAgeDelta} yrs</td>` : ""}
        </tr></table>
        <div style="margin-top:8px;">${bar(d.longevityIndex / 10, C.brand)}</div>
      </td></tr>

      <!-- Next lever -->
      ${d.topLever ? `<tr><td style="background:#ffffff;padding:0 28px 24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;"><tr><td style="padding:16px 18px;">
          <div style="font-size:12px;color:${C.brand};font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Your highest-impact move this week</div>
          <div style="font-size:16px;font-weight:700;color:${C.ink};margin-top:4px;">${d.topLever.label}</div>
          <div style="font-size:14px;color:#374151;margin-top:4px;">${d.topLever.action}</div>
        </td></tr></table>
      </td></tr>` : ""}

      <!-- CTAs -->
      <tr><td style="background:#ffffff;padding:0 28px 28px;border-radius:0 0 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="border-radius:10px;background:${C.brand};"><a href="${dashboardUrl}" style="display:inline-block;padding:13px 22px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">Open my dashboard</a></td>
          <td style="width:10px;"></td>
          <td style="border-radius:10px;border:1px solid ${C.line};"><a href="${futureUrl}" style="display:inline-block;padding:13px 22px;color:${C.ink};font-weight:700;font-size:14px;text-decoration:none;">Run “Future You”</a></td>
        </tr></table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:18px 28px;">
        <div style="font-size:12px;color:${C.sub};line-height:1.6;">
          You're getting this weekly update because you're a Calqulate Vitals member.
          <a href="${prefsUrl}" style="color:${C.brand};">Manage email preferences</a>.<br/>
          Educational decision-support only — not medical advice. Questions? <a href="mailto:meet.akabari@calqulate.net" style="color:${C.brand};">meet.akabari@calqulate.net</a><br/>
          © Calqulate.net
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}
