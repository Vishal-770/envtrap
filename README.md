# envtrap

A zero-configuration, air-gapped runtime secret leak detector and egress firewall for Node.js. 

`envtrap` sits at the lowest boundary of your Node.js process—hooking module loaders and socket interfaces—to intercept, block, and log accidental secret exposure before a single byte leaves your machine.

[![GitHub license](https://img.shields.io/github/license/Vishal-770/envtrap)](https://github.com/Vishal-770/envtrap)
[![Docs](https://img.shields.io/badge/docs-mintlify-indigo)](https://envtrap.mintlify.app/introduction#the-solution)

---

## 📂 Repository Structure

This repository is structured as a monorepo containing the security agent CLI, documentation, the product landing page, and test suites:

- **[`/package`](file:///home/vishal/Projects/envtrap/package)**: The core `envtrap` npm CLI tool and runtime hook agent.
- **[`/landing-page`](file:///home/vishal/Projects/envtrap/landing-page)**: A premium Next.js 16 landing page with clean light-theme typography and interactive visuals.
- **[`/docs`](file:///home/vishal/Projects/envtrap/docs)**: Mintlify-powered developer documentation files.
- **[`/test-server`](file:///home/vishal/Projects/envtrap/test-server)**: A utility Node.js test server simulating exfiltration vectors to verify detection.

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

Prefix your Node.js application startup command with `envtrap run`:
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

The landing page is built with Next.js 16, Tailwind CSS, GSAP, and Lucide Icons.

### 1. Install dependencies
From the `/landing-page` directory:
```bash
pnpm install
```

### 2. Run local dev server
```bash
pnpm dev
```

### 3. Build production bundle
```bash
pnpm build
```

---

## 📘 Documentation

Our full developer reference guide, CLI arguments list, and custom exclusion instructions can be found at:
👉 **[envtrap Mintlify Docs](https://envtrap.mintlify.app/introduction#the-solution)**

---

## 🔒 Security & Guidelines

- **100% Local Execution**: No telemetry, no external API calls, and completely air-gapped compatible.
- **AI-Safe Logs**: Secret values are hashed via SHA-256 for redaction, preventing credentials from appearing in log streams or AI assistants (e.g. Copilot, Claude Code).
- **Security Policy**: For reporting vulnerabilities responsibly, please refer to our [Security Policy](./SECURITY.md).
- **Contributing**: Check out our [Contributing Guidelines](./CONTRIBUTING.md) to learn how to run tests and make updates.
- **License**: Released under the MIT License. See [LICENSE.md](./LICENSE.md) for details.
