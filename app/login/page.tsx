import React from "react";
import { LoginForm } from "./LoginForm";
import { FileCheck2, ShieldCheck } from "lucide-react";
import { Squares } from "@/components/react-bits/Squares";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { ShinyText } from "@/components/react-bits/ShinyText";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60 overflow-hidden">
      {/* React Bits Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Squares
          direction="diagonal"
          speed={0.3}
          squareSize={48}
          borderColor="rgba(226, 232, 240, 0.7)"
          hoverFillColor="rgba(224, 231, 255, 0.5)"
        />
      </div>

      {/* Atmospheric radial gradient light for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.12),transparent)]"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header & Brand Emblem */}
        <div className="text-center mb-8">
          {/* Subtle Security / Portal Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-200/80 text-xs font-medium text-slate-700 shadow-xs mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">Workspace Portal</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-semibold">v1.0</span>
          </div>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-50 mb-4 transition-transform hover:scale-105 duration-300">
            <FileCheck2 className="w-7 h-7 stroke-[2.2]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            <ShinyText text="Task & Report Management" speed={4} />
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-normal">
            Sign in to access your role-specific dashboard
          </p>
        </div>

        {/* React Bits Spotlight Card Container */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.18)"
          className="bg-white/85 backdrop-blur-xl border-slate-200/80 shadow-2xl shadow-indigo-950/5 p-7 sm:p-9"
        >
          <LoginForm initialError={searchParams.error} />
        </SpotlightCard>

        {/* Trust & Enterprise Footnote */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Protected by Enterprise Role-Based Access Control</span>
        </div>
      </div>
    </div>
  );
}
