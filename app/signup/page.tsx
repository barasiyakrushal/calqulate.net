import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/auth/AuthForm";
import { SignupSocialProof } from "@/components/auth/SignupSocialProof";
import { SIGNUP_SOCIAL } from "@/lib/social-proof";
import { ShieldCheck, TrendingUp, Syringe, Star, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Create your account | Calqulate",
  description:
    "Create a free Calqulate account to track your GLP-1 journey — weight, injections, side effects, and progress — with validated clinical models.",
  robots: { index: false },
};

// Bottom stat row: shows REAL figures when set, otherwise truthful capability
// cards (never invented numbers) so the layout stays premium either way.
const realStats = [
  { icon: TrendingUp, value: SIGNUP_SOCIAL.healthLogsSaved, label: "Health logs saved" },
  { icon: Syringe, value: SIGNUP_SOCIAL.remindersSent, label: "Injection reminders sent" },
  { icon: Star, value: SIGNUP_SOCIAL.rating, label: "Average rating" },
].filter((s) => s.value);

const capabilityCards = [
  { icon: TrendingUp, title: "Weekly", sub: "Progress tracking" },
  { icon: Syringe, title: "Dose", sub: "Reminders built in" },
  { icon: Lock, title: "Private", sub: "Encrypted & yours" },
];

export default function SignupPage() {
  const showRealStats = realStats.length === 3;

  return (
    <main
      id="main"
      className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-white px-4 pt-8 pb-[calc(env(safe-area-inset-bottom)+2rem)]"
    >
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center pt-2">
          <Link href="/" aria-label="Calqulate — Home">
            <Image
              src="/calqulate-wordmark.png"
              alt="Calqulate"
              width={654}
              height={167}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Title + subtitle */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your free account</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            The private home for your GLP-1 journey — weight, injections, side effects, and progress, all in one
            place.
          </p>
        </div>

        {/* Premium social-proof card (data-gated, honest) */}
        <SignupSocialProof />

        {/* Auth form — Google + email/password + green CTA */}
        <Suspense
          fallback={
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-12 animate-pulse rounded bg-gray-200" />
            </div>
          }
        >
          <AuthForm mode="signup" ctaLabel="Start my free GLP-1 journey" />
        </Suspense>

        {/* Trust row (truthful capability claims) */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12.5px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-600" /> Private & encrypted
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> Track progress over time
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Syringe className="h-3.5 w-3.5 text-emerald-600" /> Injection reminders included
          </span>
        </div>

        {/* Fine print */}
        <p className="text-center text-xs text-slate-400">Always free to start · No credit card required</p>

        {/* Bottom stat row — real numbers if set, else truthful capability cards */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {(showRealStats ? realStats : capabilityCards).map((s, i) => {
            const Icon = s.icon;
            const value = "value" in s ? s.value : (s as { title: string }).title;
            const label = "label" in s ? s.label : (s as { sub: string }).sub;
            return (
              <div
                key={i}
                className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-2 py-4 text-center shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
              >
                <Icon className="h-5 w-5 text-emerald-600" />
                <p className="mt-2 text-base font-extrabold text-slate-900">{value}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Reassurance */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          Your health data is never sold.
        </div>
      </div>
    </main>
  );
}
