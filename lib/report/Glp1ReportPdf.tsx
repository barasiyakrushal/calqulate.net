import React from "react";
import { Document, Page, Text, View, StyleSheet, Svg, Polyline, Line as SvgLine } from "@react-pdf/renderer";

/**
 * Doctor-shareable GLP-1 clinical report.
 *
 * Five sections built for a physician to grasp status in seconds, then drill in:
 *   1. Patient & treatment snapshot
 *   2. Executive summary & clinical flags (low-responder / excessive-loss / plateau / muscle-loss)
 *   3. Detailed progress & analytics (body comp, trend, labs, PK, adherence, benchmark, symptoms)
 *   4. Actionable insights (correlation levers, dosing sweet-spot, next-levers, maintenance)
 *   5. Summary & action plan (impression + physician notes space + next review)
 *
 * All figures are estimates for decision-support — the disclaimer is repeated in the footer.
 */

export type FlagLevel = "ok" | "watch" | "alert";
export interface ReportFlag {
  level: FlagLevel;
  label: string; // short badge, e.g. "Plateau detected"
  detail?: string; // one-line explanation
}

export interface Glp1ReportSummary {
  // ── Section 1 ──
  patientName: string | null;
  patientEmail: string;
  clinician: string | null;
  generatedAt: string; // ISO
  medication: {
    name: string;
    compound: string;
    currentDoseMg: number | null;
    startDate: string;
    weeksOnTherapy: number;
    doseIntervalDays: number;
  } | null;

  // ── Section 2 ──
  metabolicScore: { score: number; grade: string } | null;
  weight: { baselineLb: number; currentLb: number; changeLb: number; changePct: number } | null;
  bmi: { value: number; category: string } | null;
  responseFlag: ReportFlag | null;
  plateauFlag: ReportFlag | null;
  muscleFlag: ReportFlag | null;

  // ── Section 3 ──
  bodyComp: { fatMassLb: number; leanMassLb: number; bodyFatPct: number; waistToHeight: number | null; leanLossPct: number | null; message: string | null } | null;
  weightTrend: { t: number; lb: number }[]; // for the mini line chart
  trialBenchmark: { trial: string; dose: string; expectedPct: number; actualPct: number; status: string; message: string } | null;
  labs: { label: string; value: string }[];
  medicationLevelPct: number | null;
  adherence: {
    dosesLast30: number;
    expectedDosesLast30: number;
    missedApprox: number;
    resistanceSessionsLast30: number;
    siteRotation: { site: string; count: number }[];
    symptomDaysLast30: number;
    noSymptomDaysLast30: number;
  };
  symptoms: { type: string; count: number; avgSeverity: number | null }[];
  todayForecast: { phaseLabel: string; dayOfCycle: number; cycleLengthDays: number; metrics: { label: string; value: string }[] } | null;

  // ── Section 4 ──
  correlations: { label: string; message: string; favorable: boolean }[];
  sweetSpot: { doseMg: number; message: string } | null;
  nextLevers: { label: string; change: string; action: string }[];
  maintenanceOutlook: { projectedLb: number | null; note: string } | null;

  // ── Section 5 ──
  clinicalImpression: string;
  nextReviewSuggestion: string;
  proteinTarget: { minG: number; maxG: number } | null;
}

// ── styles ──────────────────────────────────────────────────────────────────
const C = {
  ink: "#1f2937", brand: "#065F46", brandMid: "#059669", muted: "#6b7280", faint: "#9ca3af", line: "#e5e7eb",
  okBg: "#ECFDF5", okFg: "#065F46", watchBg: "#FEF3C7", watchFg: "#92400E", alertBg: "#FEE2E2", alertFg: "#991B1B",
};
const s = StyleSheet.create({
  page: { padding: 36, paddingBottom: 54, fontSize: 10, fontFamily: "Helvetica", color: C.ink },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.brand },
  headerSub: { color: C.muted, fontSize: 9, marginTop: 2 },
  headerRule: { borderBottom: `2px solid ${C.brand}`, marginTop: 8, marginBottom: 4 },

  sectionTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.brand, marginTop: 16, marginBottom: 6 },
  sectionNo: { color: C.brandMid },

  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, borderBottom: `1px solid ${C.line}` },
  k: { color: C.muted, flex: 1 },
  v: { fontFamily: "Helvetica-Bold", textAlign: "right" },

  // 2-col grid of flag cards
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  card: { width: "50%", padding: 4 },
  cardInner: { borderRadius: 6, padding: 10, border: `1px solid ${C.line}` },
  cardLabel: { fontSize: 8, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  cardValue: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 2 },

  pill: { alignSelf: "flex-start", borderRadius: 10, paddingVertical: 2, paddingHorizontal: 7, marginTop: 5 },
  pillText: { fontSize: 8, fontFamily: "Helvetica-Bold" },

  note: { fontSize: 9, color: "#374151", marginTop: 3, lineHeight: 1.4 },
  bullet: { flexDirection: "row", marginTop: 4 },
  bulletDot: { width: 10, color: C.brandMid, fontFamily: "Helvetica-Bold" },
  bulletBody: { flex: 1 },
  bulletHead: { fontFamily: "Helvetica-Bold" },

  notesLine: { borderBottom: `1px solid ${C.line}`, height: 18 },
  disclaimer: { marginTop: 22, fontSize: 8, color: C.faint, borderTop: `1px solid ${C.line}`, paddingTop: 8, lineHeight: 1.45 },
});

