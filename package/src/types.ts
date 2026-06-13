// src/types.ts
// Shared interfaces and types for envtrap v2.0

/**
 * Represents a secret loaded from environment variables or .env files.
 */
export interface Secret {
  /** Human-readable name / key (e.g. "STRIPE_SECRET_KEY") */
  name: string;
  /** The raw value of the secret */
  value: string;
  /** Origin of the secret: process.env or a .env file on disk */
  source: 'env' | 'file';
}

/**
 * A detected leak event — a secret found in a monitored channel.
 */
export interface LeakEvent {
  /** The secret that was detected */
  secret: Secret;
  /** Which monitoring channel caught the leak */
  channel: 'stdout' | 'stderr' | 'network' | 'child_process' | 'dns';
  /** A snippet of the content where the secret was found */
  context: string;
  /** Unix ms timestamp when the leak was detected */
  timestamp: number;
}

/**
 * Result of scanning a content chunk.
 */
export interface ScanResult {
  leaked: boolean;
  events: LeakEvent[];
}

/**
 * Generated domain TLS credentials (PEM strings).
 */
export interface DomainCreds {
  keyPem: string;
  certPem: string;
}

/**
 * Root CA materials kept in memory.
 */
export interface CaMaterials {
  /** PEM-encoded public root certificate (safe to write to disk) */
  certPem: string;
  /** Path on disk where the public cert was written */
  certPath: string;
}
