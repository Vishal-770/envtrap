// src/hooks.mjs
// Node.js ESM Customization Hook & CommonJS require() Monkeypatcher
// Injected via NODE_OPTIONS="--import"
//
// This hook intercepts:
//   1. node:child_process loading to monitor options.env secret leaks.
//   2. node:dns loading to block outbound DNS Tunneling secret exfiltrations.
//   3. stdout/stderr writes to pre-redact leaks if originating from excluded paths.
//
// Works for both ESM (import) and CJS (require).

import module from 'node:module';
import { isMainThread } from 'node:worker_threads';
import * as realChildProcess from 'node:child_process';
import * as realDns from 'node:dns';

// Helper to determine active channel modes
const configModes = (() => {
  try {
    return JSON.parse(process.env.__ENVTRAP_CONFIG_MODES__ || '{}');
  } catch {
    return {};
  }
})();

function getChannelMode(channel, defaultMode = 'warn') {
  return configModes[channel] || defaultMode;
}

// ---------------------------------------------------------------------------
// Path Exclusions Helper
// ---------------------------------------------------------------------------
const pathExclusions = (() => {
  try {
    return JSON.parse(process.env.__ENVTRAP_PATH_EXCLUSIONS__ || '[]');
  } catch {
    return [];
  }
})();

