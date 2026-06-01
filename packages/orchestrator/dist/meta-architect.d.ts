import type { AgentManager } from "./agent-manager.js";
import type { MetaAgent } from "./meta-agent.js";
/**
 * MetaArchitect: The brain of the recursive self-improvement ecosystem.
 * Proactively scans the repo and suggests/implements improvements.
 */
export declare class MetaArchitect {
    private agentManager;
    private metaAgent;
    private runSwarm;
    private lastScanTime;
    private isScanning;
    constructor(agentManager: AgentManager, metaAgent: MetaAgent, runSwarm: (prompt: string) => Promise<void>);
    backgroundProactiveScan(): Promise<void>;
    /**
     * Run a deep analysis of the current project state.
     */
    analyzeRepositoryHealth(): Promise<string[]>;
    /**
     * Trigger a self-improvement cycle.
     */
    triggerSelfImprovement(focus?: string): Promise<void>;
    /**
     * Automatically submit a PR for the latest improvements.
     */
    submitPullRequest(branchName: string, title: string, body: string): Promise<void>;
}
//# sourceMappingURL=meta-architect.d.ts.map