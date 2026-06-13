import React from "react";
import Image from "next/image";
import { ArrowRight, ShieldAlert, FileText, FileCode, ArrowDown } from "lucide-react";

export default function Architecture() {
  return (
    <div className="w-full bg-white border-3 border-[#121212] rounded-none p-6 md:p-8 shadow-[4px_4px_0px_#121212] relative overflow-hidden">
      
      {/* Pipeline columns */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 relative">
        
        {/* Column 1: Application Runtime */}
        <div className="flex-1 flex flex-col items-center bg-[#F0F0F0] border-2 border-[#121212] rounded-none p-5 text-center">
          <span className="text-[9px] font-black text-[#121212] uppercase tracking-widest mb-4">
            Application Runtime
          </span>
          
          {/* Node.js Logo box */}
          <div className="w-16 h-16 rounded-none bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] flex items-center justify-center mb-5 hover:scale-105 transition-transform duration-300">
            <Image
              src="/nodejs.webp"
              alt="Node.js logo"
              width={38}
              height={38}
              className="object-contain"
            />
          </div>

          {/* Subsystem tags */}
          <div className="grid grid-cols-2 gap-2 w-full text-[10px] font-black uppercase tracking-wider text-[#121212]">
            <span className="bg-white border-2 border-[#121212] py-2">Logs</span>
            <span className="bg-white border-2 border-[#121212] py-2">Network</span>
            <span className="bg-white border-2 border-[#121212] py-2">DNS</span>
            <span className="bg-white border-2 border-[#121212] py-2">Processes</span>
          </div>
        </div>

        {/* Connector Arrow 1 */}
        <div className="flex lg:flex-col justify-center items-center text-[#121212] py-2">
          <ArrowRight size={20} className="hidden lg:block stroke-[2.5]" />
          <ArrowDown size={20} className="block lg:hidden stroke-[2.5]" />
        </div>

        {/* Column 2: Runtime Interceptors */}
        <div className="flex-1 flex flex-col bg-[#F0F0F0] border-2 border-[#121212] rounded-none p-5 text-center justify-between">
          <span className="text-[9px] font-black text-[#121212] uppercase tracking-widest mb-4">
            Runtime Interceptors
          </span>
          <div className="flex flex-col gap-2.5 my-auto">
            <InterceptorBadge title="OS Pipes" desc="(stdout)" />
            <InterceptorBadge title="MITM Proxy" desc="(HTTPS)" />
            <InterceptorBadge title="Subprocess" desc="Hooks" />
            <InterceptorBadge title="DNS Resolver" desc="Hooks" />
          </div>
        </div>

        {/* Connector Arrow 2 */}
        <div className="flex lg:flex-col justify-center items-center text-[#121212] py-2">
          <ArrowRight size={20} className="hidden lg:block stroke-[2.5]" />
          <ArrowDown size={20} className="block lg:hidden stroke-[2.5]" />
        </div>

        {/* Column 3: Scanner Engine */}
        <div className="flex-1 flex flex-col bg-[#F0F0F0] border-2 border-[#121212] rounded-none p-5 text-center justify-between">
          <span className="text-[9px] font-black text-[#121212] uppercase tracking-widest mb-4">
            Scanner Engine
          </span>
          <div className="flex flex-col gap-2.5 my-auto">
            <EngineBadge title="Entropy Analysis" />
            <EngineBadge title="Pattern Matching" />
            <EngineBadge title="Fingerprinting" />
          </div>
        </div>

        {/* Connector Arrow 3 */}
        <div className="flex lg:flex-col justify-center items-center text-[#121212] py-2">
          <ArrowRight size={20} className="hidden lg:block stroke-[2.5]" />
          <ArrowDown size={20} className="block lg:hidden stroke-[2.5]" />
        </div>

        {/* Column 4: Action & Response */}
        <div className="flex-1 flex flex-col bg-[#F0F0F0] border-2 border-[#121212] rounded-none p-5 text-center justify-between">
          <span className="text-[9px] font-black text-[#121212] uppercase tracking-widest mb-4">
            Action & Response
          </span>
          <div className="flex flex-col gap-3 my-auto">
            <ActionCard
              icon={<ShieldAlert size={14} className="text-[#121212]" />}
              bgClass="bg-[#D02020] text-white"
              title="Block & Prevent"
            />
            <ActionCard
              icon={<FileCode size={14} className="text-white" />}
              bgClass="bg-[#1040C0] text-white"
              title="Redact & Log"
            />
            <ActionCard
              icon={<FileText size={14} className="text-[#121212]" />}
              bgClass="bg-[#F0C020] text-[#121212]"
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
    <div className="flex items-center justify-center gap-1.5 bg-white border-2 border-[#121212] rounded-none py-1.5 px-2.5 shadow-[2px_2px_0px_#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#121212] transition-all duration-200">
      <div className="w-2 h-2 bg-[#1040C0] shrink-0" />
      <span className="text-[10px] font-black uppercase tracking-wider text-[#121212]">
        {title} <span className="text-zinc-500 font-normal">{desc}</span>
      </span>
    </div>
  );
}

function EngineBadge({ title }: { title: string }) {
  return (
    <div className="bg-white border-2 border-[#121212] rounded-none py-1.5 px-2.5 shadow-[2px_2px_0px_#121212] text-[10px] font-black uppercase tracking-wider text-[#121212] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#121212] transition-all duration-200">
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
    <div className={`flex items-center gap-2 border-2 border-[#121212] rounded-none p-2 shadow-[2px_2px_0px_#121212] text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#121212] ${bgClass}`}>
      <div className="shrink-0">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