function isPathExcluded(filePath) {
  if (!filePath || pathExclusions.length === 0) return false;
  const normalized = filePath.replace(/\\/g, '/');
  for (const pattern of pathExclusions) {
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

function getCallerFile() {
  const err = new Error();
  const stack = err.stack;
  if (!stack) return null;
  const lines = stack.split('\n');
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const match = /\(([^)]+)\)/.exec(line) || /at\s+([^\s]+)/.exec(line);
    if (match) {
      let fileUrlOrPath = match[1];
      const parts = fileUrlOrPath.split(':');
      let filePath = fileUrlOrPath;
      if (parts.length >= 3) {
        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        if (/^\d+$/.test(last) && /^\d+$/.test(secondLast)) {
          filePath = parts.slice(0, -2).join(':');
        }
      } else if (parts.length === 2) {
        const last = parts[1];
        if (/^\d+$/.test(last)) {
          filePath = parts[0];
        }
      }
      
      if (filePath.startsWith('file://')) {
        try {
          filePath = new URL(filePath).pathname;
        } catch {
          // ignore
        }
      }
      
      if (!filePath || 
          filePath.includes('node:internal') || 
          filePath.includes('internal/') ||
          (!filePath.startsWith('/') && !filePath.startsWith('file://')) ||
          filePath.includes('hooks.mjs') || 
          filePath.includes('hooks.js') ||
          filePath.includes('node_modules/envtrap')
      ) {
        continue;
      }
      return filePath;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Entropy Helper
// ---------------------------------------------------------------------------
const entropyThreshold = parseFloat(process.env.__ENVTRAP_ENTROPY_THRESHOLD__ || '3.5');
const entropyMinLength = parseInt(process.env.__ENVTRAP_ENTROPY_MIN_LENGTH__ || '12', 10);

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
    if (label.length >= entropyMinLength) {
      const entropy = shannonEntropy(label);
      if (entropy >= entropyThreshold) {
        return true;
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Shared Interception Logic (CJS & ESM)
// ---------------------------------------------------------------------------

const secretsMap = (() => {
  try {
    return JSON.parse(process.env.__ENVTRAP_SECRETS_MAP__ || '{}');
  } catch {
    return {};
  }
})();

function reportChildLeak(envKey, envValue, command) {
  process.stderr.write(
    '[envtrap] Child process leak: secret "' + envKey + '" passed to: ' + command + '\n'
  );
}

function checkChildEnv(env, command) {
  if (!env || typeof env !== 'object') return;

  const channelMode = getChannelMode('child_process', 'warn');
  if (channelMode === 'off') return;

  const caller = getCallerFile();
  if (caller && isPathExcluded(caller)) return;

  for (const name in secretsMap) {
    const value = secretsMap[name];
    if (name in env && env[name] === value) {
      reportChildLeak(name, value, command);
      if (channelMode === 'block') {
        throw new Error('[envtrap] child_process block: env key "' + name + '" passed to child process');
      }
    }
  }
}

function reportDnsLeak(envKey, specifier) {
  process.stderr.write(
    '[envtrap] DNS leak: secret "' + envKey + '" found in lookup of: ' + specifier + '\n'
  );
}

function reportDnsWarning(specifier) {
  process.stderr.write(
    '[envtrap] DNS warning: high-entropy lookup detected: ' + specifier + '\n'
  );
}

function checkLookup(specifier) {
  if (typeof specifier !== 'string') return;

  const channelMode = getChannelMode('dns', 'block');
  if (channelMode === 'off') return;

  const caller = getCallerFile();
  if (caller && isPathExcluded(caller)) return;

  // 1. Check for secret match
  for (const name in secretsMap) {
    const value = secretsMap[name];
    if (value && value.length >= 8 && specifier.includes(value)) {
      reportDnsLeak(name, specifier);
      if (channelMode === 'block') {
        throw new Error('DNS resolution blocked by envtrap: potential secret leak detected in domain name');
      }
    }
  }

  // 2. Check for high-entropy (DNS Tunneling indication)
  if (checkHighEntropyDns(specifier)) {
    reportDnsWarning(specifier);
  }
}

function preRedact(chunk) {
  if (!chunk) return chunk;
  let str = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
  let modified = false;
  for (const name in secretsMap) {
    const value = secretsMap[name];
    if (value && str.includes(value)) {
      str = str.split(value).join('[REDACTED: PATH_EXCLUDED]');
      modified = true;
    }
  }
  if (modified) {
    return typeof chunk === 'string' ? str : Buffer.from(str, 'utf-8');
  }
  return chunk;
}

// ---------------------------------------------------------------------------
// CommonJS Monkeypatching
// ---------------------------------------------------------------------------

function wrapChildProcess(realCP) {
  const wrapped = { ...realCP };

  wrapped.spawn = function(command, args, options) {
    if (options && options.env) checkChildEnv(options.env, command);
    return realCP.spawn(command, args, options);
  };

  wrapped.exec = function(command, options, callback) {
    const opts = typeof options === 'object' && options !== null ? options : {};
    if (opts.env) checkChildEnv(opts.env, command);
    return realCP.exec(command, options, callback);
  };

  wrapped.execFile = function(file, args, options, callback) {
    let opts = {};
    if (typeof args === 'object' && !Array.isArray(args) && args !== null) {
      opts = args;
    } else if (typeof options === 'object' && options !== null) {
      opts = options;
    }
    if (opts.env) checkChildEnv(opts.env, file);
    return realCP.execFile(file, args, options, callback);
  };

  wrapped.fork = function(modulePath, args, options) {
    const opts = typeof args === 'object' && !Array.isArray(args) && args !== null ? args : (options || {});
    if (opts.env) checkChildEnv(opts.env, modulePath);
    return realCP.fork(modulePath, args, options);
  };

  wrapped.spawnSync = function(command, args, options) {
    if (options && options.env) checkChildEnv(options.env, command);
    return realCP.spawnSync(command, args, options);
  };

  wrapped.execSync = function(command, options) {
    if (options && options.env) checkChildEnv(options.env, command);
    return realCP.execSync(command, options);
  };

  wrapped.execFileSync = function(file, args, options) {
    if (options && options.env) checkChildEnv(options.env, file);
    return realCP.execFileSync(file, args, options);
  };

  Object.setPrototypeOf(wrapped, realCP);
  return wrapped;
}

function wrapDns(realDnsObj) {
  const wrapped = { ...realDnsObj };

  wrapped.lookup = function(hostname, options, callback) {
    checkLookup(hostname);
    if (typeof options === 'function') return realDnsObj.lookup(hostname, options);
    return realDnsObj.lookup(hostname, options, callback);
  };

  wrapped.resolve = function(hostname, rrtype, callback) {
    checkLookup(hostname);
    if (typeof rrtype === 'function') {
      return realDnsObj.resolve(hostname, rrtype);
    }
    return realDnsObj.resolve(hostname, rrtype, callback);
  };

  wrapped.resolve4 = function(hostname, options, callback) {
    checkLookup(hostname);
    if (typeof options === 'function') return realDnsObj.resolve4(hostname, options);
    return realDnsObj.resolve4(hostname, options, callback);
  };

  wrapped.resolve6 = function(hostname, options, callback) {
    checkLookup(hostname);
    if (typeof options === 'function') return realDnsObj.resolve6(hostname, options);
    return realDnsObj.resolve6(hostname, options, callback);
  };

  wrapped.resolveAny = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveAny(hostname, callback);
  };

  wrapped.resolveCname = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveCname(hostname, callback);
  };

  wrapped.resolveMx = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveMx(hostname, callback);
  };

  wrapped.resolveNaptr = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveNaptr(hostname, callback);
  };

  wrapped.resolveNs = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveNs(hostname, callback);
  };

  wrapped.resolvePtr = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolvePtr(hostname, callback);
  };

  wrapped.resolveSoa = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveSoa(hostname, callback);
  };

  wrapped.resolveSrv = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveSrv(hostname, callback);
  };

  wrapped.resolveTxt = function(hostname, callback) {
    checkLookup(hostname);
    return realDnsObj.resolveTxt(hostname, callback);
  };

  const _promises = realDnsObj.promises;
  wrapped.promises = {
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

  Object.setPrototypeOf(wrapped, realDnsObj);
  return wrapped;
}

