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
    <div className="w-full bg-white border-3 border-[#121212] rounded-none p-6 md:p-8 shadow-[4px_4px_0px_#121212] relative overflow-hidden">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
        {/* VS Divider for desktop (Stark square) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-[#F0C020] border-3 border-[#121212] items-center justify-center text-[10px] font-black text-[#121212] select-none z-10 shadow-[2px_2px_0px_#121212]">
          VS
        </div>

        {/* Static Analysis Column */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="inline-block px-3 py-1.5 bg-[#D02020] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest">
              Static Analysis (SAST)
            </h4>
            <div className="h-1 bg-[#121212] w-12 mt-1.5" />
          </div>

          <ul className="space-y-4">
            {sastFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-[#121212]">
                <div className="w-6 h-6 bg-white border-2 border-[#121212] flex items-center justify-center text-rose-600 shrink-0">
                  <X size={12} className="stroke-[3.5]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider for mobile */}
        <div className="flex lg:hidden items-center justify-center gap-4 py-2">
          <div className="h-1 bg-[#121212] flex-1" />
          <span className="text-[10px] font-black text-[#121212] uppercase tracking-widest px-2">VS</span>
          <div className="h-1 bg-[#121212] flex-1" />
        </div>

        {/* envtrap Column */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h4 className="inline-block px-3 py-1.5 bg-[#1040C0] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest">
              envtrap Runtime Shield
            </h4>
            <div className="h-1 bg-[#121212] w-12 mt-1.5" />
          </div>

          <ul className="space-y-4">
            {envtrapFeatures.map((feat, idx) => (
              <li key={idx} className="flex items-center gap-3 text-[#121212]">
                <div className="w-6 h-6 bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center text-[#121212] shrink-0 shadow-[1px_1px_0px_#121212]">
                  <Check size={12} className="stroke-[3.5]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">{feat.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
