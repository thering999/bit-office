import { z } from "zod";
export declare const AgentStatusEvent: z.ZodObject<{
    type: z.ZodLiteral<"AGENT_STATUS">;
    agentId: z.ZodString;
    status: z.ZodEnum<["idle", "thinking", "coding", "working", "waiting_approval", "done", "error", "searching", "testing", "documenting", "debugging", "walking_to_server"]>;
    details: z.ZodOptional<z.ZodString>;
    isFailover: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_STATUS";
    status: "idle" | "thinking" | "coding" | "working" | "waiting_approval" | "done" | "error" | "searching" | "testing" | "documenting" | "debugging" | "walking_to_server";
    agentId: string;
    details?: string | undefined;
    isFailover?: boolean | undefined;
}, {
    type: "AGENT_STATUS";
    status: "idle" | "thinking" | "coding" | "working" | "waiting_approval" | "done" | "error" | "searching" | "testing" | "documenting" | "debugging" | "walking_to_server";
    agentId: string;
    details?: string | undefined;
    isFailover?: boolean | undefined;
}>;
export declare const TaskStartedEvent: z.ZodObject<{
    type: z.ZodLiteral<"TASK_STARTED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "TASK_STARTED";
    agentId: string;
    taskId: string;
    prompt: string;
}, {
    type: "TASK_STARTED";
    agentId: string;
    taskId: string;
    prompt: string;
}>;
export declare const LogAppendEvent: z.ZodObject<{
    type: z.ZodLiteral<"LOG_APPEND">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    stream: z.ZodEnum<["stdout", "stderr"]>;
    chunk: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "LOG_APPEND";
    agentId: string;
    taskId: string;
    stream: "stdout" | "stderr";
    chunk: string;
}, {
    type: "LOG_APPEND";
    agentId: string;
    taskId: string;
    stream: "stdout" | "stderr";
    chunk: string;
}>;
export declare const ApprovalNeededEvent: z.ZodObject<{
    type: z.ZodLiteral<"APPROVAL_NEEDED">;
    approvalId: z.ZodString;
    agentId: z.ZodString;
    taskId: z.ZodString;
    title: z.ZodString;
    summary: z.ZodString;
    riskLevel: z.ZodEnum<["low", "med", "high"]>;
}, "strip", z.ZodTypeAny, {
    type: "APPROVAL_NEEDED";
    agentId: string;
    taskId: string;
    approvalId: string;
    title: string;
    summary: string;
    riskLevel: "low" | "med" | "high";
}, {
    type: "APPROVAL_NEEDED";
    agentId: string;
    taskId: string;
    approvalId: string;
    title: string;
    summary: string;
    riskLevel: "low" | "med" | "high";
}>;
export declare const TokenUsage: z.ZodObject<{
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    inputTokens: number;
    outputTokens: number;
}, {
    inputTokens: number;
    outputTokens: number;
}>;
export declare const TaskResultPayload: z.ZodObject<{
    summary: z.ZodString;
    fullOutput: z.ZodOptional<z.ZodString>;
    changedFiles: z.ZodArray<z.ZodString, "many">;
    diffStat: z.ZodString;
    testResult: z.ZodEnum<["passed", "failed", "unknown"]>;
    nextSuggestion: z.ZodOptional<z.ZodString>;
    previewUrl: z.ZodOptional<z.ZodString>;
    previewPath: z.ZodOptional<z.ZodString>;
    entryFile: z.ZodOptional<z.ZodString>;
    projectDir: z.ZodOptional<z.ZodString>;
    previewCmd: z.ZodOptional<z.ZodString>;
    previewPort: z.ZodOptional<z.ZodNumber>;
    tokenUsage: z.ZodOptional<z.ZodObject<{
        inputTokens: z.ZodNumber;
        outputTokens: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        inputTokens: number;
        outputTokens: number;
    }, {
        inputTokens: number;
        outputTokens: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    changedFiles: string[];
    diffStat: string;
    testResult: "unknown" | "passed" | "failed";
    previewCmd?: string | undefined;
    previewPort?: number | undefined;
    projectDir?: string | undefined;
    fullOutput?: string | undefined;
    nextSuggestion?: string | undefined;
    previewUrl?: string | undefined;
    previewPath?: string | undefined;
    entryFile?: string | undefined;
    tokenUsage?: {
        inputTokens: number;
        outputTokens: number;
    } | undefined;
}, {
    summary: string;
    changedFiles: string[];
    diffStat: string;
    testResult: "unknown" | "passed" | "failed";
    previewCmd?: string | undefined;
    previewPort?: number | undefined;
    projectDir?: string | undefined;
    fullOutput?: string | undefined;
    nextSuggestion?: string | undefined;
    previewUrl?: string | undefined;
    previewPath?: string | undefined;
    entryFile?: string | undefined;
    tokenUsage?: {
        inputTokens: number;
        outputTokens: number;
    } | undefined;
}>;
export declare const TaskDoneEvent: z.ZodObject<{
    type: z.ZodLiteral<"TASK_DONE">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    result: z.ZodObject<{
        summary: z.ZodString;
        fullOutput: z.ZodOptional<z.ZodString>;
        changedFiles: z.ZodArray<z.ZodString, "many">;
        diffStat: z.ZodString;
        testResult: z.ZodEnum<["passed", "failed", "unknown"]>;
        nextSuggestion: z.ZodOptional<z.ZodString>;
        previewUrl: z.ZodOptional<z.ZodString>;
        previewPath: z.ZodOptional<z.ZodString>;
        entryFile: z.ZodOptional<z.ZodString>;
        projectDir: z.ZodOptional<z.ZodString>;
        previewCmd: z.ZodOptional<z.ZodString>;
        previewPort: z.ZodOptional<z.ZodNumber>;
        tokenUsage: z.ZodOptional<z.ZodObject<{
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            inputTokens: number;
            outputTokens: number;
        }, {
            inputTokens: number;
            outputTokens: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    }, {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    }>;
    isFinalResult: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "TASK_DONE";
    result: {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    };
    agentId: string;
    taskId: string;
    isFinalResult?: boolean | undefined;
}, {
    type: "TASK_DONE";
    result: {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    };
    agentId: string;
    taskId: string;
    isFinalResult?: boolean | undefined;
}>;
export declare const TaskFailedEvent: z.ZodObject<{
    type: z.ZodLiteral<"TASK_FAILED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    error: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
    type: "TASK_FAILED";
    agentId: string;
    taskId: string;
}, {
    error: string;
    type: "TASK_FAILED";
    agentId: string;
    taskId: string;
}>;
export declare const TaskDelegatedEvent: z.ZodObject<{
    type: z.ZodLiteral<"TASK_DELEGATED">;
    fromAgentId: z.ZodString;
    toAgentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "TASK_DELEGATED";
    taskId: string;
    prompt: string;
    fromAgentId: string;
    toAgentId: string;
}, {
    type: "TASK_DELEGATED";
    taskId: string;
    prompt: string;
    fromAgentId: string;
    toAgentId: string;
}>;
export declare const AgentCreatedEvent: z.ZodObject<{
    type: z.ZodLiteral<"AGENT_CREATED">;
    agentId: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    palette: z.ZodOptional<z.ZodNumber>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
    isTeamLead: z.ZodOptional<z.ZodBoolean>;
    teamId: z.ZodOptional<z.ZodString>;
    isExternal: z.ZodOptional<z.ZodBoolean>;
    pid: z.ZodOptional<z.ZodNumber>;
    cwd: z.ZodOptional<z.ZodString>;
    workDir: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_CREATED";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
    cwd?: string | undefined;
    isTeamLead?: boolean | undefined;
    isExternal?: boolean | undefined;
    pid?: number | undefined;
    startedAt?: number | undefined;
}, {
    type: "AGENT_CREATED";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
    cwd?: string | undefined;
    isTeamLead?: boolean | undefined;
    isExternal?: boolean | undefined;
    pid?: number | undefined;
    startedAt?: number | undefined;
}>;
export declare const AgentFiredEvent: z.ZodObject<{
    type: z.ZodLiteral<"AGENT_FIRED">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_FIRED";
    agentId: string;
}, {
    type: "AGENT_FIRED";
    agentId: string;
}>;
export declare const TaskResultReturnedEvent: z.ZodObject<{
    type: z.ZodLiteral<"TASK_RESULT_RETURNED">;
    fromAgentId: z.ZodString;
    toAgentId: z.ZodString;
    taskId: z.ZodString;
    summary: z.ZodString;
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "TASK_RESULT_RETURNED";
    taskId: string;
    summary: string;
    fromAgentId: string;
    toAgentId: string;
    success: boolean;
}, {
    type: "TASK_RESULT_RETURNED";
    taskId: string;
    summary: string;
    fromAgentId: string;
    toAgentId: string;
    success: boolean;
}>;
export declare const TeamChatEvent: z.ZodObject<{
    type: z.ZodLiteral<"TEAM_CHAT">;
    fromAgentId: z.ZodString;
    toAgentId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    messageType: z.ZodEnum<["delegation", "result", "status", "briefing"]>;
    taskId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "TEAM_CHAT";
    fromAgentId: string;
    messageType: "status" | "delegation" | "result" | "briefing";
    timestamp: number;
    taskId?: string | undefined;
    toAgentId?: string | undefined;
}, {
    message: string;
    type: "TEAM_CHAT";
    fromAgentId: string;
    messageType: "status" | "delegation" | "result" | "briefing";
    timestamp: number;
    taskId?: string | undefined;
    toAgentId?: string | undefined;
}>;
export declare const TaskQueuedEvent: z.ZodObject<{
    type: z.ZodLiteral<"TASK_QUEUED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
    position: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "TASK_QUEUED";
    agentId: string;
    taskId: string;
    prompt: string;
    position: number;
}, {
    type: "TASK_QUEUED";
    agentId: string;
    taskId: string;
    prompt: string;
    position: number;
}>;
export declare const TokenUpdateEvent: z.ZodObject<{
    type: z.ZodLiteral<"TOKEN_UPDATE">;
    agentId: z.ZodString;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "TOKEN_UPDATE";
    agentId: string;
    inputTokens: number;
    outputTokens: number;
}, {
    type: "TOKEN_UPDATE";
    agentId: string;
    inputTokens: number;
    outputTokens: number;
}>;
export declare const TeamPhaseEvent: z.ZodObject<{
    type: z.ZodLiteral<"TEAM_PHASE">;
    teamId: z.ZodString;
    phase: z.ZodEnum<["create", "design", "execute", "complete"]>;
    leadAgentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "TEAM_PHASE";
    teamId: string;
    phase: "create" | "design" | "execute" | "complete";
    leadAgentId: string;
}, {
    type: "TEAM_PHASE";
    teamId: string;
    phase: "create" | "design" | "execute" | "complete";
    leadAgentId: string;
}>;
export declare const MetaThoughtEvent: z.ZodObject<{
    type: z.ZodLiteral<"META_THOUGHT">;
    agentId: z.ZodString;
    thought: z.ZodString;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "META_THOUGHT";
    thought: string;
    agentId: string;
    timestamp: number;
}, {
    type: "META_THOUGHT";
    thought: string;
    agentId: string;
    timestamp: number;
}>;
export declare const SuggestionEvent: z.ZodObject<{
    type: z.ZodLiteral<"SUGGESTION">;
    text: z.ZodString;
    author: z.ZodString;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "SUGGESTION";
    text: string;
    author: string;
    timestamp: number;
}, {
    type: "SUGGESTION";
    text: string;
    author: string;
    timestamp: number;
}>;
export declare const AgentDefsEvent: z.ZodObject<{
    type: z.ZodLiteral<"AGENT_DEFS">;
    agents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        skills: z.ZodString;
        personality: z.ZodString;
        palette: z.ZodNumber;
        isBuiltin: z.ZodBoolean;
        teamRole: z.ZodEnum<["dev", "reviewer", "leader"]>;
        avatarUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }, {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_DEFS";
    agents: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }[];
}, {
    type: "AGENT_DEFS";
    agents: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }[];
}>;
export declare const AgentsSyncEvent: z.ZodObject<{
    type: z.ZodLiteral<"AGENTS_SYNC">;
    agentIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "AGENTS_SYNC";
    agentIds: string[];
}, {
    type: "AGENTS_SYNC";
    agentIds: string[];
}>;
export declare const ToolStartedEvent: z.ZodObject<{
    type: z.ZodLiteral<"TOOL_STARTED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    tool: z.ZodString;
    input: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "TOOL_STARTED";
    agentId: string;
    taskId: string;
    tool: string;
    input?: string | undefined;
}, {
    type: "TOOL_STARTED";
    agentId: string;
    taskId: string;
    tool: string;
    input?: string | undefined;
}>;
export declare const ToolFinishedEvent: z.ZodObject<{
    type: z.ZodLiteral<"TOOL_FINISHED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    tool: z.ZodString;
    output: z.ZodOptional<z.ZodString>;
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "TOOL_FINISHED";
    agentId: string;
    taskId: string;
    success: boolean;
    tool: string;
    output?: string | undefined;
}, {
    type: "TOOL_FINISHED";
    agentId: string;
    taskId: string;
    success: boolean;
    tool: string;
    output?: string | undefined;
}>;
export declare const ProjectListEvent: z.ZodObject<{
    type: z.ZodLiteral<"PROJECT_LIST">;
    projects: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        startedAt: z.ZodNumber;
        endedAt: z.ZodNumber;
        agentNames: z.ZodArray<z.ZodString, "many">;
        eventCount: z.ZodNumber;
        preview: z.ZodOptional<z.ZodObject<{
            entryFile: z.ZodOptional<z.ZodString>;
            projectDir: z.ZodOptional<z.ZodString>;
            previewCmd: z.ZodOptional<z.ZodString>;
            previewPort: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        }, {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        }>>;
        tokenUsage: z.ZodOptional<z.ZodObject<{
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            inputTokens: number;
            outputTokens: number;
        }, {
            inputTokens: number;
            outputTokens: number;
        }>>;
        ratings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }, {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "PROJECT_LIST";
    projects: {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }[];
}, {
    type: "PROJECT_LIST";
    projects: {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }[];
}>;
export declare const ProjectDataEvent: z.ZodObject<{
    type: z.ZodLiteral<"PROJECT_DATA">;
    projectId: z.ZodString;
    name: z.ZodString;
    startedAt: z.ZodNumber;
    endedAt: z.ZodNumber;
    events: z.ZodArray<z.ZodAny, "many">;
}, "strip", z.ZodTypeAny, {
    type: "PROJECT_DATA";
    name: string;
    projectId: string;
    startedAt: number;
    endedAt: number;
    events: any[];
}, {
    type: "PROJECT_DATA";
    name: string;
    projectId: string;
    startedAt: number;
    endedAt: number;
    events: any[];
}>;
export declare const PreviewReadyEvent: z.ZodObject<{
    type: z.ZodLiteral<"PREVIEW_READY">;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "PREVIEW_READY";
    url: string;
}, {
    type: "PREVIEW_READY";
    url: string;
}>;
export declare const FolderPickedEvent: z.ZodObject<{
    type: z.ZodLiteral<"FOLDER_PICKED">;
    requestId: z.ZodString;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "FOLDER_PICKED";
    requestId: string;
}, {
    path: string;
    type: "FOLDER_PICKED";
    requestId: string;
}>;
export declare const ImageUploadedEvent: z.ZodObject<{
    type: z.ZodLiteral<"IMAGE_UPLOADED">;
    requestId: z.ZodString;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "IMAGE_UPLOADED";
    requestId: string;
}, {
    path: string;
    type: "IMAGE_UPLOADED";
    requestId: string;
}>;
export declare const BackendsSyncEvent: z.ZodObject<{
    type: z.ZodLiteral<"BACKENDS_SYNC">;
    backends: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        isInstalled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }, {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "BACKENDS_SYNC";
    backends: {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }[];
}, {
    type: "BACKENDS_SYNC";
    backends: {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }[];
}>;
export declare const ConfigDataEvent: z.ZodObject<{
    type: z.ZodLiteral<"CONFIG_DATA">;
    config: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "CONFIG_DATA";
    config?: any;
}, {
    type: "CONFIG_DATA";
    config?: any;
}>;
export declare const ConfigUpdatedEvent: z.ZodObject<{
    type: z.ZodLiteral<"CONFIG_UPDATED">;
    config: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "CONFIG_UPDATED";
    config?: any;
}, {
    type: "CONFIG_UPDATED";
    config?: any;
}>;
export declare const KeyStatusDataEvent: z.ZodObject<{
    type: z.ZodLiteral<"KEY_STATUS_DATA">;
    summary: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "KEY_STATUS_DATA";
    summary?: any;
}, {
    type: "KEY_STATUS_DATA";
    summary?: any;
}>;
export declare const SwarmHealthEvent: z.ZodObject<{
    type: z.ZodLiteral<"SWARM_HEALTH">;
    teamId: z.ZodString;
    score: z.ZodNumber;
    status: z.ZodEnum<["optimal", "stressed", "failing"]>;
    diagnostics: z.ZodArray<z.ZodString, "many">;
    recommendations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "SWARM_HEALTH";
    status: "optimal" | "stressed" | "failing";
    teamId: string;
    score: number;
    diagnostics: string[];
    recommendations: string[];
}, {
    type: "SWARM_HEALTH";
    status: "optimal" | "stressed" | "failing";
    teamId: string;
    score: number;
    diagnostics: string[];
    recommendations: string[];
}>;
export declare const SwarmReassemblyEvent: z.ZodObject<{
    type: z.ZodLiteral<"SWARM_REASSEMBLY">;
    teamId: z.ZodString;
    newTeamName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "SWARM_REASSEMBLY";
    teamId: string;
    newTeamName: string;
}, {
    type: "SWARM_REASSEMBLY";
    teamId: string;
    newTeamName: string;
}>;
export declare const KnowledgeSyncedEvent: z.ZodObject<{
    type: z.ZodLiteral<"KNOWLEDGE_SYNCED">;
    projectDir: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "KNOWLEDGE_SYNCED";
    projectDir: string;
    content: string;
}, {
    type: "KNOWLEDGE_SYNCED";
    projectDir: string;
    content: string;
}>;
export declare const BatchEvent: z.ZodObject<{
    type: z.ZodLiteral<"BATCH">;
    events: z.ZodArray<z.ZodAny, "many">;
}, "strip", z.ZodTypeAny, {
    type: "BATCH";
    events: any[];
}, {
    type: "BATCH";
    events: any[];
}>;
export declare const GatewayEventSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"AGENTS_SYNC">;
    agentIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "AGENTS_SYNC";
    agentIds: string[];
}, {
    type: "AGENTS_SYNC";
    agentIds: string[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"AGENT_STATUS">;
    agentId: z.ZodString;
    status: z.ZodEnum<["idle", "thinking", "coding", "working", "waiting_approval", "done", "error", "searching", "testing", "documenting", "debugging", "walking_to_server"]>;
    details: z.ZodOptional<z.ZodString>;
    isFailover: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_STATUS";
    status: "idle" | "thinking" | "coding" | "working" | "waiting_approval" | "done" | "error" | "searching" | "testing" | "documenting" | "debugging" | "walking_to_server";
    agentId: string;
    details?: string | undefined;
    isFailover?: boolean | undefined;
}, {
    type: "AGENT_STATUS";
    status: "idle" | "thinking" | "coding" | "working" | "waiting_approval" | "done" | "error" | "searching" | "testing" | "documenting" | "debugging" | "walking_to_server";
    agentId: string;
    details?: string | undefined;
    isFailover?: boolean | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TASK_STARTED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "TASK_STARTED";
    agentId: string;
    taskId: string;
    prompt: string;
}, {
    type: "TASK_STARTED";
    agentId: string;
    taskId: string;
    prompt: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"LOG_APPEND">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    stream: z.ZodEnum<["stdout", "stderr"]>;
    chunk: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "LOG_APPEND";
    agentId: string;
    taskId: string;
    stream: "stdout" | "stderr";
    chunk: string;
}, {
    type: "LOG_APPEND";
    agentId: string;
    taskId: string;
    stream: "stdout" | "stderr";
    chunk: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"APPROVAL_NEEDED">;
    approvalId: z.ZodString;
    agentId: z.ZodString;
    taskId: z.ZodString;
    title: z.ZodString;
    summary: z.ZodString;
    riskLevel: z.ZodEnum<["low", "med", "high"]>;
}, "strip", z.ZodTypeAny, {
    type: "APPROVAL_NEEDED";
    agentId: string;
    taskId: string;
    approvalId: string;
    title: string;
    summary: string;
    riskLevel: "low" | "med" | "high";
}, {
    type: "APPROVAL_NEEDED";
    agentId: string;
    taskId: string;
    approvalId: string;
    title: string;
    summary: string;
    riskLevel: "low" | "med" | "high";
}>, z.ZodObject<{
    type: z.ZodLiteral<"TASK_DONE">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    result: z.ZodObject<{
        summary: z.ZodString;
        fullOutput: z.ZodOptional<z.ZodString>;
        changedFiles: z.ZodArray<z.ZodString, "many">;
        diffStat: z.ZodString;
        testResult: z.ZodEnum<["passed", "failed", "unknown"]>;
        nextSuggestion: z.ZodOptional<z.ZodString>;
        previewUrl: z.ZodOptional<z.ZodString>;
        previewPath: z.ZodOptional<z.ZodString>;
        entryFile: z.ZodOptional<z.ZodString>;
        projectDir: z.ZodOptional<z.ZodString>;
        previewCmd: z.ZodOptional<z.ZodString>;
        previewPort: z.ZodOptional<z.ZodNumber>;
        tokenUsage: z.ZodOptional<z.ZodObject<{
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            inputTokens: number;
            outputTokens: number;
        }, {
            inputTokens: number;
            outputTokens: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    }, {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    }>;
    isFinalResult: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "TASK_DONE";
    result: {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    };
    agentId: string;
    taskId: string;
    isFinalResult?: boolean | undefined;
}, {
    type: "TASK_DONE";
    result: {
        summary: string;
        changedFiles: string[];
        diffStat: string;
        testResult: "unknown" | "passed" | "failed";
        previewCmd?: string | undefined;
        previewPort?: number | undefined;
        projectDir?: string | undefined;
        fullOutput?: string | undefined;
        nextSuggestion?: string | undefined;
        previewUrl?: string | undefined;
        previewPath?: string | undefined;
        entryFile?: string | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
    };
    agentId: string;
    taskId: string;
    isFinalResult?: boolean | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TASK_FAILED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    error: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
    type: "TASK_FAILED";
    agentId: string;
    taskId: string;
}, {
    error: string;
    type: "TASK_FAILED";
    agentId: string;
    taskId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TASK_DELEGATED">;
    fromAgentId: z.ZodString;
    toAgentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "TASK_DELEGATED";
    taskId: string;
    prompt: string;
    fromAgentId: string;
    toAgentId: string;
}, {
    type: "TASK_DELEGATED";
    taskId: string;
    prompt: string;
    fromAgentId: string;
    toAgentId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"AGENT_CREATED">;
    agentId: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    palette: z.ZodOptional<z.ZodNumber>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
    isTeamLead: z.ZodOptional<z.ZodBoolean>;
    teamId: z.ZodOptional<z.ZodString>;
    isExternal: z.ZodOptional<z.ZodBoolean>;
    pid: z.ZodOptional<z.ZodNumber>;
    cwd: z.ZodOptional<z.ZodString>;
    workDir: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_CREATED";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
    cwd?: string | undefined;
    isTeamLead?: boolean | undefined;
    isExternal?: boolean | undefined;
    pid?: number | undefined;
    startedAt?: number | undefined;
}, {
    type: "AGENT_CREATED";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
    cwd?: string | undefined;
    isTeamLead?: boolean | undefined;
    isExternal?: boolean | undefined;
    pid?: number | undefined;
    startedAt?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"AGENT_FIRED">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_FIRED";
    agentId: string;
}, {
    type: "AGENT_FIRED";
    agentId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TASK_RESULT_RETURNED">;
    fromAgentId: z.ZodString;
    toAgentId: z.ZodString;
    taskId: z.ZodString;
    summary: z.ZodString;
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "TASK_RESULT_RETURNED";
    taskId: string;
    summary: string;
    fromAgentId: string;
    toAgentId: string;
    success: boolean;
}, {
    type: "TASK_RESULT_RETURNED";
    taskId: string;
    summary: string;
    fromAgentId: string;
    toAgentId: string;
    success: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TEAM_CHAT">;
    fromAgentId: z.ZodString;
    toAgentId: z.ZodOptional<z.ZodString>;
    message: z.ZodString;
    messageType: z.ZodEnum<["delegation", "result", "status", "briefing"]>;
    taskId: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "TEAM_CHAT";
    fromAgentId: string;
    messageType: "status" | "delegation" | "result" | "briefing";
    timestamp: number;
    taskId?: string | undefined;
    toAgentId?: string | undefined;
}, {
    message: string;
    type: "TEAM_CHAT";
    fromAgentId: string;
    messageType: "status" | "delegation" | "result" | "briefing";
    timestamp: number;
    taskId?: string | undefined;
    toAgentId?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TASK_QUEUED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
    position: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "TASK_QUEUED";
    agentId: string;
    taskId: string;
    prompt: string;
    position: number;
}, {
    type: "TASK_QUEUED";
    agentId: string;
    taskId: string;
    prompt: string;
    position: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TOKEN_UPDATE">;
    agentId: z.ZodString;
    inputTokens: z.ZodNumber;
    outputTokens: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "TOKEN_UPDATE";
    agentId: string;
    inputTokens: number;
    outputTokens: number;
}, {
    type: "TOKEN_UPDATE";
    agentId: string;
    inputTokens: number;
    outputTokens: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TEAM_PHASE">;
    teamId: z.ZodString;
    phase: z.ZodEnum<["create", "design", "execute", "complete"]>;
    leadAgentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "TEAM_PHASE";
    teamId: string;
    phase: "create" | "design" | "execute" | "complete";
    leadAgentId: string;
}, {
    type: "TEAM_PHASE";
    teamId: string;
    phase: "create" | "design" | "execute" | "complete";
    leadAgentId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"AGENT_DEFS">;
    agents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        role: z.ZodString;
        skills: z.ZodString;
        personality: z.ZodString;
        palette: z.ZodNumber;
        isBuiltin: z.ZodBoolean;
        teamRole: z.ZodEnum<["dev", "reviewer", "leader"]>;
        avatarUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }, {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "AGENT_DEFS";
    agents: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }[];
}, {
    type: "AGENT_DEFS";
    agents: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    }[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"SUGGESTION">;
    text: z.ZodString;
    author: z.ZodString;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "SUGGESTION";
    text: string;
    author: string;
    timestamp: number;
}, {
    type: "SUGGESTION";
    text: string;
    author: string;
    timestamp: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"PROJECT_LIST">;
    projects: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        startedAt: z.ZodNumber;
        endedAt: z.ZodNumber;
        agentNames: z.ZodArray<z.ZodString, "many">;
        eventCount: z.ZodNumber;
        preview: z.ZodOptional<z.ZodObject<{
            entryFile: z.ZodOptional<z.ZodString>;
            projectDir: z.ZodOptional<z.ZodString>;
            previewCmd: z.ZodOptional<z.ZodString>;
            previewPort: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        }, {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        }>>;
        tokenUsage: z.ZodOptional<z.ZodObject<{
            inputTokens: z.ZodNumber;
            outputTokens: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            inputTokens: number;
            outputTokens: number;
        }, {
            inputTokens: number;
            outputTokens: number;
        }>>;
        ratings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }, {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "PROJECT_LIST";
    projects: {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }[];
}, {
    type: "PROJECT_LIST";
    projects: {
        name: string;
        id: string;
        startedAt: number;
        endedAt: number;
        agentNames: string[];
        eventCount: number;
        ratings?: Record<string, number> | undefined;
        tokenUsage?: {
            inputTokens: number;
            outputTokens: number;
        } | undefined;
        preview?: {
            previewCmd?: string | undefined;
            previewPort?: number | undefined;
            projectDir?: string | undefined;
            entryFile?: string | undefined;
        } | undefined;
    }[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"PROJECT_DATA">;
    projectId: z.ZodString;
    name: z.ZodString;
    startedAt: z.ZodNumber;
    endedAt: z.ZodNumber;
    events: z.ZodArray<z.ZodAny, "many">;
}, "strip", z.ZodTypeAny, {
    type: "PROJECT_DATA";
    name: string;
    projectId: string;
    startedAt: number;
    endedAt: number;
    events: any[];
}, {
    type: "PROJECT_DATA";
    name: string;
    projectId: string;
    startedAt: number;
    endedAt: number;
    events: any[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"PREVIEW_READY">;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "PREVIEW_READY";
    url: string;
}, {
    type: "PREVIEW_READY";
    url: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"FOLDER_PICKED">;
    requestId: z.ZodString;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "FOLDER_PICKED";
    requestId: string;
}, {
    path: string;
    type: "FOLDER_PICKED";
    requestId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"IMAGE_UPLOADED">;
    requestId: z.ZodString;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "IMAGE_UPLOADED";
    requestId: string;
}, {
    path: string;
    type: "IMAGE_UPLOADED";
    requestId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"BACKENDS_SYNC">;
    backends: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        color: z.ZodOptional<z.ZodString>;
        isInstalled: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }, {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    type: "BACKENDS_SYNC";
    backends: {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }[];
}, {
    type: "BACKENDS_SYNC";
    backends: {
        name: string;
        id: string;
        color?: string | undefined;
        isInstalled?: boolean | undefined;
    }[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"CONFIG_DATA">;
    config: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "CONFIG_DATA";
    config?: any;
}, {
    type: "CONFIG_DATA";
    config?: any;
}>, z.ZodObject<{
    type: z.ZodLiteral<"CONFIG_UPDATED">;
    config: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "CONFIG_UPDATED";
    config?: any;
}, {
    type: "CONFIG_UPDATED";
    config?: any;
}>, z.ZodObject<{
    type: z.ZodLiteral<"KEY_STATUS_DATA">;
    summary: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "KEY_STATUS_DATA";
    summary?: any;
}, {
    type: "KEY_STATUS_DATA";
    summary?: any;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TOOL_STARTED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    tool: z.ZodString;
    input: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "TOOL_STARTED";
    agentId: string;
    taskId: string;
    tool: string;
    input?: string | undefined;
}, {
    type: "TOOL_STARTED";
    agentId: string;
    taskId: string;
    tool: string;
    input?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TOOL_FINISHED">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    tool: z.ZodString;
    output: z.ZodOptional<z.ZodString>;
    success: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "TOOL_FINISHED";
    agentId: string;
    taskId: string;
    success: boolean;
    tool: string;
    output?: string | undefined;
}, {
    type: "TOOL_FINISHED";
    agentId: string;
    taskId: string;
    success: boolean;
    tool: string;
    output?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"META_THOUGHT">;
    agentId: z.ZodString;
    thought: z.ZodString;
    timestamp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    type: "META_THOUGHT";
    thought: string;
    agentId: string;
    timestamp: number;
}, {
    type: "META_THOUGHT";
    thought: string;
    agentId: string;
    timestamp: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"SWARM_HEALTH">;
    teamId: z.ZodString;
    score: z.ZodNumber;
    status: z.ZodEnum<["optimal", "stressed", "failing"]>;
    diagnostics: z.ZodArray<z.ZodString, "many">;
    recommendations: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    type: "SWARM_HEALTH";
    status: "optimal" | "stressed" | "failing";
    teamId: string;
    score: number;
    diagnostics: string[];
    recommendations: string[];
}, {
    type: "SWARM_HEALTH";
    status: "optimal" | "stressed" | "failing";
    teamId: string;
    score: number;
    diagnostics: string[];
    recommendations: string[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"SWARM_REASSEMBLY">;
    teamId: z.ZodString;
    newTeamName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "SWARM_REASSEMBLY";
    teamId: string;
    newTeamName: string;
}, {
    type: "SWARM_REASSEMBLY";
    teamId: string;
    newTeamName: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"KNOWLEDGE_SYNCED">;
    projectDir: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "KNOWLEDGE_SYNCED";
    projectDir: string;
    content: string;
}, {
    type: "KNOWLEDGE_SYNCED";
    projectDir: string;
    content: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"BATCH">;
    events: z.ZodArray<z.ZodAny, "many">;
}, "strip", z.ZodTypeAny, {
    type: "BATCH";
    events: any[];
}, {
    type: "BATCH";
    events: any[];
}>]>;
export type TokenUsage = z.infer<typeof TokenUsage>;
export type AgentStatusEvent = z.infer<typeof AgentStatusEvent>;
export type TaskStartedEvent = z.infer<typeof TaskStartedEvent>;
export type LogAppendEvent = z.infer<typeof LogAppendEvent>;
export type ApprovalNeededEvent = z.infer<typeof ApprovalNeededEvent>;
export type TaskResultPayload = z.infer<typeof TaskResultPayload>;
export type TaskDoneEvent = z.infer<typeof TaskDoneEvent>;
export type TaskFailedEvent = z.infer<typeof TaskFailedEvent>;
export type TaskDelegatedEvent = z.infer<typeof TaskDelegatedEvent>;
export type AgentCreatedEvent = z.infer<typeof AgentCreatedEvent>;
export type AgentFiredEvent = z.infer<typeof AgentFiredEvent>;
export type TaskResultReturnedEvent = z.infer<typeof TaskResultReturnedEvent>;
export type TeamChatEvent = z.infer<typeof TeamChatEvent>;
export type TaskQueuedEvent = z.infer<typeof TaskQueuedEvent>;
export type TokenUpdateEvent = z.infer<typeof TokenUpdateEvent>;
export type TeamPhaseEvent = z.infer<typeof TeamPhaseEvent>;
export type AgentDefsEvent = z.infer<typeof AgentDefsEvent>;
export type SuggestionEvent = z.infer<typeof SuggestionEvent>;
export type AgentsSyncEvent = z.infer<typeof AgentsSyncEvent>;
export type ProjectListEvent = z.infer<typeof ProjectListEvent>;
export type ProjectDataEvent = z.infer<typeof ProjectDataEvent>;
export type PreviewReadyEvent = z.infer<typeof PreviewReadyEvent>;
export type FolderPickedEvent = z.infer<typeof FolderPickedEvent>;
export type ImageUploadedEvent = z.infer<typeof ImageUploadedEvent>;
export type BackendsSyncEvent = z.infer<typeof BackendsSyncEvent>;
export type ConfigDataEvent = z.infer<typeof ConfigDataEvent>;
export type ConfigUpdatedEvent = z.infer<typeof ConfigUpdatedEvent>;
export type KeyStatusDataEvent = z.infer<typeof KeyStatusDataEvent>;
export type ToolStartedEvent = z.infer<typeof ToolStartedEvent>;
export type ToolFinishedEvent = z.infer<typeof ToolFinishedEvent>;
export type MetaThoughtEvent = z.infer<typeof MetaThoughtEvent>;
export type SwarmHealthEvent = z.infer<typeof SwarmHealthEvent>;
export type SwarmReassemblyEvent = z.infer<typeof SwarmReassemblyEvent>;
export type KnowledgeSyncedEvent = z.infer<typeof KnowledgeSyncedEvent>;
export type BatchEvent = z.infer<typeof BatchEvent>;
export type GatewayEvent = z.infer<typeof GatewayEventSchema>;
//# sourceMappingURL=events.d.ts.map