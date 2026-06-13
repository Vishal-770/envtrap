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
      }, 105);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center py-4 select-none">
      
      {/* 1. Sleek Terminal Mockup (Bauhaus styling: flat shadows, thick black borders, non-rounded edges) */}
      <div className="w-full max-w-[430px] bg-zinc-950 rounded-none border-3 border-[#121212] shadow-[6px_6px_0px_#121212] overflow-hidden font-mono text-xs md:text-sm leading-relaxed text-zinc-300 transition-all">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#121212] bg-[#F0C020] text-[#121212]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#121212]" />
            <span className="w-2.5 h-2.5 bg-[#1040C0]" />
            <span className="w-2.5 h-2.5 bg-[#D02020]" />
          </div>
          <div className="text-[10px] font-black tracking-widest uppercase">envtrap CLI</div>
          <div className="w-12" /> {/* spacer */}
        </div>

        {/* Terminal Content */}
        <div className="p-5 md:p-6 space-y-4">
          {/* Prompt line */}
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-indigo-400 font-bold">$</span>
            <span>
              <span className="text-indigo-400 font-bold">envtrap</span> run node <span className="font-bold text-zinc-100">app.js</span>
            </span>
          </div>

          {/* Blocked Badge */}
          <div className="flex items-center gap-1.5 bg-[#D02020] border-2 border-[#121212] px-2.5 py-1 text-white w-fit shadow-[2px_2px_0px_#121212]">
            <div className="w-3.5 h-3.5 bg-white flex items-center justify-center text-[#121212]">
              <X size={9} className="stroke-[3.5]" />
            </div>
            <span className="font-black tracking-wider text-[9px] uppercase">BLOCKED</span>
          </div>

          {/* Key-Value Details */}
          <div className="grid grid-cols-[90px_1fr] gap-y-3.5 text-xs border-t-2 border-[#121212] pt-4 text-zinc-400">
            <span className="text-zinc-500 font-bold tracking-wide">Channel:</span>
            <span className="text-zinc-200 font-bold">HTTPS</span>

            <span className="text-zinc-500 font-bold tracking-wide">Secret:</span>
            <span className="text-zinc-100 font-bold font-mono">STRIPE_SECRET_KEY</span>

            <span className="text-zinc-500 font-bold tracking-wide">Fingerprint:</span>
            <span className="text-zinc-400 font-mono break-all leading-normal text-xs font-semibold">
              SHA256:e4b4ecc7d4a4...
            </span>

            <span className="text-zinc-500 font-bold tracking-wide">Destination:</span>
            <span className="text-zinc-200 font-bold">api.attacker.com</span>

            <span className="text-zinc-555 text-zinc-500 font-bold tracking-wide">Action:</span>
            <span className="text-rose-455 font-black tracking-wide text-rose-400">Request terminated</span>
          </div>
        </div>
      </div>

      {/* 2. Dotted Connector from Terminal to Node.js App */}
      <div className="h-10 w-0.5 border-l-2 border-dashed border-[#121212] relative">
        {pulseActive && (
          <div className="absolute top-0 -left-[5.5px] w-2.5 h-2.5 bg-[#D02020] border border-[#121212] shadow-xs animate-flow-down-1" />
        )}
      </div>

      {/* 3. Node.js Application Badge (Bauhaus square badge) */}
      <div className="flex items-center gap-2.5 bg-white border-2 border-[#121212] px-5 py-2.5 shadow-[3px_3px_0px_#121212] text-xs font-black uppercase tracking-wider text-[#121212] z-10 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#121212] transition-all duration-200">
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
      <div className="h-10 w-0.5 border-l-2 border-dashed border-[#121212] relative">
        {pulseActive && (
          <div className="absolute top-0 -left-[5.5px] w-2.5 h-2.5 bg-[#D02020] border border-[#121212] shadow-xs animate-flow-down-2" />
        )}
      </div>

      {/* 5. envtrap Shield Badge (Bauhaus square badge) */}
      <div className="flex items-center gap-2.5 bg-white border-2 border-[#121212] px-6 py-3 shadow-[4px_4px_0px_#121212] text-xs font-black uppercase tracking-wider text-[#121212] z-10 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#121212] transition-all duration-200">
        <div className="w-5 h-5 flex items-center justify-center relative">
          <Image
            src="/logo.png"
            alt="envtrap logo"
            fill
            className="object-contain"
          />
        </div>
        <span>envtrap agent</span>
      </div>

      {/* 6. Branching SVG Lines & Endpoints */}
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
                    stroke="#121212"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                  {pulseActive && (
                    <circle r="1.2" fill="#D02020">
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

        {/* 5 Destination Cards (Bauhaus square cards) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 w-full max-w-3xl px-2">
          <FlowCard
            icon={<Terminal size={14} className="text-[#121212]" />}
            title="stdout / stderr"
            status="BLOCKED"
          />
          <FlowCard
            icon={<Lock size={14} className="text-[#121212]" />}
            title="HTTPS Traffic"
            status="BLOCKED"
          />
          <FlowCard
            icon={<HardDrive size={14} className="text-[#121212]" />}
            title="Subprocesses"
            status="BLOCKED"
          />
          <FlowCard
            icon={<Globe size={14} className="text-[#121212]" />}
            title="DNS Tunneling"
            status="BLOCKED"
          />
          <FlowCard
            icon={<Activity size={14} className="text-[#121212]" />}
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
          border-radius: 0px;
          background: rgba(208, 32, 32, 0.1);
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
      className={`relative flex flex-col items-center bg-white border-2 border-[#121212] rounded-none p-4 shadow-[3px_3px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#121212] transition-all duration-300 group ${className}`}
    >
      {/* Top red dot blocking the connector line with ripple animation */}
      <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4.5 h-4.5 bg-[#D02020] border-2 border-[#121212] flex items-center justify-center shadow-sm z-10 text-white">
        <div className="collision-ripple" />
        <X size={8} className="stroke-[3.5] relative z-10" />
      </div>

      <div className="p-2 bg-zinc-50 border border-zinc-200 rounded-none mb-2 text-[#121212] transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>

      <span className="text-[10px] font-black uppercase tracking-wider text-[#121212] text-center mb-2 leading-tight">
        {title}
      </span>

      <span className="px-2 py-0.5 rounded-none text-[8px] font-black tracking-widest uppercase bg-[#D02020] text-white border border-[#121212]">
        {status}
      </span>
    </div>
  );
}
