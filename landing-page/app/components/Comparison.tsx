import React from "react";
import { Check, X } from "lucide-react";

export default function Comparison() {
  const sastFeatures = [
    { text: "Scans code", active: false },
    { text: "Finds patterns", active: false },
    { text: "Cannot see runtime values", active: false },
    { text: "Misses generated secrets", active: false },
    { text: "Cannot stop exfiltration", active: false },
    { text: "Needs source access", active: false },
  ];

  const envtrapFeatures = [
    { text: "Runtime visibility", active: true },
    { text: "Intercepts live traffic", active: true },
    { text: "Detects generated secrets", active: true },
    { text: "Blocks exfiltration", active: true },
    { text: "Works without source access", active: true },
    { text: "Zero configuration", active: true },
  ];

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Decorative subtle gradient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
        {/* VS Divider for desktop */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 items-center justify-center text-xs font-bold text-slate-500 select-none z-10">
          VS
        </div>

        {/* Static Analysis Column */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Static Analysis (SAST)
            </h4>
            <div className="h-0.5 w-12 bg-rose-500/50" />
          </div>

          <ul className="space-y-4">
            {sastFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 shrink-0">
                  <X size={12} className="stroke-[3]" />
                </div>
                <span className="text-sm font-medium">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider for mobile */}
        <div className="flex md:hidden items-center justify-center gap-4 py-2">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">VS</span>
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
        </div>

        {/* envtrap Column */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              envtrap
            </h4>
            <div className="h-0.5 w-12 bg-indigo-500" />
          </div>

          <ul className="space-y-4">
            {envtrapFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-800 dark:text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 shrink-0">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <span className="text-sm font-semibold">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
