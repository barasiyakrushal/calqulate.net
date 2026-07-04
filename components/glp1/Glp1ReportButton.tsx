"use client";

import { useState } from "react";
import { FileText, Loader2, X } from "lucide-react";

/** Downloads the doctor-shareable GLP-1 clinical report, with optional patient/clinician context. */
export function Glp1ReportButton({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [clinician, setClinician] = useState("");

  async function download() {
    setBusy(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (name.trim()) qs.set("name", name.trim());
      if (clinician.trim()) qs.set("clinician", clinician.trim());
      const res = await fetch(`/api/glp1/report${qs.toString() ? `?${qs}` : ""}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? "Could not generate report.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "calqulate-glp1-clinical-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => (enabled ? setOpen((o) => !o) : undefined)}
        disabled={!enabled}
        title={enabled ? "" : "Available with Calqulate Vitals"}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        <FileText className="h-4 w-4" />
        Doctor PDF
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Doctor clinical report</h3>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-0.5 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Optional — add context for the header. Left blank, we use your account email. Nothing you type here is stored.
          </p>

          <label htmlFor="rep-name" className="mt-3 block text-xs font-medium text-gray-600">Patient name</label>
          <input
            id="rep-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />

          <label htmlFor="rep-clin" className="mt-3 block text-xs font-medium text-gray-600">Prescribing clinician</label>
          <input
            id="rep-clin"
            value={clinician}
            onChange={(e) => setClinician(e.target.value)}
            placeholder="e.g. Dr. Smith"
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />

          <button
            onClick={download}
            disabled={busy}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {busy ? "Generating…" : "Generate PDF"}
          </button>
          {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
        </div>
      )}
    </div>
  );
}
