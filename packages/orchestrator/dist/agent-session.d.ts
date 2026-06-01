import type { AIBackend } from "./ai-backend.js";
import type { AgentStatus, OrchestratorEvent } from "./types.js";
import type { TemplateName } from "./prompt-templates.js";
export declare function loadSessionMap(): Record<string, string>;
export declare function clearAllSessionIds(): void;
export declare function clearSessionId(agentId: string): void;
/** Callback for delegation: (fromAgentId, targetName, prompt) => void */
export type DelegationHandler = (fromAgentId: string, targetName: string, prompt: string) => void;
/** Callback when a task completes: (agentId, taskId, summary, success) => void */
export type TaskCompleteHandler = (agentId: string, taskId: string, summary: string, success: boolean, fullOutput?: string) => void;
export interface AgentSessionOpts {
    agentId: string;
    name: string;
    role: string;
    personality?: string;
    workspace: string;
    resumeHistory?: boolean;
    backend: AIBackend;
    sandboxMode?: "full" | "safe";
    onEvent: (event: OrchestratorEvent) => void;
    renderPrompt: (templateName: TemplateName, vars: Record<string, string | undefined>) => string;
    /** Whether this agent is the team lead (uses leader template, no tools) */
    isTeamLead?: boolean;
    teamId?: string;
    /** Memory context to inject into prompts (from previous projects) */
    memoryContext?: string;
    /** Whether this agent should use vision (e.g. screenshots of current state) */
    useVision?: boolean;
}
export declare class AgentSession {
    readonly agentId: string;
    readonly name: string;
    readonly role: string;
    readonly personality: string;
    backend: AIBackend;
    palette?: number;
    private process;
    private currentTaskId;
    private taskTimeout;
    private idleTimer;
    private lastPrompt;
    private currentCwd;
    private _status;
    get status(): AgentStatus;
    private pendingApprovals;
    private workspace;
    private _lastLogLine;
    get lastLogLine(): string;
    private sandboxMode;
    private stdoutBuffer;
    private stderrBuffer;
    private taskInputTokens;
    private taskOutputTokens;
    private fixRoundCount;
    /** Dedup same-turn repeated usage in assistant messages */
    private lastUsageSignature;
    private hasHistory;
    private sessionId;
    private taskQueue;
    private onEvent;
    private _renderPrompt;
    private timedOut;
    private wasInactivityTimeout;
    private currentTool;
    private inactivityTimeout;
    private healthCheckInterval;
    private _lastHealthActivity;
    private _isTeamLead;
    private _memoryContext;
    /** Whether this leader has already been through execute phase at least once */
    private _hasExecuted;
    private _lastResult;
    /** Original user-facing task prompt (for leader state-summary mode) */
    originalTask: string | null;
    onDelegation: DelegationHandler | null;
    onTaskComplete: TaskCompleteHandler | null;
    /** Whether the last failure was a timeout (not retryable) */
    get wasTimeout(): boolean;
    get isTeamLead(): boolean;
    /** Mark that this leader has already been through execute phase (for restart recovery). */
    set hasExecuted(v: boolean);
    /** Short summary of last completed/failed task (for roster context) */
    get lastResult(): string | null;
    private _lastResultText;
    /** Full output from the last completed task (for plan capture). */
    private _lastFullOutput;
    get lastFullOutput(): string | null;
    set isTeamLead(v: boolean);
    /** Current phase override for team collaboration phases */
    /** Current phase override for team collaboration phases */
    currentPhase: string | null;
    /** Whether vision is enabled for this session */
    useVision: boolean;
    /** Current working directory of the running task (used by worktree logic) */
    get currentWorkingDir(): string | null;
    /** Whether this agent has session history (used --resume before) */
    get hasSessionHistory(): boolean;
    /** The configured workspace root directory */
    get workspaceDir(): string;
    /** PID of the running child process (null if not running) */
    get pid(): number | null;
    /** Worktree path if task is running in one (set externally by orchestrator) */
    worktreePath: string | null;
    worktreeBranch: string | null;
    teamId?: string;
    private snapshotManager;
    private currentSnapshot;
    /** Whether this session has autonomously failed over to a backup backend */
    isFailover: boolean;
    constructor(opts: AgentSessionOpts);
    /** Update the backend for this session (used for failover) */
    setBackend(backend: AIBackend): void;
    incrementFixRound(): void;
    runTask(taskId: string, prompt: string, repoPath?: string, teamContext?: string, teamChat?: string, isUserInitiated?: boolean, phaseOverride?: string, imagePath?: string, visualContext?: string): Promise<void>;
    /**
     * Send a message to the agent's stdin.
     * NOTE: Currently a no-op because stdin is set to "ignore" (pipe causes Claude Code to hang).
     * Future: use --input-format stream-json for bidirectional communication.
     */
    sendMessage(_message: string): boolean;
    /**
     * Detect preview URL/path from agent output.
     * Called directly for workers; called by orchestrator for leader's final result.
     */
    detectPreview(): {
        previewUrl: string | undefined;
        previewPath: string | undefined;
    };
    /**
     * Parse stdoutBuffer for structured result (SUMMARY/STATUS/FILES_CHANGED).
     * Falls back to a cleaned-up excerpt of the raw output.
     */
    private extractResult;
    private dequeueNext;
    private cancelled;
    /** Set by cancelTask(); prevents flushResults / delegation from auto-restarting this agent. */
    private _userCancelled;
    cancelTask(): void;
    /**
     * Roll back the workspace to the state before the current/last task started.
     */
    rollbackLastTask(): Promise<boolean>;
    destroy(): void;
    /** Reset conversation history so the next task starts fresh (used by End Project). */
    clearHistory(): void;
    resolveApproval(approvalId: string, decision: "yes" | "no"): void;
    requestApproval(title: string, summary: string, riskLevel: "low" | "med" | "high"): Promise<"yes" | "no">;
    getLastPrompt(): string;
    private setStatus;
    private getEnhancedMemoryContext;
}
//# sourceMappingURL=agent-session.d.ts.map