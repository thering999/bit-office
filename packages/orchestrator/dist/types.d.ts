import { OrchTaskResultPayload as TaskResultPayload, OrchTaskStartedEvent as TaskStartedEvent, OrchTaskDoneEvent as TaskDoneEvent, OrchTaskFailedEvent as TaskFailedEvent, OrchTaskDelegatedEvent as TaskDelegatedEvent, OrchTaskRetryingEvent as TaskRetryingEvent, OrchAgentStatusEvent as AgentStatusEvent, OrchApprovalNeededEvent as ApprovalNeededEvent, OrchLogAppendEvent as LogAppendEvent, OrchReflectionEvent as ReflectionEvent, OrchTeamChatEvent as TeamChatEvent, OrchTaskQueuedEvent as TaskQueuedEvent, OrchWorktreeCreatedEvent as WorktreeCreatedEvent, OrchWorktreeMergedEvent as WorktreeMergedEvent, OrchAgentActivityEvent as AgentActivityEvent, OrchAgentCreatedEvent as AgentCreatedEvent, OrchAgentFiredEvent as AgentFiredEvent, OrchTaskResultReturnedEvent as TaskResultReturnedEvent, OrchMetaThoughtEvent as MetaThoughtEvent, OrchTeamPhaseChangedEvent as TeamPhaseChangedEvent, OrchTokenUpdateEvent as TokenUpdateEvent, OrchSwarmHealthEvent as SwarmHealthEvent, OrchSwarmReassemblyEvent as SwarmReassemblyEvent, OrchToolStartedEvent as ToolStartedEvent, OrchToolFinishedEvent as ToolFinishedEvent } from "@office/shared";
export type { TaskResultPayload, TaskStartedEvent, TaskDoneEvent, TaskFailedEvent, TaskDelegatedEvent, TaskRetryingEvent, AgentStatusEvent, ApprovalNeededEvent, LogAppendEvent, ReflectionEvent, TeamChatEvent, TaskQueuedEvent, WorktreeCreatedEvent, WorktreeMergedEvent, AgentActivityEvent, AgentCreatedEvent, AgentFiredEvent, TaskResultReturnedEvent, MetaThoughtEvent, TeamPhaseChangedEvent, TokenUpdateEvent, SwarmHealthEvent, SwarmReassemblyEvent, ToolStartedEvent, ToolFinishedEvent, };
export * from "@office/shared";
export interface WorktreeOptions {
    /** Merge worktree branch back to parent on task success (default: true) */
    mergeOnComplete?: boolean;
}
export interface RetryOptions {
    /** Maximum retries per task (default: 2) */
    maxRetries?: number;
    /** Escalate to team lead after exhausting retries (default: true) */
    escalateToLeader?: boolean;
}
export interface OrchestratorOptions {
    /** Root workspace directory */
    workspace: string;
    /** Registered AI backends */
    backends: import("./ai-backend.js").AIBackend[];
    /** Default backend ID (defaults to first backend) */
    defaultBackendId?: string;
    /** Whether to use visual perception */
    useVision?: boolean;
    /** Worktree isolation options. false to disable entirely. */
    worktree?: WorktreeOptions | false;
    /** Auto-retry options. false to disable entirely. */
    retry?: RetryOptions | false;
    /** FS directory for prompt template overrides */
    promptsDir?: string;
    /** Sandbox mode: "full" gives agent full access, "safe" restricts */
    sandboxMode?: "full" | "safe";
    /** Optional callback for backend-specific failures (e.g. key rotation) */
    onBackendFailure?: (agentId: string, backendId: string, error: string) => void;
    /** Optional callback to check if a backend has available capacity/keys */
    onBackendCheck?: (backendId: string) => boolean;
}
export interface CreateAgentOpts {
    agentId: string;
    name: string;
    role: string;
    personality?: string;
    backend?: string;
    palette?: number;
    resumeHistory?: boolean;
    teamId?: string;
}
export interface CreateTeamOpts {
    leadPresetIndex: number;
    memberPresets: Array<{
        name: string;
        role: string;
        personality?: string;
        palette?: number;
    }>;
    backends?: Record<string, string>;
}
export interface RunTaskOpts {
    taskId?: string;
    prompt: string;
    repoPath?: string;
    phaseOverride?: string;
}
//# sourceMappingURL=types.d.ts.map