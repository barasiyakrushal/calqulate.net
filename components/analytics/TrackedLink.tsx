"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics/track";

/**
 * A next/link that reports a `cta_click` with the page it was clicked from.
 * This is what answers "which calculator actually drives signups?" — the
 * question the funnel could not answer before.
 */
export function TrackedLink({
  href,
  ctaId,
  label,
  className,
  children,
  ...rest
}: {
  href: string;
  /** Stable id for this CTA, e.g. "service_cta", "header_start_free". */
  ctaId: string;
  /** Human-readable button text, for reading reports at a glance. */
  label?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        track("cta_click", {
          cta_id: ctaId,
          cta_label: label,
          source_page: pathname,
          destination: href,
        })
      }
      {...rest}
    >
      {children}
    </Link>
  );
}
