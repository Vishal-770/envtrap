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
  Target,
  Search,
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

export default function Home() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const copyToClipboard = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-slate-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#" className="hover:opacity-95 transition-opacity">
            <LogoBrand />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <a href="#features" className="hover:text-indigo-650 transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-indigo-650 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-indigo-650 transition-colors">Docs</a>
            <a href="#pricing" className="hover:text-indigo-650 transition-colors">Pricing</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-650 transition-colors flex items-center gap-1"
            >
              GitHub
            </a>
          </nav>

          {/* CTA / Mobile Menu toggle */}
          <div className="flex items-center gap-4">
            <a href="#" className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900 mr-2 transition-colors">
              Log in
            </a>
            <a
              href="#installation"
              className="hidden sm:inline-flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all"
            >
              Get Started
              <ArrowRight size={13} className="stroke-[2.5]" />
            </a>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-500 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-100 bg-white px-6 py-5 space-y-4 shadow-xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-500 hover:text-indigo-650"
            >
              Product
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-500 hover:text-indigo-650"
            >
              How It Works
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-500 hover:text-indigo-650"
            >
              Docs
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-500 hover:text-indigo-650"
            >
              Pricing
            </a>
            <a
              href="https://github.com"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-500 hover:text-indigo-650"
            >
              GitHub
            </a>
            <a
              href="#installation"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-zinc-950 hover:bg-zinc-900 text-white text-sm font-bold py-3 rounded-full w-full shadow-md transition-colors"
            >
              Get Started
              <ArrowRight size={13} className="stroke-[2.5]" />
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text details */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 bg-[#eef2ff] border border-indigo-100/50 rounded-full px-3.5 py-1 text-[10px] font-bold text-[#4f46e5] tracking-wider uppercase animate-slide-up">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f46e5]" />
              Runtime Secret Leak Prevention for Node.js
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] animate-slide-up delay-100">
              Stop secrets <br />
              before they <br />
              <span className="text-[#4f46e5]">
                leave your process.
              </span>
            </h1>

            {/* Paragraph description */}
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg animate-slide-up delay-200">
              envtrap is a runtime security agent for Node.js that detects and blocks accidental or malicious exfiltration of secrets across logs, network, DNS, and subprocesses.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-row items-center gap-4 animate-slide-up delay-300">
              <a
                href="#installation"
                className="inline-flex items-center justify-center gap-1.5 bg-zinc-955 bg-zinc-900 hover:bg-zinc-950 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-sm transition-all scale-100 hover:scale-[1.02]"
              >
                Get Started
                <ArrowRight size={14} className="stroke-[2.5]" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-semibold text-sm px-6 py-3 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all"
              >
                View on GitHub
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-slate-800" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>

            {/* Trusted By Section */}
            <div className="pt-10 border-t border-slate-100 max-w-xl animate-slide-up delay-400">
              <div className="flex items-center gap-4 mb-4.5">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider whitespace-nowrap uppercase">Trusted by engineering teams at</span>
                <div className="w-full h-px bg-slate-100" />
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-slate-400/80">
                {/* Vercel */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none">
                  <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10.5px] border-b-current" />
                  <span>Vercel</span>
                </div>
                {/* Netlify */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L2.7 5.4v13.2L12 24l9.3-5.4V5.4L12 0zm5.4 12.6l-5.4 3.1V9.5l5.4 3.1zm-7.2-4.1l5.4-3.1v6.2l-5.4 3.1V8.5z" />
                  </svg>
                  <span>Netlify</span>
                </div>
                {/* Render */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none">
                  <span className="w-3.5 h-3.5 rounded-xs border border-current flex items-center justify-center font-black text-[7px] leading-none">R</span>
                  <span>Render</span>
                </div>
                {/* Railway */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0V0zm2 2v20h20V2H2zm4 4h12v12H6V6z" />
                  </svg>
                  <span>Railway</span>
                </div>
                {/* Supabase */}
                <div className="flex items-center gap-1.5 font-bold text-xs select-none">
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

      {/* 4. Features Grid (5 columns/cards) */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <FeatureGridCard
            icon={<Zap size={16} className="text-indigo-600" />}
            title="Zero Configuration"
            desc="Works out of the box. No setup. No edits."
            className="animate-slide-up"
          />
          <FeatureGridCard
            icon={<Shield size={16} className="text-indigo-600" />}
            title="In-Memory Root CA"
            desc="No private key on disk. Always secure."
            className="animate-slide-up delay-100"
          />
          <FeatureGridCard
            icon={<Eye size={16} className="text-indigo-600" />}
            title="Real-Time Protection"
            desc="Interceptors at runtime, not just static scanning."
            className="animate-slide-up delay-200"
          />
          <FeatureGridCard
            icon={<Bot size={16} className="text-indigo-600" />}
            title="AI-Safe Reporting"
            desc="Hashes, not secrets. Safe for AI tools."
            className="animate-slide-up delay-300"
          />
          <FeatureGridCard
            icon={<Lock size={16} className="text-indigo-600" />}
            title="100% Local Execution"
            desc="No telemetry. No data leaves your machine."
            className="animate-slide-up delay-400 sm:col-span-2 lg:col-span-1"
          />
        </div>
      </section>

      {/* 5. Double Panel (Why Existing Tools Fail & Five Runtime Attack Surfaces) */}
      <section className="max-w-7xl mx-auto px-6 pb-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left Panel: Comparison */}
          <div className="space-y-6 flex flex-col">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Why Existing Tools Fail
            </h3>
            <div className="flex-1 flex">
              <Comparison />
            </div>
          </div>

          {/* Right Panel: Five Runtime Attack Surfaces */}
          <div className="space-y-6 flex flex-col">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Five Runtime Attack Surfaces
            </h3>
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-4 flex flex-col justify-between">
              <AttackSurfaceRow
                num="01"
                title="stdout / stderr"
                desc="Native addon or app logs exposing secrets to console"
                status="Blocked"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="02"
                title="HTTPS MITM"
                desc="Compromised dependency sending secrets externally?"
                status="Blocked"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="03"
                title="Subprocesses"
                desc="Environment variables inherited by child processes?"
                status="Blocked"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="04"
                title="DNS Tunneling"
                desc="Secret encoded into hostname for exfiltration?"
                status="Blocked"
                statusType="danger"
              />
              <AttackSurfaceRow
                num="05"
                title="Entropy Detection"
                desc="High-entropy DNS payloads detected via Shannon entropy."
                status="Warned"
                statusType="warning"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Deep Runtime Protection Architecture */}
      <section id="security" className="max-w-7xl mx-auto px-6 pb-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center mb-8">
          <div className="lg:col-span-1 space-y-4 text-center lg:text-left">
            <h3 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Deep Runtime Protection Architecture
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
              envtrap operates at the lowest boundaries of your runtime environments to deliver complete visibility, real-time threat interception, and secret leak prevention without sacrificing execution speed.
            </p>
          </div>
          <div className="lg:col-span-2 w-full">
            <Architecture />
          </div>
        </div>
      </section>

      {/* 7. How envtrap Works (6-step flow) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 pb-20 md:pb-24 text-center">
        <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-12">
          How envtrap Works
        </h3>

        {/* Steps flow horizontal container */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <WorkStepCard
            stepNum="1"
            icon={<Star size={16} className="text-indigo-600" />}
            title="Secret Generated"
            desc="Application or dependency creates or accesses a secret."
          />
          <WorkStepCard
            stepNum="2"
            icon={<Send size={16} className="text-indigo-600" />}
            title="Secret Tries to Leave"
            desc="Via logs, network, DNS or child process."
          />
          <WorkStepCard
            stepNum="3"
            icon={<Compass size={16} className="text-indigo-600" />}
            title="envtrap Intercepts"
            desc="At the runtime boundary in real time."
          />
          <WorkStepCard
            stepNum="4"
            icon={<Search size={16} className="text-indigo-600" />}
            title="Secret Identified"
            desc="Entropy & patterns detect the secret."
          />
          <WorkStepCard
            stepNum="5"
            icon={<ShieldAlert size={16} className="text-indigo-600" />}
            title="Leak Blocked"
            desc="The exfiltration is blocked instantly."
          />
          <WorkStepCard
            stepNum="6"
            icon={<FileText size={16} className="text-indigo-600" />}
            title="Report Generated"
            desc="Redacted, hash-based report written."
          />
        </div>
      </section>

      {/* 8. Highlights (AI-Safe, reports, installation cards) */}
      <section className="max-w-7xl mx-auto px-6 pb-20 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: AI-Safe by Design */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <h4 className="text-lg font-bold text-slate-900">AI-Safe by Design</h4>
              
              {/* Bad vs Good comparison visual */}
              <div className="space-y-3.5 border border-slate-100 rounded-xl p-4 bg-slate-50/50 font-mono text-[11px]">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-rose-500 font-extrabold">BAD</span>
                  <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-extrabold text-[9px] border border-rose-100">
                    <X size={10} className="stroke-[3.5]" />
                    Sent to AI History
                  </div>
                </div>
                <div className="text-slate-400 break-all select-none">
                  sk_live_abc123...
                </div>

                <div className="flex items-center justify-between pt-3 pb-2.5 border-b border-slate-100">
                  <span className="text-emerald-500 font-extrabold">GOOD</span>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-extrabold text-[9px] border border-emerald-100">
                    <Check size={10} className="stroke-[3.5]" />
                    Non-reversible
                  </div>
                </div>
                <div className="text-slate-800 break-all font-bold">
                  SHA256:e6b8eee7...
                </div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pt-1">
                  <ShieldCheck size={12} className="stroke-[2.5]" /> Safe for AI Tools
                </div>
              </div>

              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                envtrap never prints raw secrets. Only non-reversible hashes are logged — safe for Claude Code, Copilot CLI, and other AI assisted environments.
              </p>
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <Shield size={14} />
              <span>Cryptographic Safety Guard</span>
            </div>
          </div>

          {/* Card B: Machine Readable Reports */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <h4 className="text-lg font-bold text-slate-900">Machine Readable Reports</h4>
              
              {/* JSON code box */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 text-slate-700 font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner">
                <span className="text-slate-400">{`{`}</span>
                <div className="pl-4">
                  <span className="text-indigo-600 font-semibold">"secretName"</span>: <span className="text-emerald-600 font-semibold">"STRIPE_SECRET_KEY"</span>,
                  <br />
                  <span className="text-indigo-600 font-semibold">"channel"</span>: <span className="text-emerald-600 font-semibold">"dns"</span>,
                  <br />
                  <span className="text-indigo-600 font-semibold">"sha256"</span>: <span className="text-emerald-600 font-semibold">"e6b8eee70bd6..."</span>,
                  <br />
                  <span className="text-indigo-600 font-semibold">"context"</span>: <span className="text-emerald-600 font-semibold">"[REDACTED].attacker.com"</span>,
                  <br />
                  <span className="text-indigo-600 font-semibold">"timestamp"</span>: <span className="text-slate-800 font-semibold">170131604545</span>
                </div>
                <span className="text-slate-400">{`}`}</span>
              </div>

              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Structured JSON schema reports let your CI/CD systems or autonomous AI agents automatically locate and patch the source of a leaked parameter.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-2 text-indigo-600 font-bold text-xs">
              <Bot size={14} />
              <span>AI Agent Integrable Schema</span>
            </div>
          </div>

          {/* Card C: Installation */}
          <div id="installation" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <h4 className="text-lg font-bold text-slate-900">Installation</h4>
              
              {/* Copy commands steps */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-50 flex items-center justify-center text-[9px]">1</span>
                    <span>Install</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-mono text-[11px] text-slate-700 shadow-inner group">
                    <span className="truncate select-all">npm install -g envtrap</span>
                    <button
                      onClick={() => copyToClipboard("npm install -g envtrap", setCopiedInstall)}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label="Copy install command"
                    >
                      {copiedInstall ? <Check size={13} className="text-emerald-500 stroke-[3]" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-50 flex items-center justify-center text-[9px]">2</span>
                    <span>Run</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 font-mono text-[11px] text-slate-700 shadow-inner group">
                    <span className="truncate select-all">envtrap run node app.js</span>
                    <button
                      onClick={() => copyToClipboard("envtrap run node app.js", setCopiedRun)}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      aria-label="Copy run command"
                    >
                      {copiedRun ? <Check size={13} className="text-emerald-500 stroke-[3]" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Start protecting your production systems and local processes instantly without altering a single line of application source code.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-1.5 text-indigo-600 font-bold text-xs">
              <span>That's it. 🚀</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Engineered for Enterprise Scale (10-Feature Grid) */}
      <section className="max-w-7xl mx-auto px-6 pb-20 md:pb-24">
        <div className="border-t border-slate-100 pt-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12">
            <MiniFeature
              icon={<Shield size={14} className="text-indigo-650" />}
              title="Dynamic TLS Certificates"
              desc="Generated on the fly."
            />
            <MiniFeature
              icon={<Terminal size={14} className="text-indigo-650" />}
              title="Native Addon Coverage"
              desc="Captures OS-level writes."
            />
            <MiniFeature
              icon={<Globe size={14} className="text-indigo-650" />}
              title="DNS Tunneling Detection"
              desc="Stops secret exfil via DNS."
            />
            <MiniFeature
              icon={<Activity size={14} className="text-indigo-650" />}
              title="Shannon Entropy Analysis"
              desc="Detects obfuscated payloads."
            />
            <MiniFeature
              icon={<Link size={14} className="text-indigo-650" />}
              title="ESM Hook Interception"
              desc="Hard to bypass."
            />
            <MiniFeature
              icon={<ShieldAlert size={14} className="text-indigo-650" />}
              title="Egress Firewall"
              desc="Runtime outbound control."
            />
            <MiniFeature
              icon={<HardDrive size={14} className="text-indigo-650" />}
              title="In-Memory Operations"
              desc="No secrets written to disk."
            />
            <MiniFeature
              icon={<Bot size={14} className="text-indigo-650" />}
              title="AI Safe Reporting"
              desc="No raw secrets. Ever."
            />
            <MiniFeature
              icon={<Laptop size={14} className="text-indigo-655" />}
              title="Cross Platform"
              desc="macOS, Linux, Windows."
            />
            <MiniFeature
              icon={<Zap size={14} className="text-indigo-650" />}
              title="Lightweight"
              desc="Low overhead."
            />
          </div>
        </div>
      </section>

      {/* 9. Pre-Footer Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-20 md:pb-24">
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 rounded-3xl p-8 md:p-14 text-white shadow-xl shadow-indigo-500/10">
          {/* Watermark SVG logo in the background */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
            <LogoIcon size={340} />
          </div>

          <div className="max-w-2xl space-y-6 relative z-10">
            <LogoIcon size={56} className="bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border border-white/20" />
            <h3 className="text-3xl md:text-4xl font-extrabold leading-[1.2] tracking-tight">
              Secrets Should Never Leave The Process. <br />
              <span className="text-indigo-200">Monitor. Detect. Block.</span> <br />
              Before The Network Sees Them.
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href="#installation"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-indigo-600 font-extrabold text-sm px-6 py-3.5 rounded-full shadow-md transition-all scale-100 hover:scale-[1.02]"
              >
                Get Started Now
                <ArrowRight size={16} className="stroke-[2.5]" />
              </a>
              <a
                href="#docs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-500/30 hover:bg-indigo-500/40 text-white font-extrabold text-sm px-6 py-3.5 rounded-full border border-white/10 backdrop-blur-sm transition-all"
              >
                <BookOpen size={16} />
                Read Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-12 transition-all">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-slate-100">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <LogoBrand />
              <p className="text-slate-450 text-xs md:text-sm leading-relaxed max-w-xs">
                Runtime secret leak prevention for Node.js applications. Shielding databases, consoles, processes, and HTTP endpoints in real time.
              </p>
            </div>

            {/* Links Columns */}
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</h5>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How It Works</a></li>
                <li><a href="#security" className="hover:text-indigo-600 transition-colors">Security</a></li>
                <li><a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resources</h5>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li><a href="#docs" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">CLI Reference</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Examples</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community</h5>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li><a href="https://github.com" className="hover:text-indigo-600 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Discussions</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Issues</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contributing</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal</h5>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">MIT License</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Use</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-2xs font-semibold text-slate-400">
            <span>© {new Date().getFullYear()} envtrap. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-600 transition-colors">Status</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Security Audit</a>
              <a href="#" className="hover:text-slate-600 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Sub-Components

function FeatureGridCard({
  icon,
  title,
  desc,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-200 transition-all group ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-50/50 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
        {icon}
      </div>
      <h4 className="text-xs font-bold text-slate-900 mb-1.5">
        {title}
      </h4>
      <p className="text-[11px] text-slate-400 leading-normal">
        {desc}
      </p>
    </div>
  );
}

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
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-100 last:border-b-0 group">
      <div className="flex gap-4">
        <span className="font-mono text-2xs font-bold text-slate-300 pt-0.5 select-none">{num}</span>
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
            {title}
          </h5>
          <p className="text-[11px] text-slate-400 max-w-sm md:max-w-md font-semibold leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
      
      <span
        className={`text-[11px] font-extrabold tracking-wide shrink-0 ${
          statusType === "danger"
            ? "text-rose-600"
            : "text-amber-600"
        }`}
      >
        {status}.
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
      <div className="w-7 h-7 rounded-lg bg-indigo-50/70 border border-indigo-100/30 flex items-center justify-center shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="space-y-1">
        <h5 className="text-[11.5px] font-extrabold text-slate-900 tracking-wide leading-tight">
          {title}
        </h5>
        <p className="text-[10px] text-slate-400 font-semibold leading-normal">
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
    <div className="relative bg-white border border-slate-100 rounded-2xl p-5 shadow-xs text-left flex flex-col justify-between group overflow-hidden">
      {/* Subtle indicator for order */}
      <span className="absolute -right-3 -top-3 text-5xl font-black text-slate-50 select-none group-hover:text-indigo-500/5 transition-colors">
        {stepNum}
      </span>

      <div className="space-y-3.5 relative z-10">
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100/30">
          {icon}
        </div>
        <h4 className="text-xs font-extrabold text-slate-900">
          {stepNum}. {title}
        </h4>
        <p className="text-[11px] text-slate-405 leading-normal">
          {desc}
      </p>
      </div>
    </div>
  );
}
