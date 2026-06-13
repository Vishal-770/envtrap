// src/hooks.mjs
// Node.js ESM Customization Hook — injected via NODE_OPTIONS="--import"
//
// This hook intercepts:
//   1. node:child_process loading to monitor options.env secret leaks.
//   2. node:dns loading to block outbound DNS Tunneling secret exfiltrations.
//
// IMPORTANT: This file MUST be .mjs (native ESM). TypeScript compilation
// does not touch this file — it is copied to dist/ as-is.

import module from 'node:module';
import { isMainThread } from 'node:worker_threads';

if (isMainThread && typeof module.register === 'function') {
  module.register(import.meta.url);
}

const CHILD_PROCESS_URLS = new Set(['node:child_process', 'child_process']);
const DNS_URLS = new Set(['node:dns', 'dns']);

// ---------------------------------------------------------------------------
// resolve hook — redirects module imports to virtual namespaces
// ---------------------------------------------------------------------------
export async function resolve(specifier, context, nextResolve) {
  if (CHILD_PROCESS_URLS.has(specifier)) {
    if (context.parentURL && context.parentURL.startsWith('envtrap:')) {
      // Allow virtual module to import the real built-in
      return {
        url: 'node:child_process',
        shortCircuit: true
      };
    }
    // Redirect app imports to our virtual child_process module
    return {
      url: 'envtrap:child_process',
      shortCircuit: true
    };
  }

  if (DNS_URLS.has(specifier)) {
    if (context.parentURL && context.parentURL.startsWith('envtrap:')) {
      // Allow virtual dns module to import real dns built-in
      return {
        url: 'node:dns',
        shortCircuit: true
      };
    }
    // Redirect app imports to our virtual dns resolver
    return {
      url: 'envtrap:dns',
      shortCircuit: true
    };
  }

  return nextResolve(specifier, context);
}

