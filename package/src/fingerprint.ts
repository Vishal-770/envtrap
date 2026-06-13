import { createHash } from 'node:crypto';
import type { Secret } from './types.js';

/** Generates a SHA-256 hash of a string */
export function getSha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// ---------------------------------------------------------------------------
// Deterministic Regex Overrides
// These patterns bypass entropy/length thresholds — if matched, always flag.
// ---------------------------------------------------------------------------

interface RegexPattern {
  name: string;
  pattern: RegExp;
}

const DETERMINISTIC_PATTERNS: RegexPattern[] = [
  {
    name: 'Stripe Secret Key',
    pattern: /sk_(live|test)_[a-zA-Z0-9]{24,}/,
  },
  {
    name: 'AWS Access Key ID',
    pattern: /AKIA[0-9A-Z]{16}/,
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/,
  },
  {
    name: 'Generic Bearer Token',
    pattern: /Bearer\s+[a-zA-Z0-9\-._~+/]{20,}/,
  },
  {
    name: 'SendGrid API Key',
    pattern: /SG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}/,
  },
  {
    name: 'Slack Bot Token',
    pattern: /xoxb-[0-9]{11,13}-[0-9]{11,13}-[a-zA-Z0-9]{24}/,
  },
];

// ---------------------------------------------------------------------------
// Shannon Entropy
// Measures the randomness of a string. High entropy → likely a secret.
// Formula: H = -Σ (f/n) * log2(f/n)  where f = char frequency, n = length
// ---------------------------------------------------------------------------

/**
 * Computes the Shannon entropy of a string.
 * Returns a float in [0, log2(uniqueChars)].
 */
export function shannonEntropy(str: string): number {
  if (str.length === 0) return 0;

  const freq = new Map<string, number>();
  for (const ch of str) {
    freq.set(ch, (freq.get(ch) ?? 0) + 1);
  }

  let entropy = 0;
  const n = str.length;
  for (const count of freq.values()) {
    const p = count / n;
    entropy -= p * Math.log2(p);
  }

  return entropy;
}

// ---------------------------------------------------------------------------
// Primary Analysis Function
// ---------------------------------------------------------------------------

/**
 * Tests whether a string value looks like a secret.
 * Returns true if the value should be considered a secret candidate.
 */
export function looksLikeSecret(value: string, minLength = 12, minEntropy = 3.5): boolean {
  if (value.length < minLength) return false;

  // Deterministic regex always wins
  for (const { pattern } of DETERMINISTIC_PATTERNS) {
    if (pattern.test(value)) return true;
  }

  // Entropy gate
  return shannonEntropy(value) >= minEntropy;
}

/**
 * Searches a content string for any known secret values.
 *
 * @param content  - The raw text to scan (already clamped to ≤1MB by caller)
 * @param secrets  - The list of loaded secrets to search for
 * @returns        Array of secret names found in the content
 */
export function scanContent(content: string, secrets: Secret[], minLength = 12, minEntropy = 3.5): string[] {
  if (!content || content.length === 0) return [];

  const found: string[] = [];

  for (const secret of secrets) {
    const { name, value } = secret;

    // Skip trivially short / low-entropy values to avoid false positives
    if (!looksLikeSecret(value, minLength, minEntropy)) continue;

    if (content.includes(value)) {
      found.push(name);
    }
  }

  return found;
}

/**
 * Extracts a short context snippet around the first occurrence of a value.
 * Returns a string like: "...before[VALUE]after..."
 */
export function extractContext(content: string, value: string, windowSize = 40): string {
  const idx = content.indexOf(value);
  if (idx === -1) return '';

  const start = Math.max(0, idx - windowSize);
  const end = Math.min(content.length, idx + value.length + windowSize);
  const snippet = content.slice(start, end);

  // Mask the actual secret value in the context entirely using its SHA-256 hash prefix
  const hash = getSha256(value);
  const masked = snippet.replace(value, `[REDACTED: SHA256:${hash.slice(0, 8)}]`);
  return masked;
}

/**
 * Checks a string against all deterministic regex patterns.
 * Used by the MITM proxy when scanning payloads that may contain
 * secrets not in our loaded set (e.g., third-party tokens).
 *
 * @returns Array of { patternName, match } objects
 */
export function matchDeterministicPatterns(
  content: string,
): Array<{ patternName: string; match: string }> {
  const results: Array<{ patternName: string; match: string }> = [];

  for (const { name: patternName, pattern } of DETERMINISTIC_PATTERNS) {
    const match = pattern.exec(content);
    if (match) {
      results.push({ patternName, match: match[0] });
    }
  }

  return results;
}

export interface HttpRequestDetails {
  method: string;
  url: string;
  host: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * Parses a raw HTTP request string into a structured HttpRequestDetails object.
 */
export function parseHttpRequest(raw: string): HttpRequestDetails | null {
  try {
    const lines = raw.split('\r\n');
    if (lines.length < 2) return null;

    // Parse request line (e.g. "POST /v1/charges HTTP/1.1")
    const reqLine = lines[0].split(' ');
    if (reqLine.length < 2) return null;
    const method = reqLine[0];
    const url = reqLine[1];

    const headers: Record<string, string> = {};
    let host = '';
    let bodyIndex = -1;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '') {
        bodyIndex = i + 1;
        break;
      }
      const parts = lines[i].split(': ');
      if (parts.length >= 2) {
        const key = parts[0];
        const val = parts.slice(1).join(': ');
        headers[key] = val;
        if (key.toLowerCase() === 'host') {
          host = val;
        }
      }
    }

    const body = bodyIndex !== -1 && bodyIndex < lines.length
      ? lines.slice(bodyIndex).join('\r\n')
      : '';

    return { method, url, host, headers, body };
  } catch {
    return null;
  }
}

/**
 * Formats a detailed, secure audit log representation of an intercepted HTTP request containing a leak.
 */
export function formatNetworkContext(content: string, value: string): string {
  const parsed = parseHttpRequest(content);
  if (!parsed) {
    // Fallback to default substring context if it doesn't look like standard HTTP request
    return extractContext(content, value);
  }

  const hash = getSha256(value);
  const hashStr = `[REDACTED: SHA256:${hash.slice(0, 8)}]`;

  const auditHeaders: string[] = [];
  for (const [key, val] of Object.entries(parsed.headers)) {
    if (val.includes(value)) {
      auditHeaders.push(`    ${key}: ${val.replace(value, hashStr)}`);
    } else {
      // Redact standard credentials on general headers just in case
      if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'cookie') {
        auditHeaders.push(`    ${key}: [REDACTED VALUE]`);
      } else {
        auditHeaders.push(`    ${key}: ${val}`);
      }
    }
  }

  let bodySnippet = '';
  if (parsed.body) {
    if (parsed.body.includes(value)) {
      const idx = parsed.body.indexOf(value);
      const start = Math.max(0, idx - 20);
      const end = Math.min(parsed.body.length, idx + value.length + 20);
      bodySnippet = `\n  Body Context:\n    ...${parsed.body.slice(start, end).replace(value, hashStr)}...`;
    } else {
      bodySnippet = '\n  Body Context: (Present, no secret found in body)';
    }
  }

  return `Outbound HTTPS Request Audited:\n` +
         `  Destination Host: ${parsed.host}\n` +
         `  Request Line:     ${parsed.method} ${parsed.url}\n` +
         `  Headers:\n${auditHeaders.join('\n')}` +
         bodySnippet;
}
