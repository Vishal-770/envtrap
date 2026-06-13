# envtrap

A zero-configuration runtime secret leak detector and egress firewall for Node.js.

envtrap is a security agent that wraps Node.js applications to intercept, block, and log the exposure of sensitive data such as API keys, database credentials, and tokens at runtime — across five distinct exfiltration channels.

Unlike static analysis (SAST) tools, envtrap monitors execution boundaries to prevent data exfiltration before it reaches log streams, subprocesses, or external network destinations.

---

## Features

- **HTTPS/HTTP MITM Proxy** (`network` channel, default: `block`): Starts a local TLS proxy on `127.0.0.1`, routes all child process HTTP/HTTPS traffic through it, decrypts payloads, and scans headers, URLs, and request bodies for secrets. Blocks with `403 Forbidden` or socket destruction.
- **stdout / stderr Stream Scanning** (`stdout`/`stderr` channels, default: `warn`): Pipes the child process's standard streams, scans every chunk, redacts matched secrets (`[REDACTED: SHA256:<8-char>]`), and optionally kills the child on block.
- **Child Process Env Validation** (`child_process` channel, default: `warn`): Intercepts `spawn`, `exec`, `execFile`, `fork`, and sync variants to check `options.env` for secrets before any OS fork.
- **DNS Interception** (`dns` channel, default: `block`): Intercepts all `node:dns` APIs (callback and promise style) to block queries containing secret values in the hostname.
- **High-Entropy DNS Tunneling Detection**: Analyses each subdomain label for Shannon entropy ≥ threshold — flags potential base64/hex encoded DNS-tunneled payloads regardless of secret match.
- **ESM + CommonJS Coverage**: All module interception works for both ESM (`import`) via `module.register()` customization hooks, and CommonJS (`require()`) via `Module.prototype.require` patching.
- **AI-Safe Redaction**: Secret values are never printed in logs or terminal output — only their SHA-256 hash prefix is shown.
- **Structured Leak Reports**: After each run, `.envtrap-report.json` is written to CWD with all events in machine-readable JSON.
- **Granular Channel Control**: Each channel can be independently set to `block`, `warn`, or `off` via `envtrap.json`.

---

## Requirements

- **Node.js 18.0.0 or later** (ESM customization hooks require Node 18+)

---

## Installation

Install globally:

```bash
npm install -g envtrap
```

Install as a development dependency:

```bash
npm install --save-dev envtrap
```

Use without installing:

```bash
npx envtrap run node app.js
```

---

## Usage

Prefix your start command with `envtrap run`:

```bash
envtrap run node app.js
```

Additional flags:

```bash
# Custom .env file
envtrap run --env-file .env.production node app.js

# Disable HTTPS MITM proxy (no network channel scanning)
envtrap run --no-mitm node app.js

# Verbose debug output
envtrap run --verbose node app.js

# Quiet mode (suppress alerts, show summary only)
envtrap run --quiet node app.js

# Write structured JSONL events to a file
envtrap run --log-file logs/envtrap.jsonl node app.js
```

package.json integration:

```json
{
  "scripts": {
    "start": "envtrap run node app.js",
    "dev":   "envtrap run node --watch app.js"
  }
}
```

---

## Configuration (`envtrap.json`)

Create `envtrap.json` in your project root for fine-grained control. All fields are optional — envtrap ships with safe defaults.

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

### `channels`

Each key accepts `"block"`, `"warn"`, or `"off"`:

| Channel | Default | Description |
|---|---|---|
| `stdout` | `warn` | Scans every write to process.stdout, redacts secrets |
| `stderr` | `warn` | Scans every write to process.stderr, redacts secrets |
| `network` | `block` | MITM proxy intercepts all HTTP/HTTPS traffic |
| `child_process` | `warn` | Checks `options.env` on all spawn/exec/fork calls |
| `dns` | `block` | Intercepts all `node:dns` resolution calls |

### `exclusions`

- **`domains`**: Fully-qualified domain names that bypass network scanning entirely
- **`paths`**: Glob patterns for source files — detections from matching files are suppressed (applies to `stdout`, `stderr`, `child_process`, `dns`)

