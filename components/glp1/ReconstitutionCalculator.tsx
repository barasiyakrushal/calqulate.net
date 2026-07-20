"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, AlertTriangle } from "lucide-react";
import { reconstitution } from "@/lib/glp1/reconstitution";

/**
 * Compounded reconstitution calculator — converts a desired mg dose into the
 * insulin-syringe units to draw. Pure client-side math; nothing leaves the device.
 */
export function ReconstitutionCalculator() {
  const [vialMg, setVialMg] = useState("5");
  const [bacWaterMl, setBacWaterMl] = useState("2");
  const [doseMg, setDoseMg] = useState("0.25");

  const result = reconstitution({
    vialMg: Number(vialMg),
    bacWaterMl: Number(bacWaterMl),
    doseMg: Number(doseMg),
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-gray-900">Reconstitution calculator</h2>
      </div>
      <p className="mt-0.5 text-sm text-gray-500">For compounded vials — find the units to draw for your dose.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="rc-vial">Vial peptide (mg)</Label>
          <Input id="rc-vial" type="number" step="0.5" min="0" value={vialMg} onChange={(e) => setVialMg(e.target.value)} placeholder="e.g. 10" />
        </div>
        <div>
          <Label htmlFor="rc-water">BAC water (mL)</Label>
          <Input id="rc-water" type="number" step="0.5" min="0" value={bacWaterMl} onChange={(e) => setBacWaterMl(e.target.value)} placeholder="e.g. 2" />
        </div>
        <div>
          <Label htmlFor="rc-dose">Your dose (mg)</Label>
          <Input id="rc-dose" type="number" step="0.05" min="0" value={doseMg} onChange={(e) => setDoseMg(e.target.value)} placeholder="e.g. 0.5" />
        </div>
      </div>

      {result ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <div>
              <div className="text-3xl font-extrabold text-emerald-700">{result.drawUnitsRounded} units</div>
              <div className="text-xs text-gray-500">on a U-100 insulin syringe ({result.drawUnits} exact)</div>
            </div>
            <div className="text-sm text-gray-600">
              <div>Concentration: <span className="font-semibold">{result.concentrationMgPerMl} mg/mL</span></div>
              <div>Draw volume: <span className="font-semibold">{result.drawMl} mL</span></div>
              <div>Doses per vial: <span className="font-semibold">{result.dosesPerVial}</span> · {result.mcgPerUnit} mcg/unit</div>
            </div>
          </div>
          {result.warnings.map((w) => (
            <p key={w} className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {w}
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400">Enter positive values to calculate.</p>
      )}

      <p className="mt-3 text-xs text-gray-400">
        Educational math only — always follow your prescriber/pharmacist's instructions and verify before injecting.
      </p>
    </div>
  );
}