if (isMainThread) {
  const Module = module.Module;
  const wrappedCP = wrapChildProcess(realChildProcess);
  const wrappedDns = wrapDns(realDns);

  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id) {
    if (id === 'child_process' || id === 'node:child_process') {
      return wrappedCP;
    }
    if (id === 'dns' || id === 'node:dns') {
      return wrappedDns;
    }
    return originalRequire.apply(this, arguments);
  };

  // Monkeypatch stdout/stderr writes for path exclusions
  const originalStdoutWrite = process.stdout.write;
  process.stdout.write = function (chunk, encoding, callback) {
    const caller = getCallerFile();
    if (caller && isPathExcluded(caller)) {
      const args = [...arguments];
      args[0] = preRedact(chunk);
      return originalStdoutWrite.apply(process.stdout, args);
    }
    return originalStdoutWrite.apply(process.stdout, arguments);
  };

  const originalStderrWrite = process.stderr.write;
  process.stderr.write = function (chunk, encoding, callback) {
    const caller = getCallerFile();
    if (caller && isPathExcluded(caller)) {
      const args = [...arguments];
      args[0] = preRedact(chunk);
      return originalStderrWrite.apply(process.stderr, args);
    }
    return originalStderrWrite.apply(process.stderr, arguments);
  };
}

if (isMainThread && typeof module.register === 'function') {
  module.register(import.meta.url);
}

const CHILD_PROCESS_URLS = new Set(['node:child_process', 'child_process']);
const DNS_URLS = new Set(['node:dns', 'dns']);

// ---------------------------------------------------------------------------
// resolve hook — redirects module imports to virtual namespaces
// ---------------------------------------------------------------------------
export async function resolve(specifier, context, nextResolve) {
  if (specifier.includes('config')) {
    console.error('[debug-resolve]', { specifier, parentURL: context.parentURL });
  }
  if (CHILD_PROCESS_URLS.has(specifier)) {
    if (context.parentURL && (context.parentURL.startsWith('envtrap:') || context.parentURL.endsWith('hooks.mjs') || context.parentURL.endsWith('hooks.js'))) {
      return {
        url: 'node:child_process',
        shortCircuit: true
      };
    }
    return {
      url: 'envtrap:child_process',
      shortCircuit: true
    };
  }

  if (DNS_URLS.has(specifier)) {
    if (context.parentURL && (context.parentURL.startsWith('envtrap:') || context.parentURL.endsWith('hooks.mjs') || context.parentURL.endsWith('hooks.js'))) {
      return {
        url: 'node:dns',
        shortCircuit: true
      };
    }
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

function getCallerFile() {
  const err = new Error();
  const stack = err.stack;
  if (!stack) return null;
  const lines = stack.split('\\n');
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const match = /\\(([^)]+)\\)/.exec(line) || /at\\s+([^\\s]+)/.exec(line);
    if (match) {
      let fileUrlOrPath = match[1];
      const parts = fileUrlOrPath.split(':');
      let filePath = fileUrlOrPath;
      if (parts.length >= 3) {
        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        if (/^\\d+$/.test(last) && /^\\d+$/.test(secondLast)) {
          filePath = parts.slice(0, -2).join(':');
        }
      } else if (parts.length === 2) {
        const last = parts[1];
        if (/^\\d+$/.test(last)) {
          filePath = parts[0];
        }
      }
      
      if (filePath.startsWith('file://')) {
        try {
          filePath = new URL(filePath).pathname;
        } catch {
          // ignore
        }
      }
      
      if (!filePath || 
          filePath.includes('node:internal') || 
          filePath.includes('internal/') ||
          (!filePath.startsWith('/') && !filePath.startsWith('file://')) ||
          filePath.includes('hooks.mjs') || 
          filePath.includes('hooks.js') ||
          filePath.includes('node_modules/envtrap')
      ) {
        continue;
      }
      return filePath;
    }
  }
  return null;
}

const pathExclusions = (() => {
  try {
    return JSON.parse(process.env.__ENVTRAP_PATH_EXCLUSIONS__ || '[]');
  } catch {
    return [];
  }
})();

function isPathExcluded(filePath) {
  if (!filePath || pathExclusions.length === 0) return false;
  const normalized = filePath.replace(/\\\\/g, '/');
  for (const pattern of pathExclusions) {
    let p = pattern.replace(/\\\\/g, '/');
    if (!p.startsWith('/') && !p.startsWith('**')) {
      p = '**/' + p;
    }
    const parts = p.split('**');
    const regexParts = parts.map(part => {
      return part
        .replace(/[-\/\\\\^$+?.()|[\\\]{}]/g, '\\\\$&')
        .replace(/\\*/g, '.*');
    });
    const regex = new RegExp('^' + regexParts.join('.*') + '$');
    if (regex.test(normalized)) {
      return true;
    }
  }
  return false;
}

