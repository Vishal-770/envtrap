import test from "node:test";
import assert from "node:assert";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testServerRoot = path.resolve(__dirname, "..");
const envtrapBin = path.resolve(testServerRoot, "node_modules", "envtrap", "dist", "index.js");
const reportPath = path.resolve(testServerRoot, ".envtrap-report.json");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("envtrap comprehensive integration test suite", async (t) => {
  // Ensure any previous report is deleted
  if (fs.existsSync(reportPath)) {
    fs.unlinkSync(reportPath);
  }

  let serverProcess;

  await t.test("1. Run envtrap check on valid configuration", () => {
    console.log("Running envtrap check on valid config...");
    const stdout = execSync(`node ${envtrapBin} check`, {
      cwd: testServerRoot,
      encoding: "utf8"
    });
    assert.ok(stdout.includes("Configuration is valid"), "check command failed on valid config");
  });

  await t.test("2. Spin up Express Server under envtrap monitoring", async () => {
    console.log("Starting express server...");
    
    serverProcess = spawn("node", [envtrapBin, "run", "node", "app.js"], {
      cwd: testServerRoot,
      env: {
        ...process.env,
        PORT: "3600",
        STRIPE_SECRET_KEY: "sk_test_51NzABCDEFGHIJ123456789012",
        GITHUB_TOKEN: "ghp_123456789012345678901234567890123456"
      },
      stdio: "pipe"
    });

    let isBooted = false;
    serverProcess.stdout.on("data", (data) => {
      const log = data.toString();
      process.stdout.write(log);
      if (log.includes("Server started")) {
        isBooted = true;
      }
    });

    serverProcess.stderr.on("data", (data) => {
      process.stderr.write(data.toString());
    });

    for (let i = 0; i < 50; i++) {
      if (isBooted) break;
      await delay(100);
    }

    assert.ok(isBooted, "Server failed to start successfully on port 3600");
  });

  await t.test("3. Trigger STDOUT leak endpoint (ESM)", async () => {
    console.log("Triggering console log leak...");
    const res = await fetch("http://localhost:3600/leak-console");
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(json.status.includes("Attempted console.log"));
  });

  await t.test("4. Trigger HTTP network leak endpoint (ESM)", async () => {
    console.log("Triggering HTTP leak...");
    const res = await fetch("http://localhost:3600/leak-http");
    assert.strictEqual(res.status, 200);
  });

  await t.test("5. Trigger subprocess spawn leak (ESM)", async () => {
    console.log("Triggering subprocess spawn leak (ESM)...");
    const res = await fetch("http://localhost:3600/leak-subprocess");
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, "Subprocess execution completed.");
  });

  await t.test("6. Trigger subprocess spawn leak (CJS require)", async () => {
    console.log("Triggering subprocess spawn leak (CJS require)...");
    const res = await fetch("http://localhost:3600/leak-subprocess-cjs");
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, "Subprocess execution completed.");
  });

  await t.test("7. Trigger DNS leak endpoint (ESM)", async () => {
    console.log("Triggering DNS leak (ESM)...");
    const res = await fetch("http://localhost:3600/leak-dns-esm");
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, "Success");
  });

  await t.test("8. Trigger DNS leak endpoint (CJS require)", async () => {
    console.log("Triggering DNS leak (CJS require)...");
    const res = await fetch("http://localhost:3600/leak-dns-cjs");
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, "Success");
  });

  await t.test("9. Shut down server and verify report contains all ESM and CJS leaks", async () => {
    console.log("Shutting down server...");
    const shutdownRes = await fetch("http://localhost:3600/shutdown");
    assert.strictEqual(shutdownRes.status, 200);

    for (let i = 0; i < 30; i++) {
      if (fs.existsSync(reportPath)) break;
      await delay(100);
    }

    assert.ok(fs.existsSync(reportPath), "Leak report was not generated");

    const reportContent = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    const channels = reportContent.map((event) => event.channel);

    assert.ok(channels.includes("stdout"), "STDOUT leak not caught");
    assert.ok(channels.includes("child_process"), "Subprocess env leak not caught");
    assert.ok(channels.includes("dns"), "DNS leak not caught");
  });

  await t.test("10. Test Block Mode behavior for DNS leaks", async () => {
    console.log("Testing Block Mode...");
    const tempDir = path.join(testServerRoot, "test-temp-block");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    // Write an envtrap.json with block mode for dns
    fs.writeFileSync(path.join(tempDir, "envtrap.json"), JSON.stringify({
      channels: {
        dns: "block"
      }
    }));

    // Create a script that performs a dns lookup
    fs.writeFileSync(path.join(tempDir, "dns-test.js"), `
      import dns from "dns";
      try {
        dns.lookup("sk_test_51NzABCDEFGHIJ123456789012.example.com", (err) => {
          // Should not reach here because lookup throws synchronously
          process.exit(0);
        });
      } catch (err) {
        console.error("BLOCK_TEST_CAUGHT: " + err.message);
        process.exit(0);
      }
    `);

    let result = "";
    try {
      result = execSync(`node ${envtrapBin} run node dns-test.js`, {
        cwd: tempDir,
        env: {
          ...process.env,
          STRIPE_SECRET_KEY: "sk_test_51NzABCDEFGHIJ123456789012"
        },
        encoding: "utf8"
      });
    } catch (err) {
      result = (err.stdout || "") + "\n" + (err.stderr || "");
    }

    assert.ok(result.includes("BLOCK_TEST_CAUGHT"), "Block mode failed to throw on secret DNS leak");
    
    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  await t.test("11. Test Path Exclusions", async () => {
    console.log("Testing Path Exclusions...");
    const tempDir = path.join(testServerRoot, "test-temp-exclude");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    fs.writeFileSync(path.join(tempDir, "envtrap.json"), JSON.stringify({
      exclusions: {
        paths: ["**/ignored/*", "ignored/*", "test-temp-exclude/ignored/*", "**/test-temp-exclude/ignored/*"]
      }
    }));

    const ignoredDir = path.join(tempDir, "ignored");
    if (!fs.existsSync(ignoredDir)) fs.mkdirSync(ignoredDir);

    // Write a test script inside ignored/ that prints secret and does dns lookup
    fs.writeFileSync(path.join(ignoredDir, "test.js"), `
      import dns from "dns";
      console.log("leak: " + process.env.STRIPE_SECRET_KEY);
      dns.lookup("sk_test_51NzABCDEFGHIJ123456789012.example.com", () => {});
    `);

    const runResult = execSync(`node ${envtrapBin} run node ignored/test.js`, {
      cwd: tempDir,
      env: {
        ...process.env,
        STRIPE_SECRET_KEY: "sk_test_51NzABCDEFGHIJ123456789012"
      },
      encoding: "utf8"
    });

    assert.ok(!runResult.includes("SECRET LEAK DETECTED"), "Leak reported from excluded path");
    
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
