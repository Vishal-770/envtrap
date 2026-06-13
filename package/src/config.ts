// src/config.ts
// envtrap.json configuration loader and validator.
//
// Schema:
//   {
//     "channels": {
//       "stdout":        "block" | "warn" | "off",
//       "stderr":        "block" | "warn" | "off",
//       "network":       "block" | "warn" | "off",
//       "child_process": "block" | "warn" | "off",
//       "dns":           "block" | "warn" | "off"
//     },
//     "exclusions": {
//       "domains":       string[],   // fully-qualified domain names to bypass MITM scanning
//       "paths":         string[]    // path globs to exclude from file-path context hints
//     },
//     "entropy": {
//       "threshold":     number,     // Shannon entropy threshold (default: 3.5)
//       "minLength":     number      // minimum secret length (default: 12)
//     },
//     "quiet":           boolean,    // suppress banner/alert lines (show summary only)
//     "logFile":         string      // path to write append-mode JSONL structured events
//   }

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChannelMode = 'block' | 'warn' | 'off';

export interface ChannelConfig {
  stdout: ChannelMode;
  stderr: ChannelMode;
  network: ChannelMode;
  child_process: ChannelMode;
  dns: ChannelMode;
}

export interface ExclusionsConfig {
  domains: string[];
  paths: string[];
}

export interface EntropyConfig {
  threshold: number;
  minLength: number;
}

