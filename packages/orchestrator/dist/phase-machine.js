// ---------------------------------------------------------------------------
// PhaseMachine — manages team collaboration phase transitions.
//
// Phases: CREATE → DESIGN → EXECUTE → COMPLETE → (loop back to EXECUTE)
//
// Transitions:
//   create  → design:   Leader output contains [PLAN] tag
//   design  → execute:  Explicit approvePlan() call (user approval)
//   execute → complete: isFinalResult on task:done from leader
//   complete → execute: User sends new message (feedback loop)
// ---------------------------------------------------------------------------
export class PhaseMachine {
    teams = new Map();
    // ---------------------------------------------------------------------------
    // Mutations
    // ---------------------------------------------------------------------------
    /**
     * Register a new team at a specific phase.
     * Called on CREATE_TEAM and on state restoration from disk.
     */
    setPhase(teamId, phase, leadAgentId) {
        const info = { teamId, phase, leadAgentId };
        this.teams.set(teamId, info);
        return info;
    }
    /**
     * Detect create → design transition from leader output.
     * Returns the new phase info if a transition occurred, null otherwise.
     */
    checkPlanDetected(leadAgentId, resultText) {
        if (!/\[PLAN\]/i.test(resultText))
            return null;
        for (const [teamId, info] of this.teams) {
            if (info.leadAgentId === leadAgentId && info.phase === "create") {
                info.phase = "design";
                console.log(`[PhaseMachine] ${teamId}: create → design (plan detected)`);
                return { ...info };
            }
        }
        return null;
    }
    /**
     * Explicit design → execute transition (user approved the plan).
     * Returns the new phase info, or null if no matching team found.
     */
    approvePlan(leadAgentId) {
        for (const [teamId, info] of this.teams) {
            if (info.leadAgentId === leadAgentId) {
                info.phase = "execute";
                console.log(`[PhaseMachine] ${teamId}: ${info.phase} → execute (plan approved)`);
                return { ...info };
            }
        }
        return null;
    }
    /**
     * Detect execute → complete transition from final result.
     * Returns the new phase info if a transition occurred, null otherwise.
     */
    checkFinalResult(leadAgentId) {
        for (const [teamId, info] of this.teams) {
            if (info.leadAgentId === leadAgentId && info.phase === "execute") {
                info.phase = "complete";
                console.log(`[PhaseMachine] ${teamId}: execute → complete (final result)`);
                return { ...info };
            }
        }
        return null;
    }
    /**
     * Handle user message in complete phase → transition back to execute.
     * Returns the resolved phase override, phase info, and whether a transition occurred.
     */
    handleUserMessage(leadAgentId) {
        for (const [teamId, info] of this.teams) {
            if (info.leadAgentId === leadAgentId) {
                if (info.phase === "complete") {
                    info.phase = "execute";
                    console.log(`[PhaseMachine] ${teamId}: complete → execute (user feedback)`);
                    return { phaseOverride: "execute", phaseInfo: { ...info }, transitioned: true };
                }
                return { phaseOverride: info.phase, phaseInfo: { ...info }, transitioned: false };
            }
        }
        return null;
    }
    /**
     * Remove a team (FIRE_TEAM).
     */
    clear(teamId) {
        this.teams.delete(teamId);
    }
    /**
     * Remove all teams.
     */
    clearAll() {
        this.teams.clear();
    }
    // ---------------------------------------------------------------------------
    // Queries
    // ---------------------------------------------------------------------------
    /**
     * Get the current phase for a leader agent.
     */
    getPhaseForLeader(leadAgentId) {
        for (const info of this.teams.values()) {
            if (info.leadAgentId === leadAgentId)
                return { ...info };
        }
        return undefined;
    }
    /**
     * Get teamId for a leader agent.
     */
    getTeamIdForLeader(leadAgentId) {
        for (const [teamId, info] of this.teams) {
            if (info.leadAgentId === leadAgentId)
                return teamId;
        }
        return undefined;
    }
    /**
     * Whether the given leader is in a phase that allows delegation.
     */
    canDelegate(leadAgentId) {
        const info = this.getPhaseForLeader(leadAgentId);
        return info?.phase === "execute";
    }
    /**
     * Get all team phase info (for state persistence/broadcasting).
     */
    getAllPhases() {
        return Array.from(this.teams.values()).map(info => ({ ...info }));
    }
    /**
     * Check if any team exists.
     */
    hasTeams() {
        return this.teams.size > 0;
    }
    /**
     * Check if a specific teamId exists.
     */
    hasTeam(teamId) {
        return this.teams.has(teamId);
    }
}
//# sourceMappingURL=phase-machine.js.map