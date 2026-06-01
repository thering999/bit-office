import { CONFIG } from "./config.js";
/**
 * MetaArchitect: The brain of the recursive self-improvement ecosystem.
 * Proactively scans the repo and suggests/implements improvements.
 */
export class MetaArchitect {
    agentManager;
    metaAgent;
    runSwarm;
    lastScanTime = 0;
    isScanning = false;
    constructor(agentManager, metaAgent, runSwarm) {
        this.agentManager = agentManager;
        this.metaAgent = metaAgent;
        this.runSwarm = runSwarm;
        // Proactive background loop: every 6 hours
        if (typeof setInterval !== 'undefined') {
            setInterval(() => this.backgroundProactiveScan(), 6 * 60 * 60 * 1000);
        }
    }
    async backgroundProactiveScan() {
        if (this.isScanning || !CONFIG.memory.enabled)
            return;
        this.isScanning = true;
        console.log("[MetaArchitect] Starting proactive repository health check...");
        try {
            const suggestions = await this.analyzeRepositoryHealth();
            if (suggestions && suggestions.length > 0) {
                console.log(`[MetaArchitect] Found ${suggestions.length} potential improvements.`);
                // In the future, we could auto-trigger a low-priority swarm.
            }
        }
        catch (err) {
            console.error("[MetaArchitect] Proactive scan failed:", err);
        }
        finally {
            this.isScanning = false;
            this.lastScanTime = Date.now();
        }
    }
    /**
     * Run a deep analysis of the current project state.
     */
    async analyzeRepositoryHealth() {
        const prompt = `You are the Meta-Architect. 
Analyze the current repository state for "Recursive Self-Improvement".
Focus on:
1. Code Redundancy (e.g. duplicate logic in agent-session and orchestrator).
2. Safety Gaps (e.g. missing bounds checks, error handling).
3. Performance Bottlenecks (e.g. redundant memory lookups).
4. Developer Experience (e.g. confusing API patterns).

Return a list of specific, actionable improvement tasks.`;
        const spec = await this.metaAgent.analyzeAndAssemble(prompt);
        if (!spec)
            return [];
        return spec.members.map(m => m.role);
    }
    /**
     * Trigger a self-improvement cycle.
     */
    async triggerSelfImprovement(focus) {
        const prompt = `## RECURSIVE SELF-IMPROVEMENT CYCLE
Focus: ${focus || "General Repository Health & Architecture Optimization"}

GOAL:
1. Scan the codebase for patterns of technical debt.
2. Refactor identified modules for better maintainability and performance.
3. Ensure 100% test coverage for changes.
4. Document any architectural shifts in README.md or AGENTS.md.

This is an AUTONOMOUS mission. You have full authority to refactor as needed.`;
        await this.runSwarm(prompt);
    }
    /**
     * Automatically submit a PR for the latest improvements.
     */
    async submitPullRequest(branchName, title, body) {
        console.log(`[MetaArchitect] Submitting Auto-PR: ${title}...`);
        try {
            const { execSync } = await import("child_process");
            // Use gh CLI to create PR
            const cmd = `gh pr create --title "${title}" --body "${body}" --head "${branchName}" --base main`;
            execSync(cmd, { stdio: 'inherit' });
            console.log("[MetaArchitect] Auto-PR submitted successfully.");
        }
        catch (err) {
            console.error("[MetaArchitect] Failed to submit Auto-PR:", err);
        }
    }
}
//# sourceMappingURL=meta-architect.js.map