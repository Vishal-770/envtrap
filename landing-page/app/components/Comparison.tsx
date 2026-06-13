import React from "react";
import { Check, X } from "lucide-react";

export default function Comparison() {
  const sastFeatures = [
    { text: "Scans code statically", active: false },
    { text: "Finds static patterns only", active: false },
    { text: "Cannot see live runtime values", active: false },
    { text: "Misses dynamically generated secrets", active: false },
    { text: "Cannot prevent or block exfiltration", active: false },
    { text: "Requires repository access", active: false },
  ];

  const envtrapFeatures = [
    { text: "Full runtime execution visibility", active: true },
    { text: "Intercepts live network/DNS/stdout traffic", active: true },
    { text: "Detects dynamically generated secrets", active: true },
    { text: "Blocks exfiltration at execution time", active: true },
    { text: "Works zero-config without source access", active: true },
    { text: "Zero environment/telemetry leakage", active: true },
  ];

  return (
    <div className="w-full bg-zinc-955 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative background gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
        {/* VS Divider for desktop */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center text-[10px] font-extrabold text-zinc-400 select-none z-10 shadow-lg">
          VS
        </div>

        {/* Static Analysis Column */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Static Analysis (SAST)
            </h4>
            <div className="h-0.5 w-12 bg-rose-500/50" />
          </div>

          <ul className="space-y-4">
            {sastFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-zinc-400">
                <div className="w-5 h-5 rounded-full bg-rose-950/30 border border-rose-900/20 flex items-center justify-center text-rose-400 shrink-0">
                  <X size={11} className="stroke-[3]" />
                </div>
                <span className="text-xs font-semibold">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider for mobile */}
        <div className="flex lg:hidden items-center justify-center gap-4 py-2">
          <div className="h-px bg-zinc-850 flex-1" />
          <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest px-2">VS</span>
          <div className="h-px bg-zinc-850 flex-1" />
        </div>

        {/* envtrap Column */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              envtrap Runtime Shield
            </h4>
            <div className="h-0.5 w-12 bg-indigo-500" />
          </div>

          <ul className="space-y-4">
            {envtrapFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-zinc-150">
                <div className="w-5 h-5 rounded-full bg-emerald-950/40 border border-emerald-900/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.1)]">
                  <Check size={11} className="stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-zinc-200">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
