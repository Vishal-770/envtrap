#!/usr/bin/env node
// src/index.ts
// CLI Orchestrator & Process Spawner
//
// Boot sequence:
//   1. Parse CLI args (commander)
//   2. Load secrets from process.env + .env
//   3. Init Root CA (node-forge, in-memory private key)
//   4. Start MITM proxy (random port on 127.0.0.1)
//   5. Construct child environment with injected proxy + CA + ESM hook
//   6. Spawn child with stdio: ['inherit', 'pipe', 'pipe']
//   7. Pipe child stdout/stderr through scanner → pass-through to terminal
//   8. Listen for IPC messages from child process ESM hook
//   9. On child exit, print summary and exit with same code

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { initCA, injectSystemCA, removeSystemCA } from './ca.js';
import { startProxy } from './proxy.js';
import { setSecrets, scan, checkChildEnv, getAllEvents } from './scanner.js';
import { printBanner, summary, info, warn } from './reporter.js';
import { looksLikeSecret, getSha256 } from './fingerprint.js';
import type { Secret } from './types.js';

// ---------------------------------------------------------------------------
// Secret Loading
// ---------------------------------------------------------------------------

/**
 * Loads secrets from two sources:
 *   1. The current process.env (already set in the shell)
 *   2. A .env file (parsed via dotenv, NOT set into process.env globally)
 *
 * Secrets with trivially short/empty values are excluded.
 */
const SYSTEM_ENV_BLOCKLIST = new Set([
  'PATH', 'HOME', 'USER', 'SHELL', 'PWD', 'LANG', 'TERM', 'SHLVL', 'LOGNAME',
  'MAIL', 'HOSTNAME', 'HISTCONTROL', 'LESSOPEN', 'LESSCLOSE', '_',
  'XDG_DATA_DIRS', 'XDG_RUNTIME_DIR', 'DBUS_SESSION_BUS_ADDRESS',
  'DEBUGINFOD_URLS', 'NVM_DIR', 'NVM_BIN', 'NVM_INC', 'PNPM_HOME',
  'NODE_ENV', 'NODE_OPTIONS', 'QT_IM_MODULES', 'XMODIFIERS', 'GPG_TTY',
  'EDITOR', 'XAUTHORITY', 'GDM_LANG', 'WAYLAND_DISPLAY', 'INVOCATION_ID',
  'JOURNAL_STREAM', 'CHROME_DESKTOP', 'GJS_DEBUG_TOPICS', 'GNOME_SETUP_DISPLAY',
  'DISPLAY', 'OLDPWD', 'SSH_ASKPASS', 'SSH_AUTH_SOCK', 'LS_COLORS',
  'XDG_SESSION_PATH', 'XDG_SEAT_PATH', 'XDG_SESSION_ID', 'XDG_SESSION_TYPE',
  'XDG_SESSION_CLASS', 'XDG_SESSION_DESKTOP', 'XDG_CURRENT_DESKTOP',
  'GDMSESSION', 'DESKTOP_SESSION', 'XDG_CONFIG_DIRS', 'XDG_SEAT',
  'XDG_VTNR', 'QT_ACCESSIBILITY', 'QT_AUTO_SCREEN_SCALE_FACTOR',
  'GTK_IM_MODULE', 'GTK_MODULES', 'GNOME_JOURNAL_STREAM', 'DBUS_STARTER_BUS_TYPE',
  'DBUS_STARTER_ADDRESS', 'MANAGERPID', 'SYSTEMD_EXEC_PID', 'XDG_MENU_PREFIX',
  'MEMORY_PRESSURE_WATCH', 'MEMORY_PRESSURE_WRITE', 'XDG_SESSION_EXTRA_DEVICE_ACCESS',
  'ANTIGRAVITY_LS_ADDRESS', 'ANTIGRAVITY_CSRF_TOKEN', 'ANTIGRAVITY_SOURCE_METADATA',
  'ANTIGRAVITY_TRAJECTORY_ID', 'ANTIGRAVITY_PROJECT_ID', 'AGY_BROWSER_WS_URL',
  'AGY_BROWSER_ACTIVE_PORT_FILE', 'CHROME_DEVTOOLS_MCP_JS'
]);

