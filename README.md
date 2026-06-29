# envtrap

A zero-configuration, air-gapped runtime secret leak detector and egress firewall for Node.js.

`envtrap` sits at the lowest boundary of your Node.js process — hooking module loaders and socket interfaces — to intercept, block, and log accidental secret exposure before a single byte leaves your machine.

[![npm version](https://img.shields.io/npm/v/envtrap)](https://www.npmjs.com/package/envtrap)
[![GitHub license](https://img.shields.io/github/license/Vishal-770/envtrap)](https://github.com/Vishal-770/envtrap)
[![Docs](https://img.shields.io/badge/docs-mintlify-indigo)](https://envtrap.mintlify.app/introduction)

---

## Features

- **HTTPS/HTTP MITM Proxy** (`network` channel, default: `block`): Routes outbound traffic through a loopback TLS proxy, decrypts payloads, and scans request headers, URLs, and bodies for secrets. Local loopback traffic (`localhost`, `127.0.0.1`, `::1`) is automatically bypassed via `NO_PROXY`.
- **stdout / stderr Stream Scanning** (`stdout`/`stderr` channels, default: `warn`): Pipes process output streams to scan, redact (`[REDACTED: SHA256:<8-char>]`), and optionally kill execution on leaks.
- **Child Process Env Validation** (`child_process` channel, default: `warn`): Intercepts `spawn`, `exec`, `execFile`, `fork`, and all sync variants to inspect `options.env` for secrets before any OS fork.
- **DNS Interception** (`dns` channel, default: `block`): Detects secrets encoded inside DNS hostname queries and blocks resolver calls for both callback and promise-based APIs.
- **High-Entropy Tunneling Detection**: Identifies potential base64/hex DNS tunneling using Shannon-entropy analysis on each subdomain label.
- **Real-Time Secret Synchronization**: Dynamically-rotated or injected credentials (e.g. `process.env.NEW_KEY = '...'`) are detected via a `process.env` Proxy and immediately broadcast to the ESM loader thread via a `MessageChannel` — no restart needed.
- **ESM + CommonJS Coverage**: Interception works for both `import` (via `module.register()` hooks) and `require()` (via `Module.prototype.require` patching).
- **AI-Safe Redaction**: Raw credential values are never printed. Only their SHA-256 hash prefix is shown in terminal output and reports.

---

## Installation

```bash
# Global install
npm install -g envtrap

# Dev dependency
npm install --save-dev envtrap

# One-off, no install
npx envtrap run node app.js
```

---

## Usage

Prefix your existing Node.js startup command with `envtrap run`:

```bash
envtrap run node app.js

# Express / Fastify
envtrap run node server.js

# NestJS
envtrap run node dist/main.js

# Next.js (server-side protection)
envtrap run npm run start
```

### CLI Flags

```bash
# Custom .env file
envtrap run --env-file .env.production node app.js

# Disable HTTPS MITM proxy
envtrap run --no-mitm node app.js

# Verbose debug output (proxy intercept logs)
envtrap run --verbose node app.js

# Quiet mode — suppress alerts, show summary only
envtrap run --quiet node app.js

# Structured JSONL event log
envtrap run --log-file logs/envtrap.jsonl node app.js

# Validate envtrap.json before running
envtrap check
```

---

## Configuration (`envtrap.json`)

Create an optional `envtrap.json` in your project root. All fields are optional — defaults are secure out of the box.

```json
{
  "channels": {
    "stdout":        "warn",
    "stderr":        "warn",
    "network":       "block",
    "child_process": "warn",
    "dns":           "block"
  },
  "exclusions": {
    "domains": ["api.stripe.com", "api.openai.com"],
    "paths":   ["test/**", "**/__tests__/**"]
  },
  "entropy": {
    "threshold": 3.5,
    "minLength": 12
  },
  "quiet":   false,
  "logFile": null
}
```

### Channel Modes

| Channel | Default | Description |
|---|---|---|
| `stdout` | `warn` | Scans process.stdout, redacts secrets |
| `stderr` | `warn` | Scans process.stderr, redacts secrets |
| `network` | `block` | MITM proxy intercepts all HTTP/HTTPS traffic |
| `child_process` | `warn` | Validates `options.env` on all spawn/exec/fork calls |
| `dns` | `block` | Intercepts all `node:dns` resolution calls |

### Exclusions

- **`domains`**: FQDNs that bypass network scanning entirely. These are also automatically added to the child process `NO_PROXY` list so local-only services are never proxied.
- **`paths`**: Glob patterns — detections originating from matching source files are suppressed.

---

## What Gets Protected

`envtrap` works with **any Node.js framework or runtime** — it hooks the Node.js core, not the application layer:

| Runtime | Coverage |
|---|---|
| Express / Fastify | All outbound requests, subprocesses, DNS, stdout |
| NestJS | All services, guards, background workers |
| Next.js | All server-side routes, API routes, Server Actions |
| Bare Node.js scripts | Full coverage |

> **Note:** Client-side browser code runs in the user's browser, not the Node.js process. Only server-side code is covered.

---

## Security & Guidelines

- **100% Local Execution**: No telemetry, no external API calls, completely air-gapped compatible.
- **In-Memory Root CA**: The TLS MITM proxy generates an ephemeral Root CA entirely in RAM on boot. The private key never touches disk and is wiped when the process exits.
- **Security Policy**: See [SECURITY.md](./SECURITY.md) for responsible disclosure.
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for build, test, and PR guidelines.
- **License**: MIT. See [LICENSE.md](./LICENSE.md).

---

## What's New in v2.1.0

- **Native OpenSSL RSA key generation** — reduced certificate synthesis from ~200ms to ~5ms
- **Sliding-window TCP chunk scanner** — eliminated $O(n^2)$ memory allocation in the MITM proxy
- **`execFileSync` shell injection prevention** — system CA tooling no longer uses template-string shell commands
- **RFC 5280-compliant certificate serials** — `crypto.randomBytes(20)` replaces `Date.now()`
- **Real-time ESM loader sync** — `MessageChannel` + `process.env` Proxy broadcasts runtime secret rotations to the loader thread instantly
- **Automatic `NO_PROXY` injection** — loopback and excluded domains are bypassed from the MITM proxy automatically
