import { AgentErrorHandler } from "./error-handler.js";

const samples = [
  "file:///tmp/agent-123.ts:45 Error: ENOENT: no such file or directory, open 'config.json'",
  "TerminalQuotaError: You have exhausted your daily quota on Gemini. Full report available at: /tmp/gemini-client-error.json\n  at async sendMessageStream (gemini.js:10811:26)",
  "Error: ECONNREFUSED 127.0.0.1:11434",
  "Error when talking to Gemini API Full report available at: /tmp/gemini-client-error-Turn.run-sendMessageStream-2026-05-13.json"
];

console.log("=== Agent Error Handler Test ===\n");

samples.forEach((raw, i) => {
  console.log(`[Sample ${i + 1}] RAW:`);
  console.log(raw);
  console.log("\n[Sample ${i + 1}] CLEANED:");
  console.log(AgentErrorHandler.clean(raw));
  console.log("\n[Sample ${i + 1}] THAI OUTPUT:");
  console.log(AgentErrorHandler.formatThai(raw));
  console.log("-----------------------------------\n");
});
