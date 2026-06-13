import React from "react";
import Image from "next/image";
import { ArrowRight, ShieldAlert, FileText, FileCode, CheckCircle2, ArrowDown } from "lucide-react";

export default function Architecture() {
  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
      {/* Grid of the 4 columns in the pipeline */}
      <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 relative">
        
        {/* Column 1: Application Runtime */}
        <div className="flex-1 flex flex-col items-center bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900 rounded-xl p-4 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Application Runtime
          </span>
          
          {/* Node.js Logo box */}
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center mb-5 hover:scale-105 transition-transform">
            <Image
              src="/nodejs.webp"
              alt="Node.js logo"
              width={38}
              height={38}
              className="object-contain"
            />
          </div>

          {/* Subsystem tags */}
          <div className="grid grid-cols-2 gap-2 w-full text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-slate-800 rounded-md py-1.5">Logs</span>
            <span className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-slate-800 rounded-md py-1.5">Network</span>
            <span className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-slate-800 rounded-md py-1.5">DNS</span>
            <span className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-slate-800 rounded-md py-1.5">Processes</span>
          </div>
        </div>

        {/* Connector Arrow 1 */}
        <div className="flex md:flex-col justify-center items-center text-slate-300 dark:text-slate-700 py-2">
          <ArrowRight size={20} className="hidden md:block" />
          <ArrowDown size={20} className="block md:hidden" />
        </div>

        {/* Column 2: Runtime Interceptors */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900 rounded-xl p-4 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
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
        <div className="flex md:flex-col justify-center items-center text-slate-300 dark:text-slate-700 py-2">
          <ArrowRight size={20} className="hidden md:block" />
          <ArrowDown size={20} className="block md:hidden" />
        </div>

        {/* Column 3: Scanner Engine */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900 rounded-xl p-4 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Scanner Engine
          </span>
          <div className="flex flex-col gap-2.5 my-auto">
            <EngineBadge title="Entropy Analysis" />
            <EngineBadge title="Pattern Matching" />
            <EngineBadge title="Secret Fingerprinting" />
          </div>
        </div>

        {/* Connector Arrow 3 */}
        <div className="flex md:flex-col justify-center items-center text-slate-300 dark:text-slate-700 py-2">
          <ArrowRight size={20} className="hidden md:block" />
          <ArrowDown size={20} className="block md:hidden" />
        </div>

        {/* Column 4: Action & Response */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900 rounded-xl p-4 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Action & Response
          </span>
          <div className="flex flex-col gap-3 my-auto">
            <ActionCard
              icon={<ShieldAlert size={14} className="text-rose-500" />}
              bgClass="bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40"
              title="Block & Prevent"
            />
            <ActionCard
              icon={<FileCode size={14} className="text-indigo-500" />}
              bgClass="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40"
              title="Redact & Log"
            />
            <ActionCard
              icon={<FileText size={14} className="text-emerald-500" />}
              bgClass="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40"
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
    <div className="flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
      <span className="text-[11px] md:text-[12px] font-semibold text-slate-700 dark:text-slate-300">
        {title} <span className="text-slate-400 dark:text-slate-500 font-normal">{desc}</span>
      </span>
    </div>
  );
}

function EngineBadge({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 shadow-xs text-[11px] md:text-[12px] font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
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
    <div className={`flex items-center gap-2 border rounded-lg p-2.5 shadow-xs text-[11px] md:text-[12px] font-bold text-slate-800 dark:text-slate-200 ${bgClass}`}>
      <div className="shrink-0">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
