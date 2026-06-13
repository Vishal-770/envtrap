import test from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testServerRoot = path.resolve(__dirname, "..");
const reportPath = path.resolve(testServerRoot, ".envtrap-report.json");

// Helper function to sleep/wait
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("envtrap integration security test suite", async (t) => {
  // Ensure any previous report is deleted
  if (fs.existsSync(reportPath)) {
    fs.unlinkSync(reportPath);
  }

  let serverProcess;

  await t.test("1. Spin up Express Server under envtrap monitoring", async () => {
    console.log("Starting secure express server on port 3600...");
    
    serverProcess = spawn("node", ["node_modules/envtrap/dist/index.js", "run", "node", "app.js"], {
      cwd: testServerRoot,
      env: {
        ...process.env,
        PORT: "3600"
      },
      stdio: "pipe"
    });

    // Capture logs to see server boot
    let isBooted = false;
    serverProcess.stdout.on("data", (data) => {
      const log = data.toString();
      if (log.includes("Server started")) {
        isBooted = true;
      }
    });

    // Wait up to 5 seconds for boot
    for (let i = 0; i < 50; i++) {
      if (isBooted) break;
      await delay(100);
    }

    assert.ok(isBooted, "Server failed to start successfully on port 3600");
    console.log("Server is running. Proceeding to trigger leaks...");
  });

  await t.test("2. Trigger STDOUT leak endpoint", async () => {
    console.log("Triggering console log leak...");
    const res = await fetch("http://localhost:3600/leak-console");
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(json.status.includes("Attempted console.log"));
  });

  await t.test("3. Trigger HTTP network leak endpoint", async () => {
    console.log("Triggering outbound HTTP network leak...");
    const res = await fetch("http://localhost:3600/leak-http");
    assert.strictEqual(res.status, 200);
  });

  await t.test("4. Trigger Child Process env leak endpoint", async () => {
    console.log("Triggering subprocess spawn leak...");
    const res = await fetch("http://localhost:3600/leak-subprocess");
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.status, "Subprocess execution completed.");
  });

  await t.test("5. Shut down server and verify envtrap leak report generation", async () => {
    console.log("Triggering clean shutdown via endpoint...");
    
    // Call the shutdown endpoint
    const shutdownRes = await fetch("http://localhost:3600/shutdown");
    assert.strictEqual(shutdownRes.status, 200);

    // Wait up to 3 seconds for file output write
    for (let i = 0; i < 30; i++) {
      if (fs.existsSync(reportPath)) break;
      await delay(100);
    }

    assert.ok(fs.existsSync(reportPath), "envtrap failed to generate .envtrap-report.json upon shutdown");

    const reportContent = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    console.log(`\nGenerated Leak Report contains ${reportContent.length} logged events:`);
    console.log(JSON.stringify(reportContent, null, 2));

    // Assert that the report captured the specific exfiltration channels
    const channels = reportContent.map((event) => event.channel);
    
    assert.ok(channels.includes("stdout"), "STDOUT leak was not caught in envtrap report");
    assert.ok(channels.includes("child_process"), "Subprocess env leak was not caught in envtrap report");
  });
});
