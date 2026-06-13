#!/usr/bin/env node
// src/index.ts
// CLI Orchestrator & Process Spawner

import { Command } from 'commander';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import { initCA, injectSystemCA, removeSystemCA } from './ca.js';
import { startProxy } from './proxy.js';
import { setSecrets, setConfig, scan, checkChildEnv, getAllEvents } from './scanner.js';
import { printBanner, summary, info, warn, setQuiet, setLogFile } from './reporter.js';
import { looksLikeSecret, getSha256 } from './fingerprint.js';
import type { Secret } from './types.js';
import { loadConfig } from './config.js';

// ---------------------------------------------------------------------------
// Secret Loading
// ---------------------------------------------------------------------------

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

function loadSecrets(envFilePath?: string, minLength = 12, minEntropy = 3.5): Secret[] {
  const secrets: Secret[] = [];
  const seenValues = new Set<string>();

  // Source 1: process.env
  for (const [name, value] of Object.entries(process.env)) {
    if (SYSTEM_ENV_BLOCKLIST.has(name)) continue;
    if (value && value.length >= 8 && looksLikeSecret(value, minLength, minEntropy)) {
      secrets.push({ name, value, source: 'env' });
      seenValues.add(value);
    }
  }

  // Source 2: .env file
  const dotenvPath = envFilePath ?? path.resolve(process.cwd(), '.env');
  if (fs.existsSync(dotenvPath)) {
    const parsed = dotenv.parse(fs.readFileSync(dotenvPath));
    for (const [name, value] of Object.entries(parsed)) {
      const alreadyLoaded = secrets.some((s) => s.name === name);
      if (value && value.length >= 8 && !alreadyLoaded && !seenValues.has(value) && looksLikeSecret(value, minLength, minEntropy)) {
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
  .version('2.0.3');

program
  .command('check')
  .description('Validate the envtrap.json configuration file')
  .action(() => {
    const { errors, loaded } = loadConfig(process.cwd());
    if (!loaded) {
      console.log('No envtrap.json configuration file found. Using default settings.');
      process.exit(0);
    }
    if (errors.length > 0) {
      console.error('Configuration Validation Failed:');
      for (const err of errors) {
        console.error(`  - [${err.path}] ${err.message}`);
      }
      process.exit(1);
    }
    console.log('✅ Configuration is valid.');
    process.exit(0);
  });

program
  .command('run <command> [args...]')
  .description('Run a command under envtrap monitoring')
  .option('-e, --env-file <path>', 'Path to a custom .env file', '.env')
  .option('-v, --verbose', 'Enable verbose proxy/hook logging', false)
  .option('--no-mitm', 'Disable HTTPS MITM proxy (faster startup, no network scan)')
  .option('--quiet', 'Suppress startup banner and leak alerts (show summary only)', false)
  .option('--log-file <path>', 'Path to write structured JSONL events')
  .action(async (command: string, args: string[], options: {
    envFile: string;
    verbose: boolean;
    mitm: boolean;
    quiet: boolean;
    logFile?: string;
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
  options: { envFile: string; verbose: boolean; mitm: boolean; quiet: boolean; logFile?: string },
): Promise<void> {
  // --- Step 1: Load config ---
  const { config, errors: configErrors, loaded: configLoaded } = loadConfig(process.cwd());

  const quiet = options.quiet || config.quiet;
  const logFile = options.logFile || config.logFile;
  const verbose = options.verbose;

  setQuiet(quiet);
  setLogFile(logFile ? path.resolve(process.cwd(), logFile) : null);
  setConfig(config);

  if (configLoaded && configErrors.length > 0) {
    warn(`Configuration file validation warnings/errors:`);
    for (const err of configErrors) {
      warn(`  - [${err.path}] ${err.message}`);
    }
  }

  // --- Step 2: Load secrets ---
  const secrets = loadSecrets(options.envFile, config.entropy.minLength, config.entropy.threshold);
  setSecrets(secrets);

  // --- Step 3: Transparency Logs ---
  if (!quiet) {
    info(`Configuration loaded: ${configLoaded ? 'envtrap.json' : 'default settings'}`);
    info(`Active monitoring channels:`);
    for (const [ch, mode] of Object.entries(config.channels)) {
      info(`  - ${ch}: [${mode.toUpperCase()}]`);
    }
    if (config.exclusions.domains.length > 0) {
      info(`Allowlisted domains (bypassing HTTPS scanning): ${config.exclusions.domains.join(', ')}`);
    }
    if (config.exclusions.paths.length > 0) {
      info(`Path exclusions: ${config.exclusions.paths.join(', ')}`);
    }
  }

  printBanner(`${command} ${args.join(' ')}`);

  if (verbose) {
    info(`Loaded ${secrets.length} secrets from env/file sources`);
  }

  // --- Step 4: Init CA + Proxy (unless --no-mitm or network: off) ---
  let proxyPort = 0;
  let caCertPath = '';
  const mitmEnabled = options.mitm && config.channels.network !== 'off';

  if (mitmEnabled) {
    const caMaterials = initCA();
    caCertPath = caMaterials.certPath;

    // Temporarily inject CA into OS system trust store
    injectSystemCA(caCertPath, verbose);

    if (verbose) {
      info(`Root CA written to: ${caCertPath}`);
    }

    proxyPort = await startProxy(verbose, config);

    if (verbose) {
      info(`MITM proxy listening on 127.0.0.1:${proxyPort}`);
    }
  }

  // --- Step 5: Build child environment ---
  const hooksPath = resolveHooksPath();
  const secretNames = secrets.map((s) => s.name);
  const secretsMap: Record<string, string> = {};
  for (const s of secrets) {
    secretsMap[s.name] = s.value;
  }

  const childEnv: NodeJS.ProcessEnv = {
    ...process.env,
    ...(mitmEnabled && proxyPort > 0
      ? {
          HTTP_PROXY: `http://127.0.0.1:${proxyPort}`,
          HTTPS_PROXY: `http://127.0.0.1:${proxyPort}`,
          http_proxy: `http://127.0.0.1:${proxyPort}`,
          https_proxy: `http://127.0.0.1:${proxyPort}`,
        }
      : {}),
    ...(mitmEnabled && caCertPath
      ? { NODE_EXTRA_CA_CERTS: caCertPath }
      : {}),
    NODE_OPTIONS: buildNodeOptions(hooksPath, process.env.NODE_OPTIONS),
    __ENVTRAP_SECRET_NAMES__: JSON.stringify(secretNames),
    __ENVTRAP_SECRETS_MAP__: JSON.stringify(secretsMap),
    __ENVTRAP_CONFIG_MODES__: JSON.stringify(config.channels),
    __ENVTRAP_PATH_EXCLUSIONS__: JSON.stringify(config.exclusions.paths),
    __ENVTRAP_ENTROPY_THRESHOLD__: String(config.entropy.threshold),
    __ENVTRAP_ENTROPY_MIN_LENGTH__: String(config.entropy.minLength),
  };

  // --- Step 6: Spawn child process ---
  const child = spawn(command, args, {
    env: childEnv,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  let forceExit = false;

  const handleHookMessage = (str: string): void => {
    const match = /secret "([^"]+)" passed to: (.+)/.exec(str);
    if (match) {
      const secretName = match[1];
      const found = secrets.find((s) => s.name === secretName);
      if (found) {
        const isBlocked = checkChildEnv({ [secretName]: found.value });
        if (isBlocked) {
          forceExit = true;
          child.kill('SIGTERM');
        }
      }
    }
  };

  const handleDnsMessage = (str: string): void => {
    const match = /secret "([^"]+)" found in lookup of: (.+)/.exec(str);
    if (match) {
      const specifier = match[2];
      const isBlocked = scan(specifier, 'dns');
      if (isBlocked) {
        forceExit = true;
        child.kill('SIGTERM');
      }
    }
  };

  const handleDnsWarning = (str: string): void => {
    const match = /high-entropy lookup detected: (.+)/.exec(str);
    if (match) {
      const specifier = match[1];
      warn(`Potential DNS Tunneling detected (high-entropy): ${specifier}`);
    }
  };

  // --- Step 7: Pipe stdout/stderr through scanner ---
  child.stdout?.on('data', (chunk: Buffer) => {
    let str = chunk.toString('utf-8');
    const isBlocked = scan(str, 'stdout');

    for (const secret of secrets) {
      if (str.includes(secret.value)) {
        const hash = getSha256(secret.value).slice(0, 8);
        const redactedVal = `[REDACTED: SHA256:${hash}]`;
        str = str.split(secret.value).join(redactedVal);
      }
    }

    process.stdout.write(str);

    if (isBlocked) {
      forceExit = true;
      child.kill('SIGTERM');
    }
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
        const isBlocked = scan(line, 'stderr');

        let redactedLine = line;
        for (const secret of secrets) {
          if (redactedLine.includes(secret.value)) {
            const hash = getSha256(secret.value).slice(0, 8);
            const redactedVal = `[REDACTED: SHA256:${hash}]`;
            redactedLine = redactedLine.split(secret.value).join(redactedVal);
          }
        }
        process.stderr.write(redactedLine + '\n');

        if (isBlocked) {
          forceExit = true;
          child.kill('SIGTERM');
        }
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
        const isBlocked = scan(stderrRemainder, 'stderr');

        let redactedRemainder = stderrRemainder;
        for (const secret of secrets) {
          if (redactedRemainder.includes(secret.value)) {
            const hash = getSha256(secret.value).slice(0, 8);
            const redactedVal = `[REDACTED: SHA256:${hash}]`;
            redactedRemainder = redactedRemainder.split(secret.value).join(redactedVal);
          }
        }
        process.stderr.write(redactedRemainder);

        if (isBlocked) {
          forceExit = true;
          child.kill('SIGTERM');
        }
      }
    }
  });

  // --- Step 8: Handle child exit ---
  child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
    const events = getAllEvents();
    summary(events);

    // Save structured report
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
      if (verbose) {
        info(`AI-Agent leak report written to: ${reportPath}`);
      }
    } catch (err) {
      warn(`Failed to write AI-Agent leak report: ${(err as Error).message}`);
    }

    if (mitmEnabled && caCertPath) {
      removeSystemCA(caCertPath);
    }

    const exitCode = forceExit ? 1 : (code ?? (signal ? 1 : 0));
    process.exit(exitCode);
  });

  child.on('error', (err: Error) => {
    warn(`Failed to spawn process: ${err.message}`);
    process.exit(1);
  });
}

function resolveHooksPath(): string {
  const distHooks = path.resolve(__dirname, 'hooks.mjs');
  const srcHooks = path.resolve(__dirname, '..', 'src', 'hooks.mjs');

  if (fs.existsSync(distHooks)) return distHooks;
  if (fs.existsSync(srcHooks)) return srcHooks;

  throw new Error(
    `[envtrap] Cannot find hooks.mjs. Expected at:\n  ${distHooks}\n  ${srcHooks}`,
  );
}

function buildNodeOptions(hooksPath: string, existingOptions?: string): string {
  const ourFlag = `--import ${hooksPath}`;
  if (!existingOptions) return ourFlag;
  if (existingOptions.includes(hooksPath)) return existingOptions;
  return `${existingOptions} ${ourFlag}`;
}