function pillStyle(level: FlagLevel) {
  if (level === "alert") return { bg: C.alertBg, fg: C.alertFg };
  if (level === "watch") return { bg: C.watchBg, fg: C.watchFg };
  return { bg: C.okBg, fg: C.okFg };
}

function SectionTitle({ no, children }: { no: number; children: React.ReactNode }) {
  return (
    <Text style={s.sectionTitle}>
      <Text style={s.sectionNo}>{no}. </Text>
      {children}
    </Text>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.row}>
      <Text style={s.k}>{k}</Text>
      <Text style={s.v}>{v}</Text>
    </View>
  );
}

function Flag({ flag }: { flag: ReportFlag }) {
  const p = pillStyle(flag.level);
  return (
    <View style={[s.pill, { backgroundColor: p.bg }]}>
      <Text style={[s.pillText, { color: p.fg }]}>{flag.label}</Text>
    </View>
  );
}

function FlagCard({ label, value, flag, sub }: { label: string; value: string; flag?: ReportFlag | null; sub?: string }) {
  const border = flag ? pillStyle(flag.level).fg : C.line;
  return (
    <View style={s.card}>
      <View style={[s.cardInner, { borderColor: border, borderLeftWidth: 3 }]}>
        <Text style={s.cardLabel}>{label}</Text>
        <Text style={s.cardValue}>{value}</Text>
        {flag && <Flag flag={flag} />}
        {flag?.detail ? <Text style={s.note}>{flag.detail}</Text> : sub ? <Text style={s.note}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function Bullet({ head, body }: { head: string; body: string }) {
  return (
    <View style={s.bullet} wrap={false}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletBody}>
        <Text style={s.bulletHead}>{head} </Text>
        {body}
      </Text>
    </View>
  );
}

/** Minimal weight-trend line chart (react-pdf SVG). */
function WeightChart({ points }: { points: { t: number; lb: number }[] }) {
  if (points.length < 2) return null;
  const W = 520, H = 130, pad = 22;
  const xs = points.map((p) => p.t);
  const ys = points.map((p) => p.lb);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = maxX - minX || 1, spanY = maxY - minY || 1;
  const px = (t: number) => pad + ((t - minX) / spanX) * (W - pad * 2);
  const py = (lb: number) => pad + (1 - (lb - minY) / spanY) * (H - pad * 2);
  const poly = points.map((p) => `${px(p.t).toFixed(1)},${py(p.lb).toFixed(1)}`).join(" ");
  const startLb = points[0].lb, endLb = points[points.length - 1].lb;
  return (
    <View>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <SvgLine x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={C.line} strokeWidth={1} />
        <SvgLine x1={pad} y1={pad} x2={pad} y2={H - pad} stroke={C.line} strokeWidth={1} />
        <Polyline points={poly} fill="none" stroke={C.brandMid} strokeWidth={2} />
      </Svg>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: -2 }}>
        <Text style={{ fontSize: 8, color: C.faint }}>Start {startLb} lb</Text>
        <Text style={{ fontSize: 8, color: C.faint }}>Range {minY.toFixed(0)}–{maxY.toFixed(0)} lb</Text>
        <Text style={{ fontSize: 8, color: C.faint }}>Latest {endLb} lb</Text>
      </View>
    </View>
  );
}

