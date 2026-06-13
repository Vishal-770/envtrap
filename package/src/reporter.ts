// src/reporter.ts
// Terminal UI formatter using chalk@4.1.2 (CJS-compatible).
// Formats leak alerts and end-of-run summaries with rich ANSI colors.

import chalk from 'chalk';
import { getSha256 } from './fingerprint.js';
import type { LeakEvent } from './types.js';

// ---------------------------------------------------------------------------
// Channel metadata — icon + color for each interception channel
// ---------------------------------------------------------------------------

const CHANNEL_META: Record<
  LeakEvent['channel'],
  { icon: string; label: string; color: chalk.Chalk }
> = {
  stdout: { icon: '📤', label: 'STDOUT', color: chalk.yellow },
  stderr: { icon: '🔴', label: 'STDERR', color: chalk.red },
  network: { icon: '🌐', label: 'NETWORK', color: chalk.magenta },
  child_process: { icon: '🔀', label: 'CHILD PROC', color: chalk.cyan },
  dns: { icon: '📡', label: 'DNS', color: chalk.blue },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Masks the secret value entirely by printing its SHA-256 hash prefix to prevent AI tools from reading it */
function maskValue(value: string): string {
  const hash = getSha256(value);
  return `[SHA256:${hash.slice(0, 12)}...]`;
}

/** Renders a horizontal divider */
function divider(char = '─', width = 60): string {
  return chalk.gray(char.repeat(width));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Prints a styled header banner when envtrap starts.
 */
export function printBanner(command: string): void {
  console.error('');
  console.error(chalk.bgRed.white.bold(' ⚠  envtrap v2.0  '));
  console.error(chalk.gray(`   Monitoring: ${chalk.white(command)}`));
  console.error(
    chalk.gray(
      '   Channels: stdout/stderr · HTTPS MITM · child_process · ESM hooks',
    ),
  );
  console.error(divider());
  console.error('');
}

/**
 * Prints a single leak event alert to stderr.
 * Uses stderr so that stdout pass-through remains clean.
 */
export function flag(event: LeakEvent): void {
  const meta = CHANNEL_META[event.channel];
  const ts = new Date(event.timestamp).toISOString();

  console.error('');
  console.error(
    chalk.bgRed.white.bold(` ${meta.icon} SECRET LEAK DETECTED `) +
      '  ' +
      chalk.gray(ts),
  );
  console.error(divider('─'));
  console.error(
    `  ${chalk.gray('Secret:')}  ${meta.color.bold(event.secret.name)}  ${chalk.gray(`(source: ${event.secret.source})`)}`,
  );
  console.error(
    `  ${chalk.gray('Value:')}   ${chalk.red(maskValue(event.secret.value))}`,
  );
  console.error(
    `  ${chalk.gray('Channel:')} ${meta.color(`${meta.icon}  ${meta.label}`)}`,
  );
  if (event.context) {
    console.error(`  ${chalk.gray('Context:')}`);
    if (event.channel === 'network') {
      const lines = event.context.split('\n');
      for (const line of lines) {
        console.error(`    ${line}`);
      }
    } else {
      console.error(
        `    ${chalk.bgGray.white(` ${event.context.slice(0, 120)} `)}`,
      );
    }
  }
  console.error(divider('─'));
  console.error('');
}

/**
 * Prints a summary report after the child process exits.
 */
export function summary(events: LeakEvent[]): void {
  console.error('');
  console.error(divider('═'));
  console.error(chalk.bold.white('  envtrap — Run Summary'));
  console.error(divider('─'));

  if (events.length === 0) {
    console.error(
      chalk.green('  ✅  No secret leaks detected. All clear.'),
    );
  } else {
    console.error(
      chalk.red.bold(`  🚨  ${events.length} leak event(s) detected!`),
    );
    console.error('');

    // Group by channel
    const byChannel = new Map<LeakEvent['channel'], LeakEvent[]>();
    for (const ev of events) {
      const arr = byChannel.get(ev.channel) ?? [];
      arr.push(ev);
      byChannel.set(ev.channel, arr);
    }

    for (const [channel, channelEvents] of byChannel) {
      const meta = CHANNEL_META[channel];
      console.error(
        `  ${meta.icon}  ${meta.color.bold(meta.label)}: ${channelEvents.length} leak(s)`,
      );
      // Unique secret names for this channel
      const uniqueNames = [...new Set(channelEvents.map((e) => e.secret.name))];
      for (const name of uniqueNames) {
        console.error(`       → ${chalk.yellow(name)}`);
      }
    }
  }

  console.error(divider('═'));
  console.error('');
}

/**
 * Prints a non-fatal warning (e.g. proxy upstream failure, scan skip).
 */
export function warn(message: string): void {
  console.error(chalk.yellow(`  ⚠  [envtrap] ${message}`));
}

/**
 * Prints a debug/info line (suppressed in non-verbose mode by caller).
 */
export function info(message: string): void {
  console.error(chalk.gray(`  ℹ  [envtrap] ${message}`));
}
