"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, FileText, FlaskConical,
  ScrollText, Settings, ExternalLink, Syringe, Bell,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/protocols", label: "GLP-1 Protocols", icon: Syringe },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/dev", label: "Dev Tools", icon: FlaskConical },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-gray-800 bg-gray-900 text-gray-300 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="px-5 py-4 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-white">
          Calqulate <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">Admin</span>
        </Link>
        {email && <p className="mt-1 truncate text-xs text-gray-500">{email}</p>}
      </div>

      <nav className="flex gap-1 overflow-x-auto p-2 lg:flex-1 lg:flex-col lg:overflow-visible">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-emerald-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-2 lg:block">
        <div className="flex gap-1 lg:flex-col">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">
            <ExternalLink className="h-4 w-4" /> <span className="hidden lg:inline">Back to site</span>
          </Link>
          <form action="/auth/signout" method="post">
            <button className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              <span className="hidden lg:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
