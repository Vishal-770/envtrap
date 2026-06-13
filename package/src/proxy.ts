// src/proxy.ts
// Local MITM TLS interceptor.
//
// Architecture:
//   Child app ──CONNECT──► HTTP server (127.0.0.1:N)
//                                │
//                                ▼  SNICallback issues fake domain cert
//                          in-memory tls.Server
//                                │
//               ┌────────────────┴──────────────────┐
//               │  Decrypted plaintext HTTP payload  │
//               └────────────────┬──────────────────┘
//                                │
//                    scanner.scan(payload, 'network')
//                                │
//                          https.request ──► real upstream

import * as http from 'http';
import * as https from 'https';
import * as net from 'net';
import * as tls from 'tls';
import { generateDomainCert } from './ca.js';
import { scan } from './scanner.js';
import { warn, info } from './reporter.js';
import { EnvtrapConfig } from './config.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max payload bytes to buffer from an intercepted TLS connection */
const MAX_BUFFER_BYTES = 1_048_576; // 1 MB

// ---------------------------------------------------------------------------
// Proxy Server Internals
// ---------------------------------------------------------------------------

/**
 * Starts the MITM HTTP proxy server on 127.0.0.1 at an OS-assigned port.
 *
 * @returns  A promise resolving to the bound port number
 */
export function startProxy(verbose = false, config: EnvtrapConfig): Promise<number> {
  const allowedDomains = new Set(config.exclusions.domains);
  const mode = config.channels.network || 'block';

  return new Promise((resolve, reject) => {
    const server = http.createServer();

    // Plain HTTP: forward unencrypted requests
    server.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => {
      const targetUrl = req.url ?? '/';
      const hostHeader = req.headers.host ?? '';
      const hostname = hostHeader.split(':')[0];
      const isAllowed = allowedDomains.has(hostname);

      if (verbose) info(`HTTP intercept: ${req.method} ${targetUrl} (allowed: ${isAllowed})`);

      // Collect body for scanning
      const bodyChunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => {
        bodyChunks.push(chunk);
      });

      req.on('end', () => {
        let isBlocked = false;
        if (!isAllowed && mode !== 'off') {
          const body = Buffer.concat(bodyChunks).toString('utf-8');
          if (body) {
            isBlocked = scan(body, 'network') || isBlocked;
          }

          // Also scan headers
          const headerStr = JSON.stringify(req.headers);
          isBlocked = scan(headerStr, 'network') || isBlocked;
          isBlocked = scan(targetUrl, 'network') || isBlocked;
        }

        if (isBlocked) {
          if (verbose) warn(`HTTP request blocked due to secret leak`);
          res.writeHead(403, { 'Content-Type': 'text/plain' });
          res.end('Blocked by envtrap');
          return;
        }

        // Forward request if not blocked
        const options: https.RequestOptions = {
          host: hostHeader,
          path: req.url,
          method: req.method,
          headers: req.headers,
        };

        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
          proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
          warn(`HTTP upstream error: ${err.message}`);
          res.writeHead(502);
          res.end('Bad Gateway');
        });

        const bodyBuf = Buffer.concat(bodyChunks);
        proxyReq.write(bodyBuf);
        proxyReq.end();
      });
    });

    // HTTPS CONNECT: the core MITM interception path
    server.on('connect', (req: http.IncomingMessage, clientSocket: net.Socket, head: Buffer) => {
      const targetHost = req.url ?? '';
      const [hostname, portStr] = targetHost.split(':');
      const upstreamPort = parseInt(portStr ?? '443', 10);

      if (verbose) info(`CONNECT intercept: ${targetHost}`);

      handleConnect(hostname, upstreamPort, clientSocket, head, verbose, config).catch((err: Error) => {
        warn(`CONNECT handler error for ${targetHost}: ${err.message}`);
        safeDestroySocket(clientSocket);
      });
    });

    server.on('error', reject);

    // Bind to 127.0.0.1 only — never expose to network
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('[envtrap/proxy] Failed to get bound port'));
        return;
      }
      resolve(addr.port);
    });
  });
}

// ---------------------------------------------------------------------------
// CONNECT Handler
// ---------------------------------------------------------------------------

async function handleConnect(
  hostname: string,
  upstreamPort: number,
  clientSocket: net.Socket,
  head: Buffer,
  verbose: boolean,
  config: EnvtrapConfig,
): Promise<void> {
  // Step 1: generate (or retrieve cached) domain cert for the target
  let creds: { keyPem: string; certPem: string };
  try {
    creds = generateDomainCert(hostname);
  } catch (err) {
    warn(`Cert generation failed for ${hostname}: ${(err as Error).message}`);
    clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    safeDestroySocket(clientSocket);
    return;
  }

  // Step 2: Tell the client TLS is ready (standard CONNECT protocol)
  clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');

  // Step 3: Boot an in-memory TLS server to impersonate the target.
  const tlsServer = tls.createServer({
    SNICallback: (_serverName: string, cb: (err: Error | null, ctx?: tls.SecureContext) => void) => {
      const ctx = tls.createSecureContext({
        key: creds.keyPem,
        cert: creds.certPem,
      });
      cb(null, ctx);
    },
  });

  // Step 4: When the TLS server gets a decrypted connection, buffer the payload
  tlsServer.on('secureConnection', (tlsSocket: tls.TLSSocket) => {
    interceptTlsSocket(tlsSocket, hostname, upstreamPort, verbose, config);
  });

  // Step 5: Pipe the raw client TCP socket into the fake TLS server.
  const duplexSocket = tlsServer.emit('connection', clientSocket);
  if (!duplexSocket && head.length > 0) {
    clientSocket.unshift(head);
  }

  // Feed the initial HEAD bytes into the TLS server if present
  if (head.length > 0) {
    clientSocket.emit('data', head);
  }
}

