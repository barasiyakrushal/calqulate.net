import Link from "next/link";
import {
  Syringe, BellRing, Target, Scale, Utensils, Activity, LineChart, ArrowRight,
} from "lucide-react";
import { Reveal } from "./Reveal";

const FREE_FEATURES = [
  { icon: Syringe, title: "Shot & dose logging", desc: "Log every injection in one tap, with full history." },
  { icon: BellRing, title: "Smart dose reminders", desc: "Set your shot day; get a reminder + live countdown." },
  { icon: Target, title: "Injection-site rotation", desc: "A body map suggests your next site automatically." },
  { icon: Scale, title: "Weight tracking", desc: "Decimal-precise weight with a real trend line." },
  { icon: Utensils, title: "Food, protein & water", desc: "Protein-first logging built for a smaller appetite." },
  { icon: Activity, title: "Side-effect tracking", desc: "Severity scale — and a “no symptoms today” option." },
  { icon: LineChart, title: "Free medication-level curves", desc: "See active drug fall before your next dose." },
];

/**
 * Reusable promo for the free GLP-1 tracker. Used on the dose calculator page and
 * the service page's free section. Brand green, accessible, no dead clicks.
 */
export function FreeFeaturesPromo({
  heading = "Track every dose free with Calqulate Vitals",
  sub = "Your free GLP-1 tracker: log shots, food, weight and side effects in one place — and get medication-level curves other apps charge for.",
  className = "",
  loggedIn = false,
}: {
  heading?: string;
  sub?: string;
  className?: string;
  loggedIn?: boolean;
}) {
  return (
    <section className={`bg-surface py-12 sm:py-16 ${className}`}>
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
            Free GLP-1 Tracker
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{heading}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-copy sm:text-base">{sub}</p>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {FREE_FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 50}>
              <div className="group h-full rounded-2xl border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_24px_rgba(15,23,42,.08)]">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800">Free</span>
                </div>
                <h3 className="mt-3 text-[15px] font-bold text-ink">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-copy">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={loggedIn ? "/dashboard/glp1" : "/signup?next=/dashboard/glp1"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-md sm:w-auto"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/product/glp1-progress-tracker"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 sm:w-auto"
          >
            Explore the tracker
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
