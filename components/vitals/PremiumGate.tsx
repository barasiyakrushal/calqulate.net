import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";

const upgradeHref = (feature: string) => `/pricing?feature=${encodeURIComponent(feature)}`;

/**
 * Wraps a premium dashboard feature. When `locked` (free user), it replaces the
 * feature with a lock card — or, with `blur`, shows a teasing blurred preview of
 * the real content behind a lock overlay. The CTA always routes to /pricing with
 * the feature name so the pricing page can say exactly what needs unlocking.
 */
export function PremiumGate({
  locked,
  feature,
  description,
  children,
  blur = false,
  className = "",
}: {
  locked: boolean;
  feature: string;
  description?: string;
  children?: React.ReactNode;
  /** Render children blurred behind the lock instead of hiding them. */
  blur?: boolean;
  className?: string;
}) {
  if (!locked) return <>{children}</>;

  const card = (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 text-center sm:p-8">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
          <Sparkles className="h-3 w-3" /> Premium
        </div>
        <h3 className="mt-2 text-base font-bold text-gray-900">{feature}</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">
          {description ?? "This is a Calqulate Vitals member feature."} You’ll need an active subscription to access it.
        </p>
      </div>
      <Link
        href={upgradeHref(feature)}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Unlock with Premium <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );

  if (blur && children) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <div aria-hidden className="pointer-events-none select-none blur-[6px] saturate-50 opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 grid place-items-center bg-white/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md">{card}</div>
        </div>
      </div>
    );
  }

  return <div className={className}>{card}</div>;
}

/** Small inline lock pill for card headers / list rows. Links to pricing. */
export function LockBadge({ feature, className = "" }: { feature: string; className?: string }) {
  return (
    <Link
      href={upgradeHref(feature)}
      title={`${feature} — unlock with Premium`}
      className={`inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 hover:bg-amber-200 ${className}`}
    >
      <Lock className="h-3 w-3" /> Premium
    </Link>
  );
}