function checkEnv(env, command) {
  if (!env || typeof env !== 'object') return;

  const channelMode = (() => {
    try {
      const config = JSON.parse(process.env.__ENVTRAP_CONFIG_MODES__ || '{}');
      return config.child_process || 'warn';
    } catch {
      return 'warn';
    }
  })();
  if (channelMode === 'off') return;

  const caller = getCallerFile();
  if (caller && isPathExcluded(caller)) return;

  for (const name in secretsMap) {
    const value = secretsMap[name];
    if (name in env && env[name] === value) {
      reportChildLeak(name, value, command);
      if (channelMode === 'block') {
        throw new Error('[envtrap] child_process block: env key "' + name + '" passed to child process');
      }
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

function getCallerFile() {
  const err = new Error();
  const stack = err.stack;
  if (!stack) return null;
  const lines = stack.split('\\n');
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const match = /\\(([^)]+)\\)/.exec(line) || /at\\s+([^\\s]+)/.exec(line);
    if (match) {
      let fileUrlOrPath = match[1];
      const parts = fileUrlOrPath.split(':');
      let filePath = fileUrlOrPath;
      if (parts.length >= 3) {
        const last = parts[parts.length - 1];
        const secondLast = parts[parts.length - 2];
        if (/^\\d+$/.test(last) && /^\\d+$/.test(secondLast)) {
          filePath = parts.slice(0, -2).join(':');
        }
      } else if (parts.length === 2) {
        const last = parts[1];
        if (/^\\d+$/.test(last)) {
          filePath = parts[0];
        }
      }
      
      if (filePath.startsWith('file://')) {
        try {
          filePath = new URL(filePath).pathname;
        } catch {
          // ignore
        }
      }
      
      if (!filePath || 
          filePath.includes('node:internal') || 
          filePath.includes('internal/') ||
          (!filePath.startsWith('/') && !filePath.startsWith('file://')) ||
          filePath.includes('hooks.mjs') || 
          filePath.includes('hooks.js') ||
          filePath.includes('node_modules/envtrap')
      ) {
        continue;
      }
      return filePath;
    }
  }
  return null;
}

const pathExclusions = (() => {
  try {
    return JSON.parse(process.env.__ENVTRAP_PATH_EXCLUSIONS__ || '[]');
  } catch {
    return [];
  }
})();

function isPathExcluded(filePath) {
  if (!filePath || pathExclusions.length === 0) return false;
  const normalized = filePath.replace(/\\\\/g, '/');
  for (const pattern of pathExclusions) {
    let p = pattern.replace(/\\\\/g, '/');
    if (!p.startsWith('/') && !p.startsWith('**')) {
      p = '**/' + p;
    }
    const parts = p.split('**');
    const regexParts = parts.map(part => {
      return part
        .replace(/[-\/\\\\^$+?.()|[\\\]{}]/g, '\\\\$&')
        .replace(/\\*/g, '.*');
    });
    const regex = new RegExp('^' + regexParts.join('.*') + '$');
    if (regex.test(normalized)) {
      return true;
    }
  }
  return false;
}

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
  const entropyThreshold = parseFloat(process.env.__ENVTRAP_ENTROPY_THRESHOLD__ || '3.5');
  const entropyMinLength = parseInt(process.env.__ENVTRAP_ENTROPY_MIN_LENGTH__ || '12', 10);
  const labels = specifier.split('.');
  for (const label of labels) {
    if (label.length >= entropyMinLength) {
      const entropy = shannonEntropy(label);
      if (entropy >= entropyThreshold) {
        return true;
      }
    }
  }
  return false;
}

function checkLookup(specifier) {
  if (typeof specifier !== 'string') return;

  const channelMode = (() => {
    try {
      const config = JSON.parse(process.env.__ENVTRAP_CONFIG_MODES__ || '{}');
      return config.dns || 'block';
    } catch {
      return 'block';
    }
  })();
  if (channelMode === 'off') return;

  const caller = getCallerFile();
  if (caller && isPathExcluded(caller)) return;

  // 1. Check for secret match
  for (const name in secretsMap) {
    const value = secretsMap[name];
    if (value && value.length >= 8 && specifier.includes(value)) {
      reportDnsLeak(name, specifier);
      if (channelMode === 'block') {
        throw new Error('DNS resolution blocked by envtrap: potential secret leak detected in domain name');
      }
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
