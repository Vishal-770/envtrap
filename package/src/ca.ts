// src/ca.ts
// In-memory X.509 Certificate Authority using node-forge.
//
// SECURITY CONTRACT:
//   - The Root CA *private key* NEVER leaves this module and NEVER touches disk.
//   - Only the Root CA *public certificate* (PEM) is written to os.tmpdir().
//   - All domain keypairs are also kept exclusively in RAM.

import forge from 'node-forge';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import type { CaMaterials, DomainCreds } from './types.js';

// ---------------------------------------------------------------------------
// Internal state — module-level closure ensures private key stays in RAM.
// ---------------------------------------------------------------------------

/** The Root CA keypair (private key stays here, never exported) */
let caKeys: forge.pki.KeyPair | null = null;
/** The Root CA X.509 certificate */
let caCert: forge.pki.Certificate | null = null;
/** Cache: hostname → { keyPem, certPem } to avoid expensive RSA re-generation */
const domainCertCache = new Map<string, DomainCreds>();

// ---------------------------------------------------------------------------
// Utility: Build an X.509 certificate attribute list
// ---------------------------------------------------------------------------

function makeAttrs(commonName: string): forge.pki.CertificateField[] {
  return [
    { name: 'commonName', value: commonName },
    { name: 'organizationName', value: 'envtrap Local CA' },
    { name: 'organizationalUnitName', value: 'envtrap v2.0' },
    { name: 'countryName', value: 'US' },
  ];
}

// ---------------------------------------------------------------------------
// Root CA Initialisation
// ---------------------------------------------------------------------------

/**
 * Generates a 2048-bit RSA Root CA in memory and writes only the public
 * certificate to a temp file so NODE_EXTRA_CA_CERTS can point at it.
 *
 * MUST be called once before any other export in this module.
 */
export function initCA(): CaMaterials {
  // Generate Root CA keypair — private key stays in `caKeys` closure
  caKeys = forge.pki.rsa.generateKeyPair({ bits: 2048 });

  // Build Root CA certificate
  caCert = forge.pki.createCertificate();
  caCert.publicKey = caKeys.publicKey;
  caCert.serialNumber = '01';
  caCert.validity.notBefore = new Date();
  caCert.validity.notAfter = new Date();
  caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10);

  const caAttrs = makeAttrs('envtrap Root CA');
  caCert.setSubject(caAttrs);
  caCert.setIssuer(caAttrs); // Self-signed

  caCert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
      critical: true,
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      cRLSign: true,
      critical: true,
    },
    {
      name: 'subjectKeyIdentifier',
    },
  ]);

  // Sign with SHA-256 using the CA's own private key
  // Cast required: @types/node-forge distinguishes pki.PrivateKey from rsa.PrivateKey
  caCert.sign(caKeys.privateKey as forge.pki.rsa.PrivateKey, forge.md.sha256.create());

  // Export public cert to PEM — this is the ONLY thing that touches disk
  const certPem = forge.pki.certificateToPem(caCert);
  const certPath = path.join(os.tmpdir(), 'envtrap-ca.crt');
  fs.writeFileSync(certPath, certPem, { encoding: 'utf-8', mode: 0o600 });

  return { certPem, certPath };
}

// ---------------------------------------------------------------------------
// Domain Certificate Issuance
// ---------------------------------------------------------------------------

/**
 * Generates (or retrieves from cache) a TLS certificate for a given hostname,
 * signed by our in-memory Root CA.
 *
 * RSA key generation is ~100-200ms; caching is critical for performance.
 *
 * @param hostname - e.g. "api.stripe.com" (port stripped by caller)
 * @throws If initCA() has not been called first
 */
