import { AgentStatus, RiskLevel, TeamPhase } from "./types";
export interface OrchTaskResultPayload {
    summary: string;
    fullOutput?: string;
    changedFiles: string[];
    diffStat: string;
    testResult: "passed" | "failed" | "unknown";
    previewUrl?: string;
    previewPath?: string;
    entryFile?: string;
    projectDir?: string;
    previewCmd?: string;
    previewPort?: number;
    tokenUsage?: {
        inputTokens: number;
        outputTokens: number;
    };
}
export interface OrchTaskStartedEvent {
    type: "task:started";
    agentId: string;
    taskId: string;
    prompt: string;
}
export interface OrchTaskDoneEvent {
    type: "task:done";
    agentId: string;
    taskId: string;
    result: OrchTaskResultPayload;
    /** True when a team leader completes with no pending delegated tasks — the real final result. */
    isFinalResult?: boolean;
}
export interface OrchTaskFailedEvent {
    type: "task:failed";
    agentId: string;
    taskId: string;
    error: string;
    rawError?: string;
}
export interface OrchTaskDelegatedEvent {
    type: "task:delegated";
    fromAgentId: string;
    toAgentId: string;
    taskId: string;
    prompt: string;
}
export interface OrchTaskRetryingEvent {
    type: "task:retrying";
    agentId: string;
    taskId: string;
    attempt: number;
    maxRetries: number;
    error: string;
    rawError?: string;
}
export interface OrchAgentStatusEvent {
    type: "agent:status";
    agentId: string;
    status: AgentStatus;
    isFailover?: boolean;
    /** Optional human-readable detail for UI rendering */
    details?: string;
}
export interface OrchApprovalNeededEvent {
    type: "approval:needed";
    approvalId: string;
    agentId: string;
    taskId: string;
    title: string;
    summary: string;
    riskLevel: RiskLevel;
}
export interface OrchLogAppendEvent {
    type: "log:append";
    agentId: string;
    taskId: string;
    stream: "stdout" | "stderr";
    chunk: string;
}
export interface OrchReflectionResultPayload {
    passed: boolean;
    score: number;
    critique: string;
    needsFix: boolean;
}
export interface OrchReflectionEvent {
    type: "task:reflection";
    agentId: string;
    taskId: string;
    result: OrchReflectionResultPayload;
}
export interface OrchTeamChatEvent {
    type: "team:chat";
    fromAgentId: string;
    toAgentId?: string;
    message: string;
    messageType: "delegation" | "result" | "status" | "briefing" | "thought" | "error";
    taskId?: string;
    timestamp: number;
}
export interface OrchTaskQueuedEvent {
    type: "task:queued";
    agentId: string;
    taskId: string;
    prompt: string;
    position: number;
}
export interface OrchWorktreeCreatedEvent {
    type: "worktree:created";
    agentId: string;
    taskId: string;
    worktreePath: string;
    branch: string;
}
export interface OrchWorktreeMergedEvent {
    type: "worktree:merged";
    agentId: string;
    taskId: string;
    branch: string;
    success: boolean;
    conflictFiles?: string[];
}
export interface OrchAgentActivityEvent {
    type: "agent:activity";
    agentId: string;
    agentName: string;
    intent: string;
    phase: "started" | "completed";
    touchedFiles?: string[];
    exports?: string[];
    needs?: string[];
}
export interface OrchToolStartedEvent {
    type: "tool:started";
    agentId: string;
    taskId: string;
    tool: string;
}
export interface OrchToolFinishedEvent {
    type: "tool:finished";
    agentId: string;
    taskId: string;
    tool: string;
    success: boolean;
}
export interface OrchAgentCreatedEvent {
    type: "agent:created";
    agentId: string;
    name: string;
    role: string;
    palette?: number;
    personality?: string;
    backend?: string;
    isTeamLead?: boolean;
    teamId?: string;
}
export interface OrchAgentFiredEvent {
    type: "agent:fired";
    agentId: string;
}
export interface OrchTaskResultReturnedEvent {
    type: "task:result-returned";
    fromAgentId: string;
    toAgentId: string;
    taskId: string;
    summary: string;
    success: boolean;
}
export interface OrchMetaThoughtEvent {
    type: "meta:thought";
    agentId: string;
    thought: string;
    timestamp: number;
}
export interface OrchTeamPhaseChangedEvent {
    type: "team:phase";
    teamId: string;
    phase: TeamPhase;
    leadAgentId: string;
}
export interface OrchTokenUpdateEvent {
    type: "token:update";
    agentId: string;
    inputTokens: number;
    outputTokens: number;
}
export interface OrchSwarmHealthEvent {
    type: "swarm:health";
    teamId: string;
    score: number;
    status: "optimal" | "stressed" | "failing";
    diagnostics: string[];
    recommendations: string[];
}
export interface OrchSwarmReassemblyEvent {
    type: "swarm:re-assembly";
    teamId: string;
    teamName: string;
}
export type OrchestratorEvent = OrchTaskStartedEvent | OrchTaskDoneEvent | OrchTaskFailedEvent | OrchTaskDelegatedEvent | OrchTaskRetryingEvent | OrchAgentStatusEvent | OrchApprovalNeededEvent | OrchLogAppendEvent | OrchTeamChatEvent | OrchTaskQueuedEvent | OrchWorktreeCreatedEvent | OrchWorktreeMergedEvent | OrchAgentActivityEvent | OrchAgentCreatedEvent | OrchAgentFiredEvent | OrchTaskResultReturnedEvent | OrchTeamPhaseChangedEvent | OrchTokenUpdateEvent | OrchMetaThoughtEvent | OrchToolStartedEvent | OrchToolFinishedEvent | OrchReflectionEvent | OrchSwarmHealthEvent | OrchSwarmReassemblyEvent;
export interface OrchestratorEventMap {
    "task:started": [OrchTaskStartedEvent];
    "task:done": [OrchTaskDoneEvent];
    "task:failed": [OrchTaskFailedEvent];
    "task:delegated": [OrchTaskDelegatedEvent];
    "task:retrying": [OrchTaskRetryingEvent];
    "agent:status": [OrchAgentStatusEvent];
    "approval:needed": [OrchApprovalNeededEvent];
    "log:append": [OrchLogAppendEvent];
    "team:chat": [OrchTeamChatEvent];
    "task:queued": [OrchTaskQueuedEvent];
    "worktree:created": [OrchWorktreeCreatedEvent];
    "worktree:merged": [OrchWorktreeMergedEvent];
    "agent:activity": [OrchAgentActivityEvent];
    "agent:created": [OrchAgentCreatedEvent];
    "agent:fired": [OrchAgentFiredEvent];
    "task:result-returned": [OrchTaskResultReturnedEvent];
    "team:phase": [OrchTeamPhaseChangedEvent];
    "token:update": [OrchTokenUpdateEvent];
    "meta:thought": [OrchMetaThoughtEvent];
    "tool:started": [OrchToolStartedEvent];
    "tool:finished": [OrchToolFinishedEvent];
    "task:reflection": [OrchReflectionEvent];
    "swarm:health": [OrchSwarmHealthEvent];
    "swarm:re-assembly": [OrchSwarmReassemblyEvent];
}
//# sourceMappingURL=orchestrator-types.d.ts.map