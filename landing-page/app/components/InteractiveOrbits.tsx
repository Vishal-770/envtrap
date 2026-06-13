"use client";

import React from "react";
import { Terminal, Globe, Lock, GitBranch } from "lucide-react";

export default function InteractiveOrbits() {
  return (
    <div className="relative w-full aspect-square max-w-[500px] sm:max-w-[550px] flex items-center justify-center select-none overflow-visible">
      {/* 1. Orbit Tracks (Concentric Circles) */}
      
      {/* Inner Track */}
      <div className="absolute w-[44%] h-[44%] rounded-full border border-slate-100/90 dark:border-zinc-800/40 pointer-events-none" />
      
      {/* Middle Track */}
      <div className="absolute w-[72%] h-[72%] rounded-full border border-slate-100/95 dark:border-zinc-800/50 pointer-events-none" />
      
      {/* Outer Track */}
      <div className="absolute w-[100%] h-[100%] rounded-full border border-slate-100/80 dark:border-zinc-800/30 pointer-events-none" />

      {/* 2. Orbiting Glowing Particles (Rotating Containers) */}
      
      {/* Particle 1: Inner Track */}
      <div className="absolute w-[44%] h-[44%] rounded-full animate-spin-slow pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
      </div>

      {/* Particle 2: Middle Track */}
      <div className="absolute w-[72%] h-[72%] rounded-full animate-spin-reverse pointer-events-none">
        <div className="absolute bottom-1/2 left-0 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500/80 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
      </div>

      {/* Particle 3: Outer Track */}
      <div className="absolute w-[100%] h-[100%] rounded-full animate-spin-slower pointer-events-none">
        <div className="absolute top-[20%] right-[7%] w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.7)]" />
      </div>

      {/* 3. Center Glowing envtrap Emblem */}
      <div className="relative z-10 w-[24%] h-[24%] rounded-full bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] shadow-[0_15px_45px_rgba(79,70,229,0.35)] flex items-center justify-center transition-transform duration-500 hover:scale-105 group">
        {/* Outer pulse glow */}
        <div className="absolute -inset-2 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
        
        {/* Stylized Logo Icon in White using brightness filter */}
        <img
          src="/logo.png"
          alt="envtrap logo"
          className="w-[45%] h-[45%] object-contain select-none pointer-events-none filter brightness-0 invert"
        />
      </div>

      {/* 4. Floating Satellite Nodes (HTML Cards positioned along orbits) */}
      
      {/* Node 1: Logs (Top Left) */}
      <div className="absolute top-[10%] left-[10%] z-20 flex flex-col items-center gap-1.5 animate-float delay-100">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-100/90 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:border-slate-200 flex items-center justify-center transition-all duration-300 group cursor-default">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Terminal size={14} className="stroke-[2.5]" />
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 tracking-wide">Logs</span>
      </div>

      {/* Node 2: Network (Top Right) */}
      <div className="absolute top-[14%] right-[12%] z-20 flex flex-col items-center gap-1.5 animate-float delay-300">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-100/90 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:border-slate-200 flex items-center justify-center transition-all duration-300 group cursor-default">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-800 transition-transform group-hover:scale-105">
            <Globe size={14} className="stroke-[2]" />
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 tracking-wide">Network</span>
      </div>

      {/* Node 3: DNS (Middle Right) */}
      <div className="absolute top-[45%] right-[2%] z-20 flex flex-col items-center gap-1.5 animate-float delay-500">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-100/90 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:border-slate-200 flex items-center justify-center transition-all duration-300 group cursor-default">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-800 font-extrabold text-[8px] tracking-tighter transition-transform group-hover:scale-105">
            DNS
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 tracking-wide">DNS</span>
      </div>

      {/* Node 4: Environment (Bottom Right) */}
      <div className="absolute bottom-[14%] right-[14%] z-20 flex flex-col items-center gap-1.5 animate-float delay-200">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-100/90 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:border-slate-200 flex items-center justify-center transition-all duration-300 group cursor-default">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-800 transition-transform group-hover:scale-105">
            <Lock size={13} className="stroke-[2]" />
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 tracking-wide">Environment</span>
      </div>

      {/* Node 5: Subprocesses (Bottom Left) */}
      <div className="absolute bottom-[18%] left-[10%] z-20 flex flex-col items-center gap-1.5 animate-float delay-400">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-100/90 shadow-[0_8px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)] hover:border-slate-200 flex items-center justify-center transition-all duration-300 group cursor-default">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-800 transition-transform group-hover:scale-105">
            <GitBranch size={14} className="stroke-[2] rotate-180" />
          </div>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 tracking-wide">Subprocesses</span>
      </div>

      {/* 5. Custom Animation Styles */}
      <style jsx global>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinSlower {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
        .animate-spin-slow {
          animation: spinSlow 24s linear infinite;
        }
        .animate-spin-slower {
          animation: spinSlower 36s linear infinite;
        }
        .animate-spin-reverse {
          animation: spinReverse 28s linear infinite;
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
    </div>
  );
}
