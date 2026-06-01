import fs from "fs";
import { Orchestrator } from "./orchestrator.js";
import { CONFIG } from "./config.js";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function runTest() {
    console.log("🚀 Starting AI Recovery Unit Test...");
    // 1. Setup small timeouts for fast testing
    const timing = CONFIG.timing;
    timing.inactivityTimeoutMs = 5000; // 5 seconds
    timing.workerTimeoutMs = 15000; // 15 seconds
    timing.retryDelayMs = 100;
    const mockScript = path.join(__dirname, "mock-ai-recovery.js");
    const mockCommand = "node";
    const backends = [
        {
            id: "primary",
            name: "Primary AI (Flaky)",
            command: mockCommand,
            buildArgs: (prompt) => [mockScript, prompt],
            getEnv: () => ({})
        },
        {
            id: "secondary",
            name: "Secondary AI (Reliable)",
            command: mockCommand,
            buildArgs: (prompt) => [mockScript, prompt],
            getEnv: () => ({})
        }
    ];
    const orchestrator = new Orchestrator({
        workspace: process.cwd(),
        backends,
        defaultBackendId: "primary",
        retry: {
            maxRetries: 3,
            escalateToLeader: false
        }
    });
    orchestrator.on("task:failed", (e) => {
        console.log(`\n⚠️  TEST: Task Failed as expected: ${e.error}`);
        console.log(`🔄 TEST: Orchestrator should auto-retry...`);
    });
    let completedScenarios = 0;
    orchestrator.on("task:done", (e) => {
        console.log(`\n✅ TEST: Task Completed Successfully!`);
        console.log(`📝 Result: ${e.result.summary}`);
        completedScenarios++;
        if (completedScenarios >= 2) {
            console.log("\n🌟 ALL TEST SCENARIOS PASSED!");
            process.exit(0);
        }
    });
    const waitForTask = () => new Promise((resolve) => {
        const handler = (e) => {
            if (e.type === "task:done") {
                orchestrator.removeListener("task:done", handler);
                resolve();
            }
        };
        orchestrator.on("task:done", handler);
    });
    // TEST 1: SIMULATE_HANG
    console.log("\n--- Scenario 1: AI Hangs (Silent) ---");
    orchestrator.createAgent({
        agentId: "test-agent-hang",
        name: "HangTester",
        role: "Tester",
        backend: "primary"
    });
    orchestrator.runTask("test-agent-hang", { prompt: "SIMULATE_HANG" });
    await waitForTask();
    // TEST 2: SIMULATE_EMPTY
    console.log("\n--- Scenario 2: AI Exits with 0 but Empty Output ---");
    if (fs.existsSync(".mock_ai_state"))
        fs.unlinkSync(".mock_ai_state");
    orchestrator.createAgent({
        agentId: "test-agent-empty",
        name: "EmptyTester",
        role: "Tester",
        backend: "primary"
    });
    orchestrator.runTask("test-agent-empty", { prompt: "SIMULATE_EMPTY" });
    await waitForTask();
    // If it doesn't fail/retry within 30s, the test failed
    setTimeout(() => {
        console.error("❌ TEST FAILED: Timeout reached without recovery.");
        process.exit(1);
    }, 40000);
}
runTest().catch(err => {
    console.error("Test error:", err);
    process.exit(1);
});
//# sourceMappingURL=test-recovery.js.map