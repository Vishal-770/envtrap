import React from "react";
import Image from "next/image";
import { ArrowRight, ShieldAlert, FileText, FileCode, ArrowDown } from "lucide-react";

export default function Architecture() {
  return (
    <div className="w-full bg-white border border-zinc-200/80 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden backdrop-blur-md">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Pipeline columns */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 relative">
        
        {/* Column 1: Application Runtime */}
        <div className="flex-1 flex flex-col items-center bg-zinc-50/50 border border-zinc-100 rounded-xl p-5 text-center">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4">
            Application Runtime
          </span>
          
          {/* Node.js Logo box */}
          <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center mb-5 hover:scale-105 transition-transform duration-300">
            <Image
              src="/nodejs.webp"
              alt="Node.js logo"
              width={38}
              height={38}
              className="object-contain"
            />
          </div>

          {/* Subsystem tags */}
          <div className="grid grid-cols-2 gap-2 w-full text-[11px] font-bold text-zinc-700">
            <span className="bg-white border border-zinc-150 rounded-lg py-2">Logs</span>
            <span className="bg-white border border-zinc-150 rounded-lg py-2">Network</span>
            <span className="bg-white border border-zinc-150 rounded-lg py-2">DNS</span>
            <span className="bg-white border border-zinc-150 rounded-lg py-2">Processes</span>
          </div>
        </div>

        {/* Connector Arrow 1 */}
        <div className="flex lg:flex-col justify-center items-center text-zinc-300 py-2">
          <ArrowRight size={20} className="hidden lg:block text-indigo-500/40" />
          <ArrowDown size={20} className="block lg:hidden text-indigo-500/40" />
        </div>

        {/* Column 2: Runtime Interceptors */}
        <div className="flex-1 flex flex-col bg-zinc-50/50 border border-zinc-100 rounded-xl p-5 text-center justify-between">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4">
            Runtime Interceptors
          </span>
          <div className="flex flex-col gap-2.5 my-auto">
            <InterceptorBadge title="OS Pipes" desc="(stdout/stderr)" />
            <InterceptorBadge title="MITM Proxy" desc="(HTTPS)" />
            <InterceptorBadge title="Child Process" desc="Hooks" />
            <InterceptorBadge title="DNS Resolver" desc="Hooks" />
          </div>
        </div>

        {/* Connector Arrow 2 */}
        <div className="flex lg:flex-col justify-center items-center text-zinc-300 py-2">
          <ArrowRight size={20} className="hidden lg:block text-indigo-500/40" />
          <ArrowDown size={20} className="block lg:hidden text-indigo-500/40" />
        </div>

        {/* Column 3: Scanner Engine */}
        <div className="flex-1 flex flex-col bg-zinc-50/50 border border-zinc-100 rounded-xl p-5 text-center justify-between">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4">
            Scanner Engine
          </span>
          <div className="flex flex-col gap-2.5 my-auto">
            <EngineBadge title="Entropy Analysis" />
            <EngineBadge title="Pattern Matching" />
            <EngineBadge title="Secret Fingerprinting" />
          </div>
        </div>

        {/* Connector Arrow 3 */}
        <div className="flex lg:flex-col justify-center items-center text-zinc-300 py-2">
          <ArrowRight size={20} className="hidden lg:block text-indigo-500/40" />
          <ArrowDown size={20} className="block lg:hidden text-indigo-500/40" />
        </div>

        {/* Column 4: Action & Response */}
        <div className="flex-1 flex flex-col bg-zinc-50/50 border border-zinc-100 rounded-xl p-5 text-center justify-between">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-4">
            Action & Response
          </span>
          <div className="flex flex-col gap-3 my-auto">
            <ActionCard
              icon={<ShieldAlert size={14} className="text-rose-500" />}
              bgClass="bg-rose-50 border-rose-100 text-rose-700"
              title="Block & Prevent"
            />
            <ActionCard
              icon={<FileCode size={14} className="text-indigo-500" />}
              bgClass="bg-indigo-50 border-indigo-100 text-indigo-700"
              title="Redact & Log"
            />
            <ActionCard
              icon={<FileText size={14} className="text-emerald-500" />}
              bgClass="bg-emerald-50 border-emerald-100 text-emerald-700"
              title="Generate Report"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function InterceptorBadge({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 bg-white border border-zinc-200 rounded-lg py-2 px-3 shadow-xs hover:border-zinc-300 transition-colors duration-300">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
      <span className="text-[11px] font-bold text-zinc-700">
        {title} <span className="text-zinc-400 font-normal">{desc}</span>
      </span>
    </div>
  );
}

function EngineBadge({ title }: { title: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg py-2 px-3 shadow-xs text-[11px] font-bold text-zinc-700 hover:border-zinc-300 transition-colors duration-300">
      {title}
    </div>
  );
}

function ActionCard({
  icon,
  title,
  bgClass,
}: {
  icon: React.ReactNode;
  title: string;
  bgClass: string;
}) {
  return (
    <div className={`flex items-center gap-2 border rounded-lg p-2.5 shadow-sm text-[11px] font-bold transition-all duration-300 ${bgClass}`}>
      <div className="shrink-0">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
