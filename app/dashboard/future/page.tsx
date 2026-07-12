import Link from "next/link";
import { getAccess, hasPaidAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Paywall } from "@/components/vitals/Paywall";
import { SimulationRunner } from "@/components/health/SimulationRunner";
import type { HistoryPoint } from "@/lib/simulationEngine";
import type { VitalsReport } from "@/types/vitals";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FuturePage() {
  const access = await getAccess();
  const paid = hasPaidAccess(access);

  if (!paid) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Future You: see where this is heading</h1>
        <Paywall feature="the Future You simulator" />
      </div>
    );
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("risk_results")
    .select("composite_score,heart_age,report_json,computed_at")
    .eq("user_id", access.userId!)
    .order("computed_at", { ascending: true });

  const history: HistoryPoint[] = (rows ?? []).map((r: any) => ({
    date: r.computed_at,
    weightKg: (r.report_json as VitalsReport | null)?.input?.weightKg ?? null,
    metabolicScore: r.composite_score,
    heartAge: r.heart_age,
  }));

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-gray-950 px-4 py-8 text-gray-100 lg:-mx-0 lg:rounded-3xl lg:px-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300">
        <ArrowLeft className="h-4 w-4" /> Mission control
      </Link>

      <div className="mt-4 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500">First-principles forecasting</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white md:text-4xl">Future You</h1>
        <p className="mt-2 max-w-2xl text-gray-400">
          Model your biological trajectory. Set a goal, run a Monte-Carlo simulation across optimistic, realistic and
          pessimistic adherence, and see the most-likely version of you — with honest confidence bands, not hype.
        </p>
      </div>

      {history.filter((h) => h.metabolicScore != null).length < 2 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-gray-400">
          You need at least two saved measurements to project a trajectory. Add measurements on your{" "}
          <Link href="/dashboard" className="text-emerald-400 underline">dashboard</Link>, or seed demo data from the admin Dev Tools.
        </div>
      ) : (
        <SimulationRunner history={history} />
      )}

      <p className="mt-8 text-xs text-gray-600">
        Educational decision-support only — not medical advice. Projections are statistical models of your own data, not guarantees.
      </p>
    </div>
  );
}
