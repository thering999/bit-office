// mock-ai-recovery.js - Simulates various failure modes including hangs and empty responses
import fs from 'fs';
import path from 'path';

const prompt = process.argv[2] || "";
const agentId = process.env.AGENT_ID || "unknown";

const stateFile = path.join(process.cwd(), ".mock_ai_state");
let attempts = 0;
if (fs.existsSync(stateFile)) {
  attempts = parseInt(fs.readFileSync(stateFile, "utf-8")) || 0;
}
attempts++;
fs.writeFileSync(stateFile, attempts.toString());

if (prompt.includes("SIMULATE_HANG") && attempts < 2) {
  console.log(`[Attempt ${attempts}] I will now stay silent forever (transient)...`);
  setInterval(() => {}, 1000000); 
} else if (prompt.includes("SIMULATE_EMPTY")) {
  if (attempts < 2) {
    process.exit(0);
  }
  console.log("Thinking...");
  console.log("Result: Success! (Recovered from Empty)");
  process.exit(0);
} else if (prompt.includes("SIMULATE_QUOTA")) {
  console.error("TerminalQuotaError: Usage limit reached.");
  process.exit(1);
} else {
  // Normal success
  setTimeout(() => {
    console.log("Thinking...");
    setTimeout(() => {
      console.log("Result: Success!");
      process.exit(0);
    }, 500);
  }, 500);
}
