"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics/track";
import { CTA_HREF } from "@/lib/cta";

/**
 * The one brand CTA. Solid brand green (#16A34A), white text, arrow, subtle
 * shadow — identical everywhere so users learn green = continue = save progress.
 *
 *  variant="header" → compact 40px pill (14px radius) for the top bar
 *  variant="block"  → full-width 56px button (16px radius) for sticky/in-content
 */
export function PrimaryCTA({
  label,
  ctaId,
  variant = "header",
  className = "",
  onClick,
}: {
  label: string;
  ctaId: string;
  variant?: "header" | "block";
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();

  const base =
    "group inline-flex items-center justify-center gap-2 font-semibold text-white " +
    "bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] transition-colors " +
    "shadow-[0_8px_24px_rgba(22,163,74,0.18)] focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2";

  const sizing =
    variant === "header"
      ? "h-10 rounded-[14px] px-[18px] text-[13.5px] whitespace-nowrap"
      : "h-14 w-full rounded-2xl px-6 text-base";

  return (
    <Link
      href={CTA_HREF}
      onClick={() => {
        track("cta_click", {
          cta_id: ctaId,
          cta_label: label,
          source_page: pathname,
          destination: CTA_HREF,
        });
        onClick?.();
      }}
      className={`${base} ${sizing} ${className}`}
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default PrimaryCTA;
