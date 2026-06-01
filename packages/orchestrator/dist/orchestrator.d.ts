import { EventEmitter } from "events";
import type { OrchestratorOptions, CreateAgentOpts, CreateTeamOpts, RunTaskOpts, OrchestratorEventMap, TeamPhase, Decision } from "./types.js";
export declare class Orchestrator extends EventEmitter<OrchestratorEventMap> {
    private agentManager;
    private delegationRouter;
    private promptEngine;
    private retryTracker;
    private phaseMachine;
    private backends;
    private defaultBackendId;
    private workspace;
    private sandboxMode;
    private worktreeEnabled;
    private worktreeMerge;
    /** Preview info captured from the first dev worker that produces one — not from QA/reviewer */
    private teamPreview;
    /** Accumulated changedFiles from all workers in the current team session */
    private teamChangedFiles;
    /** Guard against emitting isFinalResult more than once per execute cycle. */
    private teamFinalized;
    private vectorMemory;
    private visualPerception;
    private autoHealer;
    private reflectionEngine;
    private reflectingTasks;
    private metaAgent;
    private metaArchitect;
    private snapshotManager;
    private swarmDoctor;
    private metaSwarm;
    private teamId;
    private useVision;
    private briefingTimer;
    private onBackendFailure?;
    private onBackendCheck?;
    constructor(opts: OrchestratorOptions);
    createAgent(opts: CreateAgentOpts): void;
    removeAgent(agentId: string): void;
    setTeamLead(agentId: string): void;
    createTeam(opts: CreateTeamOpts): void;
    assembleAndCreateTeam(prompt: string): Promise<void>;
    /**
     * Orchestrates the dynamic re-assembly of the swarm based on Meta-Agent strategy.
     */
    private handleSwarmReassembly;
    runTask(agentId: string, opts: RunTaskOpts): Promise<void>;
    /**
     * Check if another solo agent (no teamId) is currently working in the same repoPath.
     */
    private hasSoloNeighbor;
    cancelTask(agentId: string): void;
    /**
     * Stop all team agents — cancel their tasks but keep them alive.
     * Safe to call before fireTeam, or to just pause work.
     */
    stopTeam(): void;
    /**
     * Fire the entire team — stop all work silently, then remove all agents.
     */
    fireTeam(): void;
    sendMessage(agentId: string, message: string): boolean;
    resolveApproval(approvalId: string, decision: Decision): void;
    getAgent(agentId: string): {
        agentId: string;
        name: string;
        role: string;
        status: "idle" | "thinking" | "coding" | "working" | "waiting_approval" | "done" | "error" | "searching" | "testing" | "documenting" | "debugging" | "walking_to_server";
        palette: number | undefined;
        backend: string;
        pid: number | null;
        teamId: string | undefined;
    } | undefined;
    getAllAgents(): {
        agentId: string;
        name: string;
        role: string;
        status: "idle" | "thinking" | "coding" | "working" | "waiting_approval" | "done" | "error" | "searching" | "testing" | "documenting" | "debugging" | "walking_to_server";
        palette: number | undefined;
        personality: string;
        backend: string;
        pid: number | null;
        isTeamLead: boolean;
        teamId: string | undefined;
    }[];
    getTeamRoster(): string;
    /** Return PIDs of all managed (gateway-spawned) agent processes */
    getManagedPids(): number[];
    isTeamLead(agentId: string): boolean;
    /** Get the leader's last full output (used to capture the approved plan). */
    getLeaderLastOutput(agentId: string): string | null;
    /** Set team-wide project directory — all delegations will use this as cwd. */
    setTeamProjectDir(dir: string | null): void;
    getTeamProjectDir(): string | null;
    /** Get the original task context for the leader (the approved plan). */
    getOriginalTask(agentId: string): string | null;
    /** Set the original task context for the leader (e.g. the approved plan). */
    setOriginalTask(agentId: string, task: string): void;
    /** Mark leader as having already executed (for restart recovery — uses leader-continue instead of leader-initial). */
    setHasExecuted(agentId: string, value: boolean): void;
    /** Clear team members' conversation history for a fresh project cycle. */
    clearLeaderHistory(agentId: string): void;
    /**
     * Set a team phase explicitly (for initialization and state restoration).
     * Emits a team:phase event.
     */
    setTeamPhase(teamId: string, phase: TeamPhase, leadAgentId: string): void;
    /**
     * Approve the plan — transitions design → execute, captures plan, creates project dir context.
     * Returns the team phase info, or null if no matching team.
     */
    approvePlan(leadAgentId: string): {
        teamId: string;
        phase: TeamPhase;
    } | null;
    /**
     * Get the phase override for a team lead when running a task.
     * Handles complete → execute transition automatically.
     */
    getPhaseOverrideForLeader(leadAgentId: string): TeamPhase | undefined;
    /**
     * Get current phase for a team leader.
     */
    getTeamPhase(leadAgentId: string): TeamPhase | undefined;
    /**
     * Get all team phase info (for state persistence/broadcasting).
     */
    getAllTeamPhases(): Array<{
        teamId: string;
        phase: TeamPhase;
        leadAgentId: string;
    }>;
    /**
     * Clear a specific team's phase (FIRE_TEAM).
     */
    clearTeamPhase(teamId: string): void;
    /**
     * Clear all team phases.
     */
    clearAllTeamPhases(): void;
    destroy(): void;
    runDoctor(): Promise<void>;
    private handleSessionEvent;
    private emitEvent;
    /**
     * Emergency rescue: Resets all agents, clears stuck sessions,
     * and potentially switches their backend to a stable default (Gemini).
     */
    rescueSwarm(): void;
    private startLoops;
    private startBriefingLoop;
    private broadcastBriefings;
    private consolidateKnowledge;
}
//# sourceMappingURL=orchestrator.d.ts.map