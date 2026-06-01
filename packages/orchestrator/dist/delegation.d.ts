import type { AgentManager } from "./agent-manager.js";
import type { AgentSession } from "./agent-session.js";
import type { PromptEngine } from "./prompt-templates.js";
import type { OrchestratorEvent } from "./types.js";
export declare class DelegationRouter {
    /** All per-task delegation metadata, keyed by taskId */
    private tasks;
    /** agentId → taskId of the delegated task currently assigned TO this agent */
    private assignedTask;
    /** Total delegations in current team session (reset on clearAll) */
    private totalDelegations;
    /** How many times the leader has been invoked to process results */
    private leaderRounds;
    /** How many times a Code Reviewer result has been forwarded to the leader */
    private reviewCount;
    /** When true, all new delegations and result forwarding are blocked */
    private stopped;
    /** Batch result forwarding: originAgentId → pending results + timer */
    private pendingResults;
    /** Team-wide project directory — all delegations use this as repoPath when set */
    private teamProjectDir;
    /** Direct fix attempts per dev agent (reviewer → dev shortcut without leader) */
    private devFixAttempts;
    /** Tracks which dev agent was last assigned to work (for reviewer → dev routing) */
    private lastDevAgentId;
    /** Last known preview fields from developer output (survives across rounds for leader context) */
    private lastDevPreview;
    private agentManager;
    private promptEngine;
    private emitEvent;
    private worktreeEnabled;
    private worktreeMerge;
    constructor(agentManager: AgentManager, promptEngine: PromptEngine, emitEvent: (event: OrchestratorEvent) => void, worktreeEnabled?: boolean, worktreeMerge?: boolean);
    /**
     * Wire delegation and result forwarding callbacks onto a session.
     */
    wireAgent(session: AgentSession): void;
    /**
     * Check if a taskId was delegated (has an origin).
     */
    isDelegated(taskId: string): boolean;
    /**
     * True if this taskId was created by flushResults (leader processing worker results).
     * Only result-processing tasks are eligible to be marked as isFinalResult.
     */
    isResultTask(taskId: string): boolean;
    /**
     * True when the delegation budget is exhausted — leader should finalize even
     * if the current task is not a "resultTask" (safety net for convergence).
     */
    isBudgetExhausted(): boolean;
    /**
     * True if the given resultTask completed WITHOUT creating any new delegations.
     * This means the leader decided to summarize/finish rather than delegate more work.
     */
    resultTaskDidNotDelegate(taskId: string): boolean;
    /**
     * Check if there are any pending delegated tasks originating from a given agent.
     */
    hasPendingFrom(agentId: string): boolean;
    /**
     * Remove all delegation tracking for a specific agent (on fire/cancel).
     */
    clearAgent(agentId: string): void;
    /**
     * Block all future delegations and result forwarding. Call before cancelling tasks.
     */
    stop(): void;
    /**
     * Set a team-wide project directory. All delegations will use this as repoPath.
     */
    setTeamProjectDir(dir: string | null): void;
    getTeamProjectDir(): string | null;
    /**
     * Reset all delegation state (on new team task).
     */
    clearAll(): void;
    private wireDelegation;
    private wireResultForwarding;
    /**
     * Attempt a direct reviewer → dev fix shortcut.
     * Returns true if the shortcut was taken (caller should skip normal forwarding).
     *
     * Strategy:
     * - First FAIL: route directly to dev with reviewer feedback (skip leader)
     * - Second FAIL for same dev: escalate to leader (maybe needs a different approach)
     */
    private tryDirectFix;
    /**
     * Queue a result for batched forwarding to the origin agent.
     * Flush only when ALL delegated tasks from this origin have returned.
     * The timer is a safety net — if a worker somehow disappears without returning,
     * we don't want the leader to wait forever.
     */
    private enqueueResult;
    /** Flush all pending results for an origin agent as a single leader prompt. */
    private flushResults;
}
//# sourceMappingURL=delegation.d.ts.map