export interface EnvtrapConfig {
  channels: ChannelConfig;
  exclusions: ExclusionsConfig;
  entropy: EntropyConfig;
  quiet: boolean;
  logFile: string | null;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const DEFAULT_CONFIG: EnvtrapConfig = {
  channels: {
    stdout: 'warn',
    stderr: 'warn',
    network: 'block',
    child_process: 'warn',
    dns: 'block',
  },
  exclusions: {
    domains: [],
    paths: [],
  },
  entropy: {
    threshold: 3.5,
    minLength: 12,
  },
  quiet: false,
  logFile: null,
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const VALID_MODES: ChannelMode[] = ['block', 'warn', 'off'];
const CHANNEL_KEYS: (keyof ChannelConfig)[] = [
  'stdout', 'stderr', 'network', 'child_process', 'dns',
];

export interface ConfigError {
  path: string;
  message: string;
}

export function validateConfig(raw: unknown): ConfigError[] {
  const errors: ConfigError[] = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    errors.push({ path: '$', message: 'Root config must be a JSON object' });
    return errors;
  }

  const obj = raw as Record<string, unknown>;

  if ('channels' in obj) {
    const ch = obj['channels'];
    if (typeof ch !== 'object' || ch === null || Array.isArray(ch)) {
      errors.push({ path: '$.channels', message: 'Must be an object' });
    } else {
      const chObj = ch as Record<string, unknown>;
      for (const key of Object.keys(chObj)) {
        if (!CHANNEL_KEYS.includes(key as keyof ChannelConfig)) {
          errors.push({
            path: `$.channels.${key}`,
            message: `Unknown channel key "${key}". Valid keys: ${CHANNEL_KEYS.join(', ')}`,
          });
        } else {
          const val = chObj[key];
          if (!VALID_MODES.includes(val as ChannelMode)) {
            errors.push({
              path: `$.channels.${key}`,
              message: `Invalid mode "${val}". Valid modes: ${VALID_MODES.join(', ')}`,
            });
          }
        }
      }
    }
  }

  if ('exclusions' in obj) {
    const ex = obj['exclusions'];
    if (typeof ex !== 'object' || ex === null || Array.isArray(ex)) {
      errors.push({ path: '$.exclusions', message: 'Must be an object' });
    } else {
      const exObj = ex as Record<string, unknown>;
      if ('domains' in exObj && !Array.isArray(exObj['domains'])) {
        errors.push({ path: '$.exclusions.domains', message: 'Must be an array of strings' });
      }
      if ('paths' in exObj && !Array.isArray(exObj['paths'])) {
        errors.push({ path: '$.exclusions.paths', message: 'Must be an array of strings' });
      }
    }
  }

  if ('entropy' in obj) {
    const en = obj['entropy'];
    if (typeof en !== 'object' || en === null || Array.isArray(en)) {
      errors.push({ path: '$.entropy', message: 'Must be an object' });
    } else {
      const enObj = en as Record<string, unknown>;
      if ('threshold' in enObj && typeof enObj['threshold'] !== 'number') {
        errors.push({ path: '$.entropy.threshold', message: 'Must be a number (e.g. 3.5)' });
      }
      if ('minLength' in enObj && typeof enObj['minLength'] !== 'number') {
        errors.push({ path: '$.entropy.minLength', message: 'Must be a number (e.g. 12)' });
      }
    }
  }

  if ('quiet' in obj && typeof obj['quiet'] !== 'boolean') {
    errors.push({ path: '$.quiet', message: 'Must be a boolean (true or false)' });
  }

  if ('logFile' in obj && obj['logFile'] !== null && typeof obj['logFile'] !== 'string') {
    errors.push({ path: '$.logFile', message: 'Must be a string path or null' });
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export interface LoadConfigResult {
  config: EnvtrapConfig;
  errors: ConfigError[];
  loaded: boolean;
}

export function loadConfig(cwd: string): LoadConfigResult {
  const configPath = path.resolve(cwd, 'envtrap.json');

  if (!fs.existsSync(configPath)) {
    return { config: { ...DEFAULT_CONFIG, exclusions: { domains: [], paths: [] }, entropy: { threshold: 3.5, minLength: 12 }, channels: { ...DEFAULT_CONFIG.channels } }, errors: [], loaded: false };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (err) {
    return {
      config: { ...DEFAULT_CONFIG, exclusions: { domains: [], paths: [] }, entropy: { threshold: 3.5, minLength: 12 }, channels: { ...DEFAULT_CONFIG.channels } },
      errors: [{ path: '$', message: `Failed to parse JSON: ${(err as Error).message}` }],
      loaded: true,
    };
  }

  const errors = validateConfig(raw);
  const merged = deepMerge(DEFAULT_CONFIG, raw as Partial<EnvtrapConfig>);

  return { config: merged, errors, loaded: true };
}

function deepMerge(defaults: EnvtrapConfig, user: Partial<EnvtrapConfig>): EnvtrapConfig {
  if (typeof user !== 'object' || user === null) return defaults;

  const userAny = user as Record<string, unknown>;
  const userChannels = (userAny['channels'] && typeof userAny['channels'] === 'object' && !Array.isArray(userAny['channels']))
    ? userAny['channels'] as Partial<ChannelConfig>
    : {};
  const userExclusions = (userAny['exclusions'] && typeof userAny['exclusions'] === 'object' && !Array.isArray(userAny['exclusions']))
    ? userAny['exclusions'] as Partial<ExclusionsConfig>
    : {};
  const userEntropy = (userAny['entropy'] && typeof userAny['entropy'] === 'object' && !Array.isArray(userAny['entropy']))
    ? userAny['entropy'] as Partial<EntropyConfig>
    : {};

  return {
    channels: {
      stdout: (VALID_MODES.includes(userChannels.stdout as ChannelMode) ? userChannels.stdout : defaults.channels.stdout) as ChannelMode,
      stderr: (VALID_MODES.includes(userChannels.stderr as ChannelMode) ? userChannels.stderr : defaults.channels.stderr) as ChannelMode,
      network: (VALID_MODES.includes(userChannels.network as ChannelMode) ? userChannels.network : defaults.channels.network) as ChannelMode,
      child_process: (VALID_MODES.includes(userChannels.child_process as ChannelMode) ? userChannels.child_process : defaults.channels.child_process) as ChannelMode,
      dns: (VALID_MODES.includes(userChannels.dns as ChannelMode) ? userChannels.dns : defaults.channels.dns) as ChannelMode,
    },
    exclusions: {
      domains: Array.isArray(userExclusions.domains)
        ? (userExclusions.domains as unknown[]).filter((d): d is string => typeof d === 'string')
        : defaults.exclusions.domains,
      paths: Array.isArray(userExclusions.paths)
        ? (userExclusions.paths as unknown[]).filter((p): p is string => typeof p === 'string')
        : defaults.exclusions.paths,
    },
    entropy: {
      threshold: typeof userEntropy.threshold === 'number' ? userEntropy.threshold : defaults.entropy.threshold,
      minLength: typeof userEntropy.minLength === 'number' ? userEntropy.minLength : defaults.entropy.minLength,
    },
    quiet: typeof userAny['quiet'] === 'boolean' ? (userAny['quiet'] as boolean) : defaults.quiet,
    logFile: typeof userAny['logFile'] === 'string' ? (userAny['logFile'] as string) : defaults.logFile,
  };
}

// ---------------------------------------------------------------------------
// Utility: path exclusion check
// ---------------------------------------------------------------------------

export function isPathExcluded(filePath: string, patterns: string[]): boolean {
  if (patterns.length === 0) return false;
  const normalized = filePath.replace(/\\/g, '/');

  for (const pattern of patterns) {
    let p = pattern.replace(/\\/g, '/');
    if (!p.startsWith('/') && !p.startsWith('**')) {
      p = '**/' + p;
    }
    const parts = p.split('**');
    const regexParts = parts.map(part => {
      return part
        .replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&')
        .replace(/\*/g, '.*');
    });
    const regex = new RegExp('^' + regexParts.join('.*') + '$');
    if (regex.test(normalized)) {
      return true;
    }
  }

  return false;
}
