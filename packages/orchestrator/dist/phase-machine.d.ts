import type { TeamPhase } from "./types.js";
export interface TeamPhaseInfo {
    teamId: string;
    phase: TeamPhase;
    leadAgentId: string;
}
export declare class PhaseMachine {
    private teams;
    /**
     * Register a new team at a specific phase.
     * Called on CREATE_TEAM and on state restoration from disk.
     */
    setPhase(teamId: string, phase: TeamPhase, leadAgentId: string): TeamPhaseInfo;
    /**
     * Detect create → design transition from leader output.
     * Returns the new phase info if a transition occurred, null otherwise.
     */
    checkPlanDetected(leadAgentId: string, resultText: string): TeamPhaseInfo | null;
    /**
     * Explicit design → execute transition (user approved the plan).
     * Returns the new phase info, or null if no matching team found.
     */
    approvePlan(leadAgentId: string): TeamPhaseInfo | null;
    /**
     * Detect execute → complete transition from final result.
     * Returns the new phase info if a transition occurred, null otherwise.
     */
    checkFinalResult(leadAgentId: string): TeamPhaseInfo | null;
    /**
     * Handle user message in complete phase → transition back to execute.
     * Returns the resolved phase override, phase info, and whether a transition occurred.
     */
    handleUserMessage(leadAgentId: string): {
        phaseOverride: TeamPhase;
        phaseInfo: TeamPhaseInfo;
        transitioned: boolean;
    } | null;
    /**
     * Remove a team (FIRE_TEAM).
     */
    clear(teamId: string): void;
    /**
     * Remove all teams.
     */
    clearAll(): void;
    /**
     * Get the current phase for a leader agent.
     */
    getPhaseForLeader(leadAgentId: string): TeamPhaseInfo | undefined;
    /**
     * Get teamId for a leader agent.
     */
    getTeamIdForLeader(leadAgentId: string): string | undefined;
    /**
     * Whether the given leader is in a phase that allows delegation.
     */
    canDelegate(leadAgentId: string): boolean;
    /**
     * Get all team phase info (for state persistence/broadcasting).
     */
    getAllPhases(): TeamPhaseInfo[];
    /**
     * Check if any team exists.
     */
    hasTeams(): boolean;
    /**
     * Check if a specific teamId exists.
     */
    hasTeam(teamId: string): boolean;
}
//# sourceMappingURL=phase-machine.d.ts.map