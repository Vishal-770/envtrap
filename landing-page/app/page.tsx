"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowDown,
  Shield,
  Lock,
  Server,
  Zap,
  Activity,
  FileCode,
  FileText,
  Globe,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
──────────────────────────────────────────────────────────*/
const GITHUB_URL = "https://github.com/Vishal-770/envtrap";
const DOCS_URL = "https://envtrap.mintlify.app/introduction#the-solution";

const GITHUB_SVG = (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const ATTACK_SURFACES = [
  { icon: <Terminal size={22} strokeWidth={1.5} />, title: "stdout / stderr", desc: "Prevents raw secrets appearing in console.log, process.stdout or log aggregators.", status: "Blocked", color: "bg-red-50 text-red-600 border-red-200" },
  { icon: <Lock size={22} strokeWidth={1.5} />, title: "HTTPS Egress", desc: "Intercepts all outbound TLS connections via an in-memory MITM proxy before the socket is established.", status: "Blocked", color: "bg-red-50 text-red-600 border-red-200" },
  { icon: <FileCode size={22} strokeWidth={1.5} />, title: "Subprocesses", desc: "Blocks secrets from being inherited by spawned child_process, exec, or shell commands.", status: "Blocked", color: "bg-red-50 text-red-600 border-red-200" },
  { icon: <Globe size={22} strokeWidth={1.5} />, title: "DNS Tunneling", desc: "Detects secrets encoded inside DNS query hostname labels and blocks the resolver call.", status: "Blocked", color: "bg-red-50 text-red-600 border-red-200" },
  { icon: <Activity size={22} strokeWidth={1.5} />, title: "Entropy Detection", desc: "Shannon-entropy analysis flags high-entropy credential strings even without an explicit variable name match.", status: "Warned", color: "bg-amber-50 text-amber-600 border-amber-200" },
];

const COMPARISON_ROWS = [
  { sast: "Scans static source code syntax", env: "Full dynamic runtime visibility" },
  { sast: "Finds regex patterns in committed files", env: "Intercepts network, DNS, subprocesses live" },
  { sast: "Cannot see dynamically-loaded keys", env: "Audits secrets loaded at runtime" },
  { sast: "Misses transitive dependency leaks", env: "Blocks exfiltration before socket connects" },
  { sast: "Cannot actively prevent a leak", env: "Zero code instrumentation required" },
];

const INTEGRATIONS = [
  {
    id: "github", label: "GitHub Actions",
    icon: GITHUB_SVG, file: "ci-pipeline.yml",
    code: `name: envtrap Security Audit
on: [push, pull_request]

jobs:
  envtrap-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: Run tests under envtrap
        run: npx envtrap run npm test`,
  },
  {
    id: "docker", label: "Docker",
    icon: <Server size={16} strokeWidth={1.5} />, file: "Dockerfile",
    code: `FROM node:20-alpine

# Install envtrap globally
RUN npm install -g envtrap

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

CMD ["envtrap", "run", "node", "app.js"]`,
  },
  {
    id: "local", label: "Local Dev",
    icon: <Terminal size={16} strokeWidth={1.5} />, file: "package.json",
    code: `{
  "name": "my-app",
  "scripts": {
    "dev":   "envtrap run node --watch app.js",
    "start": "envtrap run node app.js",
    "test":  "envtrap run jest",
    "audit": "envtrap check"
  }
}`,
  },
];

const PROCESS_STEPS = [
  { n: "01", title: "Secret Generated", desc: "Application or a dependency accesses a process environment variable." },
  { n: "02", title: "Egress Attempted", desc: "The secret is embedded in a log, request body, DNS label, or subprocess env." },
  { n: "03", title: "Intercepted", desc: "envtrap captures the call at the module-loader or socket boundary." },
  { n: "04", title: "Classified", desc: "Entropy analysis and pattern matching identify the secret type." },
  { n: "05", title: "Enforced", desc: "The connection is dropped or the process throws synchronously per your policy." },
  { n: "06", title: "Report Emitted", desc: "A redacted, SHA-256-hashed JSON incident record is written to stdout." },
];

const FAQ_ITEMS = [
  { q: "Does envtrap add latency to my Node.js application?", a: "No measurable latency on hot paths. The ESM/CJS loader hooks execute once at module-load time. The HTTPS proxy operates as an in-memory loopback, adding less than 0.8ms of routing overhead per request — well under typical network round-trip times." },
  { q: "How does HTTPS interception work without SSL errors?", a: "envtrap generates a 2048-bit RSA Root CA entirely in RAM on startup, outputs the public certificate to a temp path, and sets NODE_EXTRA_CA_CERTS. The Node.js runtime trusts the local proxy. The private key is never written to disk and is garbage-collected when the process exits." },
  { q: "Can a compromised package bypass envtrap using raw TCP sockets?", a: "No. envtrap overrides the native net, tls, and http modules at the loader level. Any socket opened via net.connect, net.createConnection, or raw Socket instances is routed through the interception layer. Raw TCP egress containing a known secret is destroyed before the first byte is acknowledged." },
  { q: "Which Node.js frameworks are supported?", a: "All Node.js applications on v18.0.0 or later. This includes Express, Fastify, NestJS, Next.js (server-side), Hono, and custom HTTP servers. Both CommonJS require() and modern ECMAScript Module import() graphs are intercepted." },
  { q: "What happens if a secret is detected in 'warn' mode?", a: "The exfiltration is permitted to proceed but a structured JSON incident record is written to stdout with a non-reversible hash of the secret value, the destination host, the channel (network/dns/subprocess), and a UTC timestamp. No raw secret is ever logged." },
];

const STATS = [
  { value: "< 1ms", label: "Added latency per request" },
  { value: "0 bytes", label: "Disk footprint" },
  { value: "Node 18+", label: "Runtime requirement" },
  { value: "5", label: "Monitored attack channels" },
];

/* ─────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────*/
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer" aria-label="Copy">
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="inline-block text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-indigo-600 mb-3 select-none">{children}</span>;
}

function SectionHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-3xl sm:text-4xl md:text-[44px] font-bold tracking-[-0.03em] text-zinc-950 leading-[1.1] ${className}`}>{children}</h2>;
}

/* ─────────────────────────────────────────────────────────
   PAGE
──────────────────────────────────────────────────────────*/
export default function Home() {
  const [activeIntegration, setActiveIntegration] = useState("github");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const activeInt = INTEGRATIONS.find((i) => i.id === activeIntegration)!;

  return (
    <div className="relative min-h-screen flex flex-col bg-white text-zinc-900 overflow-x-hidden font-sans antialiased">

      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded">Skip to main content</a>

      {/* ── HEADER ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 shrink-0">
            <Image src="/logo.png" alt="envtrap" width={24} height={24} className="object-contain" priority />
            <span className="text-[15px] font-mono font-bold text-zinc-950 tracking-tight">envtrap</span>
          </a>
          <nav className="hidden md:flex items-center gap-7" aria-label="Primary">
            <a href="#features" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors">Features</a>
            <a href="#how-it-works" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors">How It Works</a>
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-1">Docs <ExternalLink size={11} className="opacity-50" /></a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-zinc-500 hover:text-zinc-950 transition-colors flex items-center gap-1">GitHub <ExternalLink size={11} className="opacity-50" /></a>
          </nav>
          <a href="#installation" className="flex items-center gap-1.5 px-4 py-2 bg-zinc-950 text-white text-[13px] font-semibold rounded-lg hover:bg-zinc-800 transition-colors">
            Get Started <ArrowRight size={13} strokeWidth={2.5} />
          </a>
        </div>
      </header>

      <main id="main" className="flex-1">

        {/* ── HERO ────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-24 pb-28">
          <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" style={{ maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 60%, transparent 100%)" }} aria-hidden />

          <div className="relative max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

              {/* Left copy */}
              <div className="lg:col-span-5 space-y-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/60 rounded-full">
                  <Shield size={12} className="text-indigo-600" strokeWidth={2} />
                  <span className="text-[11px] font-mono font-semibold text-indigo-700 tracking-wide uppercase">Runtime Security · Node.js</span>
                </div>

                <h1 className="text-5xl sm:text-6xl md:text-[68px] font-bold tracking-[-0.04em] text-zinc-950 leading-[1.02]">
                  Stop Secrets<br />Before They<br /><span className="text-indigo-600">Leave Your Process</span>
                </h1>

                <p className="text-[17px] text-zinc-500 leading-[1.7] max-w-[420px] font-normal">
                  envtrap is a zero-configuration runtime agent that intercepts, blocks, and flags accidental secret exfiltration across network, DNS, logs, and subprocesses — before a single byte leaves your machine.
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: <Zap size={12} strokeWidth={2} />, text: "Zero Configuration" },
                    { icon: <Server size={12} strokeWidth={2} />, text: "Runs Locally" },
                    { icon: <Shield size={12} strokeWidth={2} />, text: "Blocks in Real Time" },
                  ].map((p) => (
                    <span key={p.text} className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <span className="text-indigo-600">{p.icon}</span>{p.text}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a href="#installation" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-[13px] font-semibold rounded-lg hover:bg-indigo-500 transition-colors shadow-sm">
                    Get Started <ArrowRight size={14} strokeWidth={2.5} />
                  </a>
                  <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-700 text-[13px] font-semibold rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all">
                    Read Docs <ExternalLink size={13} strokeWidth={2} />
                  </a>
                  <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 text-zinc-500 text-[13px] font-semibold hover:text-zinc-900 transition-colors">
                    {GITHUB_SVG} GitHub
                  </a>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-3">Used by engineers at</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold text-zinc-400">
                    {["Vercel", "Netlify", "Supabase", "Render", "Railway"].map((b) => (
                      <span key={b} className="hover:text-zinc-600 transition-colors cursor-default">{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: light-mode terminal + flow tree */}
              <div className="lg:col-span-7 flex items-center justify-center">
                <div className="w-full max-w-[560px] space-y-4">

                  {/* Light terminal — no emojis, monochrome log levels */}
                  <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 tracking-widest uppercase">envtrap audit</span>
                      <div className="w-[52px]" />
                    </div>

                    <div className="p-5 font-mono text-[12.5px] leading-[1.85] select-text bg-white">
                      <div><span className="text-zinc-400">$</span> <span className="text-indigo-600 font-semibold">envtrap run</span> <span className="text-zinc-800">node app.js</span></div>
                      <div className="mt-3 space-y-[3px]">
                        <div className="text-zinc-500"><span className="text-zinc-400">info</span>  <span className="text-zinc-600">[envtrap]</span> Config: <span className="text-zinc-800">envtrap.json</span></div>
                        <div className="text-zinc-500"><span className="text-zinc-400">info</span>  <span className="text-zinc-600">[envtrap]</span> Monitoring: <span className="text-emerald-600">network · dns · subprocess · stdout</span></div>
                        <div className="text-zinc-500"><span className="text-zinc-400">info</span>  <span className="text-zinc-600">[envtrap]</span> RAM CA ready · TLS proxy on <span className="text-zinc-800">:8443</span></div>
                        <div className="text-zinc-500"><span className="text-zinc-400">info</span>  <span className="text-zinc-600">[system] </span> Server on <span className="text-zinc-800">http://localhost:3000</span></div>
                        <div className="mt-2 text-zinc-500"><span className="text-amber-600">warn</span>  <span className="text-amber-700">[telemetry-pkg]</span> POST to <span className="text-zinc-800">api.attacker.com/collect</span></div>
                        <div className="pl-12 text-zinc-500">body: <span className="text-rose-600 font-semibold">STRIPE_SECRET_KEY=sk_live_...</span></div>
                        <div className="mt-2 text-rose-600 font-bold">error  [envtrap] SECRET LEAK BLOCKED</div>
                        <div className="pl-12 text-zinc-500">secret  <span className="text-zinc-700">STRIPE_SECRET_KEY</span></div>
                        <div className="pl-12 text-zinc-500">channel <span className="text-zinc-700">NETWORK (HTTPS egress)</span></div>
                        <div className="pl-12 text-zinc-500">action  <span className="text-red-600">connection destroyed — 403</span></div>
                        <div className="pl-12 text-zinc-500">hash    <span className="text-zinc-500">SHA256:baf2ae56c...</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Flow tree */}
                  <div className="flex flex-col items-center select-none">
                    <div className="h-5 w-px bg-zinc-200" />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg shadow-sm text-[11px] font-semibold text-zinc-700">
                      <Image src="/nodejs.webp" alt="Node.js" width={14} height={14} className="object-contain" />Node.js Application
                    </div>
                    <div className="h-5 w-px bg-zinc-200" />
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg shadow-sm text-[11px] font-semibold text-indigo-700">
                      <Image src="/logo.png" alt="envtrap" width={14} height={14} className="object-contain" />envtrap agent
                    </div>
                    <div className="w-full relative h-6">
                      <svg className="w-full h-full" viewBox="0 0 560 24" fill="none" preserveAspectRatio="none">
                        {[52, 158, 280, 402, 508].map((x, i) => (
                          <path key={i} d={`M 280 0 C 280 12, ${x} 12, ${x} 24`} stroke="#e4e4e7" strokeWidth="1.5" strokeDasharray="3 2" />
                        ))}
                      </svg>
                    </div>
                    <div className="grid grid-cols-5 gap-2 w-full">
                      {[
                        { label: "stdout", icon: <Terminal size={14} strokeWidth={1.5} /> },
                        { label: "HTTPS", icon: <Lock size={14} strokeWidth={1.5} /> },
                        { label: "Subprocess", icon: <FileCode size={14} strokeWidth={1.5} /> },
                        { label: "DNS", icon: <Globe size={14} strokeWidth={1.5} /> },
                        { label: "Entropy", icon: <Activity size={14} strokeWidth={1.5} /> },
                      ].map((ch) => (
                        <div key={ch.label} className="flex flex-col items-center gap-1.5 p-2.5 bg-white border border-zinc-200 rounded-lg hover:border-red-200 hover:bg-red-50/30 transition-colors group">
                          <span className="text-zinc-400 group-hover:text-red-500 transition-colors">{ch.icon}</span>
                          <span className="text-[9px] font-semibold text-zinc-600 text-center leading-tight">{ch.label}</span>
                          <span className="px-1.5 py-0.5 bg-red-50 border border-red-200 rounded text-[8px] font-bold text-red-600 uppercase tracking-wide">BLOCKED</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ───────────────────────────────── */}
        <section className="section-divider border-b border-zinc-200/80 bg-zinc-50/50 py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-200/80">
              {STATS.map((s) => (
                <div key={s.value} className="flex flex-col items-center text-center px-8 py-4">
                  <span className="text-[32px] font-bold tabular tracking-tight text-zinc-950">{s.value}</span>
                  <span className="text-[12px] text-zinc-500 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURE BENTO GRID ──────────────────────── */}
        <section id="features" className="py-28">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="max-w-xl mb-14">
              <SectionLabel>Capabilities</SectionLabel>
              <SectionHeading>Engineered for<br />Process Isolation</SectionHeading>
              <p className="mt-4 text-[15px] text-zinc-500 leading-[1.7]">Five monitoring channels. One prefix command. Complete runtime visibility into every byte leaving your process.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Card A */}
              <div className="md:col-span-7 bg-white border border-zinc-200/80 rounded-2xl p-8 flex flex-col justify-between min-h-[340px] hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div>
                  <span className="inline-block px-2.5 py-1 bg-indigo-50 border border-indigo-200/60 rounded-md text-[10px] font-mono font-semibold text-indigo-600 uppercase tracking-wider mb-4">Core Engine</span>
                  <h3 className="text-xl font-bold text-zinc-950 tracking-tight mb-2">Real-Time Secret Interception</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed max-w-md">Hooks Node.js at the ESM/CJS loader level. Every outbound call is scanned against your secret registry in microseconds — before the OS socket is opened.</p>
                </div>
                <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-[11.5px] leading-[1.7] text-zinc-600 overflow-x-auto">
                  <div className="text-zinc-400 mb-1">{`// ESM loader hook — injected at process boot`}</div>
                  <div><span className="text-indigo-600 font-medium">export async function</span> <span className="text-zinc-800 font-semibold">resolve</span>(spec, ctx, next) {"{"}</div>
                  <div className="pl-4"><span className="text-indigo-600 font-medium">if</span> (MONITORED.includes(spec))</div>
                  <div className="pl-8"><span className="text-indigo-600 font-medium">return</span> next(<span className="text-emerald-600">{"`envtrap:${spec}`"}</span>, ctx);</div>
                  <div className="pl-4"><span className="text-indigo-600 font-medium">return</span> next(spec, ctx);</div>
                  <div>{"}"}</div>
                </div>
              </div>

              {/* Card B */}
              <div className="md:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-8 flex flex-col justify-between min-h-[340px] hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div>
                  <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-5"><Lock size={18} strokeWidth={1.5} className="text-zinc-700" /></div>
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2">RAM-Only Certificate Authority</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">Generates an ephemeral 2048-bit RSA Root CA entirely in memory. The private key never touches disk.</p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100">
                  {[{ label: "Key location", value: "RAM buffer" }, { label: "Disk footprint", value: "0 bytes" }, { label: "Key size", value: "2048-bit RSA" }, { label: "Lifetime", value: "Process scope" }].map((s) => (
                    <div key={s.label}>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-0.5">{s.label}</div>
                      <div className="text-[13px] font-bold text-zinc-800">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card C */}
              <div className="md:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div>
                  <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-5"><Zap size={18} strokeWidth={1.5} className="text-zinc-700" /></div>
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2">Zero Code Instrumentation</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">No SDK imports. No code modifications. Prefix your start command and you are protected immediately.</p>
                </div>
                <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 font-mono text-[12.5px] text-zinc-800 select-all font-medium"><span className="text-zinc-400 font-normal mr-2">$</span>envtrap run node app.js</div>
              </div>

              {/* Card D */}
              <div className="md:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div>
                  <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-5"><Server size={18} strokeWidth={1.5} className="text-zinc-700" /></div>
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2">100% Local Execution</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">All scans happen inside your process. No telemetry, no external API calls, no cloud dependency.</p>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200/60 rounded-lg text-[12px] font-semibold text-emerald-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Air-gapped compatible
                </div>
              </div>

              {/* Card E */}
              <div className="md:col-span-4 bg-white border border-zinc-200/80 rounded-2xl p-8 flex flex-col justify-between hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
                <div>
                  <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mb-5"><Activity size={18} strokeWidth={1.5} className="text-zinc-700" /></div>
                  <h3 className="text-lg font-bold text-zinc-950 tracking-tight mb-2">AI-Safe Hashed Reports</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">Incidents emit non-reversible SHA-256 hashes — safe for Claude Code, Copilot CLI, and CI log aggregators.</p>
                </div>
                <div className="mt-6 font-mono text-[11px] bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-zinc-600 select-all">SHA256:ca18b2ee7a4dff2b...</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMPARISON + ATTACK SURFACES ─────────────── */}
        <section className="py-28 section-divider">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div>
                <SectionLabel>Comparison</SectionLabel>
                <SectionHeading>Why Existing<br />Tools Fall Short</SectionHeading>
                <p className="mt-4 mb-10 text-[15px] text-zinc-500 leading-[1.7]">Static analysis scanners operate on source code at rest. envtrap monitors your runtime — where leaks actually happen.</p>
                <div className="border border-zinc-200/80 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-2 bg-zinc-50 border-b border-zinc-200/80">
                    <div className="px-5 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-500">Static Analysis (SAST)</div>
                    <div className="px-5 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-600 border-l border-zinc-200/80">envtrap</div>
                  </div>
                  {COMPARISON_ROWS.map((row, i) => (
                    <div key={i} className="grid grid-cols-2 border-b last:border-0 border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                      <div className="px-5 py-4 text-[13px] flex items-start gap-2.5 border-r border-zinc-100">
                        <span className="text-red-400 font-bold mt-px shrink-0">x</span>
                        <span className="text-zinc-600">{row.sast}</span>
                      </div>
                      <div className="px-5 py-4 text-[13px] flex items-start gap-2.5">
                        <span className="text-emerald-500 font-bold mt-px shrink-0">v</span>
                        <span className="text-zinc-700">{row.env}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>Coverage</SectionLabel>
                <SectionHeading>Five Runtime<br />Attack Surfaces</SectionHeading>
                <p className="mt-4 mb-10 text-[15px] text-zinc-500 leading-[1.7]">Each channel represents a distinct exfiltration vector. envtrap covers all of them simultaneously.</p>
                <div className="space-y-3">
                  {ATTACK_SURFACES.map((s, i) => (
                    <div key={i} className="flex items-center gap-5 p-5 bg-white border border-zinc-200/80 rounded-xl hover:border-zinc-300 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-200 group">
                      <div className="w-11 h-11 flex items-center justify-center bg-zinc-50 border border-zinc-200/80 rounded-xl text-zinc-500 shrink-0 group-hover:border-zinc-300 transition-colors">{s.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-zinc-900 mb-0.5">{s.title}</div>
                        <div className="text-[12px] text-zinc-500 leading-relaxed">{s.desc}</div>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${s.color}`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARCHITECTURE ─────────────────────────────── */}
        <section id="how-it-works" className="py-28 section-divider bg-zinc-50/40">
          <div className="max-w-[1200px] mx-auto px-6">

            {/* Full-width heading row */}
            <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <SectionLabel>Architecture</SectionLabel>
                <SectionHeading>Deep Runtime Interception</SectionHeading>
              </div>
              <p className="text-[15px] text-zinc-500 leading-[1.7] max-w-sm">
                envtrap hooks at the lowest boundary of your runtime — before syscalls, before sockets, before DNS resolvers see a single query.
              </p>
            </div>

            {/* Horizontal numbered timeline */}
            <div className="relative mb-16">
              <div className="absolute top-5 left-0 right-0 h-px bg-zinc-200 hidden md:block" aria-hidden />
              <div className="grid grid-cols-2 md:grid-cols-6 gap-x-6 gap-y-8">
                {PROCESS_STEPS.map((s, i) => (
                  <div key={i} className="relative flex flex-col items-center text-center">
                    <div className="relative z-10 w-10 h-10 rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center mb-4 shadow-[0_0_0_4px_rgba(244,244,245,1)]">
                      <span className="text-[11px] font-mono font-bold text-indigo-600">{s.n}</span>
                    </div>
                    <div className="text-[13px] font-semibold text-zinc-900 leading-tight mb-1">{s.title}</div>
                    <div className="text-[11px] text-zinc-500 leading-relaxed">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full-width pipeline */}
            <div className="flex flex-col md:flex-row items-stretch gap-3 mb-4">

              {/* Col 1 */}
              <div className="flex-1 bg-white border border-zinc-200/70 rounded-2xl p-6 text-center">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-5">Application</div>
                <div className="w-14 h-14 rounded-full bg-zinc-50 border border-zinc-200 mx-auto flex items-center justify-center mb-5">
                  <Image src="/nodejs.webp" alt="Node.js" width={28} height={28} className="object-contain" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {["Logs", "Network", "DNS", "Processes"].map((l) => (
                    <span key={l} className="text-[11px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200/80 rounded-lg px-2 py-2">{l}</span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col justify-center items-center text-zinc-300 shrink-0 px-1">
                <ArrowRight size={16} className="hidden md:block" strokeWidth={1.5} />
                <ArrowDown size={16} className="md:hidden" strokeWidth={1.5} />
              </div>

              {/* Col 2 */}
              <div className="flex-1 bg-white border border-zinc-200/70 rounded-2xl p-6">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-5 text-center">Interceptors</div>
                <div className="flex flex-col gap-2">
                  {["OS Pipes (stdout)", "MITM Proxy (HTTPS)", "Subprocess Hooks", "DNS Resolver Hooks"].map((l) => (
                    <div key={l} className="flex items-center gap-2.5 bg-zinc-50/60 border border-zinc-200/80 rounded-lg px-3 py-2.5 text-[11.5px] font-medium text-zinc-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />{l}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col justify-center items-center text-zinc-300 shrink-0 px-1">
                <ArrowRight size={16} className="hidden md:block" strokeWidth={1.5} />
                <ArrowDown size={16} className="md:hidden" strokeWidth={1.5} />
              </div>

              {/* Col 3 */}
              <div className="flex-1 bg-white border border-zinc-200/70 rounded-2xl p-6 text-center">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-5">Scanner</div>
                <div className="flex flex-col gap-2">
                  {["Entropy Analysis", "Pattern Matching", "Secret Fingerprint"].map((l) => (
                    <div key={l} className="bg-zinc-50/60 border border-zinc-200/80 rounded-lg px-3 py-2.5 text-[11.5px] font-medium text-zinc-700">{l}</div>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col justify-center items-center text-zinc-300 shrink-0 px-1">
                <ArrowRight size={16} className="hidden md:block" strokeWidth={1.5} />
                <ArrowDown size={16} className="md:hidden" strokeWidth={1.5} />
              </div>

              {/* Col 4 */}
              <div className="flex-1 bg-white border border-zinc-200/70 rounded-2xl p-6 text-center">
                <div className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-400 mb-5">Action</div>
                <div className="flex flex-col gap-2">
                  <div className="bg-rose-50 border border-rose-200/60 rounded-lg px-3 py-3.5 text-[11.5px] font-semibold text-rose-700 flex items-center justify-center gap-2">
                    <Shield size={13} strokeWidth={2} />Block &amp; Prevent
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200/60 rounded-lg px-3 py-3.5 text-[11.5px] font-semibold text-indigo-700 flex items-center justify-center gap-2">
                    <FileCode size={13} strokeWidth={2} />Redact &amp; Log
                  </div>
                  <div className="bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-3.5 text-[11.5px] font-semibold text-amber-700 flex items-center justify-center gap-2">
                    <FileText size={13} strokeWidth={2} />Emit Report
                  </div>
                </div>
              </div>

            </div>

            {/* JSON report — light card */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200/80 bg-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">incident.json — Sample Incident Report</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">stdout</span>
              </div>
              <div className="p-6 font-mono text-[13px] leading-[1.9] select-text">
                <div className="text-zinc-400">{"{"}</div>
                <div className="pl-6"><span className="text-indigo-600">"secretName"</span><span className="text-zinc-400">: </span><span className="text-emerald-600">"STRIPE_SECRET_KEY"</span><span className="text-zinc-400">,</span></div>
                <div className="pl-6"><span className="text-indigo-600">"channel"</span><span className="text-zinc-400">:    </span><span className="text-emerald-600">"network"</span><span className="text-zinc-400">,</span></div>
                <div className="pl-6"><span className="text-indigo-600">"sha256"</span><span className="text-zinc-400">:    </span><span className="text-emerald-600">"e4b4ecc7d4a4aea379f1754c7a..."</span><span className="text-zinc-400">,</span></div>
                <div className="pl-6"><span className="text-indigo-600">"context"</span><span className="text-zinc-400">:   </span><span className="text-emerald-600">"[REDACTED].attacker.com"</span><span className="text-zinc-400">,</span></div>
                <div className="pl-6"><span className="text-indigo-600">"action"</span><span className="text-zinc-400">:    </span><span className="text-emerald-600">"blocked"</span><span className="text-zinc-400">,</span></div>
                <div className="pl-6"><span className="text-indigo-600">"timestamp"</span><span className="text-zinc-400">: </span><span className="text-zinc-600">1701315024545</span></div>
                <div className="text-zinc-400">{"}"}</div>
              </div>
            </div>

          </div>
        </section>

        {/* ── CI/CD INTEGRATIONS ──────────────────────── */}
        <section id="docs" className="py-28 section-divider">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="max-w-xl mb-14">
              <SectionLabel>Documentation</SectionLabel>
              <SectionHeading>Works Everywhere<br />You Deploy</SectionHeading>
              <p className="mt-4 text-[15px] text-zinc-500 leading-[1.7]">
                Drop envtrap into any pipeline with a single line change. <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Read the full docs</a>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-3 flex lg:flex-col gap-2">
                {INTEGRATIONS.map((item) => (
                  <button key={item.id} onClick={() => setActiveIntegration(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[13px] font-semibold transition-all cursor-pointer w-full ${activeIntegration === item.id ? "bg-zinc-950 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200"}`}>
                    <span className={activeIntegration === item.id ? "text-zinc-300" : "text-zinc-400"}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="lg:col-span-9 bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/80 bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500">{activeInt.file}</span>
                  </div>
                  <CopyButton text={activeInt.code} />
                </div>
                <pre className="p-6 font-mono text-[13px] leading-[1.8] text-zinc-700 overflow-x-auto select-text whitespace-pre">{activeInt.code}</pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                { title: "AI-Safe by Design", desc: "Secrets are never logged raw. Non-reversible SHA-256 hashes keep incident logs safe for AI code assistants and copilots.", badge: "No raw secrets in logs" },
                { title: "Machine Readable Reports", desc: "Structured JSON incidents include secret type, channel, hash, destination context, and timestamp for automated remediation.", badge: "JSON structured output" },
                { title: "Policy Configuration", desc: "Fine-tune behavior per channel — block, warn, or off — and whitelist trusted domains in an envtrap.json at your project root.", badge: "Per-channel granularity" },
              ].map((card) => (
                <div key={card.title} className="p-6 bg-white border border-zinc-200/80 rounded-2xl hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-200">
                  <div className="inline-block px-2.5 py-1 bg-zinc-100 rounded-md text-[10px] font-mono font-semibold text-zinc-600 mb-4 uppercase tracking-wider">{card.badge}</div>
                  <h3 className="text-[15px] font-bold text-zinc-950 mb-2 tracking-tight">{card.title}</h3>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INSTALLATION ────────────────────────────── */}
        <section id="installation" className="py-28 section-divider">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <SectionLabel>Get Started</SectionLabel>
                <SectionHeading>Up and Running<br />in 30 Seconds</SectionHeading>
                <p className="mt-4 text-[15px] text-zinc-500 leading-[1.7]">
                  Install globally or add as a dev dependency. No configuration required. <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Full documentation</a>
                </p>
                <div className="mt-10 space-y-4">
                  {[{ step: "01", label: "Install", cmd: "npm install -g envtrap" }, { step: "02", label: "Run your app", cmd: "envtrap run node app.js" }].map(({ step, label, cmd }) => (
                    <div key={step} className="flex items-center gap-5">
                      <div className="w-9 h-9 rounded-full border-2 border-zinc-200 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-mono font-bold text-zinc-500">{step}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] text-zinc-400 font-medium mb-1">{label}</div>
                        <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-mono text-[13px] text-zinc-700 hover:border-zinc-300 transition-colors">
                          <span>{cmd}</span><CopyButton text={cmd} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pl-14 text-[13px] text-zinc-400 font-medium">That is it.</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200/80 bg-zinc-50">
                    <span className="text-[11px] font-mono text-zinc-500">envtrap.json (optional)</span>
                    <CopyButton text={`{\n  "channels": {\n    "network": "block",\n    "dns": "block",\n    "child_process": "block",\n    "stdout": "warn"\n  },\n  "exclusions": {\n    "domains": ["api.stripe.com"]\n  }\n}`} />
                  </div>
                  <div className="p-6 font-mono text-[13px] leading-[1.8] select-text">
                    <div className="text-zinc-400">{"{"}</div>
                    <div className="pl-4"><span className="text-indigo-600">"channels"</span><span className="text-zinc-400">: </span><span className="text-zinc-400">{"{"}</span></div>
                    <div className="pl-8"><span className="text-indigo-600">"network"</span><span className="text-zinc-400">:       </span><span className="text-emerald-600">"block"</span><span className="text-zinc-400">,</span></div>
                    <div className="pl-8"><span className="text-indigo-600">"dns"</span><span className="text-zinc-400">:          </span><span className="text-emerald-600">"block"</span><span className="text-zinc-400">,</span></div>
                    <div className="pl-8"><span className="text-indigo-600">"child_process"</span><span className="text-zinc-400">: </span><span className="text-emerald-600">"block"</span><span className="text-zinc-400">,</span></div>
                    <div className="pl-8"><span className="text-indigo-600">"stdout"</span><span className="text-zinc-400">:        </span><span className="text-amber-600">"warn"</span></div>
                    <div className="pl-4"><span className="text-zinc-400">{"}"}</span><span className="text-zinc-400">,</span></div>
                    <div className="pl-4"><span className="text-indigo-600">"exclusions"</span><span className="text-zinc-400">: </span><span className="text-zinc-400">{"{"}</span></div>
                    <div className="pl-8"><span className="text-indigo-600">"domains"</span><span className="text-zinc-400">: [</span><span className="text-emerald-600">"api.stripe.com"</span><span className="text-zinc-400">]</span></div>
                    <div className="pl-4"><span className="text-zinc-400">{"}"}</span></div>
                    <div className="text-zinc-400">{"}"}</div>
                  </div>
                </div>
                <p className="text-[12px] text-zinc-400 leading-relaxed px-1">Configuration is entirely optional. Without envtrap.json, all channels default to <span className="font-mono text-zinc-600">block</span> mode.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────── */}
        <section id="faq" className="py-28 section-divider">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-4">
                <SectionLabel>Help &amp; Support</SectionLabel>
                <SectionHeading>Technical<br />FAQ</SectionHeading>
                <p className="mt-4 text-[15px] text-zinc-500 leading-[1.7]">Deep answers on how envtrap operates at the runtime and network layers.</p>
                <div className="mt-8 flex flex-col gap-3">
                  <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                    Read the docs <ExternalLink size={13} />
                  </a>
                  <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
                    Open an issue on GitHub <ExternalLink size={13} />
                  </a>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="border border-zinc-200/80 rounded-2xl overflow-hidden divide-y divide-zinc-200/80">
                  {FAQ_ITEMS.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div key={i}>
                        <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-zinc-50/70 transition-colors cursor-pointer" aria-expanded={isOpen}>
                          <span className="text-[14px] font-semibold text-zinc-900 pr-6 leading-snug">{faq.q}</span>
                          <span className="shrink-0 text-zinc-400">{isOpen ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}</span>
                        </button>
                        <div className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                          <div className="overflow-hidden">
                            <p className="px-7 pb-6 text-[13.5px] text-zinc-500 leading-[1.75]">{faq.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ──────────────────────────────── */}
        <section className="pb-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="bg-zinc-950 rounded-3xl px-12 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
              <div className="absolute inset-0 line-grid opacity-30 pointer-events-none" aria-hidden />
              <div className="relative space-y-4 max-w-lg">
                <div className="flex items-center gap-3">
                  <Image src="/logo.png" alt="envtrap" width={36} height={36} className="object-contain" />
                  <span className="text-sm font-mono font-bold text-zinc-400 tracking-widest uppercase">envtrap</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-[-0.03em] leading-tight">Secrets should never<br />leave your process.</h2>
                <p className="text-[15px] text-zinc-400 leading-relaxed">Monitor. Detect. Block — before the network sees them.</p>
              </div>
              <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
                <a href="#installation" className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 text-[14px] font-semibold rounded-xl hover:bg-zinc-100 transition-colors">
                  Get Started <ArrowRight size={15} strokeWidth={2.5} />
                </a>
                <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-transparent text-zinc-300 text-[14px] font-semibold rounded-xl border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all">
                  Read Docs <ExternalLink size={14} />
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-transparent text-zinc-300 text-[14px] font-semibold rounded-xl border border-zinc-700 hover:border-zinc-500 hover:text-white transition-all">
                  {GITHUB_SVG} GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="border-t border-zinc-200/80 bg-zinc-50/40 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
            <div className="col-span-2 space-y-5">
              <div className="flex items-center gap-2.5">
                <Image src="/logo.png" alt="envtrap" width={22} height={22} className="object-contain" />
                <span className="text-[15px] font-mono font-bold text-zinc-900 tracking-tight">envtrap</span>
              </div>
              <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[260px]">Runtime secret leak prevention for Node.js applications. Zero configuration, zero trust.</p>
            </div>
            <div className="space-y-4">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">Product</div>
              <ul className="space-y-2.5 text-[13px] text-zinc-500">
                {["Features", "How It Works", "Security"].map((l) => (<li key={l}><a href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-zinc-900 transition-colors">{l}</a></li>))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">Resources</div>
              <ul className="space-y-2.5 text-[13px] text-zinc-500">
                <li><a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">Documentation</a></li>
                <li><a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">CLI Reference</a></li>
                <li><a href="#faq" className="hover:text-zinc-900 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">Community</div>
              <ul className="space-y-2.5 text-[13px] text-zinc-500">
                {[
                  { label: "GitHub", href: GITHUB_URL },
                  { label: "Discussions", href: `${GITHUB_URL}/discussions` },
                  { label: "Issues", href: `${GITHUB_URL}/issues` },
                  { label: "Contributing", href: `${GITHUB_URL}/blob/main/CONTRIBUTING.md` },
                ].map((l) => (<li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 transition-colors">{l.label}</a></li>))}
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-6 border-t border-zinc-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-zinc-400 font-mono">
            <p>2026 envtrap. Open Source — MIT License.</p>
            <div className="flex items-center gap-6">
              {["Privacy Policy", "Terms of Use"].map((l) => (<a key={l} href="#" className="hover:text-zinc-700 transition-colors">{l}</a>))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
