# envtrap

A zero-configuration runtime secret leak detector and egress firewall for Node.js.

envtrap is a security agent that wraps Node.js applications to intercept, block, and log the exposure of sensitive data such as API keys, database credentials, and tokens at runtime.

Unlike static analysis (SAST) tools, envtrap monitors execution boundaries to prevent data exfiltration before it reaches standard outputs, logs, subprocesses, or external network destinations.

## Features

* **Standard Output and Error Interception**: Captures stdout and stderr streams at the OS kernel level (File Descriptors 1 and 2), intercepting writes from native C++ addons that bypass JavaScript-level stream overrides.
* **HTTPS Decryption (MITM Proxy)**: Terminates TLS connections locally via an in-memory proxy to scan outgoing headers, bodies, and URLs for matching secrets before forwarding requests.
* **Subprocess Environment Validation**: Hooks the `child_process` module to inspect environment variables (`options.env`) before subprocesses are spawned.
* **Outbound DNS Tunneling Prevention**: Intercepts `node:dns` lookup and resolve calls to block queries containing secrets.
* **High-Entropy DNS Warnings**: Analyzes hostname subdomains using Shannon Entropy. It issues warnings for potential DNS tunneling exfiltrations (length >= 12, entropy >= 3.5) without blocking standard resolutions.

## Architecture

The following diagram illustrates how envtrap hooks the application boundaries:

```
+---------------------------------------------+
|                 envtrap CLI                 |
+--------------+---------------+--------------+
               |               |
        +------v------+ +------v------+
        |  OS Pipes   | | MITM Proxy  |
        |  (FD 1 & 2) | | (127.0.0.1) |
        +------+------+ +------+------+
               |               |
        +------v---------------v------+
        |       Scanner Engine        |
        |  (Entropy + Pattern Match)  |
        +-----------------------------+
```

### In-Memory Certificate Authority
To decrypt HTTPS payloads, envtrap instantiates a local HTTP proxy server.
On startup, a 2048-bit RSA Root CA is generated in RAM. The public certificate is stored in a temporary location (`os.tmpdir()/envtrap-ca.crt`), and the private key is held exclusively in memory. Domain-specific TLS certificates are generated dynamically and cached.

### Operating System Trust Store Integration
To support multi-language child processes (e.g., Python, Go) and utilities (e.g., curl):
* **Linux/macOS**: Copies the Root CA certificate to the system trust store (`/usr/local/share/ca-certificates/` or `/Library/Keychains/System.keychain`) on startup when administrative privileges are present.
* **Windows**: Executes `certutil -addstore -user root` to inject the CA into the current user's trusted root store, which does not require User Account Control (UAC) elevation.
* **Cleanup**: Removes the CA certificate from the trust store upon process termination.

### Loader Hooks and Evasion Resistance
Under Node.js 20.6.0+, envtrap uses Module Customization Hooks (`--import` and `module.register()`) to intercept `node:child_process` and `node:dns`.
To prevent malware from bypassing checks via `delete process.env`, the hook pre-caches all loaded secrets in an isolated module closure on initialization.

## Installation

Install globally:

```bash
npm install -g envtrap
```

Install as a development dependency:

```bash
npm install --save-dev envtrap
```

## Usage

Prepend the application startup command with `envtrap run`:

```bash
# Standard execution
envtrap run node app.js

# Custom environment file configuration
envtrap run --env-file .env.production node app.js

# Disable HTTPS MITM decryption
envtrap run --no-mitm node app.js

# Verbose execution details
envtrap run --verbose node app.js
```

## Scanning and Detection Policies

Detection relies on a dual-gate scanner:

1. **Shannon Entropy**: Evaluates character randomness. Generic secrets are detected if they satisfy the following criteria:
   * **Entropy**: 3.5 or higher
   * **Length**: 12 characters or longer
2. **Pattern Matching**: Bypasses entropy limits for common token formats:
   * **Stripe**: `sk_(live|test)_[a-zA-Z0-9]{24,}`
   * **AWS Access Key ID**: `AKIA[0-9A-Z]{16}`
   * **GitHub PAT**: `ghp_[a-zA-Z0-9]{36}`
   * **Slack Bot Token**: `xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}`
   * **SendGrid API Key**: `SG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}`

### AI-Safe Redaction
To prevent exposed secrets from entering LLM context histories (when running tests or applications via AI coding tools), envtrap redacts console and log outputs:
* Secrets are masked using their SHA-256 hash: `[SHA256:e4b4eee7d4a4...]`.
* Leaked secrets are documented in `.envtrap-report.json` in the current working directory for machine parsing.

```json
[
  {
    "secretName": "STRIPE_SECRET_KEY",
    "source": "file",
    "channel": "dns",
    "context": "[REDACTED: SHA256:e4b4eee7].attacker.com",
    "sha256": "e4b4eee7d4a40e4ea77952754c76acd3338147b3f2888e82d57f5b9ccd7c6153",
    "timestamp": 1781335024545
  }
]
```

## License

MIT License. Run locally with zero telemetry.
