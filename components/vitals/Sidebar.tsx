"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Compass,
  History,
  Settings,
  Shield,
  Syringe,
  LogOut,
  X,
  Globe,
  BookOpen,
} from "lucide-react";
import { BillingButton } from "./BillingButton";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/glp1", label: "GLP-1 Tracker", icon: Syringe },
  { href: "/dashboard/future", label: "Future You", icon: TrendingUp },
  { href: "/dashboard/protocol", label: "Autopilot", icon: Compass },
  { href: "/dashboard/guide", label: "Help Guide", icon: BookOpen },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export interface SidebarProps {
  /** "rail" = persistent desktop/tablet column (icon rail at md, full at lg). "drawer" = full-width mobile drawer. */
  variant: "rail" | "drawer";
  tier: string;
  isAdmin: boolean;
  email?: string | null;
  /** Called when a nav item is activated (used to close the mobile drawer). */
  onNavigate?: () => void;
  /** Called when the drawer close button is pressed. */
  onClose?: () => void;
}

export function Sidebar({ variant, tier, isAdmin, email, onNavigate, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isDrawer = variant === "drawer";

  // Label visibility: drawer always shows labels; rail hides them at the md icon-rail
  // breakpoint and reveals them at lg.
  const labelCls = isDrawer ? "inline" : "hidden lg:inline";
  // Center icons in the collapsed md rail; left-align once labels are visible.
  const itemJustify = isDrawer ? "justify-start" : "md:justify-center lg:justify-start";
  // Shared visible keyboard focus ring for all interactive sidebar elements.
  const focusRing =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900";

  // Rail: the dark <aside> stretches to the full page height (flex stretch), while
  // the nav sits in a sticky, viewport-tall inner wrapper — so the dark column
  // always reaches the bottom (no white gap) and the nav stays pinned on scroll.
  const asideClasses = isDrawer
    ? "flex h-full w-full flex-col bg-gray-900 text-gray-300"
    : "hidden md:flex md:w-16 md:flex-col md:border-r md:border-gray-800 bg-gray-900 text-gray-300 lg:w-60";
  const innerClasses = isDrawer
    ? "flex h-full w-full flex-col"
    : "flex w-full flex-col md:sticky md:top-0 md:h-screen";

  return (
    <aside className={asideClasses}>
      <div className={innerClasses}>
      {/* Wordmark */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-800 px-4 py-4 lg:px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={`flex items-center gap-2 font-bold text-white ${itemJustify} w-full`}
          aria-label="Calqulate Vitals — Overview"
        >
          {/* Compact mark for the collapsed rail */}
          <span className={isDrawer ? "hidden" : "hidden md:inline lg:hidden"}>CV</span>
          <span className={isDrawer ? "inline" : "hidden lg:inline"}>
            Calqulate <span className="text-emerald-500">Vitals</span>
          </span>
        </Link>
        {isDrawer && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className={`-mr-1 flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white ${focusRing}`}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Back to main site */}
      <div className="border-b border-gray-800 px-2 pb-2 lg:px-3">
        <Link
          href="/"
          onClick={onNavigate}
          className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white ${focusRing} ${itemJustify}`}
          title="Back to Calqulate.net"
        >
          <Globe className="h-5 w-5 shrink-0" />
          <span className={labelCls}>Calqulate.net</span>
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 lg:px-3 lg:py-3">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${focusRing} ${itemJustify} ${
                active
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={labelCls}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom-pinned: PRO badge, Manage billing, Sign out (+ Admin for admins) */}
      <div className="mt-auto border-t border-gray-800 p-2 lg:px-3 lg:py-3">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            title="Admin"
            className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white ${focusRing} ${itemJustify}`}
          >
            <Shield className="h-5 w-5 shrink-0" />
            <span className={labelCls}>Admin</span>
          </Link>
        )}

        {/* PRO / tier badge */}
        <div className={`flex items-center px-3 py-2 ${itemJustify}`} title={`${tier} plan`}>
          <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            {tier}
          </span>
        </div>

        <BillingButton
          withIcon
          className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-60 ${focusRing} ${itemJustify}`}
          labelClassName={labelCls}
        />

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            title="Sign out"
            className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white ${focusRing} ${itemJustify}`}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={labelCls}>Sign out</span>
          </button>
        </form>

        {email && (
          <p className={`truncate px-3 pt-1 text-xs text-gray-500 ${isDrawer ? "block" : "hidden lg:block"}`}>
            {email}
          </p>
        )}
      </div>
      </div>
    </aside>
  );
}