const d = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export function Glp1ReportPdf({ summary: m }: { summary: Glp1ReportSummary }) {
  const flags = [m.responseFlag, m.plateauFlag, m.muscleFlag].filter(Boolean) as ReportFlag[];
  const alertCount = flags.filter((f) => f.level === "alert").length;

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {/* Header */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <Text style={s.brand}>Calqulate Vitals</Text>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: C.muted }}>GLP-1 Clinical Progress Report</Text>
          </View>
          <View style={s.headerRule} />
        </View>

        {/* ── Section 1: Patient & treatment snapshot ── */}
        <SectionTitle no={1}>Patient &amp; Treatment Snapshot</SectionTitle>
        <KV k="Patient" v={m.patientName || m.patientEmail || "—"} />
        {m.patientName && m.patientEmail ? <KV k="Account" v={m.patientEmail} /> : null}
        <KV k="Report date" v={d(m.generatedAt)} />
        {m.medication ? (
          <>
            <KV k="Medication & dose" v={`${m.medication.name}${m.medication.currentDoseMg != null ? ` · ${m.medication.currentDoseMg} mg` : ""}${m.medication.doseIntervalDays ? ` every ${m.medication.doseIntervalDays}d` : ""}`} />
            <KV k="Treatment start" v={`${d(m.medication.startDate)} · ${m.medication.weeksOnTherapy} weeks on therapy`} />
          </>
        ) : (
          <KV k="Medication" v="No active medication logged" />
        )}
        <KV k="Prescribing clinician" v={m.clinician || "—"} />

        {/* ── Section 2: Executive summary & clinical flags ── */}
        <SectionTitle no={2}>Executive Summary &amp; Clinical Flags</SectionTitle>
        {alertCount > 0 ? (
          <View style={[s.pill, { backgroundColor: C.alertBg, marginTop: 0, marginBottom: 4 }]}>
            <Text style={[s.pillText, { color: C.alertFg }]}>{alertCount} item(s) flagged for review</Text>
          </View>
        ) : null}
        <View style={s.grid}>
          <FlagCard
            label="Metabolic health score"
            value={m.metabolicScore ? `${m.metabolicScore.score} (${m.metabolicScore.grade})` : "—"}
            sub={m.metabolicScore ? "Composite of body, labs & risk" : "No metabolic measurement on file"}
          />
          <FlagCard
            label="Total weight change"
            value={m.weight ? `${m.weight.changeLb >= 0 ? "-" : "+"}${Math.abs(m.weight.changeLb)} lb (${m.weight.changePct >= 0 ? "-" : "+"}${Math.abs(m.weight.changePct)}%)` : "—"}
            flag={m.responseFlag}
          />
          <FlagCard
            label="Current BMI"
            value={m.bmi ? `${m.bmi.value} · ${m.bmi.category}` : "—"}
            sub={m.bmi ? "Track against goal" : "Add height in a metabolic measurement"}
          />
          <FlagCard
            label="GLP-1 response status"
            value={m.plateauFlag ? statusToValue(m.plateauFlag) : "—"}
            flag={m.plateauFlag}
          />
          <FlagCard
            label="Muscle-mass preservation"
            value={m.muscleFlag ? statusToValue(m.muscleFlag) : "—"}
            flag={m.muscleFlag}
          />
          <FlagCard
            label="Estimated medication level"
            value={m.medicationLevelPct != null ? `${m.medicationLevelPct}%` : "—"}
            sub="of recent peak (PK model)"
          />
        </View>

        {/* ── Section 3: Detailed progress & analytics ── */}
        <SectionTitle no={3}>Detailed Progress &amp; Analytics</SectionTitle>

        <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Weight trajectory</Text>
        <WeightChart points={m.weightTrend} />
        {m.weight && (
          <KV k="Baseline to current" v={`${m.weight.baselineLb} lb to ${m.weight.currentLb} lb`} />
        )}

        {m.bodyComp && (
          <>
            <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 }}>Body composition</Text>
            <KV k="Body fat" v={`${m.bodyComp.bodyFatPct}%`} />
            <KV k="Fat mass / lean mass" v={`${m.bodyComp.fatMassLb} lb / ${m.bodyComp.leanMassLb} lb`} />
            {m.bodyComp.waistToHeight != null && <KV k="Waist-to-height ratio" v={m.bodyComp.waistToHeight.toFixed(2)} />}
            {m.bodyComp.leanLossPct != null && <KV k="Share of loss that is lean mass" v={`${m.bodyComp.leanLossPct}%`} />}
            {m.bodyComp.message && <Text style={s.note}>{m.bodyComp.message}</Text>}
          </>
        )}

        {m.labs.length > 0 && (
          <>
            <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 }}>Metabolic labs (latest)</Text>
            {m.labs.map((l, i) => <KV key={i} k={l.label} v={l.value} />)}
          </>
        )}

        {m.trialBenchmark && (
          <>
            <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 }}>Clinical-study benchmark</Text>
            <KV k={`${m.trialBenchmark.trial} (${m.trialBenchmark.dose})`} v={m.trialBenchmark.status.replace("-", " ")} />
            <KV k="Expected vs actual loss" v={`${m.trialBenchmark.expectedPct}% expected · ${m.trialBenchmark.actualPct}% actual`} />
            <Text style={s.note}>{m.trialBenchmark.message}</Text>
          </>
        )}

        <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 }}>Medication adherence (last 30 days)</Text>
        <KV k="Doses logged (of ~expected)" v={`${m.adherence.dosesLast30} of ~${m.adherence.expectedDosesLast30}${m.adherence.missedApprox > 0 ? ` · ~${m.adherence.missedApprox} missed` : ""}`} />
        <KV k="Resistance-training sessions" v={String(m.adherence.resistanceSessionsLast30)} />
        {m.adherence.siteRotation.length > 0 && (
          <KV k="Injection-site rotation" v={m.adherence.siteRotation.map((r) => `${r.site.replace(/-/g, " ")} ×${r.count}`).join(", ")} />
        )}

        {m.symptoms.length > 0 && (
          <>
            <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 }}>Symptoms & side effects (last 30 days)</Text>
            {m.symptoms.map((sy, i) => (
              <KV key={i} k={sy.type.replace(/-/g, " ")} v={`${sy.count} day(s)${sy.avgSeverity != null ? ` · avg severity ${sy.avgSeverity}/5` : ""}`} />
            ))}
            <KV k="Symptom-free days logged" v={String(m.adherence.noSymptomDaysLast30)} />
          </>
        )}

        {m.todayForecast && (
          <>
            <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 }}>Patient-experience forecast (today)</Text>
            <KV k="Cycle position" v={`Day ${m.todayForecast.dayOfCycle} of ${m.todayForecast.cycleLengthDays} · ${m.todayForecast.phaseLabel}`} />
            {m.todayForecast.metrics.map((mt, i) => <KV key={i} k={mt.label} v={mt.value} />)}
          </>
        )}

        {/* ── Section 4: Actionable insights ── */}
        <SectionTitle no={4}>Actionable Insights &amp; Recommendations</SectionTitle>

        {m.correlations.length > 0 && (
          <>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>Dose-optimization signals (patient&apos;s own data)</Text>
            {m.correlations.map((c, i) => <Bullet key={i} head={`${c.label}:`} body={c.message} />)}
          </>
        )}

        {m.sweetSpot && (
          <View style={{ marginTop: 8 }}>
            <Bullet head={`Dosing sweet-spot (${m.sweetSpot.doseMg} mg):`} body={m.sweetSpot.message} />
          </View>
        )}

        {m.nextLevers.length > 0 && (
          <>
            <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 2 }}>Highest-impact levers (simulated on patient&apos;s numbers)</Text>
            {m.nextLevers.map((l, i) => <Bullet key={i} head={`${l.label}:`} body={`${l.change}. ${l.action}`} />)}
          </>
        )}

        {m.maintenanceOutlook && (
          <View style={{ marginTop: 8 }}>
            <Bullet head="Long-term maintenance:" body={m.maintenanceOutlook.note} />
          </View>
        )}

        {m.proteinTarget && (
          <View style={{ marginTop: 8 }}>
            <Bullet head="Muscle-preservation target:" body={`${m.proteinTarget.minG}–${m.proteinTarget.maxG} g protein/day plus resistance training during the deficit.`} />
          </View>
        )}

        {/* ── Section 5: Summary & action plan ── */}
        <SectionTitle no={5}>Summary &amp; Action Plan</SectionTitle>
        <KV k="Overall clinical impression" v={m.clinicalImpression} />
        <KV k="Suggested next review" v={m.nextReviewSuggestion} />
        <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 4 }}>Recommended next steps (physician notes)</Text>
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={s.notesLine} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
          <Text style={{ fontSize: 9, color: C.muted }}>Clinician signature: ______________________________</Text>
          <Text style={{ fontSize: 9, color: C.muted }}>Date: ________________</Text>
        </View>

        {/* Disclaimer (guaranteed in-flow so it always renders) */}
        <Text style={s.disclaimer}>
          Generated by Calqulate Vitals on {d(m.generatedAt)} for educational decision-support — not medical advice, diagnosis or
          treatment. Trial benchmarks are published means for the highest maintenance dose; body-composition, PK, projection and
          correlation figures are estimates, and correlation is not causation. Injection-site and dosing observations describe the
          patient&apos;s own logged history, not recommendations. Confirm all clinical decisions with the prescriber.
        </Text>

        {/* Short page marker, repeated per page */}
        <Text
          style={{ position: "absolute", bottom: 18, right: 36, fontSize: 7.5, color: C.faint }}
          fixed
          render={({ pageNumber, totalPages }) => `Calqulate Vitals · ${pageNumber}/${totalPages}`}
        />
      </Page>
    </Document>
  );
}

function statusToValue(flag: ReportFlag): string {
  return flag.label;
}
