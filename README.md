# envtrap

A zero-configuration, air-gapped runtime secret leak detector and egress firewall for Node.js. 

`envtrap` sits at the lowest boundary of your Node.js process—hooking module loaders and socket interfaces—to intercept, block, and log accidental secret exposure before a single byte leaves your machine.

[![GitHub license](https://img.shields.io/github/license/Vishal-770/envtrap)](https://github.com/Vishal-770/envtrap)
[![Docs](https://img.shields.io/badge/docs-mintlify-indigo)](https://envtrap.mintlify.app/introduction#the-solution)

---

## ⚡ Features

- **HTTPS/HTTP MITM Proxy** (`network` channel, default: `block`): Routes outbound traffic through an in-memory loopback proxy, decrypts payloads, and scans request headers, URLs, and bodies for secrets.
- **stdout / stderr Stream Scanning** (`stdout`/`stderr` channels, default: `warn`): Pipes process output streams to scan, redact, and optionally kill execution on leaks.
- **Child Process Env Validation** (`child_process` channel, default: `warn`): Intercepts command-line spawns (`spawn`, `exec`, `fork`) to validate environment inheritance.
- **DNS Interception** (`dns` channel, default: `block`): Detects secrets encoded inside DNS hostname queries and blocks resolver calls.
- **High-Entropy Tunneling Detection**: Identifies potential base64/hex DNS tunneling vectors using Shannon-entropy analysis.
- **AI-Safe Redaction**: Redacts raw credentials in console streams and reports into secure, non-reversible SHA-256 hashes.

---

## 🚀 Installation

Install globally using `npm`:
```bash
npm install -g envtrap
```

Or add as a dev dependency to your project:
```bash
npm install --save-dev envtrap
```

Use instantly without installing via `npx`:
```bash
npx envtrap run node app.js
```

---

## 🛠️ Usage

Prefix your normal Node.js startup command with `envtrap run`:
```bash
envtrap run node app.js
```

### Additional Flags
```bash
# Specify a custom environment file
envtrap run --env-file .env.production node app.js

# Disable the HTTPS MITM proxy
envtrap run --no-mitm node app.js

# Output structured log events to a file
envtrap run --log-file logs/envtrap.jsonl node app.js
```

---

## ⚙️ Configuration (`envtrap.json`)

Create an optional `envtrap.json` file in your project root to customize protection rules:

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
  }
}
```

Validate your configuration file locally:
```bash
envtrap check
```

---

## 🔒 Security & Guidelines

- **100% Local Execution**: No telemetry, no external API calls, and completely air-gapped compatible.
- **Security Policy**: For reporting vulnerabilities responsibly, please refer to our [Security Policy](./SECURITY.md).
- **Contributing**: Check out our [Contributing Guidelines](./CONTRIBUTING.md) to learn how to run tests and make updates.
- **License**: Released under the MIT License. See [LICENSE.md](./LICENSE.md) for details.