// ---------------------------------------------------------------------------
// load hook — serves the virtual modules code
// ---------------------------------------------------------------------------
export async function load(url, context, nextLoad) {
  if (url === 'envtrap:child_process') {
    const virtualChildProcessSource = `
import {
  spawn as _spawn,
  exec as _exec,
  execFile as _execFile,
  fork as _fork,
  spawnSync as _spawnSync,
  execSync as _execSync,
  execFileSync as _execFileSync,
  ChildProcess,
  _forkChild
} from 'node:child_process';

export { ChildProcess, _forkChild } from 'node:child_process';

function reportChildLeak(envKey, envValue, command) {
  process.stderr.write(
    '[envtrap] Child process leak: secret "' + envKey + '" passed to: ' + command + '\\n'
  );
}

const secretsMap = (() => {
  try {
    return JSON.parse(process.env.__ENVTRAP_SECRETS_MAP__ || '{}');
  } catch {
    return {};
  }
})();

function checkEnv(env, command) {
  if (!env || typeof env !== 'object') return;

  for (const name in secretsMap) {
    const value = secretsMap[name];
    if (name in env && env[name] === value) {
      reportChildLeak(name, value, command);
    }
  }
}

export function spawn(command, args, options) {
  if (options && options.env) checkEnv(options.env, command);
  return _spawn(command, args ?? [], options ?? {});
}

export function exec(command, options, callback) {
  if (options && typeof options === 'object' && options.env) {
    checkEnv(options.env, command);
  }
  if (typeof options === 'function') {
    return _exec(command, options);
  }
  if (typeof callback === 'function') {
    return _exec(command, options, callback);
  }
  return _exec(command, options);
}

export function execFile(file, args, options, callback) {
  if (options && typeof options === 'object' && options.env) {
    checkEnv(options.env, file);
  }
  if (typeof args === 'function') {
    return _execFile(file, args);
  }
  if (typeof options === 'function') {
    return _execFile(file, args, options);
  }
  if (typeof callback === 'function') {
    return _execFile(file, args, options, callback);
  }
  return _execFile(file, args, options);
}

export function fork(modulePath, args, options) {
  if (options && options.env) checkEnv(options.env, modulePath);
  return _fork(modulePath, args ?? [], options ?? {});
}

export function spawnSync(command, args, options) {
  if (options && options.env) checkEnv(options.env, command);
  return _spawnSync(command, args ?? [], options ?? {});
}

export function execSync(command, options) {
  if (options && options.env) checkEnv(options.env, command);
  return _execSync(command, options ?? {});
}

export function execFileSync(file, args, options) {
  if (options && options.env) checkEnv(options.env, file);
  return _execFileSync(file, args ?? [], options ?? {});
}

const defaultExport = {
  spawn,
  exec,
  execFile,
  fork,
  spawnSync,
  execSync,
  execFileSync,
  ChildProcess,
  _forkChild
};
export default defaultExport;
`;

    return {
      format: 'module',
      shortCircuit: true,
      source: virtualChildProcessSource,
    };
  }

  if (url === 'envtrap:dns') {
    const virtualDnsSource = `
import * as _dns from 'node:dns';

export * from 'node:dns';

function reportDnsLeak(envKey, specifier) {
  process.stderr.write(
    '[envtrap] DNS leak: secret "' + envKey + '" found in lookup of: ' + specifier + '\\n'
  );
}

function reportDnsWarning(specifier) {
  process.stderr.write(
    '[envtrap] DNS warning: high-entropy lookup detected: ' + specifier + '\\n'
  );
}

const secretsMap = (() => {
  try {
    return JSON.parse(process.env.__ENVTRAP_SECRETS_MAP__ || '{}');
  } catch {
    return {};
  }
})();

function shannonEntropy(str) {
  if (!str) return 0;
  const freq = {};
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    freq[ch] = (freq[ch] || 0) + 1;
  }
  let entropy = 0;
  const n = str.length;
  for (const ch in freq) {
    const p = freq[ch] / n;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function checkHighEntropyDns(specifier) {
  if (typeof specifier !== 'string') return false;
  const labels = specifier.split('.');
  for (const label of labels) {
    if (label.length >= 12) {
      const entropy = shannonEntropy(label);
      if (entropy >= 3.5) {
        return true;
      }
    }
  }
  return false;
}

function checkLookup(specifier) {
  if (typeof specifier !== 'string') return;

  // 1. Check for secret match
  for (const name in secretsMap) {
    const value = secretsMap[name];
    if (value && value.length >= 8 && specifier.includes(value)) {
      reportDnsLeak(name, specifier);
      throw new Error('DNS resolution blocked by envtrap: potential secret leak detected in domain name');
    }
  }

  // 2. Check for high-entropy (DNS Tunneling indication)
  if (checkHighEntropyDns(specifier)) {
    reportDnsWarning(specifier);
  }
}

export function lookup(hostname, options, callback) {
  checkLookup(hostname);
  if (typeof options === 'function') return _dns.lookup(hostname, options);
  return _dns.lookup(hostname, options, callback);
}

export function lookupService(address, port, callback) {
  return _dns.lookupService(address, port, callback);
}

export function resolve(hostname, rrtype, callback) {
  checkLookup(hostname);
  if (typeof rrtype === 'function') {
    return _dns.resolve(hostname, rrtype);
  }
  return _dns.resolve(hostname, rrtype, callback);
}

export function resolve4(hostname, options, callback) {
  checkLookup(hostname);
  if (typeof options === 'function') return _dns.resolve4(hostname, options);
  return _dns.resolve4(hostname, options, callback);
}

export function resolve6(hostname, options, callback) {
  checkLookup(hostname);
  if (typeof options === 'function') return _dns.resolve6(hostname, options);
  return _dns.resolve6(hostname, options, callback);
}

export function resolveAny(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveAny(hostname, callback);
}

export function resolveCname(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveCname(hostname, callback);
}

export function resolveMx(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveMx(hostname, callback);
}

export function resolveNaptr(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveNaptr(hostname, callback);
}

export function resolveNs(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveNs(hostname, callback);
}

export function resolvePtr(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolvePtr(hostname, callback);
}

export function resolveSoa(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveSoa(hostname, callback);
}

export function resolveSrv(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveSrv(hostname, callback);
}

export function resolveTxt(hostname, callback) {
  checkLookup(hostname);
  return _dns.resolveTxt(hostname, callback);
}

const _promises = _dns.promises;

export const promises = {
  ..._promises,
  lookup: async (hostname, options) => {
    checkLookup(hostname);
    return _promises.lookup(hostname, options);
  },
  resolve: async (hostname, rrtype) => {
    checkLookup(hostname);
    return _promises.resolve(hostname, rrtype);
  },
  resolve4: async (hostname, options) => {
    checkLookup(hostname);
    return _promises.resolve4(hostname, options);
  },
  resolve6: async (hostname, options) => {
    checkLookup(hostname);
    return _promises.resolve6(hostname, options);
  },
  resolveAny: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveAny(hostname);
  },
  resolveCname: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveCname(hostname);
  },
  resolveMx: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveMx(hostname);
  },
  resolveNaptr: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveNaptr(hostname);
  },
  resolveNs: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveNs(hostname);
  },
  resolvePtr: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolvePtr(hostname);
  },
  resolveSoa: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveSoa(hostname);
  },
  resolveSrv: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveSrv(hostname);
  },
  resolveTxt: async (hostname) => {
    checkLookup(hostname);
    return _promises.resolveTxt(hostname);
  }
};

const defaultExport = {
  ..._dns,
  promises,
  lookup,
  resolve,
  resolve4,
  resolve6,
  resolveAny,
  resolveCname,
  resolveMx,
  resolveNaptr,
  resolveNs,
  resolvePtr,
  resolveSoa,
  resolveSrv,
  resolveTxt
};
export default defaultExport;
`;

    return {
      format: 'module',
      shortCircuit: true,
      source: virtualDnsSource,
    };
  }

  return nextLoad(url, context);
}
