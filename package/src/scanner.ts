// src/scanner.ts
// Stateful scanning engine: deduplication, backpressure, and alert routing.
//
// Owns the canonical list of loaded secrets and the TTL dedup cache.
// All other modules call into scanner to report potential leaks.

import { scanContent, extractContext, formatNetworkContext } from './fingerprint.js';
import { flag } from './reporter.js';
import type { LeakEvent, Secret } from './types.js';
import { EnvtrapConfig, DEFAULT_CONFIG } from './config.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 1 MB — max bytes to scan in a single content chunk (V8 event-loop safety) */
const MAX_SCAN_BYTES = 1_048_576;

/** TTL in ms — duplicate events within this window are silently dropped */
const DEDUP_TTL_MS = 1_500;

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

/** The canonical list of secrets loaded at startup */
let loadedSecrets: Secret[] = [];

/** Active configuration */
let currentConfig: EnvtrapConfig = DEFAULT_CONFIG;

/** TTL deduplication cache: "${secretName}:${channel}" → last-seen timestamp */
const dedupCache = new Map<string, number>();

/** All leak events emitted in this run (for the final summary) */
const allEvents: LeakEvent[] = [];

// ---------------------------------------------------------------------------
// State setters
// ---------------------------------------------------------------------------

/**
 * Initialises (or replaces) the loaded secrets list.
 * Called once during startup after env + .env have been parsed.
 */
export function setSecrets(secrets: Secret[]): void {
  loadedSecrets = secrets;
}

/**
 * Configures the scanner with user settings.
 */
export function setConfig(config: EnvtrapConfig): void {
  currentConfig = config;
}

/**
 * Returns all leak events collected during the run.
 */
export function getAllEvents(): LeakEvent[] {
  return [...allEvents];
}

// ---------------------------------------------------------------------------
// Core scan function
// ---------------------------------------------------------------------------

/**
 * Scans a content string for loaded secrets and emits LeakEvents.
 *
 * - Applies 1MB backpressure clamp (V8 memory safety)
 * - Applies TTL deduplication to suppress repeated events
 * - Routes confirmed leaks to reporter.flag()
 *
 * @param rawContent - The raw string to scan
 * @param channel    - Which monitoring channel is calling
 * @returns          true if a leak was detected and the channel is in 'block' mode
 */
export function scan(
  rawContent: string,
  channel: LeakEvent['channel'],
): boolean {
  if (!rawContent || loadedSecrets.length === 0) return false;

  const mode = currentConfig.channels[channel] || 'warn';
  if (mode === 'off') return false;

  // Backpressure: clamp to 1MB — secrets almost always appear in the first
  // few KB (headers, log prefixes). Scanning 50MB blocks the event loop.
  const content =
    rawContent.length > MAX_SCAN_BYTES
      ? rawContent.slice(0, MAX_SCAN_BYTES)
      : rawContent;

  // Fingerprint scan
  const foundNames = scanContent(
    content,
    loadedSecrets,
    currentConfig.entropy.minLength,
    currentConfig.entropy.threshold
  );
  if (foundNames.length === 0) return false;

  const now = Date.now();
  let blocked = false;

  for (const name of foundNames) {
    const dedupKey = `${name}:${channel}`;
    const lastSeen = dedupCache.get(dedupKey);

    // TTL dedup: drop if we already fired this event in the last 1.5 seconds
    if (lastSeen !== undefined && now - lastSeen < DEDUP_TTL_MS) {
      continue;
    }

    // Update the TTL cache
    dedupCache.set(dedupKey, now);

    // Look up the full secret object
    const secret = loadedSecrets.find((s) => s.name === name);
    if (!secret) continue;

    // Build context snippet (format network leaks with full audited HTTP headers)
    const context =
      channel === 'network'
        ? formatNetworkContext(content, secret.value)
        : extractContext(content, secret.value);

    const event: LeakEvent = {
      secret,
      channel,
      context,
      timestamp: now,
    };

    // Store for summary
    allEvents.push(event);

    // Fire the alert
    flag(event);

    if (mode === 'block') {
      blocked = true;
    }
  }

  return blocked;
}

// ---------------------------------------------------------------------------
// Child-process environment check
// ---------------------------------------------------------------------------

/**
 * Checks an environment object (from spawn/exec options.env) for secrets.
 * Called from the ESM hook's virtual module injection.
 *
 * @param env - The environment object passed to spawn/exec
 * @returns   true if blocked
 */
export function checkChildEnv(env: Record<string, string | undefined>): boolean {
  if (!env || loadedSecrets.length === 0) return false;

  const mode = currentConfig.channels.child_process || 'warn';
  if (mode === 'off') return false;

  const now = Date.now();
  let blocked = false;

  for (const secret of loadedSecrets) {
    const envValue = env[secret.name];

    // The child is inheriting the secret by name AND value
    if (envValue !== undefined && envValue === secret.value) {
      const dedupKey = `${secret.name}:child_process`;
      const lastSeen = dedupCache.get(dedupKey);

      if (lastSeen !== undefined && now - lastSeen < DEDUP_TTL_MS) {
        continue;
      }

      dedupCache.set(dedupKey, now);

      const event: LeakEvent = {
        secret,
        channel: 'child_process',
        context: `env key "${secret.name}" passed to child process`,
        timestamp: now,
      };

      allEvents.push(event);
      flag(event);

      if (mode === 'block') {
        blocked = true;
      }
    }
  }

  return blocked;
}
