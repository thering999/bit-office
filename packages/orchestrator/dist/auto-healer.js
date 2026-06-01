import { nanoid } from "nanoid";
/**
 * AutoHealer listens to agent failures and attempts to resolve "knowledge gaps"
 * (e.g. missing components, unknown functions) by querying the knowledge graph.
 */
export class AutoHealer {
    agentManager;
    runTask;
    constructor(agentManager, runTask) {
        this.agentManager = agentManager;
        this.runTask = runTask;
    }
    /**
     * Analyze a task failure for potential knowledge gaps.
     * If a gap is detected (e.g. "ReferenceError: X is not defined"),
     * it triggers a research task or provides a hint for retry.
     */
    async handleFailure(event, session) {
        const { agentId, error } = event;
        console.log(`[AutoHealer] Analyzing failure for ${session.name}: ${error.substring(0, 100)}...`);
        // Pattern 1: Missing component or symbol
        const missingSymbolMatch = error.match(/(?:ReferenceError|Could not find|unknown component|is not defined)[:\s]+['"`]?(\w+)['"`]?/i);
        if (missingSymbolMatch) {
            const symbol = missingSymbolMatch[1];
            const researcher = this.agentManager.findByName("Researcher") || this.agentManager.get(agentId);
            if (researcher) {
                const taskId = `heal_${nanoid(6)}`;
                const researchPrompt = `## AUTO-HEAL: KNOWLEDGE GAP DETECTED
The agent "${session.name}" failed because it couldn't find "${symbol}". 

ACTION REQUIRED:
1. Use the 'graphify' tool or 'grep' to find where "${symbol}" is defined.
2. If found, provide the full path and an example of how to import/use it.
3. If NOT found, check if it's a known library component that needs installation.
4. Provide a clear "HINT" that the agent can use to fix the code.`;
                console.log(`[AutoHealer] Triggering expert recovery for "${symbol}" on ${researcher.name}`);
                this.runTask(researcher.agentId, taskId, researchPrompt);
                return true;
            }
        }
        // Pattern 2: Build/Lint errors
        if (error.includes("Build failed") || error.includes("Lint errors")) {
            const taskId = `heal_${nanoid(6)}`;
            const fixPrompt = `## AUTO-HEAL: QUALITY CHECK FAILED
The previous operation resulted in build or lint errors.
Error Details:
${error.substring(0, 500)}

ACTION REQUIRED:
1. Review the error log and identify the exact lines causing the issue.
2. Fix the syntax or type errors.
3. Verify that all imports are correct.
4. Ensure no partial or broken files were left behind.`;
            this.runTask(agentId, taskId, fixPrompt);
            return true;
        }
        // Pattern 3: Timeout or Hang
        if (error.includes("timeout") || error.includes("hang")) {
            const taskId = `heal_${nanoid(6)}`;
            const retryPrompt = `## AUTO-HEAL: EXECUTION TIMEOUT
The previous command timed out. This might be due to a long-running process or an infinite loop.
Please try a more efficient approach or break the task into smaller steps.`;
            this.runTask(agentId, taskId, retryPrompt);
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=auto-healer.js.map