function loadSecrets(envFilePath?: string): Secret[] {
  const secrets: Secret[] = [];
  const seenValues = new Set<string>();

  // Source 1: process.env
  for (const [name, value] of Object.entries(process.env)) {
    if (SYSTEM_ENV_BLOCKLIST.has(name)) continue;
    if (value && value.length >= 8 && looksLikeSecret(value)) {
      secrets.push({ name, value, source: 'env' });
      seenValues.add(value);
    }
  }

  // Source 2: .env file (dotenv parse — does NOT mutate process.env)
  const dotenvPath = envFilePath ?? path.resolve(process.cwd(), '.env');
  if (fs.existsSync(dotenvPath)) {
    const parsed = dotenv.parse(fs.readFileSync(dotenvPath));
    for (const [name, value] of Object.entries(parsed)) {
      if (value && value.length >= 8 && !seenValues.has(value) && looksLikeSecret(value)) {
        secrets.push({ name, value, source: 'file' });
        seenValues.add(value);
      }
    }
  }

  return secrets;
}

// ---------------------------------------------------------------------------
// CLI Definition
// ---------------------------------------------------------------------------

const program = new Command();

program
  .name('envtrap')
  .description('envtrap v2.0 — Zero-Configuration Runtime Secret Leak Detector')
  .version('2.0.2');

program
  .command('run <command> [args...]')
  .description('Run a command under envtrap monitoring')
  .option('-e, --env-file <path>', 'Path to a custom .env file', '.env')
  .option('-v, --verbose', 'Enable verbose proxy/hook logging', false)
  .option('--no-mitm', 'Disable HTTPS MITM proxy (faster startup, no network scan)')
  .action(async (command: string, args: string[], options: {
    envFile: string;
    verbose: boolean;
    mitm: boolean;
  }) => {
    await runCommand(command, args, options);
  });

program.parse(process.argv);

// ---------------------------------------------------------------------------
// Main Run Logic
// ---------------------------------------------------------------------------

