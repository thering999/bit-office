// mock-ai.js - Simulates an AI backend for testing
import fs from 'fs';

const prompt = process.argv[2] || "";
const agentId = process.env.AGENT_ID || "unknown";

console.log(`[MockAI] Received prompt for ${agentId}: ${prompt.slice(0, 50)}...`);

// Simulate quota error for "stress-test" prompts or randomly
if (prompt.includes("EXHAUST_QUOTA") || Math.random() < 0.3) {
  console.error(`Error when talking to AI API. TerminalQuotaError: You have exhausted your daily quota on this key.`);
  process.exit(1);
}

// Simulate thinking
setTimeout(() => {
  console.log("I am thinking...");
  setTimeout(() => {
    console.log(`Task completed successfully by Mock AI for ${agentId}.`);
    process.exit(0);
  }, 1000);
}, 500);