// ---------------------------------------------------------------------------
// TLS Socket Interception
// ---------------------------------------------------------------------------

function interceptTlsSocket(
  tlsSocket: tls.TLSSocket,
  hostname: string,
  upstreamPort: number,
  verbose: boolean,
  config: EnvtrapConfig,
): void {
  const allowedDomains = new Set(config.exclusions.domains);
  const isAllowed = allowedDomains.has(hostname);
  const mode = config.channels.network || 'block';

  const requestChunks: Buffer[] = [];
  let totalBytes = 0;
  let upstreamSocket: tls.TLSSocket | null = null;

  tlsSocket.on('data', (chunk: Buffer) => {
    // Buffer chunks up to 1MB for scanning
    if (totalBytes < MAX_BUFFER_BYTES) {
      requestChunks.push(chunk);
      totalBytes += chunk.length;

      // Scan cumulative request payload immediately (unless allowed or off)
      if (!isAllowed && mode !== 'off') {
        const payload = Buffer.concat(requestChunks).toString('utf-8');
        const isBlocked = scan(payload, 'network');
        if (isBlocked) {
          if (verbose) warn(`Network leak blocked: closing connection to ${hostname}`);
          safeDestroySocket(tlsSocket);
          safeDestroySocket(upstreamSocket);
          return;
        }
      }
    }

    // Lazily establish the upstream connection on first data
    if (!upstreamSocket) {
      upstreamSocket = connectUpstream(hostname, upstreamPort, tlsSocket, verbose, config, isAllowed);
    }

    if (upstreamSocket && !upstreamSocket.destroyed) {
      upstreamSocket.write(chunk);
    }
  });

  tlsSocket.on('end', () => {
    // Scan the buffered request payload (unless allowed or off)
    if (!isAllowed && mode !== 'off' && requestChunks.length > 0) {
      const payload = Buffer.concat(requestChunks).toString('utf-8');
      scan(payload, 'network');
    }
    safeDestroySocket(upstreamSocket);
  });

  tlsSocket.on('error', (err) => {
    if (verbose) warn(`TLS client socket error on ${hostname}: ${err.message}`);
    safeDestroySocket(upstreamSocket);
  });
}

// ---------------------------------------------------------------------------
// Upstream Connection
// ---------------------------------------------------------------------------

function connectUpstream(
  hostname: string,
  port: number,
  downstreamSocket: tls.TLSSocket,
  verbose: boolean,
  config: EnvtrapConfig,
  isAllowed: boolean,
): tls.TLSSocket {
  const mode = config.channels.network || 'block';
  const rejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';

  const upstream = tls.connect(
    {
      host: hostname,
      port,
      servername: hostname,
      rejectUnauthorized,
    },
    () => {
      if (verbose) info(`Upstream TLS connected: ${hostname}:${port}`);
    },
  );

  // Pipe upstream response back downstream
  upstream.on('data', (chunk: Buffer) => {
    // Scan the response too (unless allowed or off)
    if (!isAllowed && mode !== 'off') {
      const responseStr = chunk.toString('utf-8');
      const isBlocked = scan(responseStr, 'network');
      if (isBlocked) {
        safeDestroySocket(downstreamSocket);
        safeDestroySocket(upstream);
        return;
      }
    }

    if (!downstreamSocket.destroyed) {
      downstreamSocket.write(chunk);
    }
  });

  upstream.on('end', () => {
    safeDestroySocket(downstreamSocket);
  });

  upstream.on('error', (err) => {
    warn(`Upstream error for ${hostname}: ${err.message}`);
    // Fail-open: send 502 and clean up
    if (!downstreamSocket.destroyed) {
      try {
        downstreamSocket.write(
          'HTTP/1.1 502 Bad Gateway\r\nContent-Length: 11\r\n\r\nBad Gateway',
        );
      } catch {
        // Ignore write error during cleanup
      }
      safeDestroySocket(downstreamSocket);
    }
    safeDestroySocket(upstream);
  });

  return upstream;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function safeDestroySocket(socket: net.Socket | tls.TLSSocket | null | undefined): void {
  if (socket && !socket.destroyed) {
    try {
      socket.destroy();
    } catch {
      // Ignore errors during cleanup
    }
  }
}
