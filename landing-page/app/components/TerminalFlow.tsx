"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Terminal, Lock, HardDrive, Globe, Activity, X } from "lucide-react";

export default function TerminalFlow() {
  const [pulseActive, setPulseActive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(false);
      setTimeout(() => {
        setPulseActive(true);
      }, 100);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center py-4 select-none">
      
      {/* 1. Precise Light-Theme Terminal Mockup */}
      <div className="w-full max-w-[430px] bg-white rounded-2xl border border-slate-100/90 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden font-mono text-xs md:text-sm leading-relaxed text-slate-800 transition-all hover:shadow-[0_20px_55px_rgba(0,0,0,0.06)]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase">envtrap terminal</div>
          <div className="w-12" /> {/* spacer */}
        </div>

        {/* Terminal Content */}
        <div className="p-5 md:p-6 space-y-4">
          {/* Prompt line */}
          <div className="flex items-center gap-2 text-slate-650">
            <span className="text-indigo-600 font-bold">$</span>
            <span>
              <span className="text-indigo-600 font-bold">envtrap</span> run node <span className="font-bold text-slate-900">app.js</span>
            </span>
          </div>

          {/* Blocked Badge */}
          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-md px-2.5 py-1 text-rose-600 w-fit">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center text-white">
              <X size={9} className="stroke-[3.5]" />
            </div>
            <span className="font-extrabold tracking-wider text-[9px]">BLOCKED</span>
          </div>

          {/* Key-Value Details */}
          <div className="grid grid-cols-[90px_1fr] gap-y-3.5 text-xs border-t border-slate-100/55 pt-4">
            <span className="text-slate-450 font-bold tracking-wide">Channel:</span>
            <span className="text-slate-800 font-bold">HTTPS</span>

            <span className="text-slate-450 font-bold tracking-wide">Secret:</span>
            <span className="text-slate-900 font-bold font-mono">STRIPE_SECRET_KEY</span>

            <span className="text-slate-450 font-bold tracking-wide">Fingerprint:</span>
            <span className="text-slate-500 font-mono break-all leading-normal text-xs font-semibold">
              SHA256:e4b4ecc7d4a4...
            </span>

            <span className="text-slate-450 font-bold tracking-wide">Destination:</span>
            <span className="text-slate-800 font-bold">api.attacker.com</span>

            <span className="text-slate-450 font-bold tracking-wide">Action:</span>
            <span className="text-rose-650 font-black tracking-wide text-rose-600">Request terminated</span>
          </div>
        </div>
      </div>

      {/* 2. Dotted Connector from Terminal to Node.js App */}
      <div className="h-10 w-0.5 border-l-2 border-dashed border-slate-200 relative">
        {pulseActive && (
          <div className="absolute top-0 -left-[5.5px] w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/25 animate-flow-down-1" />
        )}
      </div>

      {/* 3. Node.js Application Badge */}
      <div className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-full px-5 py-2.5 shadow-xs text-xs font-bold text-slate-800 z-10 hover:border-slate-200 transition-colors">
        <Image
          src="/nodejs.webp"
          alt="Node.js logo"
          width={15}
          height={15}
          className="object-contain"
        />
        <span>Node.js Application</span>
      </div>

      {/* 4. Dotted Connector from Node.js Application to envtrap */}
      <div className="h-10 w-0.5 border-l-2 border-dashed border-slate-200 relative">
        {pulseActive && (
          <div className="absolute top-0 -left-[5.5px] w-2.5 h-2.5 rounded-full bg-rose-500 shadow-md shadow-rose-500/25 animate-flow-down-2" />
        )}
      </div>

      {/* 5. envtrap Shield Badge */}
      <div className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-full px-6 py-3 shadow-sm text-xs font-black text-slate-900 z-10 hover:border-slate-200 transition-colors">
        <div className="w-5 h-5 flex items-center justify-center relative">
          <Image
            src="/logo.png"
            alt="envtrap logo"
            fill
            className="object-contain"
          />
        </div>
        <span>envtrap</span>
      </div>

      {/* 6. Fully Responsive Branching SVG Lines & Endpoints */}
      <div className="w-full relative mt-[-2px] flex flex-col items-center">
        {/* SVG Connector lines */}
        <div className="w-full max-w-[620px] h-[60px] relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 60" fill="none" preserveAspectRatio="none">
            {[10, 30, 50, 70, 90].map((destX, idx) => {
              const pathD = `M 50 0 C 50 25, ${destX} 20, ${destX} 60`;
              return (
                <g key={idx}>
                  <path
                    d={pathD}
                    stroke="#e2e8f0"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />
                  {pulseActive && (
                    <circle r="0.8" fill="#f43f5e">
                      <animateMotion
                        dur="1.2s"
                        path={pathD}
                        fill="freeze"
                        calcMode="spline"
                        keyTimes="0;1"
                        keySplines="0.4 0 0.2 1"
                      />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* 5 Destination Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 w-full max-w-3xl px-2">
          <FlowCard
            icon={<Terminal size={14} className="text-slate-800" />}
            title="stdout / stderr"
            status="BLOCKED"
          />
          <FlowCard
            icon={<Lock size={14} className="text-slate-800" />}
            title="HTTPS Traffic"
            status="BLOCKED"
          />
          <FlowCard
            icon={<HardDrive size={14} className="text-slate-800" />}
            title="Subprocesses"
            status="BLOCKED"
          />
          <FlowCard
            icon={<Globe size={14} className="text-slate-800" />}
            title="DNS Tunneling"
            status="BLOCKED"
          />
          <FlowCard
            icon={<Activity size={14} className="text-slate-800" />}
            title="Entropy Detection"
            status="BLOCKED"
            className="col-span-2 md:col-span-1"
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes flowDown1 {
          0% { top: 0%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes flowDown2 {
          0% { top: 0%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-flow-down-1 {
          animation: flowDown1 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-flow-down-2 {
          animation: flowDown2 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: 0.5s;
        }
        @keyframes radarPulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .collision-ripple {
          position: absolute;
          top: 0;
          left: 50%;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(244, 63, 94, 0.2);
          animation: radarPulse 2s infinite ease-out;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

interface FlowCardProps {
  icon: React.ReactNode;
  title: string;
  status: "BLOCKED";
  className?: string;
}

function FlowCard({ icon, title, status, className = "" }: FlowCardProps) {
  return (
    <div
      className={`relative flex flex-col items-center bg-white border border-slate-100 rounded-xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-md hover:border-slate-200 transition-all duration-300 group ${className}`}
    >
      {/* Top red dot blocking the connector line with ripple animation */}
      <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4.5 h-4.5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shadow-xs z-10 text-rose-500">
        <div className="collision-ripple" />
        <X size={8} className="stroke-[3.5] relative z-10" />
      </div>

      <div className="p-2 bg-slate-50/70 rounded-lg mb-2 text-slate-700 transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>

      <span className="text-[10px] font-extrabold text-slate-800 text-center mb-2 leading-tight tracking-wide">
        {title}
      </span>

      <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider bg-rose-50/80 text-rose-600 border border-rose-100/50">
        {status}
      </span>
    </div>
  );
}
