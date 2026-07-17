import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { SignupSocialProof } from "@/components/auth/SignupSocialProof";

export const metadata: Metadata = {
  title: "Create your account | Calqulate",
  description: "Create a free Calqulate account to track your metabolic health, heart age, and diabetes risk with validated clinical models.",
  robots: { index: false },
};

export default function SignupPage() {
  return (
    <main id="main" className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50/80 via-white to-white px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl" />
      </div>
      <div className="relative w-full">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 group-hover:bg-emerald-700 transition-colors flex items-center justify-center shadow-sm">
              <svg className="h-[18px] w-[18px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Calqulate<span className="text-emerald-600">.NET</span>
            </span>
          </Link>
        </div>
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-center gap-8 lg:flex-row">
          <Suspense fallback={
            <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="mt-4 h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          }>
            <AuthForm mode="signup" />
          </Suspense>
          <SignupSocialProof />
        </div>
      </div>
    </main>
  );
}