### `entropy`

- **`threshold`** (default: `3.5`): Minimum Shannon entropy score for a value to be registered as an active secret
- **`minLength`** (default: `12`): Minimum character length — shorter values are always dropped

### `quiet`

When `true`, suppresses banner and per-leak alerts. Summary and report file are always produced.

### `logFile`

Path (relative or absolute) to append structured JSONL events during the run.

---

## Validate Configuration

```bash
envtrap check
```

Output on success: `✅ Configuration is valid.`  
Output on failure shows the exact field path and error message.

---

## Secret Detection

On startup, envtrap loads secret candidates from two sources:

1. **`process.env`** — every env var not on the built-in system variable blocklist (`PATH`, `HOME`, `SHELL`, `NODE_ENV`, etc.)
2. **`.env` file** — parsed with `dotenv`, deduplicated against `process.env`

Each candidate value is tested through the `looksLikeSecret` gate:

1. **Length check**: must be ≥ `entropy.minLength` (default 12 chars)
2. **Deterministic regex**: if the value matches any known pattern (see below), it's always registered
3. **Shannon entropy**: if entropy ≥ `entropy.threshold` (default 3.5), it's registered

### Built-in Token Patterns

| Provider | Pattern |
|---|---|
| Stripe | `sk_(live\|test)_[a-zA-Z0-9]{24,}` |
| AWS Access Key ID | `AKIA[0-9A-Z]{16}` |
| GitHub Personal Access Token | `ghp_[a-zA-Z0-9]{36}` |
| Generic Bearer Token | `Bearer\s+[a-zA-Z0-9\-._~+/]{20,}` |
| SendGrid API Key | `SG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}` |
| Slack Bot Token | `xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}` |

---

## Scanning Details

- **Exact string match** only at runtime (no runtime regex) — fast even on large payloads
- **1 MB backpressure clamp**: only the first 1 MB of any content chunk is scanned
- **TTL deduplication**: repeated `secret + channel` events within a 1.5-second window are silently dropped to prevent alert flooding

---

## AI-Safe Redaction

envtrap never logs secret values. It uses SHA-256 fingerprinting:

- **In terminal output**: `Bearer [REDACTED: SHA256:f23831a9]`
- **In `.envtrap-report.json`**: full SHA-256 hex digest stored, raw value never written

```json
[
  {
    "secretName": "STRIPE_SECRET_KEY",
    "source": "env",
    "channel": "network",
    "context": "Outbound HTTPS Request Audited:\n  Destination Host: attacker.com\n  ...",
    "sha256": "baf2ae563873...",
    "timestamp": 1781335024545
  }
]
```

---

## Architecture

```
  ┌─────────────────────────────────────────────────────────────────┐
  │  envtrap CLI  (parent process)                                   │
  │                                                                   │
  │  ┌───────────────────────────┐  ┌───────────────────────────┐    │
  │  │  MITM TLS Proxy           │  │  Stream Scanner           │    │
  │  │  127.0.0.1:<random port>  │  │  (stdout + stderr pipes)  │    │
  │  │  Scans HTTP/HTTPS traffic │  │  Scans + redacts output   │    │
  │  └──────────────┬────────────┘  └───────────────────────────┘    │
  └─────────────────┼───────────────────────────────────────────────┘
                    │ HTTP_PROXY, HTTPS_PROXY, NODE_EXTRA_CA_CERTS
                    │ NODE_OPTIONS="--import hooks.mjs"
                    ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │  Child Process  (your app)                                       │
  │                                                                   │
  │  ┌──────────────┐   ┌────────────────────────────────────────┐   │
  │  │  Your Code   │   │  hooks.mjs  (injected via --import)    │   │
  │  │  + npm deps  │   │                                        │   │
  │  └──────┬───────┘   │  CJS: Module.prototype.require patch  │   │
  │         │ import/   │  ESM: module.register() resolve hook  │   │
  │         │ require   │                                        │   │
  │         └──────────▶│  Wraps child_process + dns modules    │   │
  │                      └────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────┘
```

---

## License

MIT License. Runs locally with zero telemetry.
