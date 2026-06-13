"use client";

import React, { useState, useEffect, useRef } from "react";
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
import Comparison from "./components/Comparison";
import Architecture from "./components/Architecture";
import TerminalFlow from "./components/TerminalFlow";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedRun, setCopiedRun] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Package Manager selector
  const [pkgManager, setPkgManager] = useState<"npm" | "pnpm" | "yarn" | "bun">("npm");
  const pkgCommands = {
    npm: { install: "npm install -g envtrap", run: "envtrap run node app.js" },
    pnpm: { install: "pnpm add -g envtrap", run: "envtrap run node app.js" },
    yarn: { install: "yarn global add envtrap", run: "envtrap run node app.js" },
    bun: { install: "bun add -g envtrap", run: "envtrap run node app.js" },
  };

  // Redaction sandbox console toggle
  const [redactSandbox, setRedactSandbox] = useState<"raw" | "sanitized">("sanitized");

  const copyToClipboard = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  // References for GSAP
  const pinSectionRef = useRef<HTMLDivElement>(null);
  const flowPathRef = useRef<SVGPathElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // --- 1. Scroll-linked Glow Wave (Bauhaus Stark progress indicator) ---
      gsap.fromTo(
        ".glow-wave",
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

      // --- 2. Hero Text & Image Entrance Timeline ---
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      // Set initial states to avoid flashes
      gsap.set([".hero-tag", ".hero-title", ".hero-desc", ".hero-ctas", ".hero-trusted", ".hero-visual"], {
        opacity: 0
      });

      heroTl.fromTo(".hero-tag", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
            .fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.45")
            .fromTo(".hero-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.5")
            .fromTo(".hero-ctas", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.4")
            .fromTo(".hero-trusted", { opacity: 0 }, { opacity: 1, duration: 0.6 }, "-=0.3")
            .fromTo(".hero-visual", { scale: 0.98, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, "-=0.6");

      // --- 3. Pinned Storytelling Section (Step-by-Step Egress Interception) ---
      if (pinSectionRef.current && flowPathRef.current && particleRef.current) {
        // Path details: total length for dash animation
        const pathLength = flowPathRef.current.getTotalLength();
        gsap.set(flowPathRef.current, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        const storyTl = gsap.timeline({
          scrollTrigger: {
            trigger: pinSectionRef.current,
            start: "top top",
            end: "+=300%", // Scroll depth for pinning
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // Step 1: Secret Created (progress 0.0 -> 0.25)
        storyTl.to(".story-text-1", { opacity: 1, y: 0, duration: 0.5 }, 0)
               .to(".story-visual-code", { borderColor: "#D02020", duration: 0.5 }, 0)
               .to(particleRef.current, { opacity: 1, scale: 1.5, duration: 0.3 }, 0.2);

        // Step 2: Egress Attempted (progress 0.25 -> 0.5)
        storyTl.to(".story-text-1", { opacity: 0.2, y: -10, duration: 0.5 }, 0.8)
               .to(".story-text-2", { opacity: 1, y: 0, duration: 0.5 }, 0.8)
               // Draw SVG path towards shield
               .to(flowPathRef.current, { strokeDashoffset: pathLength * 0.5, duration: 0.8 }, 0.8)
               // Animate particle along path
               .to(particleRef.current, { x: 140, y: 0, duration: 0.8 }, 0.8);

        // Step 3: envtrap Intercepts (progress 0.5 -> 0.75)
        storyTl.to(".story-text-2", { opacity: 0.2, y: -10, duration: 0.5 }, 1.6)
               .to(".story-text-3", { opacity: 1, y: 0, duration: 0.5 }, 1.6)
               .to(".story-visual-shield", { scale: 1.15, borderColor: "#1040C0", backgroundColor: "#F0C020", duration: 0.5 }, 1.6)
               .to(flowPathRef.current, { strokeDashoffset: pathLength * 0.42, duration: 0.4 }, 1.6)
               .to(particleRef.current, { x: 195, y: 0, duration: 0.4 }, 1.6); // halt at shield

        // Step 4: Blocked & Redacted (progress 0.75 -> 1.0)
        storyTl.to(".story-text-3", { opacity: 0.2, y: -10, duration: 0.5 }, 2.4)
               .to(".story-text-4", { opacity: 1, y: 0, duration: 0.5 }, 2.4)
               .to(".story-visual-shield-icon", { color: "#121212", duration: 0.3 }, 2.4)
               .to(".story-visual-barrier", { opacity: 1, scaleY: 1.2, duration: 0.4 }, 2.4)
               .to(particleRef.current, { fill: "#D02020", scale: 1, duration: 0.3 }, 2.4)
               .to(".story-visual-terminal", { opacity: 1, y: 0, duration: 0.6 }, 2.5)
               .to(".terminal-typing-line-1", { display: "block", duration: 0.1 }, 2.6)
               .to(".terminal-typing-line-2", { display: "block", duration: 0.1 }, 2.9)
               .to(".terminal-typing-line-3", { display: "block", duration: 0.1 }, 3.2);
      }

      // --- 4. Bento Grid Card Scroll Guided Activation ---
      const cards = gsap.utils.toArray(".bento-card-trigger");
      cards.forEach((card: any) => {
        gsap.fromTo(
          card,
          { opacity: 0.5, y: 0 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
              end: "bottom 30%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // Bento entrance stagger on view
      gsap.fromTo(
        ".bento-item-anim",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".bento-grid-trigger",
            start: "top 80%",
          },
        }
      );

      // --- 5. Step Cards Entrance Stagger ---
      gsap.fromTo(
        ".step-card-anim",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".steps-section-trigger",
            start: "top 80%",
          },
        }
      );

      // Cleanup
      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] font-sans antialiased selection:bg-[#F0C020]/30 selection:text-[#121212] relative">
      
      {/* Scroll progress Glow Wave (Tracks scroll on left margin) */}
      <div className="glow-wave left-4 md:left-8 top-0" />

      {/* Grid background mask overlay */}
      <div className="absolute top-0 left-0 w-full h-[800px] grid-bg pointer-events-none z-0" />
      <div className="absolute inset-0 grid-bg-full pointer-events-none z-0 opacity-60" />

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b-3 border-[#121212] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <a href="#" className="hover:opacity-95 transition-opacity flex items-center">
            <LogoBrand />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest text-[#121212]">
            <a href="#features" className="hover:text-[#D02020] transition-colors">Product</a>
            <a href="#demo" className="hover:text-[#D02020] transition-colors">How It Works</a>
            <a href="#attack-surfaces" className="hover:text-[#D02020] transition-colors">Attack Surfaces</a>
            <a href="#architecture" className="hover:text-[#D02020] transition-colors">Architecture</a>
            <a href="#docs" className="hover:text-[#D02020] transition-colors">Docs</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <a
              href="#installation"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#F0C020] text-[#121212] border-2 border-[#121212] text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-none shadow-[3px_3px_0px_#121212] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#121212] active:translate-x-[0px] active:translate-y-[0px] transition-all"
            >
              Get Started
              <ArrowRight size={13} className="stroke-[2.5]" />
            </a>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-[#121212] hover:text-[#D02020]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b-3 border-[#121212] bg-[#F0F0F0] px-6 py-6 space-y-4 shadow-lg">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-black uppercase tracking-widest text-[#121212] hover:text-[#D02020]"
            >
              Product
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-black uppercase tracking-widest text-[#121212] hover:text-[#D02020]"
            >
              How It Works
            </a>
            <a
              href="#attack-surfaces"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-black uppercase tracking-widest text-[#121212] hover:text-[#D02020]"
            >
              Attack Surfaces
            </a>
            <a
              href="#architecture"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-black uppercase tracking-widest text-[#121212] hover:text-[#D02020]"
            >
              Architecture
            </a>
            <a
              href="#docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-black uppercase tracking-widest text-[#121212] hover:text-[#D02020]"
            >
              Docs
            </a>
            <a
              href="#installation"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 bg-[#F0C020] text-[#121212] border-2 border-[#121212] text-sm font-black uppercase tracking-widest py-3 shadow-[3px_3px_0px_#121212] w-full transition-colors"
            >
              Get Started
              <ArrowRight size={13} className="stroke-[2.5]" />
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section (Bauhaus Minimalist + Stark Architecture Visual) */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-36 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Tag Badge */}
            <div className="hero-tag inline-flex items-center gap-2 bg-[#1040C0] text-white border-2 border-[#121212] px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#121212]">
              <span className="w-1.5 h-1.5 bg-white animate-pulse" />
              Runtime Secret Leak Shield
            </div>

            {/* Headline */}
            <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-[#121212] leading-[0.94] uppercase">
              Stop secrets <br />
              before they <br />
              <span className="text-[#D02020]">
                leave your process.
              </span>
            </h1>

            {/* Paragraph description */}
            <p className="hero-desc text-sm sm:text-base text-zinc-700 leading-relaxed max-w-lg font-bold">
              envtrap is a runtime security agent for Node.js that intercepts and blocks exfiltration of database credentials, api keys, and tokens at the execution boundary.
            </p>

            {/* Hero CTAs */}
            <div className="hero-ctas flex flex-row items-center gap-4">
              <a
                href="#installation"
                className="inline-flex items-center justify-center gap-1.5 bg-[#D02020] text-white border-3 border-[#121212] text-xs font-black uppercase tracking-wider px-8 py-4 shadow-[4px_4px_0px_#121212] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#121212] active:translate-x-[0px] active:translate-y-[0px] transition-all"
              >
                Get Started
                <ArrowRight size={14} className="stroke-[2.5]" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#121212] border-3 border-[#121212] text-xs font-black uppercase tracking-wider px-8 py-4 shadow-[4px_4px_0px_#121212] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#121212] active:translate-x-[0px] active:translate-y-[0px] transition-all"
              >
                View on GitHub
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#121212]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>

            {/* Trusted By Section */}
            <div className="hero-trusted pt-10 border-t-2 border-[#121212] max-w-xl">
              <div className="flex items-center gap-4 mb-4.5">
                <span className="text-[9px] font-black text-zinc-550 text-zinc-400 tracking-widest whitespace-nowrap uppercase">Trusted by developer teams at</span>
                <div className="w-full h-0.5 bg-[#121212]" />
              </div>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-zinc-500 font-black text-xs select-none">
                <div className="flex items-center gap-1.5 hover:text-[#121212] transition-colors">
                  <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10.5px] border-b-zinc-500" />
                  <span>Vercel</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#121212] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L2.7 5.4v13.2L12 24l9.3-5.4V5.4L12 0zm5.4 12.6l-5.4 3.1V9.5l5.4 3.1zm-7.2-4.1l5.4-3.1v6.2l-5.4 3.1V8.5z" />
                  </svg>
                  <span>Netlify</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#121212] transition-colors">
                  <span className="w-3.5 h-3.5 rounded-none border-2 border-current flex items-center justify-center font-black text-[7px] leading-none">R</span>
                  <span>Render</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#121212] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0V0zm2 2v20h20V2H2zm4 4h12v12H6V6z" />
                  </svg>
                  <span>Railway</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-[#121212] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-3 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.4 24l8.3-12.7H13L16.2 0 7.9 12.7h8.7L13.4 24z" />
                  </svg>
                  <span>Supabase</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Bauhaus Architecture Morph / Exploded View */}
          <div className="hero-visual lg:col-span-6 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[480px] bg-white border-3 border-[#121212] rounded-none p-6 shadow-[6px_6px_0px_#121212] flex flex-col items-center justify-center relative aspect-square overflow-hidden">
              
              {/* Central envtrap hub (Stark geometric block) */}
              <div className="w-20 h-20 rounded-none bg-[#F0C020] border-3 border-[#121212] shadow-[4px_4px_0px_#121212] flex flex-col items-center justify-center relative z-25 hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="envtrap logo"
                  width={34}
                  height={34}
                  className="object-contain"
                />
                <span className="text-[7px] font-black uppercase mt-1">Shield</span>
              </div>

              {/* Exploded Channel badges (Geometric blocks stacked constructivist style) */}
              <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-0">
                <div className="px-3.5 py-2 rounded-none bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] flex items-center gap-2 font-mono text-[9px] font-black uppercase text-[#121212]">
                  <Terminal size={12} className="text-[#1040C0]" />
                  <span>stdout logs</span>
                </div>
                <div className="h-10 w-0.5 bg-[#121212]" />
              </div>

              <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col-reverse items-center gap-0">
                <div className="px-3.5 py-2 rounded-none bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] flex items-center gap-2 font-mono text-[9px] font-black uppercase text-[#121212]">
                  <Lock size={12} className="text-[#D02020]" />
                  <span>subprocesses</span>
                </div>
                <div className="h-10 w-0.5 bg-[#121212]" />
              </div>

              <div className="absolute left-[8%] top-[45%] flex items-center gap-0">
                <div className="px-3.5 py-2 rounded-none bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] flex items-center gap-2 font-mono text-[9px] font-black uppercase text-[#121212]">
                  <Globe size={12} className="text-[#1040C0]" />
                  <span>HTTPS proxy</span>
                </div>
                <div className="w-10 h-0.5 bg-[#121212]" />
              </div>

              <div className="absolute right-[8%] top-[45%] flex flex-row-reverse items-center gap-0">
                <div className="px-3.5 py-2 rounded-none bg-white border-2 border-[#121212] shadow-[3px_3px_0px_#121212] flex items-center gap-2 font-mono text-[9px] font-black uppercase text-[#121212]">
                  <Activity size={12} className="text-[#D02020]" />
                  <span>DNS Tunnel</span>
                </div>
                <div className="w-10 h-0.5 bg-[#121212]" />
              </div>

              {/* Geometric visual accent structures */}
              <div className="absolute w-[60%] h-[60%] rounded-none border-2 border-dashed border-zinc-350 pointer-events-none" />
              <div className="absolute w-[80%] h-[80%] rounded-none border-2 border-zinc-200 pointer-events-none" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Pinned Storytelling Section (Step-by-step Egress Interception) */}
      <section id="demo" ref={pinSectionRef} className="w-full bg-[#E0E0E0] border-y-3 border-[#121212] relative z-20">
        <div className="max-w-7xl mx-auto px-6 h-screen flex flex-col justify-center py-20 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full">
            
            {/* Left Column: Story Narratives */}
            <div className="lg:col-span-5 space-y-16 relative">
              <div className="space-y-4">
                <span className="inline-block px-2 py-1 bg-[#1040C0] text-white text-[8px] font-black uppercase tracking-widest border border-[#121212]">Interactive Walkthrough</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-[#121212]">How envtrap Intercepts Leaks</h2>
                <p className="text-xs text-zinc-750 font-bold leading-relaxed">Scroll down to observe the exfiltration blocking lifecycle step-by-step.</p>
              </div>

              {/* Story text layers */}
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="story-text-1 transform translate-y-4 space-y-3 opacity-100">
                  <div className="flex items-center gap-2 font-mono text-xs font-black text-[#D02020]">
                    <span>STEP 01</span>
                    <span className="h-0.5 bg-[#121212] w-8" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-[#121212]">Secret Loaded in Memory</h4>
                  <p className="text-xs text-zinc-750 font-semibold leading-relaxed max-w-sm">
                    A malicious npm package, compromised dependency, or debug statement attempts to read configuration credentials like `STRIPE_SECRET_KEY` from process memory.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="story-text-2 transform translate-y-4 space-y-3 opacity-20">
                  <div className="flex items-center gap-2 font-mono text-xs font-black text-[#D02020]">
                    <span>STEP 02</span>
                    <span className="h-0.5 bg-[#121212] w-8" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-[#121212]">Egress Attempt Triggered</h4>
                  <p className="text-xs text-zinc-750 font-semibold leading-relaxed max-w-sm">
                    The compromised library invokes an outbound connection, sending the private keys to a remote collection server (e.g. `api.attacker.com`) via HTTP or DNS names.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="story-text-3 transform translate-y-4 space-y-3 opacity-20">
                  <div className="flex items-center gap-2 font-mono text-xs font-black text-[#D02020]">
                    <span>STEP 03</span>
                    <span className="h-0.5 bg-[#121212] w-8" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-[#121212]">envtrap Boundary Interception</h4>
                  <p className="text-xs text-zinc-750 font-semibold leading-relaxed max-w-sm">
                    Before the network packet is sent, envtrap's runtime interceptor captures the raw buffers. The payload is checked against known secret signatures and Shannon entropy.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="story-text-4 transform translate-y-4 space-y-3 opacity-20">
                  <div className="flex items-center gap-2 font-mono text-xs font-black text-[#D02020]">
                    <span>STEP 04</span>
                    <span className="h-0.5 bg-[#121212] w-8" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-[#121212]">Blocked & Sanitized Report</h4>
                  <p className="text-xs text-zinc-750 font-semibold leading-relaxed max-w-sm">
                    The connection is terminated instantly. A cryptographic hash of the secret is generated for auditing, preventing any raw keys from leaking into log outputs.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Pipeline (SVG Path Drawing) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative h-[70vh]">
              <div className="w-full max-w-[500px] aspect-video border-3 border-[#121212] rounded-none bg-white shadow-[4px_4px_0px_#121212] p-6 flex items-center justify-between relative overflow-hidden">
                
                {/* SVG path connecting Code to Shield to Destination */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 300">
                  {/* Drawing Path */}
                  <path
                    ref={flowPathRef}
                    id="flow-path"
                    d="M 60 150 Q 150 100, 250 150 T 440 150"
                    fill="none"
                    stroke="#121212"
                    strokeWidth="3"
                  />
                  
                  {/* Flow Particle */}
                  <circle
                    ref={particleRef}
                    cx="60"
                    cy="150"
                    r="5"
                    fill="#1040C0"
                    className="opacity-0"
                  />
                </svg>

                {/* Source Node */}
                <div className="story-visual-code w-14 h-14 rounded-none bg-white border-2 border-[#121212] flex flex-col items-center justify-center relative z-10 shadow-[2px_2px_0px_#121212]">
                  <Terminal size={20} className="text-[#121212]" />
                  <span className="text-[8px] font-black uppercase text-zinc-500 mt-1">App</span>
                </div>

                {/* Interceptor Node */}
                <div className="story-visual-shield w-16 h-16 rounded-none bg-white border-2 border-[#121212] flex flex-col items-center justify-center relative z-10 shadow-[2px_2px_0px_#121212] transition-all duration-300">
                  <Shield size={22} className="story-visual-shield-icon text-zinc-400" />
                  <span className="text-[8px] font-black uppercase text-zinc-500 mt-1">envtrap</span>
                  
                  {/* Glowing red firewall barrier (starts hidden) */}
                  <div className="story-visual-barrier absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-16 bg-[#D02020] rounded-none opacity-0 scale-y-50 pointer-events-none border border-[#121212]" />
                </div>

                {/* Destination Node */}
                <div className="story-visual-dest w-14 h-14 rounded-none bg-white border-2 border-[#121212] flex flex-col items-center justify-center relative z-10 shadow-[2px_2px_0px_#121212]">
                  <Globe size={20} className="text-[#121212]" />
                  <span className="text-[8px] font-black uppercase text-zinc-500 mt-1">Egress</span>
                </div>
              </div>

              {/* Typewriter Terminal overlay (appears on step 4) */}
              <div className="story-visual-terminal absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-zinc-950 border-3 border-[#121212] rounded-none shadow-[6px_6px_0px_#121212] p-4 font-mono text-[10px] text-zinc-400 opacity-0 translate-y-4 transition-all duration-500 z-30">
                <div className="flex items-center gap-1.5 pb-2.5 border-b border-zinc-900 mb-2.5">
                  <span className="w-2 h-2 bg-[#D02020]" />
                  <span className="w-2 h-2 bg-[#F0C020]" />
                  <span className="w-2 h-2 bg-[#1040C0]" />
                </div>
                <div className="space-y-1.5">
                  <div className="terminal-typing-line-1 hidden">
                    <span className="text-indigo-400">$</span> envtrap run node app.js
                  </div>
                  <div className="terminal-typing-line-2 hidden text-rose-400">
                    [envtrap] Outbound HTTP Exfiltration Blocked: api.attacker.com
                  </div>
                  <div className="terminal-typing-line-3 hidden text-emerald-400">
                    [envtrap] SHA256 REDACTED: [REDACTED: SHA256:d8a57e31]
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. Custom Bento Grid (Asymmetrical 12-Column Layout) */}
      <section id="features" className="bento-grid-trigger max-w-7xl mx-auto px-6 py-32 relative z-10">
        <div className="space-y-4 text-center mb-20">
          <h2 className="text-xs font-black text-[#1040C0] uppercase tracking-widest">Core Capabilities</h2>
          <p className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight uppercase">Engineered for absolute security.</p>
        </div>

        {/* 12-Column Bento Grid */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Card 1: Zero Configuration (col-span-12 lg:col-span-8) */}
          <div className="bento-card-trigger bento-card col-span-12 lg:col-span-8 flex flex-col justify-between group bento-item-anim">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-none bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center text-[#121212] transition-transform group-hover:scale-105 shadow-[2px_2px_0px_#121212]">
                <Zap size={18} />
              </div>
              <h3 className="text-lg font-black uppercase text-[#121212] tracking-wide">Zero Configuration</h3>
              <p className="text-zinc-700 text-xs leading-relaxed max-w-sm font-bold">
                No code edits or custom library setup required. Wrap your startup command and begin runtime interception immediately.
              </p>
            </div>

            {/* Interactive Package selector */}
            <div className="mt-8 border-2 border-[#121212] rounded-none overflow-hidden bg-white font-mono text-[11px] shadow-[3px_3px_0px_#121212]">
              {/* Tab Selector */}
              <div className="flex border-b-2 border-[#121212] bg-[#F0F0F0] px-2 py-1">
                {(["npm", "pnpm", "yarn", "bun"] as const).map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPkgManager(pm)}
                    className={`px-3.5 py-1.5 rounded-none font-black uppercase tracking-wide transition-all ${
                      pkgManager === pm ? "bg-white text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_#121212]" : "text-zinc-550 hover:text-zinc-800 text-zinc-500"
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              {/* Console commands display */}
              <div className="p-4 space-y-2.5 text-[#121212] select-all relative group/copy">
                <div>
                  <span className="text-[#1040C0] font-black">$ </span>
                  {pkgCommands[pkgManager].install}
                </div>
                <div>
                  <span className="text-[#1040C0] font-black">$ </span>
                  {pkgCommands[pkgManager].run}
                </div>
                <button
                  onClick={() => copyToClipboard(`${pkgCommands[pkgManager].install} && ${pkgCommands[pkgManager].run}`, setCopiedInstall)}
                  className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-[#121212] opacity-0 group-hover/copy:opacity-100 transition-opacity p-1.5 bg-white border-2 border-[#121212] rounded-none shadow-[2px_2px_0px_#121212]"
                  aria-label="Copy commands"
                >
                  {copiedInstall ? <Check size={12} className="text-emerald-600 stroke-[3]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: In-Memory CA (col-span-12 lg:col-span-4) - Blue background */}
          <div className="bento-card-trigger bento-card col-span-12 lg:col-span-4 bg-[#1040C0] border-3 border-[#121212] text-white flex flex-col justify-between group bento-item-anim shadow-[4px_4px_0px_#121212]">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-none bg-white border-2 border-[#121212] flex items-center justify-center text-[#121212] transition-transform group-hover:scale-105 shadow-[2px_2px_0px_#121212]">
                <Shield size={18} />
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-wide">In-Memory Root CA</h3>
              <p className="text-zinc-200 text-xs leading-relaxed font-bold">
                Generates a unique 2048-bit Root CA in memory at startup. No private key is ever written to disk, ensuring TLS interception remains isolated.
              </p>
            </div>

            {/* Certificate visual diagram */}
            <div className="mt-8 border-2 border-[#121212] bg-white p-4 flex items-center justify-between font-mono text-[10px] text-zinc-500 shadow-[3px_3px_0px_#121212]">
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Key Lifecycle</span>
                <span className="text-[#1040C0] font-black">1. Generate key in RAM</span>
                <span className="text-zinc-650">2. Save public cert</span>
                <span className="text-[#D02020] font-black">3. Destroy key on exit</span>
              </div>
              <div className="border-2 border-[#121212] bg-[#F0C020] rounded-none p-3 flex flex-col items-center gap-1.5 shrink-0 shadow-[2px_2px_0px_#121212] text-[#121212]">
                <ShieldCheck size={20} className="text-[#121212]" />
                <span className="font-black text-[9px]">envtrap CA</span>
                <span className="px-1.5 py-0.5 bg-white text-[#121212] border border-[#121212] text-[8px] font-black uppercase">Verified</span>
              </div>
            </div>
          </div>

          {/* Card 3: Real-Time Interception (col-span-12 lg:col-span-4) - Yellow background */}
          <div className="bento-card-trigger bento-card col-span-12 lg:col-span-4 bg-[#F0C020] border-3 border-[#121212] text-[#121212] flex flex-col justify-between group bento-item-anim shadow-[4px_4px_0px_#121212]">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-none bg-white border-2 border-[#121212] flex items-center justify-center text-[#121212] transition-transform group-hover:scale-105 shadow-[2px_2px_0px_#121212]">
                <Eye size={18} />
              </div>
              <h3 className="text-lg font-black uppercase text-[#121212] tracking-wide">Real-Time Protection</h3>
              <p className="text-zinc-800 text-xs leading-relaxed font-bold">
                Intercepts exfiltration attempts at the execution boundary rather than statically scanning directories, catching keys generated dynamic-runtime.
              </p>
            </div>

            {/* Visualizer showing standard app vs envtrap */}
            <div className="mt-8 grid grid-cols-2 gap-4 font-mono text-[9px]">
              <div className="border-2 border-[#121212] bg-white p-3 flex flex-col justify-between h-24 shadow-[2px_2px_0px_#121212]">
                <div className="flex justify-between items-center text-[#D02020] font-black">
                  <span>UNPROTECTED</span>
                  <X size={12} className="stroke-[3.5]" />
                </div>
                <div className="text-zinc-650 leading-tight">
                  Outbound <br />
                  → Attacker Server <br />
                  <span className="text-[#D02020] font-bold">Exfil Leak!</span>
                </div>
              </div>

              <div className="border-2 border-[#121212] bg-white p-3 flex flex-col justify-between h-24 shadow-[2px_2px_0px_#121212]">
                <div className="flex justify-between items-center text-[#1040C0] font-black">
                  <span>envtrap</span>
                  <ShieldCheck size={12} />
                </div>
                <div className="text-zinc-700 leading-tight">
                  Outbound <br />
                  → Local Proxy <br />
                  <span className="text-[#1040C0] font-black">Killed connection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: AI-Safe Redacted Reporting (col-span-12 lg:col-span-8) */}
          <div className="bento-card-trigger bento-card col-span-12 lg:col-span-8 flex flex-col justify-between group bento-item-anim">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-none bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center text-[#121212] transition-transform group-hover:scale-105 shadow-[2px_2px_0px_#121212]">
                <Bot size={18} />
              </div>
              <h3 className="text-lg font-black uppercase text-[#121212] tracking-wide">AI-Safe Redacted Reporting</h3>
              <p className="text-zinc-700 text-xs leading-relaxed max-w-sm font-bold">
                Only cryptographic non-reversible hashes are ever written to stdout/reports. Paste outputs safely into LLMs without leaks.
              </p>
            </div>

            {/* Interactive Raw vs Redacted Output Console */}
            <div className="mt-8 border-2 border-[#121212] rounded-none overflow-hidden bg-[#F0F0F0] font-mono text-[10px] shadow-[3px_3px_0px_#121212]">
              <div className="flex border-b-2 border-[#121212] bg-white px-2 py-1 justify-between items-center">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest pl-2">Console output preview</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setRedactSandbox("raw")}
                    className={`px-2.5 py-1 rounded-none transition-all font-black uppercase ${
                      redactSandbox === "raw" ? "bg-[#D02020] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212]" : "text-zinc-400 hover:text-zinc-650"
                    }`}
                  >
                    Raw Output
                  </button>
                  <button
                    onClick={() => setRedactSandbox("sanitized")}
                    className={`px-2.5 py-1 rounded-none transition-all font-black uppercase ${
                      redactSandbox === "sanitized" ? "bg-[#1040C0] text-white border-2 border-[#121212] shadow-[2px_2px_0px_#121212]" : "text-zinc-400 hover:text-zinc-650"
                    }`}
                  >
                    envtrap Sanitized
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-1.5 text-[#121212] h-24 flex flex-col justify-center bg-white">
                {redactSandbox === "raw" ? (
                  <div className="text-[#D02020] leading-relaxed font-bold">
                    <div>console.log("Configuration loaded:", <span className="font-extrabold text-[#121212]">sk_live_51NzkSDFG889...</span>)</div>
                    <div className="text-zinc-550 mt-1 text-[8px] font-black uppercase">⚠️ DANGER: PRIVATE KEY VISIBLE IN CLEAR TEXT</div>
                  </div>
                ) : (
                  <div className="text-[#1040C0] leading-relaxed font-bold">
                    <div>console.log("Configuration loaded:", <span className="font-extrabold text-[#D02020]">[REDACTED: SHA256:f7b822da]</span>)</div>
                    <div className="text-[#121212] mt-1 text-[8px] font-black uppercase flex items-center gap-1">
                      <ShieldCheck size={11} className="stroke-[2.5]" /> SECURE FOR AI CODE AGENTS & LOG AGGREGATORS
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: 100% Local Execution (col-span-12) - Red background */}
          <div className="bento-card-trigger bento-card col-span-12 bg-[#D02020] border-3 border-[#121212] text-white flex flex-col md:flex-row items-center justify-between gap-8 group bento-item-anim shadow-[4px_4px_0px_#121212]">
            <div className="space-y-3 md:max-w-md">
              <div className="w-10 h-10 rounded-none bg-white border-2 border-[#121212] flex items-center justify-center text-[#121212] transition-transform group-hover:scale-105 shadow-[2px_2px_0px_#121212]">
                <Lock size={18} />
              </div>
              <h3 className="text-lg font-black uppercase text-white tracking-wide">100% Local Execution</h3>
              <p className="text-zinc-100 text-xs leading-relaxed font-bold">
                Zero telemetry, zero external network requests to security endpoints, and zero data leaving your machine. All scanning logic, CA lifecycle, and blocking behavior execute completely offline.
              </p>
              <div className="pt-2 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/80">
                <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#F0C020]" /> Offline Audit</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#F0C020]" /> Zero Telemetry</span>
              </div>
            </div>

            {/* Visual indicator representation */}
            <div className="w-full md:w-64 border-2 border-[#121212] bg-white p-4 font-mono text-[9px] space-y-3 shadow-[3px_3px_0px_#121212] text-[#121212]">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-bold uppercase tracking-wider">Telemetry Probe Check</span>
                <span className="text-[#1040C0] font-black">127.0.0.1 ONLY</span>
              </div>
              <div className="space-y-2 border-t border-zinc-200 pt-2 text-zinc-550 font-bold">
                <div className="flex justify-between">
                  <span>Outbound Telemetry Log</span>
                  <span className="text-[#D02020] font-black uppercase">DISABLED</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Reporting Servers</span>
                  <span className="text-zinc-400 uppercase">NOT DEFINED</span>
                </div>
                <div className="flex justify-between">
                  <span>Offline Air-Gapped Mode</span>
                  <span className="text-emerald-600 font-black uppercase">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Live CLI exfiltration blocker showcase (Interactive Terminal Flow) */}
      <section className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="space-y-4 text-center mb-12">
          <h2 className="text-xs font-black text-[#1040C0] uppercase tracking-widest">Real-time Sandbox</h2>
          <p className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight uppercase">Watch the leak prevention pipeline in action.</p>
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <TerminalFlow />
        </div>
      </section>

      {/* 6. Double Panel (Why Existing Tools Fail & Five Runtime Attack Surfaces) */}
      <section id="attack-surfaces" className="attack-surfaces-trigger max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Left Panel: Comparison */}
          <div className="comparison-section-anim space-y-6 flex flex-col">
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#121212] pl-2">
              Why Static Tools Fail
            </h3>
            <div className="flex-1 flex">
              <Comparison />
            </div>
          </div>

          {/* Right Panel: Five Runtime Attack Surfaces */}
          <div className="space-y-6 flex flex-col">
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#121212] pl-2">
              Five Runtime Attack Surfaces
            </h3>
            <div className="flex-1 bg-white border-3 border-[#121212] rounded-none p-6 md:p-8 shadow-[4px_4px_0px_#121212] space-y-4 flex flex-col justify-between backdrop-blur-md">
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

      {/* 7. Deep Runtime Protection Architecture */}
      <section id="architecture" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center mb-8">
          <div className="lg:col-span-1 space-y-6 text-center lg:text-left">
            <h3 className="text-3xl font-black uppercase tracking-tight text-[#121212]">
              Deep Runtime Protection Architecture
            </h3>
            <p className="text-zinc-705 text-zinc-700 leading-relaxed text-sm md:text-base font-bold">
              envtrap operates at the boundary of your Node.js runtime to intercept exfiltration channels, perform entropy analysis, and drop exfiltrations without overhead.
            </p>
            <div className="flex justify-center lg:justify-start">
              <a
                href="#docs"
                className="inline-flex items-center gap-1.5 bg-[#121212] text-white border-2 border-[#121212] text-xs font-black uppercase tracking-widest px-6 py-3 shadow-[3px_3px_0px_#121212] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#121212] active:translate-x-[0px] active:translate-y-[0px] transition-all"
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

      {/* 8. How envtrap Works (6-step flow) */}
      <section id="how-it-works" className="steps-section-trigger max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
        <div className="space-y-4 mb-16">
          <h2 className="text-xs font-black text-[#1040C0] uppercase tracking-widest">Execution Flow</h2>
          <p className="text-3xl sm:text-4xl font-black text-[#121212] tracking-tight uppercase">How envtrap prevents leaks.</p>
        </div>

        {/* Steps flow horizontal container */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <WorkStepCard
            stepNum="1"
            icon={<Star size={16} className="text-[#121212]" />}
            title="Secret Loaded"
            desc="Process starts and evaluates env parameters."
          />
          <WorkStepCard
            stepNum="2"
            icon={<Send size={16} className="text-[#121212]" />}
            title="Exfil Event"
            desc="Dependency tries to write out keys."
          />
          <WorkStepCard
            stepNum="3"
            icon={<Compass size={16} className="text-[#121212]" />}
            title="Boundary Hit"
            desc="Interceptors capture payload stream."
          />
          <WorkStepCard
            stepNum="4"
            icon={<Shield size={16} className="text-[#121212]" />}
            title="Matches Screened"
            desc="Entropy + signatures flag active key."
          />
          <WorkStepCard
            stepNum="5"
            icon={<ShieldAlert size={16} className="text-[#121212]" />}
            title="Exfil Blocked"
            desc="Connection killed or output redacted."
          />
          <WorkStepCard
            stepNum="6"
            icon={<FileText size={16} className="text-[#121212]" />}
            title="Report Logged"
            desc="Encrypted SHA255 audit written to log."
          />
        </div>
      </section>

      {/* 9. Highlights (AI-Safe, reports, installation cards) */}
      <section id="installation" className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: AI-Safe by Design */}
          <div className="bg-white border-3 border-[#121212] rounded-none p-6 shadow-[4px_4px_0px_#121212] flex flex-col justify-between group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#121212] transition-all duration-300">
            <div className="space-y-5">
              <h4 className="text-lg font-black uppercase text-[#121212]">AI-Safe by Design</h4>
              
              {/* Bad vs Good comparison visual */}
              <div className="space-y-3.5 border-2 border-[#121212] rounded-none p-4 bg-zinc-50/50 font-mono text-[11px] shadow-[2px_2px_0px_#121212]">
                <div className="flex items-center justify-between pb-2.5 border-b-2 border-[#121212]">
                  <span className="text-[#D02020] font-black">BAD</span>
                  <div className="flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-0.5 rounded-none font-bold text-[9px] border border-[#121212]">
                    <X size={10} className="stroke-[3.5]" />
                    Sent to AI History
                  </div>
                </div>
                <div className="text-zinc-450 font-bold select-none text-zinc-500 break-all">
                  sk_live_abc123...
                </div>

                <div className="flex items-center justify-between pt-3 pb-2.5 border-b-2 border-[#121212]">
                  <span className="text-[#1040C0] font-black">GOOD</span>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-none font-bold text-[9px] border border-[#121212]">
                    <Check size={10} className="stroke-[3.5]" />
                    Non-reversible
                  </div>
                </div>
                <div className="text-zinc-700 break-all font-bold">
                  SHA256:e6b8eee7...
                </div>
                <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 pt-1">
                  <ShieldCheck size={12} className="stroke-[2.5]" /> Safe for AI Tools
                </div>
              </div>

              <p className="text-zinc-700 text-xs md:text-sm leading-relaxed font-bold">
                envtrap never prints raw secrets. Only non-reversible hashes are logged — safe for Claude Code, Copilot CLI, and other AI assisted environments.
              </p>
            </div>
            
            <div className="pt-4 border-t-2 border-[#121212] mt-5 flex items-center gap-2 text-[#1040C0] font-black text-xs">
              <Shield size={14} />
              <span>Cryptographic Safety Guard</span>
            </div>
          </div>

          {/* Card B: Machine Readable Reports */}
          <div className="bg-white border-3 border-[#121212] rounded-none p-6 shadow-[4px_4px_0px_#121212] flex flex-col justify-between group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#121212] transition-all duration-300">
            <div className="space-y-5">
              <h4 className="text-lg font-black uppercase text-[#121212]">Machine Readable Reports</h4>
              
              {/* JSON code box */}
              <div className="border-2 border-[#121212] rounded-none p-4 bg-zinc-50/50 text-[#121212] font-mono text-[11px] leading-relaxed overflow-x-auto shadow-[2px_2px_0px_#121212]">
                <span className="text-zinc-400">{`{`}</span>
                <div className="pl-4">
                  <span className="text-[#1040C0] font-black">"secretName"</span>: <span className="text-[#D02020] font-black">"STRIPE_SECRET_KEY"</span>,
                  <br />
                  <span className="text-[#1040C0] font-black">"channel"</span>: <span className="text-[#D02020] font-black">"dns"</span>,
                  <br />
                  <span className="text-[#1040C0] font-black">"sha256"</span>: <span className="text-[#D02020] font-black">"e6b8eee70bd6..."</span>,
                  <br />
                  <span className="text-[#1040C0] font-black">"context"</span>: <span className="text-[#D02020] font-black">"[REDACTED].attacker.com"</span>,
                  <br />
                  <span className="text-[#1040C0] font-black">"timestamp"</span>: <span className="text-zinc-600 font-semibold">170131604545</span>
                </div>
                <span className="text-zinc-400">{`}`}</span>
              </div>

              <p className="text-zinc-700 text-xs md:text-sm leading-relaxed font-bold">
                Structured JSON schema reports let your CI/CD systems or autonomous AI agents automatically locate and patch the source of a leaked parameter.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-[#121212] mt-5 flex items-center gap-2 text-[#1040C0] font-black text-xs">
              <Bot size={14} />
              <span>AI Agent Integrable Schema</span>
            </div>
          </div>

          {/* Card C: Quick Setup */}
          <div className="bg-white border-3 border-[#121212] rounded-none p-6 shadow-[4px_4px_0px_#121212] flex flex-col justify-between group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#121212] transition-all duration-300">
            <div className="space-y-5">
              <h4 className="text-lg font-black uppercase text-[#121212]">Installation</h4>
              
              {/* Copy commands steps */}
              <div className="space-y-3">
                {/* Step 1 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#1040C0]">
                    <span className="w-3.5 h-3.5 rounded-none bg-indigo-50 border border-[#121212] flex items-center justify-center text-[9px]">1</span>
                    <span>Install globally</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-zinc-50/50 border-2 border-[#121212] rounded-none px-3.5 py-2.5 font-mono text-[11px] text-zinc-700 shadow-[2px_2px_0px_#121212] group/btn">
                    <span className="truncate select-all">npm install -g envtrap</span>
                    <button
                      onClick={() => copyToClipboard("npm install -g envtrap", setCopiedInstall)}
                      className="text-zinc-500 hover:text-[#121212] transition-colors cursor-pointer"
                      aria-label="Copy install command"
                    >
                      {copiedInstall ? <Check size={12} className="text-emerald-600 stroke-[3]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#1040C0]">
                    <span className="w-3.5 h-3.5 rounded-none bg-indigo-50 border border-[#121212] flex items-center justify-center text-[9px]">2</span>
                    <span>Start application</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-zinc-50/50 border-2 border-[#121212] rounded-none px-3.5 py-2.5 font-mono text-[11px] text-zinc-700 shadow-[2px_2px_0px_#121212] group/btn">
                    <span className="truncate select-all">envtrap run node app.js</span>
                    <button
                      onClick={() => copyToClipboard("envtrap run node app.js", setCopiedRun)}
                      className="text-zinc-500 hover:text-[#121212] transition-colors cursor-pointer"
                      aria-label="Copy run command"
                    >
                      {copiedRun ? <Check size={12} className="text-emerald-600 stroke-[3]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-zinc-700 text-xs md:text-sm leading-relaxed font-bold">
                Protect your production containers and local environments instantly without modifying code dependencies or configuration.
              </p>
            </div>

            <div className="pt-4 border-t-2 border-[#121212] mt-5 flex items-center gap-1.5 text-[#1040C0] font-black text-xs">
              <span>That's it. 🚀</span>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Engineered for Enterprise Scale */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="border-t-2 border-[#121212] pt-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12">
            <MiniFeature
              icon={<Shield size={14} className="text-[#121212]" />}
              title="Dynamic TLS Certificates"
              desc="Signed in RAM as requested."
            />
            <MiniFeature
              icon={<Terminal size={14} className="text-[#121212]" />}
              title="Native Addon Coverage"
              desc="Captures low-level outputs."
            />
            <MiniFeature
              icon={<Globe size={14} className="text-[#121212]" />}
              title="DNS Exfiltration Check"
              desc="Flags secrets hidden in host queries."
            />
            <MiniFeature
              icon={<Activity size={14} className="text-[#121212]" />}
              title="Shannon Entropy Check"
              desc="Detects random obfuscated strings."
            />
            <MiniFeature
              icon={<Link size={14} className="text-[#121212]" />}
              title="ESM Hook Interception"
              desc="Bypassing-resilient registration hooks."
            />
            <MiniFeature
              icon={<ShieldAlert size={14} className="text-[#121212]" />}
              title="Egress Firewall"
              desc="Local network request auditing."
            />
            <MiniFeature
              icon={<HardDrive size={14} className="text-[#121212]" />}
              title="In-Memory Cache"
              desc="No secrets are written to disks."
            />
            <MiniFeature
              icon={<Bot size={14} className="text-[#121212]" />}
              title="AI Safe Sanitizing"
              desc="Converts logs to safe SHA hashes."
            />
            <MiniFeature
              icon={<Laptop size={14} className="text-[#121212]" />}
              title="Cross Platform"
              desc="Consistent on macOS, Linux, Windows."
            />
            <MiniFeature
              icon={<Zap size={14} className="text-[#121212]" />}
              title="Minimal Overhead"
              desc="Extremely lightweight event checking."
            />
          </div>
        </div>
      </section>

      {/* 11. Pre-Footer Banner */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="relative overflow-hidden bg-[#121212] border-3 border-[#121212] rounded-none p-8 md:p-14 text-white shadow-[6px_6px_0px_#D02020]">
          {/* Decorative radial blur in banner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1040C0]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Watermark SVG logo in the background */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
            <LogoIcon size={340} />
          </div>

          <div className="max-w-2xl space-y-6 relative z-10">
            <LogoIcon size={56} className="bg-white border-2 border-[#121212] rounded-none p-2.5 text-[#121212]" />
            <h3 className="text-3xl md:text-4xl font-black uppercase leading-[1.1] tracking-tight">
              Secrets Should Never Leave The Process. <br />
              <span className="text-[#F0C020]">Monitor. Detect. Block.</span> <br />
              Before The Network Sees Them.
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <a
                href="#installation"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#D02020] text-white border-2 border-[#121212] font-black text-sm px-6 py-3.5 rounded-none shadow-[3px_3px_0px_white] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_white] active:translate-x-[0px] active:translate-y-[0px] transition-all"
              >
                Get Started Now
                <ArrowRight size={16} className="stroke-[2.5]" />
              </a>
              <a
                href="#docs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1040C0] text-white border-2 border-white font-black text-sm px-6 py-3.5 rounded-none shadow-[3px_3px_0px_rgba(255,255,255,0.2)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] transition-all"
              >
                <BookOpen size={16} />
                Read Documentation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className="border-t-3 border-[#121212] bg-white pt-16 pb-12 transition-all relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b-2 border-[#121212]">
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <LogoBrand />
              <p className="text-zinc-500 text-xs md:text-sm leading-relaxed max-w-xs font-bold uppercase">
                Runtime secret leak prevention for Node.js applications. Shielding databases, consoles, processes, and HTTP endpoints in real time.
              </p>
            </div>

            {/* Links Columns */}
            <div className="space-y-4">
              <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Product</h5>
              <ul className="space-y-2.5 text-xs font-black uppercase text-zinc-600">
                <li><a href="#features" className="hover:text-[#D02020] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[#D02020] transition-colors">How It Works</a></li>
                <li><a href="#architecture" className="hover:text-[#D02020] transition-colors">Architecture</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Resources</h5>
              <ul className="space-y-2.5 text-xs font-black uppercase text-zinc-600">
                <li><a href="#docs" className="hover:text-[#D02020] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#D02020] transition-colors">CLI Reference</a></li>
                <li><a href="#" className="hover:text-[#D02020] transition-colors">Examples</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Community</h5>
              <ul className="space-y-2.5 text-xs font-black uppercase text-zinc-600">
                <li><a href="https://github.com" className="hover:text-[#D02020] transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-[#D02020] transition-colors">Discussions</a></li>
                <li><a href="#" className="hover:text-[#D02020] transition-colors">Issues</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h5 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Legal</h5>
              <ul className="space-y-2.5 text-xs font-black uppercase text-zinc-600">
                <li><a href="#" className="hover:text-[#D02020] transition-colors">MIT License</a></li>
                <li><a href="#" className="hover:text-[#D02020] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#D02020] transition-colors">Terms of Use</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[10px] font-black uppercase tracking-wider text-zinc-400">
            <span>© {new Date().getFullYear()} envtrap. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-zinc-650 transition-colors">Status</a>
              <a href="#" className="hover:text-zinc-650 transition-colors">Security Audit</a>
              <a href="#" className="hover:text-zinc-650 transition-colors">Contact Support</a>
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
    <div className="attack-surface-row-anim flex items-center justify-between gap-4 py-3.5 border-b-2 border-zinc-100 last:border-b-0 group">
      <div className="flex gap-4">
        <span className="font-mono text-[10px] font-black text-zinc-400 pt-0.5 select-none">{num}</span>
        <div className="space-y-0.5">
          <h5 className="text-xs font-black uppercase text-[#121212] group-hover:text-[#D02020] transition-colors">
            {title}
          </h5>
          <p className="text-[11px] text-zinc-500 max-w-sm md:max-w-md font-semibold leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
      
      <span
        className={`text-[9px] font-black tracking-widest shrink-0 uppercase px-2 py-0.5 rounded-none border-2 border-[#121212] shadow-[2px_2px_0px_#121212] ${
          statusType === "danger"
            ? "bg-[#D02020] text-white"
            : "bg-[#F0C020] text-[#121212]"
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
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-none bg-white border-2 border-[#121212] flex items-center justify-center shrink-0 mt-0.5 shadow-[2px_2px_0px_#121212]">
        {icon}
      </div>
      <div className="space-y-1">
        <h5 className="text-[11.5px] font-black uppercase text-[#121212] tracking-wide leading-tight">
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
    <div className="step-card-anim relative bg-white border-3 border-[#121212] rounded-none p-5 shadow-[3px_3px_0px_#121212] text-left flex flex-col justify-between group overflow-hidden hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#121212] transition-all duration-200">
      {/* Subtle indicator for order */}
      <span className="absolute -right-3 -top-3 text-5xl font-black text-zinc-100 select-none group-hover:text-[#1040C0]/10 transition-colors">
        {stepNum}
      </span>

      <div className="space-y-3.5 relative z-10">
        <div className="w-8 h-8 rounded-none bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center shadow-[1px_1px_0px_#121212]">
          {icon}
        </div>
        <h4 className="text-xs font-black uppercase text-[#121212]">
          {stepNum}. {title}
        </h4>
        <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
          {desc}
        </p>
      </div>
    </div>
  );
}
