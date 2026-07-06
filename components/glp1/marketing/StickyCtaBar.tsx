"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Mobile-only sticky CTA bar — a thumb-reachable "Start free" that follows the
 * user after they scroll past the hero, then hides near the footer so it never
 * covers the final CTA. A high-intent conversion lever on small screens.
 */
export function StickyCtaBar({ hidePremium, loggedIn }: { hidePremium?: boolean; loggedIn?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolledPastHero = window.scrollY > 620;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 140;
      setShow(scrolledPastHero && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-transform duration-300 lg:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div
        className="mx-3 mb-3 flex items-center gap-2 rounded-2xl border border-line bg-white/95 p-2 shadow-[0_-6px_28px_rgba(15,23,42,.16)] backdrop-blur"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <Link
          href={hidePremium || loggedIn ? "/dashboard/glp1" : "/signup?next=/dashboard/glp1"}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          {hidePremium ? "Go to dashboard" : "Start free"} <ArrowRight className="h-4 w-4" />
        </Link>
        {!hidePremium && (
          <a
            href="#pricing"
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-gold-light to-gold px-4 py-3 text-sm font-bold text-gold-ink"
          >
            Go Premium
          </a>
        )}
      </div>
    </div>
  );
}
