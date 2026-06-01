import { z } from "zod";
export declare const RunTaskCommand: z.ZodObject<{
    type: z.ZodLiteral<"RUN_TASK">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
    repoPath: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
    teamId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "RUN_TASK";
    agentId: string;
    taskId: string;
    prompt: string;
    repoPath?: string | undefined;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
}, {
    type: "RUN_TASK";
    agentId: string;
    taskId: string;
    prompt: string;
    repoPath?: string | undefined;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
}>;
export declare const ApprovalDecisionCommand: z.ZodObject<{
    type: z.ZodLiteral<"APPROVAL_DECISION">;
    approvalId: z.ZodString;
    decision: z.ZodEnum<["yes", "no"]>;
}, "strip", z.ZodTypeAny, {
    type: "APPROVAL_DECISION";
    approvalId: string;
    decision: "yes" | "no";
}, {
    type: "APPROVAL_DECISION";
    approvalId: string;
    decision: "yes" | "no";
}>;
export declare const CancelTaskCommand: z.ZodObject<{
    type: z.ZodLiteral<"CANCEL_TASK">;
    agentId: z.ZodString;
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "CANCEL_TASK";
    agentId: string;
    taskId: string;
}, {
    type: "CANCEL_TASK";
    agentId: string;
    taskId: string;
}>;
export declare const PingCommand: z.ZodObject<{
    type: z.ZodLiteral<"PING">;
}, "strip", z.ZodTypeAny, {
    type: "PING";
}, {
    type: "PING";
}>;
export declare const CreateAgentCommand: z.ZodObject<{
    type: z.ZodLiteral<"CREATE_AGENT">;
    agentId: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    palette: z.ZodOptional<z.ZodNumber>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
    teamId: z.ZodOptional<z.ZodString>;
    workDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "CREATE_AGENT";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
}, {
    type: "CREATE_AGENT";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
}>;
export declare const FireAgentCommand: z.ZodObject<{
    type: z.ZodLiteral<"FIRE_AGENT">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "FIRE_AGENT";
    agentId: string;
}, {
    type: "FIRE_AGENT";
    agentId: string;
}>;
export declare const OpenFileCommand: z.ZodObject<{
    type: z.ZodLiteral<"OPEN_FILE">;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "OPEN_FILE";
}, {
    path: string;
    type: "OPEN_FILE";
}>;
export declare const CreateTeamCommand: z.ZodObject<{
    type: z.ZodLiteral<"CREATE_TEAM">;
    leadId: z.ZodString;
    memberIds: z.ZodArray<z.ZodString, "many">;
    backends: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    workDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "CREATE_TEAM";
    leadId: string;
    memberIds: string[];
    workDir?: string | undefined;
    backends?: Record<string, string> | undefined;
}, {
    type: "CREATE_TEAM";
    leadId: string;
    memberIds: string[];
    workDir?: string | undefined;
    backends?: Record<string, string> | undefined;
}>;
export declare const ServePreviewCommand: z.ZodObject<{
    type: z.ZodLiteral<"SERVE_PREVIEW">;
    filePath: z.ZodOptional<z.ZodString>;
    previewCmd: z.ZodOptional<z.ZodString>;
    previewPort: z.ZodOptional<z.ZodNumber>;
    cwd: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SERVE_PREVIEW";
    filePath?: string | undefined;
    previewCmd?: string | undefined;
    previewPort?: number | undefined;
    cwd?: string | undefined;
}, {
    type: "SERVE_PREVIEW";
    filePath?: string | undefined;
    previewCmd?: string | undefined;
    previewPort?: number | undefined;
    cwd?: string | undefined;
}>;
export declare const StopTeamCommand: z.ZodObject<{
    type: z.ZodLiteral<"STOP_TEAM">;
}, "strip", z.ZodTypeAny, {
    type: "STOP_TEAM";
}, {
    type: "STOP_TEAM";
}>;
export declare const FireTeamCommand: z.ZodObject<{
    type: z.ZodLiteral<"FIRE_TEAM">;
}, "strip", z.ZodTypeAny, {
    type: "FIRE_TEAM";
}, {
    type: "FIRE_TEAM";
}>;
export declare const KillExternalCommand: z.ZodObject<{
    type: z.ZodLiteral<"KILL_EXTERNAL">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "KILL_EXTERNAL";
    agentId: string;
}, {
    type: "KILL_EXTERNAL";
    agentId: string;
}>;
export declare const ApprovePlanCommand: z.ZodObject<{
    type: z.ZodLiteral<"APPROVE_PLAN">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "APPROVE_PLAN";
    agentId: string;
}, {
    type: "APPROVE_PLAN";
    agentId: string;
}>;
export declare const EndProjectCommand: z.ZodObject<{
    type: z.ZodLiteral<"END_PROJECT">;
    agentId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "END_PROJECT";
    agentId: string;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
}, {
    type: "END_PROJECT";
    agentId: string;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
}>;
export declare const SaveAgentDefCommand: z.ZodObject<{
    type: z.ZodLiteral<"SAVE_AGENT_DEF">;
    agent: z.ZodObject<{
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
    }>;
}, "strip", z.ZodTypeAny, {
    type: "SAVE_AGENT_DEF";
    agent: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    };
}, {
    type: "SAVE_AGENT_DEF";
    agent: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    };
}>;
export declare const DeleteAgentDefCommand: z.ZodObject<{
    type: z.ZodLiteral<"DELETE_AGENT_DEF">;
    agentDefId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "DELETE_AGENT_DEF";
    agentDefId: string;
}, {
    type: "DELETE_AGENT_DEF";
    agentDefId: string;
}>;
export declare const PickFolderCommand: z.ZodObject<{
    type: z.ZodLiteral<"PICK_FOLDER">;
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "PICK_FOLDER";
    requestId: string;
}, {
    type: "PICK_FOLDER";
    requestId: string;
}>;
export declare const UploadImageCommand: z.ZodObject<{
    type: z.ZodLiteral<"UPLOAD_IMAGE">;
    requestId: z.ZodString;
    /** base64-encoded image data (without data: prefix) */
    data: z.ZodString;
    /** Original filename or generated name */
    filename: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "UPLOAD_IMAGE";
    requestId: string;
    data: string;
    filename: string;
}, {
    type: "UPLOAD_IMAGE";
    requestId: string;
    data: string;
    filename: string;
}>;
export declare const SuggestCommand: z.ZodObject<{
    type: z.ZodLiteral<"SUGGEST">;
    text: z.ZodString;
    author: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SUGGEST";
    text: string;
    author?: string | undefined;
}, {
    type: "SUGGEST";
    text: string;
    author?: string | undefined;
}>;
export declare const RateProjectCommand: z.ZodObject<{
    type: z.ZodLiteral<"RATE_PROJECT">;
    projectId: z.ZodOptional<z.ZodString>;
    ratings: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "RATE_PROJECT";
    ratings: Record<string, number>;
    projectId?: string | undefined;
}, {
    type: "RATE_PROJECT";
    ratings: Record<string, number>;
    projectId?: string | undefined;
}>;
export declare const ListProjectsCommand: z.ZodObject<{
    type: z.ZodLiteral<"LIST_PROJECTS">;
}, "strip", z.ZodTypeAny, {
    type: "LIST_PROJECTS";
}, {
    type: "LIST_PROJECTS";
}>;
export declare const LoadProjectCommand: z.ZodObject<{
    type: z.ZodLiteral<"LOAD_PROJECT">;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "LOAD_PROJECT";
    projectId: string;
}, {
    type: "LOAD_PROJECT";
    projectId: string;
}>;
export declare const GetConfigCommand: z.ZodObject<{
    type: z.ZodLiteral<"GET_CONFIG">;
}, "strip", z.ZodTypeAny, {
    type: "GET_CONFIG";
}, {
    type: "GET_CONFIG";
}>;
export declare const GetKeyStatusCommand: z.ZodObject<{
    type: z.ZodLiteral<"GET_KEY_STATUS">;
}, "strip", z.ZodTypeAny, {
    type: "GET_KEY_STATUS";
}, {
    type: "GET_KEY_STATUS";
}>;
export declare const AssembleSwarmCommand: z.ZodObject<{
    type: z.ZodLiteral<"ASSEMBLE_SWARM">;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "ASSEMBLE_SWARM";
    prompt: string;
}, {
    type: "ASSEMBLE_SWARM";
    prompt: string;
}>;
export declare const RunDoctorCommand: z.ZodObject<{
    type: z.ZodLiteral<"RUN_DOCTOR">;
}, "strip", z.ZodTypeAny, {
    type: "RUN_DOCTOR";
}, {
    type: "RUN_DOCTOR";
}>;
export declare const UpdateConfigCommand: z.ZodObject<{
    type: z.ZodLiteral<"UPDATE_CONFIG">;
    config: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "UPDATE_CONFIG";
    config?: any;
}, {
    type: "UPDATE_CONFIG";
    config?: any;
}>;
export declare const RescueSwarmCommand: z.ZodObject<{
    type: z.ZodLiteral<"RESCUE_SWARM">;
}, "strip", z.ZodTypeAny, {
    type: "RESCUE_SWARM";
}, {
    type: "RESCUE_SWARM";
}>;
export declare const SyncKnowledgeCommand: z.ZodObject<{
    type: z.ZodLiteral<"SYNC_KNOWLEDGE">;
    projectDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SYNC_KNOWLEDGE";
    projectDir?: string | undefined;
}, {
    type: "SYNC_KNOWLEDGE";
    projectDir?: string | undefined;
}>;
export declare const CommandSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"RUN_TASK">;
    agentId: z.ZodString;
    taskId: z.ZodString;
    prompt: z.ZodString;
    repoPath: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
    teamId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "RUN_TASK";
    agentId: string;
    taskId: string;
    prompt: string;
    repoPath?: string | undefined;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
}, {
    type: "RUN_TASK";
    agentId: string;
    taskId: string;
    prompt: string;
    repoPath?: string | undefined;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"APPROVAL_DECISION">;
    approvalId: z.ZodString;
    decision: z.ZodEnum<["yes", "no"]>;
}, "strip", z.ZodTypeAny, {
    type: "APPROVAL_DECISION";
    approvalId: string;
    decision: "yes" | "no";
}, {
    type: "APPROVAL_DECISION";
    approvalId: string;
    decision: "yes" | "no";
}>, z.ZodObject<{
    type: z.ZodLiteral<"CANCEL_TASK">;
    agentId: z.ZodString;
    taskId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "CANCEL_TASK";
    agentId: string;
    taskId: string;
}, {
    type: "CANCEL_TASK";
    agentId: string;
    taskId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"PING">;
}, "strip", z.ZodTypeAny, {
    type: "PING";
}, {
    type: "PING";
}>, z.ZodObject<{
    type: z.ZodLiteral<"CREATE_AGENT">;
    agentId: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
    palette: z.ZodOptional<z.ZodNumber>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
    teamId: z.ZodOptional<z.ZodString>;
    workDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "CREATE_AGENT";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
}, {
    type: "CREATE_AGENT";
    agentId: string;
    name: string;
    role: string;
    personality?: string | undefined;
    backend?: string | undefined;
    teamId?: string | undefined;
    palette?: number | undefined;
    workDir?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"FIRE_AGENT">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "FIRE_AGENT";
    agentId: string;
}, {
    type: "FIRE_AGENT";
    agentId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"OPEN_FILE">;
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "OPEN_FILE";
}, {
    path: string;
    type: "OPEN_FILE";
}>, z.ZodObject<{
    type: z.ZodLiteral<"CREATE_TEAM">;
    leadId: z.ZodString;
    memberIds: z.ZodArray<z.ZodString, "many">;
    backends: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    workDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "CREATE_TEAM";
    leadId: string;
    memberIds: string[];
    workDir?: string | undefined;
    backends?: Record<string, string> | undefined;
}, {
    type: "CREATE_TEAM";
    leadId: string;
    memberIds: string[];
    workDir?: string | undefined;
    backends?: Record<string, string> | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"SERVE_PREVIEW">;
    filePath: z.ZodOptional<z.ZodString>;
    previewCmd: z.ZodOptional<z.ZodString>;
    previewPort: z.ZodOptional<z.ZodNumber>;
    cwd: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SERVE_PREVIEW";
    filePath?: string | undefined;
    previewCmd?: string | undefined;
    previewPort?: number | undefined;
    cwd?: string | undefined;
}, {
    type: "SERVE_PREVIEW";
    filePath?: string | undefined;
    previewCmd?: string | undefined;
    previewPort?: number | undefined;
    cwd?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"STOP_TEAM">;
}, "strip", z.ZodTypeAny, {
    type: "STOP_TEAM";
}, {
    type: "STOP_TEAM";
}>, z.ZodObject<{
    type: z.ZodLiteral<"FIRE_TEAM">;
}, "strip", z.ZodTypeAny, {
    type: "FIRE_TEAM";
}, {
    type: "FIRE_TEAM";
}>, z.ZodObject<{
    type: z.ZodLiteral<"KILL_EXTERNAL">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "KILL_EXTERNAL";
    agentId: string;
}, {
    type: "KILL_EXTERNAL";
    agentId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"APPROVE_PLAN">;
    agentId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "APPROVE_PLAN";
    agentId: string;
}, {
    type: "APPROVE_PLAN";
    agentId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"END_PROJECT">;
    agentId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    personality: z.ZodOptional<z.ZodString>;
    backend: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "END_PROJECT";
    agentId: string;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
}, {
    type: "END_PROJECT";
    agentId: string;
    name?: string | undefined;
    role?: string | undefined;
    personality?: string | undefined;
    backend?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"SAVE_AGENT_DEF">;
    agent: z.ZodObject<{
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
    }>;
}, "strip", z.ZodTypeAny, {
    type: "SAVE_AGENT_DEF";
    agent: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    };
}, {
    type: "SAVE_AGENT_DEF";
    agent: {
        name: string;
        role: string;
        personality: string;
        palette: number;
        id: string;
        skills: string;
        isBuiltin: boolean;
        teamRole: "dev" | "reviewer" | "leader";
        avatarUrl?: string | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"DELETE_AGENT_DEF">;
    agentDefId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "DELETE_AGENT_DEF";
    agentDefId: string;
}, {
    type: "DELETE_AGENT_DEF";
    agentDefId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"PICK_FOLDER">;
    requestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "PICK_FOLDER";
    requestId: string;
}, {
    type: "PICK_FOLDER";
    requestId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"UPLOAD_IMAGE">;
    requestId: z.ZodString;
    /** base64-encoded image data (without data: prefix) */
    data: z.ZodString;
    /** Original filename or generated name */
    filename: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "UPLOAD_IMAGE";
    requestId: string;
    data: string;
    filename: string;
}, {
    type: "UPLOAD_IMAGE";
    requestId: string;
    data: string;
    filename: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"SUGGEST">;
    text: z.ZodString;
    author: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SUGGEST";
    text: string;
    author?: string | undefined;
}, {
    type: "SUGGEST";
    text: string;
    author?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"RATE_PROJECT">;
    projectId: z.ZodOptional<z.ZodString>;
    ratings: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "RATE_PROJECT";
    ratings: Record<string, number>;
    projectId?: string | undefined;
}, {
    type: "RATE_PROJECT";
    ratings: Record<string, number>;
    projectId?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"LIST_PROJECTS">;
}, "strip", z.ZodTypeAny, {
    type: "LIST_PROJECTS";
}, {
    type: "LIST_PROJECTS";
}>, z.ZodObject<{
    type: z.ZodLiteral<"LOAD_PROJECT">;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "LOAD_PROJECT";
    projectId: string;
}, {
    type: "LOAD_PROJECT";
    projectId: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"GET_CONFIG">;
}, "strip", z.ZodTypeAny, {
    type: "GET_CONFIG";
}, {
    type: "GET_CONFIG";
}>, z.ZodObject<{
    type: z.ZodLiteral<"GET_KEY_STATUS">;
}, "strip", z.ZodTypeAny, {
    type: "GET_KEY_STATUS";
}, {
    type: "GET_KEY_STATUS";
}>, z.ZodObject<{
    type: z.ZodLiteral<"UPDATE_CONFIG">;
    config: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    type: "UPDATE_CONFIG";
    config?: any;
}, {
    type: "UPDATE_CONFIG";
    config?: any;
}>, z.ZodObject<{
    type: z.ZodLiteral<"ASSEMBLE_SWARM">;
    prompt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "ASSEMBLE_SWARM";
    prompt: string;
}, {
    type: "ASSEMBLE_SWARM";
    prompt: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"RUN_DOCTOR">;
}, "strip", z.ZodTypeAny, {
    type: "RUN_DOCTOR";
}, {
    type: "RUN_DOCTOR";
}>, z.ZodObject<{
    type: z.ZodLiteral<"RESCUE_SWARM">;
}, "strip", z.ZodTypeAny, {
    type: "RESCUE_SWARM";
}, {
    type: "RESCUE_SWARM";
}>, z.ZodObject<{
    type: z.ZodLiteral<"SYNC_KNOWLEDGE">;
    projectDir: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "SYNC_KNOWLEDGE";
    projectDir?: string | undefined;
}, {
    type: "SYNC_KNOWLEDGE";
    projectDir?: string | undefined;
}>]>;
export type RunTaskCommand = z.infer<typeof RunTaskCommand>;
export type ApprovalDecisionCommand = z.infer<typeof ApprovalDecisionCommand>;
export type CancelTaskCommand = z.infer<typeof CancelTaskCommand>;
export type PingCommand = z.infer<typeof PingCommand>;
export type CreateAgentCommand = z.infer<typeof CreateAgentCommand>;
export type FireAgentCommand = z.infer<typeof FireAgentCommand>;
export type OpenFileCommand = z.infer<typeof OpenFileCommand>;
export type CreateTeamCommand = z.infer<typeof CreateTeamCommand>;
export type ServePreviewCommand = z.infer<typeof ServePreviewCommand>;
export type StopTeamCommand = z.infer<typeof StopTeamCommand>;
export type FireTeamCommand = z.infer<typeof FireTeamCommand>;
export type KillExternalCommand = z.infer<typeof KillExternalCommand>;
export type ApprovePlanCommand = z.infer<typeof ApprovePlanCommand>;
export type EndProjectCommand = z.infer<typeof EndProjectCommand>;
export type SaveAgentDefCommand = z.infer<typeof SaveAgentDefCommand>;
export type DeleteAgentDefCommand = z.infer<typeof DeleteAgentDefCommand>;
export type PickFolderCommand = z.infer<typeof PickFolderCommand>;
export type UploadImageCommand = z.infer<typeof UploadImageCommand>;
export type SuggestCommand = z.infer<typeof SuggestCommand>;
export type RateProjectCommand = z.infer<typeof RateProjectCommand>;
export type ListProjectsCommand = z.infer<typeof ListProjectsCommand>;
export type LoadProjectCommand = z.infer<typeof LoadProjectCommand>;
export type GetConfigCommand = z.infer<typeof GetConfigCommand>;
export type GetKeyStatusCommand = z.infer<typeof GetKeyStatusCommand>;
export type UpdateConfigCommand = z.infer<typeof UpdateConfigCommand>;
export type AssembleSwarmCommand = z.infer<typeof AssembleSwarmCommand>;
export type RunDoctorCommand = z.infer<typeof RunDoctorCommand>;
export type RescueSwarmCommand = z.infer<typeof RescueSwarmCommand>;
export type SyncKnowledgeCommand = z.infer<typeof SyncKnowledgeCommand>;
export type Command = z.infer<typeof CommandSchema>;
//# sourceMappingURL=commands.d.ts.map