async function runCommand(
  command: string,
  args: string[],
  options: { envFile: string; verbose: boolean; mitm: boolean },
): Promise<void> {
  printBanner(`${command} ${args.join(' ')}`);

  // --- Step 1: Load secrets ---
  const secrets = loadSecrets(options.envFile);
  setSecrets(secrets);

  // Load envtrap.json config allowed domains if present
  let allowedDomains = new Set<string>();
  const configPath = path.resolve(process.cwd(), 'envtrap.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.exclusions && Array.isArray(config.exclusions.domains)) {
        allowedDomains = new Set(config.exclusions.domains);
        if (options.verbose) {
          info(`Loaded ${allowedDomains.size} allowed domains from envtrap.json`);
        }
      }
    } catch (err) {
      warn(`Failed to parse envtrap.json: ${(err as Error).message}`);
    }
  }

  if (options.verbose) {
    info(`Loaded ${secrets.length} secrets from env/file sources`);
  }

  // --- Step 2: Init CA + Proxy (unless --no-mitm) ---
  let proxyPort = 0;
  let caCertPath = '';

  if (options.mitm) {
    const caMaterials = initCA();
    caCertPath = caMaterials.certPath;

    // Temporarily inject CA into OS system trust store if root permissions exist
    injectSystemCA(caCertPath, options.verbose);

    if (options.verbose) {
      info(`Root CA written to: ${caCertPath}`);
    }

    proxyPort = await startProxy(options.verbose, allowedDomains);

    if (options.verbose) {
      info(`MITM proxy listening on 127.0.0.1:${proxyPort}`);
    }
  }

  // --- Step 3: Build child environment ---
  // Resolve hooks.mjs path: in dist/ at runtime, in src/ during development
  const hooksPath = resolveHooksPath();

  const secretNames = secrets.map((s) => s.name);
  const secretsMap: Record<string, string> = {};
  for (const s of secrets) {
    secretsMap[s.name] = s.value;
  }

  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    // Proxy injection (enables MITM for HTTPS traffic)
    ...(options.mitm && proxyPort > 0
      ? {
          HTTP_PROXY: `http://127.0.0.1:${proxyPort}`,
          HTTPS_PROXY: `http://127.0.0.1:${proxyPort}`,
          http_proxy: `http://127.0.0.1:${proxyPort}`,
          https_proxy: `http://127.0.0.1:${proxyPort}`,
        }
      : {}),
    // Trust our fake CA cert
    ...(options.mitm && caCertPath
      ? { NODE_EXTRA_CA_CERTS: caCertPath }
      : {}),
    // ESM hook injection — wraps child_process in the spawned app
    NODE_OPTIONS: buildNodeOptions(hooksPath, process.env.NODE_OPTIONS),
    // Pass secret names list to the hook for child_process env scanning
    __ENVTRAP_SECRET_NAMES__: JSON.stringify(secretNames),
    // Pass the full secrets map to prevent evasion via env clearing and secure DNS checks
    __ENVTRAP_SECRETS_MAP__: JSON.stringify(secretsMap),
  };

  // --- Step 4: Spawn child process with OS-level pipes ---
  // stdio: ['inherit', 'pipe', 'pipe'] routes child stdout/stderr through
  // OS pipes that we own — this catches native addon writes too.
  const child = spawn(command, args, {
    env: childEnv,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  // Local helper to match child leaks against loaded secrets list and route to scanner
  const handleHookMessage = (str: string): void => {
    const match = /secret "([^"]+)" passed to: (.+)/.exec(str);
    if (match) {
      const secretName = match[1];
      const found = secrets.find((s) => s.name === secretName);
      if (found) {
        checkChildEnv({ [secretName]: found.value });
      }
    }
  };

  // Local helper to parse DNS leaks and scan the domain hostname containing the secret value
  const handleDnsMessage = (str: string): void => {
    const match = /secret "([^"]+)" found in lookup of: (.+)/.exec(str);
    if (match) {
      const specifier = match[2];
      scan(specifier, 'dns');
    }
  };

  // Local helper to parse DNS high-entropy warnings
  const handleDnsWarning = (str: string): void => {
    const match = /high-entropy lookup detected: (.+)/.exec(str);
    if (match) {
      const specifier = match[1];
      warn(`Potential DNS Tunneling detected (high-entropy): ${specifier}`);
    }
  };

  // --- Step 5: Pipe stdout/stderr through scanner ---
  // RULE: We attach .on('data') to the pipe streams — NOT process.stdout.write.
  //       This catches OS-level writes from native C++ addons.

  child.stdout?.on('data', (chunk: Buffer) => {
    let str = chunk.toString('utf-8');
    // Scan BEFORE writing
    scan(str, 'stdout');
    
    // Redact loaded secrets in the stdout stream
    for (const secret of secrets) {
      if (str.includes(secret.value)) {
        const hash = getSha256(secret.value).slice(0, 8);
        const redactedVal = `[REDACTED: SHA256:${hash}]`;
        str = str.split(secret.value).join(redactedVal);
      }
    }
    
    // Pass through redacted string to terminal
    process.stdout.write(str);
  });

  let stderrRemainder = '';

  child.stderr?.on('data', (chunk: Buffer) => {
    const text = stderrRemainder + chunk.toString('utf-8');
    const lines = text.split('\n');
    stderrRemainder = lines.pop() ?? '';

    for (const line of lines) {
      if (line.includes('[envtrap] Child process leak:')) {
        handleHookMessage(line);
      } else if (line.includes('[envtrap] DNS leak:')) {
        handleDnsMessage(line);
      } else if (line.includes('[envtrap] DNS warning:')) {
        handleDnsWarning(line);
      } else {
        // Normal stderr: scan and pass through
        scan(line, 'stderr');
        
        let redactedLine = line;
        for (const secret of secrets) {
          if (redactedLine.includes(secret.value)) {
            const hash = getSha256(secret.value).slice(0, 8);
            const redactedVal = `[REDACTED: SHA256:${hash}]`;
            redactedLine = redactedLine.split(secret.value).join(redactedVal);
          }
        }
        process.stderr.write(redactedLine + '\n');
      }
    }
  });

  child.stderr?.on('end', () => {
    if (stderrRemainder) {
      if (stderrRemainder.includes('[envtrap] Child process leak:')) {
        handleHookMessage(stderrRemainder);
      } else if (stderrRemainder.includes('[envtrap] DNS leak:')) {
        handleDnsMessage(stderrRemainder);
      } else if (stderrRemainder.includes('[envtrap] DNS warning:')) {
        handleDnsWarning(stderrRemainder);
      } else {
        scan(stderrRemainder, 'stderr');
        
        let redactedRemainder = stderrRemainder;
        for (const secret of secrets) {
          if (redactedRemainder.includes(secret.value)) {
            const hash = getSha256(secret.value).slice(0, 8);
            const redactedVal = `[REDACTED: SHA256:${hash}]`;
            redactedRemainder = redactedRemainder.split(secret.value).join(redactedVal);
          }
        }
        process.stderr.write(redactedRemainder);
      }
    }
  });

  // --- Step 6: Handle child exit ---
  child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
    const events = getAllEvents();
    summary(events);

    // Save structured report for AI agents (Claude Code, Antigravity, etc.)
    try {
      const reportPath = path.resolve(process.cwd(), '.envtrap-report.json');
      const structuredEvents = events.map((ev) => ({
        secretName: ev.secret.name,
        source: ev.secret.source,
        channel: ev.channel,
        context: ev.context,
        sha256: getSha256(ev.secret.value),
        timestamp: ev.timestamp,
      }));
      fs.writeFileSync(reportPath, JSON.stringify(structuredEvents, null, 2), 'utf-8');
      if (options.verbose) {
        info(`AI-Agent leak report written to: ${reportPath}`);
      }
    } catch (err) {
      warn(`Failed to write AI-Agent leak report: ${(err as Error).message}`);
    }

    // Clean up system CA certificates if root was used
    if (options.mitm && caCertPath) {
      removeSystemCA(caCertPath);
    }

    const exitCode = code ?? (signal ? 1 : 0);
    process.exit(exitCode);
  });

  child.on('error', (err: Error) => {
    warn(`Failed to spawn process: ${err.message}`);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the absolute path to hooks.mjs.
 * Tries dist/ first (production), falls back to src/ (development).
 */
function resolveHooksPath(): string {
  // __dirname is the compiled dist/ directory
  const distHooks = path.resolve(__dirname, 'hooks.mjs');
  const srcHooks = path.resolve(__dirname, '..', 'src', 'hooks.mjs');

  if (fs.existsSync(distHooks)) return distHooks;
  if (fs.existsSync(srcHooks)) return srcHooks;

  throw new Error(
    `[envtrap] Cannot find hooks.mjs. Expected at:\n  ${distHooks}\n  ${srcHooks}`,
  );
}

/**
 * Merges our --import hook into any pre-existing NODE_OPTIONS.
 * Avoids overwriting user's own NODE_OPTIONS settings.
 */
function buildNodeOptions(hooksPath: string, existingOptions?: string): string {
  const ourFlag = `--import ${hooksPath}`;
  if (!existingOptions) return ourFlag;
  // Don't double-inject
  if (existingOptions.includes(hooksPath)) return existingOptions;
  return `${existingOptions} ${ourFlag}`;
}
