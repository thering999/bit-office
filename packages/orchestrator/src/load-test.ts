import { Orchestrator } from "./orchestrator.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../..");
const mockAiPath = path.resolve(rootDir, "apps/gateway/src/mock-ai.js");

async function runLoadTest() {
  console.log("🚀 Starting Load Test...");
  
  console.log(`[TEST] mockAiPath: ${mockAiPath}`);
  const testWorkspace = path.resolve(rootDir, ".test-workspace");
  if (!fs.existsSync(testWorkspace)) {
    console.log(`[TEST] Creating workspace: ${testWorkspace}`);
    fs.mkdirSync(testWorkspace, { recursive: true });
  }

  if (!fs.existsSync(mockAiPath)) {
    console.error("❌ ERROR: mock-ai.js NOT FOUND!");
    process.exit(1);
  }

  const backends = [
    {
      id: "mock-fail",
      name: "Mock Failing Backend",
      command: "node",
      buildArgs: (prompt: string) => [mockAiPath, "EXHAUST_QUOTA"],
      getEnv: () => ({}),
      failoverTo: ["mock-backup"]
    },
    {
      id: "mock-backup",
      name: "Mock Backup Backend",
      command: "node",
      buildArgs: (prompt: string) => [mockAiPath, "SUCCESS"],
      getEnv: () => ({}),
    }
  ];

  const orchestrator = new Orchestrator({
    workspace: path.resolve(rootDir, ".test-workspace"),
    backends: backends as any,
    defaultBackendId: "mock-fail",
    promptsDir: path.resolve(rootDir, "packages/orchestrator/prompts"),
    onBackendFailure: (agentId, backendId, error) => {
      console.log(`[TEST] Callback: Agent ${agentId} reported failure on ${backendId}: ${error.slice(0, 50)}...`);
    },
    onBackendCheck: (backendId) => {
      console.log(`[TEST] Check: Capacity check for ${backendId} -> returning true (retry same)`);
      return true; // Simulate having more keys
    }
  });

  const agentCount = 5;
  const agentIds: string[] = [];

  console.log(`[TEST] Creating ${agentCount} agents...`);
  for (let i = 0; i < agentCount; i++) {
    const agentId = `agent-load-${i}`;
    orchestrator.createAgent({
      agentId,
      name: `LoadAgent-${i}`,
      role: "Tester",
      backend: "mock-fail",
    });
    agentIds.push(agentId);
  }

  const results: Promise<any>[] = [];

  orchestrator.on("task:done", (e) => {
    console.log(`✅ [TEST] Agent ${e.agentId} finished task ${e.taskId}`);
  });

  orchestrator.on("task:failed", (e) => {
    console.error(`❌ [TEST] Agent ${e.agentId} FAILED task ${e.taskId}: ${e.error}`);
  });

  orchestrator.on("task:retrying", (e) => {
    console.log(`⚠️ [TEST] Agent ${e.agentId} is RETRYING (Failover expected)`);
  });

  console.log(`[TEST] Dispatching tasks to all agents...`);
  for (const agentId of agentIds) {
    orchestrator.runTask(agentId, {
      taskId: `task-${agentId}`,
      prompt: "Execute load test with failover simulation."
    });
  }

  // Wait for all tasks to complete or fail
  // For simplicity in this script, we'll wait for a timeout or until we see enough results
  console.log("[TEST] Waiting for results...");
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log("🏁 Load Test Finished.");
  process.exit(0);
}

runLoadTest().catch(console.error);
