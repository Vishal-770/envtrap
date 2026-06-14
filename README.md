# envtrap

A zero-configuration, air-gapped runtime secret leak detector and egress firewall for Node.js. 

`envtrap` sits at the lowest boundary of your Node.js process—hooking module loaders and socket interfaces—to intercept, block, and log accidental secret exposure before a single byte leaves your machine.

[![GitHub license](https://img.shields.io/github/license/Vishal-770/envtrap)](https://github.com/Vishal-770/envtrap)
[![Docs](https://img.shields.io/badge/docs-mintlify-indigo)](https://envtrap.mintlify.app/introduction#the-solution)

---

## 📂 Repository Structure

This repository is structured as a monorepo containing the security agent CLI, documentation, the product landing page, and test suites:

### 📦 [`/package`](file:///home/vishal/Projects/envtrap/package) (Core Agent)
The core `envtrap` npm package and CLI. It hooks Node.js runtime boundaries to intercept secret exfiltration.
- **Interceptors:** Hooks native `net`, `tls`, `http`, `dns`, `child_process` modules and console streams.
- **Features:** In-memory MITM TLS proxy, Shannon-entropy parsing, air-gapped mode, SHA-256 redaction logs, and local configuration.

### 💻 [`/landing-page`](file:///home/vishal/Projects/envtrap/landing-page) (Marketing Website)
A premium, highly interactive marketing website built to present `envtrap` with Vercel/Stripe-level aesthetics.
- **Tech Stack:** Next.js 16 (React 19), Tailwind CSS, Lucide Icons, GSAP (animations), and Lenis (smooth scroll).
- **Features:** Interactive pipeline flow visualizer, technical FAQ drawer, dark-to-light code terminals, responsive layout.

### 📘 [`/docs`](file:///home/vishal/Projects/envtrap/docs) (Developer Guides)
Mintlify-powered reference docs. Covers configuration, advanced exclusions, CLI reference guides, and security policies.

### 🧪 [`/test-server`](file:///home/vishal/Projects/envtrap/test-server) (Leak Harness)
An Express.js test app configured to simulate standard credential leaks so developers can verify `envtrap` in action.
- **Endpoints:** `/leak-console` (stdout), `/leak-http` (network), `/leak-subprocess` (spawning scripts), `/leak-dns-esm` / `/leak-dns-cjs` (DNS queries).

---

## ⚡ Quick Start: Core Agent CLI

### 1. Installation
Install globally using `npm`:
```bash
npm install -g envtrap
```
Or run without installing using `npx`:
```bash
npx envtrap run node app.js
```

### 2. Basic Usage
Prefix your startup command with `envtrap run`:
```bash
envtrap run node app.js
```
`envtrap` automatically scans for secrets loaded in `process.env` or from a `.env` file, monitoring 5 exfiltration channels:
- **`stdout / stderr`**: Redacts secrets logged to process output streams.
- **`network`**: Intercepts HTTPS/HTTP requests dynamically at the socket level.
- **`child_process`**: Inspects spawned command-line scripts for secret inheritance.
- **`dns`**: Intercepts DNS queries to block hostname-encoded tunneling.
- **`entropy`**: Runs Shannon-entropy analyses to flag raw high-entropy credential patterns.

---

## 💻 Quick Start: Landing Page

To run or build the landing page locally:
1. Navigate to `/landing-page`.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run local dev server:
   ```bash
   pnpm dev
   ```
4. Build production bundle:
   ```bash
   pnpm build
   ```

---

## 🧪 Testing with the Test Server

The `/test-server` lets you safely test leaks in development:
1. Navigate to `/test-server`.
2. Launch the protected server on port `3001`:
   ```bash
   npm run secure
   ```
3. Visit the endpoints to test exfiltration intercepts:
   - **`http://localhost:3001/leak-console`** (tests console redaction)
   - **`http://localhost:3001/leak-http`** (tests network block)
   - **`http://localhost:3001/leak-subprocess`** (tests child process block)

---

## 🔒 Security & Guidelines

- **100% Local Execution**: No telemetry, no external API calls, and completely air-gapped compatible.
- **AI-Safe Logs**: Secret values are hashed via SHA-256 for redaction, preventing credentials from appearing in log streams or AI assistants (e.g. Copilot, Claude Code).
- **Security Policy**: For reporting vulnerabilities responsibly, please refer to our [Security Policy](./SECURITY.md).
- **Contributing**: Check out our [Contributing Guidelines](./CONTRIBUTING.md) to learn how to run tests and make updates.
- **License**: Released under the MIT License. See [LICENSE.md](./LICENSE.md) for details.
