"use client";

import React, { useState } from "react";
import {
  Zap,
  Shield,
  Eye,
  Bot,
  Lock,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  Star,
  Send,
  ShieldAlert,
  FileText,
  Menu,
  X,
  ShieldCheck,
  Compass,
  Laptop,
  Link,
  Activity,
  HardDrive,
  Globe,
  Terminal,
} from "lucide-react";
import { LogoBrand, LogoIcon } from "./components/Logo";
import InteractiveOrbits from "./components/InteractiveOrbits";
import Comparison from "./components/Comparison";
import Architecture from "./components/Architecture";
import TerminalFlow from "./components/TerminalFlow";

export default function Home() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Interactive Bento Card 1: Package Manager Selector
  const [pkgManager, setPkgManager] = useState<"npm" | "pnpm" | "yarn" | "bun">("npm");
  const pkgCommands = {
    npm: { install: "npm install -g envtrap", run: "envtrap run node app.js" },
    pnpm: { install: "pnpm add -g envtrap", run: "envtrap run node app.js" },
    yarn: { install: "yarn global add envtrap", run: "envtrap run node app.js" },
    bun: { install: "bun add -g envtrap", run: "envtrap run node app.js" },
  };

  // Interactive Bento Card 4: Redaction Sandbox Toggle
  const [redactSandbox, setRedactSandbox] = useState<"raw" | "sanitized">("sanitized");

  const copyToClipboard = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-200 relative">
      {/* Decorative Radial glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] glow-indigo pointer-events-none z-0" />
      <div className="absolute top-[800px] right-0 w-[400px] h-[400px] glow-violet pointer-events-none z-0" />
      <div className="absolute bottom-[400px] left-0 w-[500px] h-[500px] glow-emerald pointer-events-none z-0" />

      {/* Grid background mask overlay */}
      <div className="absolute top-0 left-0 w-full h-[800px] grid-bg pointer-events-none z-0" />
      <div className="absolute inset-0 grid-bg-full pointer-events-none z-0 opacity-40" />

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#030303]/60 backdrop-blur-xl border-b border-zinc-900/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <a href="#" className="hover:opacity-95 transition-opacity flex items-center">
            <LogoBrand />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Product</a>
            <a href="#attack-surfaces" className="hover:text-indigo-400 transition-colors">Attack Surfaces</a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors">Architecture</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#docs" className="hover:text-indigo-400 transition-colors">Docs</a>
          </nav>

          {/* CTA / Mobile Menu toggle */}
          <div className="flex items-center gap-4">
            <a
              href="#installation"
              className="hidden sm:inline-flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-955 text-xs font-black px-5 py-2.5 rounded-full transition-all text-zinc-950 shadow-lg shadow-white/5"
            >
              Get Started
              <ArrowRight size={13} className="stroke-[2.5]" />
            </a>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-zinc-400 hover:text-zinc-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-900 bg-[#030303] px-6 py-6 space-y-4 shadow-2xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-zinc-400 hover:text-indigo-400"
            >
              Product
            </a>
            <a
              href="#attack-surfaces"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-zinc-400 hover:text-indigo-400"
            >
              Attack Surfaces
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-zinc-400 hover:text-indigo-400"
            >
              Architecture
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-zinc-400 hover:text-indigo-400"
            >
              How It Works
            </a>
            <a
              href="#docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-zinc-400 hover:text-indigo-400"
            >
              Docs
            </a>
            <a
              href="#installation"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-bold py-3 rounded-full w-full shadow-md transition-colors"
            >
              Get Started
              <ArrowRight size={13} className="stroke-[2.5]" />
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-36 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text details */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/35 rounded-full px-3.5 py-1.5 text-[10px] font-bold text-indigo-400 tracking-wider uppercase animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
              Runtime Secret Leak Prevention for Node.js
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.08] animate-slide-up delay-100">
              Stop secrets <br />
              before they <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
                leave your process.
              </span>
            </h1>

            {/* Paragraph description */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg animate-slide-up delay-200 font-medium">
              envtrap wraps Node.js runtimes to intercept and block accidental or malicious exfiltration of sensitive data across logs, HTTP/HTTPS channels, DNS tunneling, and child processes in real-time.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-row items-center gap-4 animate-slide-up delay-300">
              <a
                href="#installation"
                className="inline-flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-sm px-6 py-3 rounded-full shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started
                <ArrowRight size={14} className="stroke-[2.5]" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-300 font-extrabold text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-[0.98]"
              >
                View on GitHub
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-zinc-300" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>

            {/* Trusted By Section */}
            <div className="pt-10 border-t border-zinc-900/60 max-w-xl animate-slide-up delay-400">
              <div className="flex items-center gap-4 mb-4.5">
                <span className="text-[9px] font-extrabold text-zinc-550 text-zinc-500 tracking-widest whitespace-nowrap uppercase">Trusted by developer teams at</span>
                <div className="w-full h-px bg-zinc-900/80" />
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-zinc-500">
                {/* Vercel */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none hover:text-zinc-350 transition-colors duration-300">
                  <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10.5px] border-b-current" />
                  <span>Vercel</span>
                </div>
                {/* Netlify */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none hover:text-zinc-350 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L2.7 5.4v13.2L12 24l9.3-5.4V5.4L12 0zm5.4 12.6l-5.4 3.1V9.5l5.4 3.1zm-7.2-4.1l5.4-3.1v6.2l-5.4 3.1V8.5z" />
                  </svg>
                  <span>Netlify</span>
                </div>
                {/* Render */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none hover:text-zinc-350 transition-colors duration-300">
                  <span className="w-3.5 h-3.5 rounded-xs border border-current flex items-center justify-center font-black text-[7px] leading-none">R</span>
                  <span>Render</span>
                </div>
                {/* Railway */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none hover:text-zinc-350 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0V0zm2 2v20h20V2H2zm4 4h12v12H6V6z" />
                  </svg>
                  <span>Railway</span>
                </div>
                {/* Supabase */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none hover:text-zinc-350 transition-colors duration-300">
                  <svg viewBox="0 0 24 24" className="w-3 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.4 24l8.3-12.7H13L16.2 0 7.9 12.7h8.7L13.4 24z" />
                  </svg>
                  <span>Supabase</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Interactive Orbits Visualizer */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end animate-slide-up delay-500">
            <InteractiveOrbits />
          </div>

        </div>
      </section>

      {/* 3. Premium Bento Grid Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="space-y-4 text-center mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Core Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Engineered for absolute security.</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          
          {/* Card 1: Zero Configuration (Col Span 3) */}
          <div className="bento-card md:col-span-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 transition-transform group-hover:scale-105">
                <Zap size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Zero Configuration</h3>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                No code edits or custom library setup required. Wrap your startup command and begin runtime interception immediately.
              </p>
            </div>

            {/* Interactive Package selector */}
            <div className="mt-8 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/60 font-mono text-[11px]">
              {/* Tab Selector */}
              <div className="flex border-b border-zinc-900 bg-zinc-950 px-2 py-1">
                {(["npm", "pnpm", "yarn", "bun"] as const).map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPkgManager(pm)}
                    className={`px-3.5 py-1.5 rounded-md font-bold tracking-wide transition-all ${
                      pkgManager === pm ? "bg-zinc-900 text-indigo-400 border border-zinc-850" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              {/* Console commands display */}
              <div className="p-4 space-y-2.5 text-zinc-350 select-all relative group/copy">
                <div>
                  <span className="text-zinc-650 text-indigo-500/60 font-bold">$ </span>
                  {pkgCommands[pkgManager].install}
                </div>
                <div>
                  <span className="text-zinc-650 text-indigo-500/60 font-bold">$ </span>
                  {pkgCommands[pkgManager].run}
                </div>
                <button
                  onClick={() => copyToClipboard(`${pkgCommands[pkgManager].install} && ${pkgCommands[pkgManager].run}`, setCopiedInstall)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 opacity-0 group-hover/copy:opacity-100 transition-opacity p-1.5 bg-zinc-900 border border-zinc-800 rounded-md"
                  aria-label="Copy commands"
                >
                  {copiedInstall ? <Check size={12} className="text-emerald-500 stroke-[3]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: In-Memory CA (Col Span 3) */}
          <div className="bento-card md:col-span-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 transition-transform group-hover:scale-105">
                <Shield size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">In-Memory Root CA</h3>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                Generates a unique 2048-bit Root CA in memory at startup. No private key is ever written to disk, ensuring TLS interception remains isolated.
              </p>
            </div>

            {/* Certificate visual diagram */}
            <div className="mt-8 border border-zinc-900 rounded-xl bg-zinc-950/40 p-4 flex items-center justify-between font-mono text-[10px] text-zinc-400">
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Key Lifecycle</span>
                <span className="text-indigo-400 font-bold">1. Generate RSA key in RAM</span>
                <span className="text-zinc-500">2. Save public cert only</span>
                <span className="text-rose-500 font-bold">3. Delete CA from memory on exit</span>
              </div>
              <div className="border border-zinc-850 bg-zinc-950 rounded-xl p-3 flex flex-col items-center gap-1.5 shrink-0 shadow-lg">
                <ShieldCheck size={20} className="text-indigo-400 shadow-glow" />
                <span className="font-bold text-[9px] text-zinc-300">envtrap CA</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/30 text-[8px] font-extrabold uppercase">Verified</span>
              </div>
            </div>
          </div>

          {/* Card 3: Real-Time Interception (Col Span 3) */}
          <div className="bento-card md:col-span-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 transition-transform group-hover:scale-105">
                <Eye size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Real-Time Protection</h3>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                Intercepts exfiltration attempts at the execution boundary rather than statically scanning directories, catching keys generated dynamic-runtime.
              </p>
            </div>

            {/* Visualizer showing standard app vs envtrap */}
            <div className="mt-8 grid grid-cols-2 gap-4 font-mono text-[9px]">
              <div className="border border-zinc-900 rounded-xl p-3 bg-zinc-950/20 flex flex-col justify-between h-24">
                <div className="flex justify-between items-center text-rose-400 font-bold">
                  <span>UNPROTECTED</span>
                  <X size={12} />
                </div>
                <div className="text-zinc-500 leading-tight">
                  Outbound Request <br />
                  → Attacker Server <br />
                  <span className="text-rose-500/80">Exfiltration Succeeded</span>
                </div>
              </div>

              <div className="border border-indigo-950/60 rounded-xl p-3 bg-indigo-950/10 flex flex-col justify-between h-24 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
                <div className="flex justify-between items-center text-indigo-400 font-bold">
                  <span>envtrap SHIELD</span>
                  <ShieldCheck size={12} />
                </div>
                <div className="text-zinc-400 leading-tight">
                  Outbound Request <br />
                  → Intercepted Proxy <br />
                  <span className="text-indigo-400 font-bold">Exfiltration Terminated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: AI-Safe Redacted Reporting (Col Span 3) */}
          <div className="bento-card md:col-span-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 transition-transform group-hover:scale-105">
                <Bot size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">AI-Safe Redacted Reporting</h3>
              <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                Only cryptographic non-reversible hashes are ever written to stdout/reports. Paste outputs safely into LLMs without leaks.
              </p>
            </div>

            {/* Interactive Raw vs Redacted Output Console */}
            <div className="mt-8 border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/60 font-mono text-[10px]">
              <div className="flex border-b border-zinc-900 bg-zinc-950 px-2 py-1 justify-between items-center">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest pl-2">Console output preview</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setRedactSandbox("raw")}
                    className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                      redactSandbox === "raw" ? "bg-rose-950/60 text-rose-400 border border-rose-900/30" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Raw Output
                  </button>
                  <button
                    onClick={() => setRedactSandbox("sanitized")}
                    className={`px-2.5 py-1 rounded-md transition-all font-bold ${
                      redactSandbox === "sanitized" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    envtrap Sanitized
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-1.5 text-zinc-300 h-24 flex flex-col justify-center">
                {redactSandbox === "raw" ? (
                  <div className="text-rose-450 leading-relaxed text-zinc-400">
                    <div>console.log("Configuration loaded:", <span className="text-rose-400 font-bold">sk_live_51NzkSDFG889...</span>)</div>
                    <div className="text-zinc-600 font-bold mt-1 text-[8px]">⚠️ DANGER: PRIVATE KEY VISIBLE IN CLEAR TEXT</div>
                  </div>
                ) : (
                  <div className="text-emerald-450 leading-relaxed text-zinc-300">
                    <div>console.log("Configuration loaded:", <span className="text-emerald-400 font-bold">[REDACTED: SHA256:f7b822da]</span>)</div>
                    <div className="text-indigo-400 font-bold mt-1 text-[8px] flex items-center gap-1">
                      <ShieldCheck size={11} className="stroke-[2.5]" /> SECURE FOR AI CODE AGENTS & LOG AGGREGATORS
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: 100% Local Execution (Col Span 6) */}
          <div className="bento-card md:col-span-6 flex flex-col md:flex-row items-center justify-between gap-8 group">
            <div className="space-y-3 md:max-w-md">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 transition-transform group-hover:scale-105">
                <Lock size={18} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">100% Local Execution</h3>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Zero telemetry, zero external network requests to security endpoints, and zero data leaving your machine. All scanning logic, certificate authority lifecycle, and blocking behavior execute completely offline.
              </p>
              <div className="pt-2 flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Offline Audit</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-400" /> Zero Telemetry</span>
              </div>
            </div>

            {/* Visual indicator representation */}
            <div className="w-full md:w-64 border border-zinc-900 rounded-xl bg-zinc-950/30 p-4 font-mono text-[9px] space-y-3 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-zinc-550 text-zinc-500 font-bold uppercase tracking-wider">Telemetry Probe Check</span>
                <span className="text-indigo-400 font-bold">127.0.0.1 ONLY</span>
              </div>
              <div className="space-y-2 border-t border-zinc-900 pt-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Outbound Telemetry Log</span>
                  <span className="text-rose-500 font-bold">DISABLED</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Reporting Servers</span>
                  <span className="text-zinc-600 font-semibold">NOT DEFINED</span>
                </div>
                <div className="flex justify-between">
                  <span>Offline Air-Gapped Mode</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Live CLI exfiltration blocker showcase (Interactive Terminal Flow) */}
      <section className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="space-y-4 text-center mb-12">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Real-time Sandbox</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Watch the leak prevention pipeline in action.</p>
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <TerminalFlow />
        </div>
      </section>

      {/* 5. Double Panel (Why Existing Tools Fail & Five Runtime Attack Surfaces) */}
      <section id="attack-surfaces" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left Panel: Comparison */}
          <div className="space-y-6 flex flex-col">
            <h3 className="text-2xl font-extrabold tracking-tight text-white pl-2">
              Why Static Tools Fail
            </h3>
            <div className="flex-1 flex">
              <Comparison />
            </div>
          </div>

          {/* Right Panel: Five Runtime Attack Surfaces */}
          <div className="space-y-6 flex flex-col">
            <h3 className="text-2xl font-extrabold tracking-tight text-white pl-2">
              Five Runtime Attack Surfaces
            </h3>
            <div className="flex-1 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl space-y-4 flex flex-col justify-between backdrop-blur-md">
              <AttackSurfaceRow
                num="01"
                title="stdout / stderr streams"
                desc="Intercepts process output logs and sanitizes them before they print"
                status="Redacted"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="02"
                title="Outbound HTTP/HTTPS Traffic"
                desc="Intercepts CONNECT handshakes and scans payload data locally"
                status="Blocked"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="03"
                title="Spawned Subprocesses"
                desc="Inspects spawn options.env parameters prior to fork actions"
                status="Blocked"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="04"
                title="DNS Name Resolutions"
                desc="Monitors resolved domains to block subdomains containing secrets"
                status="Blocked"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="05"
                title="Entropy Detection"
                desc="Flagged high-entropy secrets and queries using Shannon scoring"
                status="Warned"
                statusType="warning"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Deep Runtime Protection Architecture */}
      <section id="architecture" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center mb-8">
          <div className="lg:col-span-1 space-y-6 text-center lg:text-left">
            <h3 className="text-3xl font-extrabold tracking-tight text-white">
              Deep Runtime Protection Architecture
            </h3>
            <p className="text-zinc-400 leading-relaxed text-sm md:text-base font-medium">
              envtrap operates at the boundary of your Node.js runtime to intercept exfiltration channels, perform entropy analysis, and drop exfiltrations without overhead.
            </p>
            <div className="flex justify-center lg:justify-start">
              <a
                href="#docs"
                className="inline-flex items-center gap-1.5 bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-300 text-xs font-bold px-4 py-2.5 rounded-full transition-all"
              >
                Read Architectural Spec
                <ArrowRight size={13} className="stroke-[2.5]" />
              </a>
            </div>
          </div>
          <div className="lg:col-span-2 w-full">
            <Architecture />
          </div>
        </div>
      </section>

      {/* 7. How envtrap Works (6-step flow) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
        <div className="space-y-4 mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Execution Flow</h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How envtrap prevents leaks.</p>
        </div>

        {/* Steps flow horizontal container */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <WorkStepCard
            stepNum="1"
            icon={<Star size={16} className="text-indigo-400" />}
            title="Secret Loaded"
            desc="Process starts and evaluates env parameters."
          />
          <WorkStepCard
            stepNum="2"
            icon={<Send size={16} className="text-indigo-400" />}
            title="Exfiltration Event"
            desc="Dependency tries to write out keys."
          />
          <WorkStepCard
            stepNum="3"
            icon={<Compass size={16} className="text-indigo-400" />}
            title="Boundary Hit"
            desc="Interceptors capture payload stream."
          />
          <WorkStepCard
            stepNum="4"
            icon={<Shield size={16} className="text-indigo-400" />}
            title="Matches Screened"
            desc="Entropy + signatures flag active key."
          />
          <WorkStepCard
            stepNum="5"
            icon={<ShieldAlert size={16} className="text-indigo-400" />}
            title="Exfil Blocked"
            desc="Connection killed or output redacted."
          />
          <WorkStepCard
            stepNum="6"
            icon={<FileText size={16} className="text-indigo-400" />}
            title="Report Logged"
            desc="Encrypted SHA256 audit written to log."
          />
        </div>
      </section>

      {/* 8. Highlights (AI-Safe, reports, installation cards) */}
      <section id="installation" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: AI-Safe by Design */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-md group hover:border-zinc-800 transition-colors duration-300">
            <div className="space-y-5">
              <h4 className="text-lg font-bold text-white">AI-Safe by Design</h4>
              
              {/* Bad vs Good comparison visual */}
              <div className="space-y-3.5 border border-zinc-900 rounded-xl p-4 bg-zinc-950/60 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-900">
                  <span className="text-rose-400 font-extrabold">BAD</span>
                  <div className="flex items-center gap-1 bg-rose-950/30 text-rose-450 px-2 py-0.5 rounded-full font-bold text-[9px] border border-rose-900/40">
                    <X size={10} className="stroke-[3.5]" />
                    Sent to AI History
                  </div>
                </div>
                <div className="text-zinc-650 font-bold select-none text-zinc-550 break-all">
                  sk_live_abc123...
                </div>

                <div className="flex items-center justify-between pt-3 pb-2.5 border-b border-zinc-900">
                  <span className="text-emerald-400 font-extrabold">GOOD</span>
                  <div className="flex items-center gap-1 bg-emerald-950/30 text-emerald-455 px-2 py-0.5 rounded-full font-bold text-[9px] border border-emerald-900/40">
                    <Check size={10} className="stroke-[3.5]" />
                    Non-reversible
                  </div>
                </div>
                <div className="text-zinc-200 break-all font-bold">
                  SHA256:e6b8eee7...
                </div>
                <div className="text-[10px] text-indigo-400 font-bold flex items-center gap-1 pt-1">
                  <ShieldCheck size={12} className="stroke-[2.5]" /> Safe for AI Tools
                </div>
              </div>

              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                envtrap never prints raw secrets. Only non-reversible hashes are logged — safe for Claude Code, Copilot CLI, and other AI assisted environments.
              </p>
            </div>
            
            <div className="pt-4 border-t border-zinc-900/80 mt-5 flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Shield size={14} />
              <span>Cryptographic Safety Guard</span>
            </div>
          </div>

          {/* Card B: Machine Readable Reports */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-md group hover:border-zinc-800 transition-colors duration-300">
            <div className="space-y-5">
              <h4 className="text-lg font-bold text-white">Machine Readable Reports</h4>
              
              {/* JSON code box */}
              <div className="border border-zinc-900 rounded-xl p-4 bg-zinc-950/60 text-zinc-300 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner">
                <span className="text-zinc-600">{`{`}</span>
                <div className="pl-4">
                  <span className="text-indigo-400 font-semibold">"secretName"</span>: <span className="text-emerald-400 font-semibold">"STRIPE_SECRET_KEY"</span>,
                  <br />
                  <span className="text-indigo-400 font-semibold">"channel"</span>: <span className="text-emerald-400 font-semibold">"dns"</span>,
                  <br />
                  <span className="text-indigo-400 font-semibold">"sha256"</span>: <span className="text-emerald-400 font-semibold">"e6b8eee70bd6..."</span>,
                  <br />
                  <span className="text-indigo-400 font-semibold">"context"</span>: <span className="text-emerald-400 font-semibold">"[REDACTED].attacker.com"</span>,
                  <br />
                  <span className="text-indigo-400 font-semibold">"timestamp"</span>: <span className="text-zinc-400 font-semibold">170131604545</span>
                </div>
                <span className="text-zinc-600">{`}`}</span>
              </div>

              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                Structured JSON schema reports let your CI/CD systems or autonomous AI agents automatically locate and patch the source of a leaked parameter.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900/80 mt-5 flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <Bot size={14} />
              <span>AI Agent Integrable Schema</span>
            </div>
          </div>

          {/* Card C: Quick Setup */}
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-6 shadow-2xl flex flex-col justify-between backdrop-blur-md group hover:border-zinc-800 transition-colors duration-300">
            <div className="space-y-5">
              <h4 className="text-lg font-bold text-white">Installation</h4>
              
              {/* Copy commands steps */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-950 border border-indigo-900/40 flex items-center justify-center text-[9px]">1</span>
                    <span>Install globally</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-zinc-950/60 border border-zinc-900 rounded-xl px-3.5 py-2.5 font-mono text-[11px] text-zinc-350 shadow-inner group/btn">
                    <span className="truncate select-all">npm install -g envtrap</span>
                    <button
                      onClick={() => copyToClipboard("npm install -g envtrap", setCopiedInstall)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      aria-label="Copy install command"
                    >
                      {copiedInstall ? <Check size={12} className="text-emerald-500 stroke-[3]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-950 border border-indigo-900/40 flex items-center justify-center text-[9px]">2</span>
                    <span>Start application</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-zinc-950/60 border border-zinc-900 rounded-xl px-3.5 py-2.5 font-mono text-[11px] text-zinc-355 text-zinc-300 shadow-inner group/btn">
                    <span className="truncate select-all">envtrap run node app.js</span>
                    <button
                      onClick={() => copyToClipboard("envtrap run node app.js", setCopiedRun)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      aria-label="Copy run command"
                    >
                      {copiedRun ? <Check size={12} className="text-emerald-500 stroke-[3]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">
                Protect your production containers and local environments instantly without modifying code dependencies or configuration.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900/80 mt-5 flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
              <span>That's it. 🚀</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Engineered for Enterprise Scale (10-Feature Grid) */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="border-t border-zinc-900/80 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12">
            <MiniFeature
              icon={<Shield size={14} className="text-indigo-400" />}
              title="Dynamic TLS Certificates"
              desc="Signed in RAM as requested."
            />
            <MiniFeature
              icon={<Terminal size={14} className="text-indigo-400" />}
              title="Native Addon Coverage"
              desc="Captures low-level outputs."
            />
            <MiniFeature
              icon={<Globe size={14} className="text-indigo-400" />}
              title="DNS Exfiltration Check"
              desc="Flags secrets hidden in host queries."
            />
            <MiniFeature
              icon={<Activity size={14} className="text-indigo-400" />}
              title="Shannon Entropy Check"
              desc="Detects random obfuscated strings."
            />
            <MiniFeature
              icon={<Link size={14} className="text-indigo-400" />}
              title="ESM Hook Interception"
              desc="Bypassing-resilient registration hooks."
            />
            <MiniFeature
              icon={<ShieldAlert size={14} className="text-indigo-400" />}
              title="Egress Firewall"
              desc="Local network request auditing."
            />
            <MiniFeature
              icon={<HardDrive size={14} className="text-indigo-400" />}
              title="In-Memory Cache"
              desc="No secrets are written to disks."
            />
            <MiniFeature
              icon={<Bot size={14} className="text-indigo-400" />}
              title="AI Safe Sanitizing"
              desc="Converts logs to safe SHA hashes."
            />
            <MiniFeature
              icon={<Laptop size={14} className="text-indigo-400" />}
              title="Cross Platform"
              desc="Consistent on macOS, Linux, Windows."
            />
            <MiniFeature
              icon={<Zap size={14} className="text-indigo-400" />}
              title="Minimal Overhead"
              desc="Extremely lightweight event checking."
            />
          </div>
        </div>
      </section>

      {/* 10. Pre-Footer Banner */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-zinc-950 to-zinc-900 border border-indigo-900/30 rounded-3xl p-8 md:p-14 text-white shadow-2xl">
          {/* Decorative radial blur in banner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Watermark SVG logo in the background */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
            <LogoIcon size={340} />
          </div>

          <div className="max-w-2xl space-y-6 relative z-10">
            <LogoIcon size={56} className="bg-indigo-950/60 border border-indigo-900/30 rounded-2xl p-2.5" />
            <h3 className="text-3xl md:text-4xl font-extrabold leading-[1.2] tracking-tight">
              Secrets Should Never Leave The Process. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300">Monitor. Detect. Block.</span> <br />
              Before The Network Sees Them.
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href="#installation"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-sm px-6 py-3.5 rounded-full shadow-lg transition-all active:scale-[0.98]"
              >
                Get Started Now
                <ArrowRight size={16} className="stroke-[2.5]" />
              </a>
              <a
                href="#docs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-extrabold text-sm px-6 py-3.5 rounded-full backdrop-blur-sm transition-all"
              >
                <BookOpen size={16} />
                Read Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <footer className="border-t border-zinc-900/80 bg-[#030303] pt-16 pb-12 transition-all relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-zinc-900">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <LogoBrand />
              <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-xs font-semibold">
                Runtime secret leak prevention for Node.js applications. Shielding databases, consoles, processes, and HTTP endpoints in real time.
              </p>
            </div>

            {/* Links Columns */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Product</h5>
              <ul className="space-y-2.5 text-xs font-bold text-zinc-400">
                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#attack-surfaces" className="hover:text-indigo-400 transition-colors">Attack Surfaces</a></li>
                <li><a href="#architecture" className="hover:text-indigo-400 transition-colors">Architecture</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Resources</h5>
              <ul className="space-y-2.5 text-xs font-bold text-zinc-400">
                <li><a href="#docs" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">CLI Reference</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Examples</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Community</h5>
              <ul className="space-y-2.5 text-xs font-bold text-zinc-400">
                <li><a href="https://github.com" className="hover:text-indigo-400 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Discussions</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Issues</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Legal</h5>
              <ul className="space-y-2.5 text-xs font-bold text-zinc-400">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">MIT License</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Use</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[10px] font-bold text-zinc-550 text-zinc-500">
            <span>© {new Date().getFullYear()} envtrap. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-zinc-300 transition-colors">Status</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Security Audit</a>
              <a href="#" className="hover:text-zinc-300 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Sub-Components

function AttackSurfaceRow({
  num,
  title,
  desc,
  status,
  statusType,
}: {
  num: string;
  title: string;
  desc: string;
  status: string;
  statusType: "danger" | "warning";
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-zinc-900 last:border-b-0 group">
      <div className="flex gap-4">
        <span className="font-mono text-[10px] font-extrabold text-zinc-600 pt-0.5 select-none">{num}</span>
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">
            {title}
          </h5>
          <p className="text-[11px] text-zinc-500 max-w-sm md:max-w-md font-medium leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
      
      <span
        className={`text-[9px] font-black tracking-widest shrink-0 uppercase px-2 py-0.5 rounded border ${
          statusType === "danger"
            ? "bg-rose-950/40 text-rose-450 border-rose-900/30"
            : "bg-amber-950/40 text-amber-450 border-amber-900/30"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function MiniFeature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 items-start animate-slide-up">
      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="space-y-1">
        <h5 className="text-[11.5px] font-bold text-zinc-200 tracking-wide leading-tight">
          {title}
        </h5>
        <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
          {desc}
        </p>
      </div>
    </div>
  );
}

function WorkStepCard({
  stepNum,
  icon,
  title,
  desc,
}: {
  stepNum: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 shadow-inner text-left flex flex-col justify-between group overflow-hidden hover:border-zinc-800 transition-colors duration-300">
      {/* Subtle indicator for order */}
      <span className="absolute -right-3 -top-3 text-5xl font-black text-zinc-900 select-none group-hover:text-indigo-500/5 transition-colors">
        {stepNum}
      </span>

      <div className="space-y-3.5 relative z-10">
        <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-900/40 flex items-center justify-center">
          {icon}
        </div>
        <h4 className="text-xs font-bold text-zinc-200">
          {stepNum}. {title}
        </h4>
        <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
          {desc}
        </p>
      </div>
    </div>
  );
}
