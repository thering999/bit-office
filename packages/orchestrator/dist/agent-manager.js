export class AgentManager {
    agents = new Map();
    _teamLeadId = null;
    _chatLog = [];
    pushChat(from, message, type) {
        this._chatLog.push({ from, message, type, timestamp: Date.now() });
        if (this._chatLog.length > 15)
            this._chatLog.shift();
    }
    getChatLog() {
        if (this._chatLog.length === 0)
            return "No recent team activity.";
        return this._chatLog.map(c => `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.from} (${c.type}): ${c.message}`).join("\n");
    }
    setTeamLead(id) {
        this._teamLeadId = id;
    }
    getTeamLead() {
        return this._teamLeadId;
    }
    isTeamLead(id) {
        return this._teamLeadId === id;
    }
    getTeamRoster() {
        const lines = [];
        for (const session of this.agents.values()) {
            // Only list agents that belong to a team (skip orphan/solo agents)
            if (!session.teamId && !this.isTeamLead(session.agentId))
                continue;
            const lead = this.isTeamLead(session.agentId) ? " (Team Lead)" : "";
            const raw = session.lastResult ?? "";
            const result = raw ? ` — ${raw.length > 100 ? raw.slice(0, 100) + "…" : raw}` : "";
            lines.push(`- ${session.name} (${session.role}) [${session.status}]${lead}${result}`);
        }
        return lines.join("\n");
    }
    getTeamMembers() {
        return Array.from(this.agents.values())
            .filter(s => s.teamId || this.isTeamLead(s.agentId))
            .map(s => ({
            name: s.name,
            role: s.role,
            status: s.status,
            isLead: this.isTeamLead(s.agentId),
            lastResult: s.lastResult,
        }));
    }
    add(session) {
        const existing = this.agents.get(session.agentId);
        if (existing) {
            existing.destroy();
        }
        this.agents.set(session.agentId, session);
    }
    delete(agentId) {
        const session = this.agents.get(agentId);
        if (!session)
            return false;
        session.destroy();
        this.agents.delete(agentId);
        return true;
    }
    get(agentId) {
        return this.agents.get(agentId);
    }
    getAll() {
        return Array.from(this.agents.values());
    }
    findByName(name) {
        const lower = name.toLowerCase();
        // Prefer agents that belong to the current team
        let fallback;
        for (const session of this.agents.values()) {
            if (session.name.toLowerCase() === lower) {
                if (session.teamId || this.isTeamLead(session.agentId))
                    return session;
                if (!fallback)
                    fallback = session;
            }
        }
        return fallback;
    }
    /**
     * Emergency rescue: Resets all agents, clears stuck sessions,
     * and potentially switches their backend to a stable default (Gemini).
     */
    rescueAll(stableBackendId) {
        console.log(`[AgentManager] EMERGENCY RESCUE: Resetting all agents to ${stableBackendId}...`);
        for (const session of this.agents.values()) {
            session.destroy(); // Kill process
            session.clearHistory(); // Clear history
            // We don't have direct access to private backend field, but we can clear it
            // so it uses the orchestrator's default next time it starts.
            session.setStatus("idle");
        }
    }
}
//# sourceMappingURL=agent-manager.js.map