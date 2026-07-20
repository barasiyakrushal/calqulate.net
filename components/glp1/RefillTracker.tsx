"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill, Check, Loader2, AlertCircle } from "lucide-react";
import { createRecord, ApiError } from "@/lib/glp1/client";
import { refillStatus } from "@/lib/glp1/refill";

export interface LatestRefill {
  filledDate: string;
  dosesSupplied: number;
  pharmacy: string | null;
  copayUsd: number | null;
  priorAuthStatus: string;
}

/**
 * Refill / pharmacy / cost tracking — projects remaining supply and flags when to
 * refill. No competitor offers this. Pure client-side status; durable add via API.
 */
export function RefillTracker({
  medication,
  latestRefill,
}: {
  medication: { id: string; name: string; doseIntervalHours: number } | null;
  latestRefill: LatestRefill | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filledDate, setFilledDate] = useState(new Date().toISOString().slice(0, 10));
  const [doses, setDoses] = useState("4");
  const [pharmacy, setPharmacy] = useState("");
  const [copay, setCopay] = useState("");
  const [priorAuth, setPriorAuth] = useState("none");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  if (!medication) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500">
        Add a medication to track refills and cost.
      </div>
    );
  }

  const supply =
    latestRefill && Date.parse(latestRefill.filledDate)
      ? refillStatus({
          filledAtMs: Date.parse(latestRefill.filledDate),
          dosesSupplied: latestRefill.dosesSupplied,
          doseIntervalHours: medication.doseIntervalHours,
          nowMs: Date.now(),
        })
      : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      await createRecord("refill", {
        medicationId: medication!.id,
        filledDate,
        dosesSupplied: Number(doses),
        pharmacy: pharmacy.trim() || null,
        copayUsd: copay ? Number(copay) : null,
        priorAuthStatus: priorAuth,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Could not save. Try again.");
    }
  }

  const stateTone =
    supply?.state === "overdue" ? "text-red-600" : supply?.state === "soon" ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <Pill className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <div className="text-sm font-semibold text-gray-900">Refills &amp; cost</div>
            {supply ? (
              <div className="text-xs text-gray-500">
                <span className={`font-semibold ${stateTone}`}>
                  {supply.state === "overdue" ? "Out of supply" : `${supply.daysRemaining} days left`}
                </span>{" "}
                · {supply.dosesRemaining} doses · refilled {new Date(latestRefill!.filledDate).toLocaleDateString()}
                {latestRefill!.copayUsd != null ? ` · $${latestRefill!.copayUsd} copay` : ""}
                {latestRefill!.priorAuthStatus !== "none" ? ` · PA ${latestRefill!.priorAuthStatus}` : ""}
              </div>
            ) : (
              <div className="text-xs text-gray-500">Log a fill to track supply, copay and prior-auth.</div>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Log refill"}</Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="rf-date">Date filled</Label>
              <Input id="rf-date" type="date" value={filledDate} onChange={(e) => setFilledDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="rf-doses">Doses supplied</Label>
              <Input id="rf-doses" type="number" min="1" value={doses} onChange={(e) => setDoses(e.target.value)} placeholder="e.g. 28" />
            </div>
            <div>
              <Label htmlFor="rf-pharm">Pharmacy (optional)</Label>
              <Input id="rf-pharm" value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} placeholder="e.g. CVS" />
            </div>
            <div>
              <Label htmlFor="rf-copay">Copay ($, optional)</Label>
              <Input id="rf-copay" type="number" step="0.01" min="0" value={copay} onChange={(e) => setCopay(e.target.value)} placeholder="25" />
            </div>
            <div>
              <Label htmlFor="rf-pa">Prior authorization</Label>
              <select id="rf-pa" value={priorAuth} onChange={(e) => setPriorAuth(e.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="none">Not needed</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={status === "saving"} className="bg-emerald-600 hover:bg-emerald-700">
              {status === "saving" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Save refill
            </Button>
            {status === "error" && <span className="inline-flex items-center gap-1 text-sm text-red-600"><AlertCircle className="h-4 w-4" /> {error}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
