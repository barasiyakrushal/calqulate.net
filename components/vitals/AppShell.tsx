"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export interface AppShellProps {
  tier: string;
  isAdmin: boolean;
  email?: string | null;
  children: React.ReactNode;
}

export function AppShell({ tier, isAdmin, email, children }: AppShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Mobile top bar (hidden once the persistent rail appears at md) */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/dashboard" className="text-base font-bold text-gray-900">
          Calqulate <span className="text-emerald-600">Vitals</span>
        </Link>
      </div>

      <div className="md:flex md:min-h-screen">
        {/* Persistent rail (md = icon rail, lg = full sidebar) */}
        <Sidebar variant="rail" tier={tier} isAdmin={isAdmin} email={email} />

        {/* Mobile slide-in drawer + dim overlay */}
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 md:hidden ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          aria-hidden={!open}
          className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform shadow-xl transition-transform duration-200 ease-out md:hidden ${
            open ? "translate-x-0" : "pointer-events-none -translate-x-full"
          }`}
        >
          <Sidebar
            variant="drawer"
            tier={tier}
            isAdmin={isAdmin}
            email={email}
            onNavigate={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        </div>

        {/* Main content — flows with the page; the rail stays visible via position:sticky */}
        <main id="main" className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