export function generateDomainCert(hostname: string): DomainCreds {
  if (!caKeys || !caCert) {
    throw new Error('[envtrap/ca] initCA() must be called before generateDomainCert()');
  }

  // Strip port if present (e.g. "api.stripe.com:443" → "api.stripe.com")
  const host = hostname.split(':')[0];

  // Cache hit — return previously generated cert
  const cached = domainCertCache.get(host);
  if (cached) return cached;

  // Generate a fresh keypair for this domain
  const domainKeys = forge.pki.rsa.generateKeyPair({ bits: 2048 });

  // Build the domain certificate
  const domainCert = forge.pki.createCertificate();
  domainCert.publicKey = domainKeys.publicKey;

  // Unique serial per domain cert to avoid conflicts
  domainCert.serialNumber = Date.now().toString(16);

  domainCert.validity.notBefore = new Date();
  domainCert.validity.notAfter = new Date();
  domainCert.validity.notAfter.setFullYear(domainCert.validity.notBefore.getFullYear() + 1);

  // Subject is the domain we're impersonating
  const subjectAttrs = makeAttrs(host);
  domainCert.setSubject(subjectAttrs);

  // Issuer is our Root CA
  domainCert.setIssuer(caCert.subject.attributes);

  // SAN (subjectAltName) is required by modern TLS stacks — must match the host
  domainCert.setExtensions([
    {
      name: 'basicConstraints',
      cA: false,
    },
    {
      name: 'keyUsage',
      digitalSignature: true,
      keyEncipherment: true,
      critical: true,
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
    },
    {
      name: 'subjectAltName',
      altNames: [
        // DNS SAN for the exact hostname
        { type: 2, value: host },
        // Wildcard SAN for subdomains (belt-and-suspenders)
        { type: 2, value: `*.${host}` },
      ],
    },
  ]);

  // Sign with Root CA private key using SHA-256
  domainCert.sign(caKeys.privateKey as forge.pki.rsa.PrivateKey, forge.md.sha256.create());

  const creds: DomainCreds = {
    keyPem: forge.pki.privateKeyToPem(domainKeys.privateKey),
    certPem: forge.pki.certificateToPem(domainCert),
  };

  // Cache and return
  domainCertCache.set(host, creds);
  return creds;
}

/**
 * Returns the number of domain certs currently cached (useful for diagnostics).
 */
export function getCacheSize(): number {
  return domainCertCache.size;
}

/**
 * Checks if the current Node process is running with root/administrator privileges.
 */
function isRoot(): boolean {
  try {
    return process.getuid !== undefined && process.getuid() === 0;
  } catch {
    return false;
  }
}

/**
 * Temporarily installs the Root CA certificate in the OS system trust store.
 * Skipped gracefully if not running with root/sudo privileges to prevent hanging on password prompts.
 */
export function injectSystemCA(caCertPath: string, verbose = false): void {
  const platform = process.platform;
  const root = isRoot();
  if (!root && platform !== 'win32') {
    if (verbose) {
      console.error('  ℹ  [envtrap] Cross-language monitoring skipped (run with root/sudo to install CA in system trust store)');
    }
    return;
  }

  try {
    if (platform === 'darwin') {
      execSync(`security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "${caCertPath}"`, { stdio: 'ignore' });
      if (verbose) console.error('  ℹ  [envtrap] CA added to macOS Keychain');
    } else if (platform === 'win32') {
      execSync(`certutil -addstore -user root "${caCertPath}"`, { stdio: 'ignore' });
      if (verbose) console.error('  ℹ  [envtrap] CA added to Windows Trusted Root');
    } else if (platform === 'linux') {
      if (fs.existsSync('/usr/local/share/ca-certificates/')) {
        fs.copyFileSync(caCertPath, '/usr/local/share/ca-certificates/envtrap-ca.crt');
        execSync('update-ca-certificates', { stdio: 'ignore' });
        if (verbose) console.error('  ℹ  [envtrap] CA added to Debian/Ubuntu Trust Store');
      } else if (fs.existsSync('/etc/pki/ca-trust/source/anchors/')) {
        fs.copyFileSync(caCertPath, '/etc/pki/ca-trust/source/anchors/envtrap-ca.crt');
        execSync('update-ca-trust', { stdio: 'ignore' });
        if (verbose) console.error('  ℹ  [envtrap] CA added to RHEL/Fedora/CentOS Trust Store');
      }
    }
  } catch (err) {
    if (verbose) {
      console.error(`  ⚠  [envtrap] Failed to install CA to system trust store: ${(err as Error).message}`);
    }
  }
}

/**
 * Removes the Root CA certificate from the OS system trust store.
 */
export function removeSystemCA(caCertPath: string): void {
  if (!isRoot() && process.platform !== 'win32') return;

  try {
    const platform = process.platform;
    if (platform === 'darwin') {
      execSync(`security remove-trusted-cert -d "${caCertPath}"`, { stdio: 'ignore' });
    } else if (platform === 'win32') {
      execSync('certutil -delstore -user root "envtrap Root CA"', { stdio: 'ignore' });
    } else if (platform === 'linux') {
      if (fs.existsSync('/usr/local/share/ca-certificates/envtrap-ca.crt')) {
        fs.unlinkSync('/usr/local/share/ca-certificates/envtrap-ca.crt');
        execSync('update-ca-certificates --fresh', { stdio: 'ignore' });
      } else if (fs.existsSync('/etc/pki/ca-trust/source/anchors/envtrap-ca.crt')) {
        fs.unlinkSync('/etc/pki/ca-trust/source/anchors/envtrap-ca.crt');
        execSync('update-ca-trust', { stdio: 'ignore' });
      }
    }
  } catch {
    // Graceful fail-open on cleanup
  }
}
