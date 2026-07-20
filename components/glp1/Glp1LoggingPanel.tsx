"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, Loader2, AlertCircle } from "lucide-react";
import { QuickLog, medLabel, type MedicationOption } from "./QuickLog";
import { createRecord, ApiError } from "@/lib/glp1/client";

const COMPOUNDS = [
  { value: "semaglutide", label: "Semaglutide (Ozempic / Wegovy)" },
  { value: "tirzepatide", label: "Tirzepatide (Mounjaro / Zepbound)" },
  { value: "liraglutide", label: "Liraglutide (Saxenda / Victoza)" },
  { value: "dulaglutide", label: "Dulaglutide (Trulicity)" },
  { value: "retatrutide", label: "Retatrutide" },
];

const KINDS = [
  { value: "glp1", label: "GLP-1 medication" },
  { value: "peptide", label: "Peptide" },
  { value: "trt", label: "TRT / hormone" },
  { value: "other", label: "Other" },
];

/**
 * Client wrapper around medication management + QuickLog. Every durable save
 * triggers router.refresh(), so the server-rendered recent-entries list and the
 * medication-level summary update without a manual reload.
 */
export function Glp1LoggingPanel({ medications }: { medications: MedicationOption[] }) {
  const router = useRouter();
  const refresh = () => router.refresh();
  const [adding, setAdding] = useState(medications.length === 0);

  return (
    <div className="space-y-5">
      {medications.length === 0 || adding ? (
        <AddMedication
          onAdded={() => { setAdding(false); refresh(); }}
          onCancel={medications.length > 0 ? () => setAdding(false) : undefined}
        />
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
          <div className="text-sm text-gray-600">
            Tracking{" "}
            <span className="font-semibold text-gray-900">
              {medications.map(medLabel).join(", ")}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add medication
          </Button>
        </div>
      )}

      <QuickLog medications={medications} onSaved={refresh} />
    </div>
  );
}

function AddMedication({ onAdded, onCancel }: { onAdded: () => void; onCancel?: () => void }) {
  const [kind, setKind] = useState("glp1");
  const [compound, setCompound] = useState("semaglutide");
  const [customName, setCustomName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [intervalDays, setIntervalDays] = useState("7");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");
  const isGlp1 = kind === "glp1";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      await createRecord("medication", {
        kind,
        compound: isGlp1 ? compound : null,
        customName: isGlp1 ? null : customName.trim() || null,
        brandName: brandName.trim() || null,
        startDate,
        doseIntervalHours: Math.max(1, Number(intervalDays)) * 24,
      });
      onAdded();
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Could not save. Try again.");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-6">
      <h2 className="text-lg font-bold text-gray-900">Add your medication</h2>
      <p className="mt-0.5 text-sm text-gray-500">GLP-1 meds get the free medication-level curve and benchmark; peptides &amp; TRT are dose-tracked alongside.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="m-kind">Type</Label>
          <select id="m-kind" value={kind} onChange={(e) => setKind(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            {KINDS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
          </select>
        </div>
        {isGlp1 ? (
          <div>
            <Label htmlFor="m-compound">Compound</Label>
            <select id="m-compound" value={compound} onChange={(e) => setCompound(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              {COMPOUNDS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <Label htmlFor="m-custom">Name</Label>
            <Input id="m-custom" required value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. BPC-157, Testosterone cypionate" />
          </div>
        )}
        <div>
          <Label htmlFor="m-brand">Brand (optional)</Label>
          <Input id="m-brand" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="e.g. Zepbound" />
        </div>
        <div>
          <Label htmlFor="m-start">Start date</Label>
          <Input id="m-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="m-interval">Dose every (days)</Label>
          <Input id="m-interval" type="number" min="1" max="60" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} placeholder="e.g. 7" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"} className="bg-emerald-600 hover:bg-emerald-700">
          {status === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
          Save medication
        </Button>
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        {status === "error" && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4" /> {error}
          </span>
        )}
      </div>
    </form>
  );
}
