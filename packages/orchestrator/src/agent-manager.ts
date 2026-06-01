import type { AgentSession } from "./agent-session.js";

export class AgentManager {
  private agents = new Map<string, AgentSession>();
  private _teamLeadId: string | null = null;
  private _chatLog: Array<{ from: string; message: string; type: string; timestamp: number }> = [];

  pushChat(from: string, message: string, type: string) {
    this._chatLog.push({ from, message, type, timestamp: Date.now() });
    if (this._chatLog.length > 15) this._chatLog.shift();
  }

  getChatLog(): string {
    if (this._chatLog.length === 0) return "No recent team activity.";
    return this._chatLog.map(c => `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.from} (${c.type}): ${c.message}`).join("\n");
  }

  setTeamLead(id: string | null) {
    this._teamLeadId = id;
  }

  getTeamLead(): string | null {
    return this._teamLeadId;
  }

  isTeamLead(id: string): boolean {
    return this._teamLeadId === id;
  }

  getTeamRoster(): string {
    const lines: string[] = [];
    for (const session of this.agents.values()) {
      // Only list agents that belong to a team (skip orphan/solo agents)
      if (!session.teamId && !this.isTeamLead(session.agentId)) continue;
      const lead = this.isTeamLead(session.agentId) ? " (Team Lead)" : "";
      const raw = session.lastResult ?? "";
      const result = raw ? ` — ${raw.length > 100 ? raw.slice(0, 100) + "…" : raw}` : "";
      lines.push(`- ${session.name} (${session.role}) [${session.status}]${lead}${result}`);
    }
    return lines.join("\n");
  }

  getTeamMembers(): Array<{ name: string; role: string; status: string; isLead: boolean; lastResult: string | null }> {
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

  add(session: AgentSession): void {
    const existing = this.agents.get(session.agentId);
    if (existing) {
      existing.destroy();
    }
    this.agents.set(session.agentId, session);
  }

  delete(agentId: string): boolean {
    const session = this.agents.get(agentId);
    if (!session) return false;
    session.destroy();
    this.agents.delete(agentId);
    return true;
  }

  get(agentId: string): AgentSession | undefined {
    return this.agents.get(agentId);
  }

  getAll(): AgentSession[] {
    return Array.from(this.agents.values());
  }

  findByName(name: string): AgentSession | undefined {
    const lower = name.toLowerCase();
    // Prefer agents that belong to the current team
    let fallback: AgentSession | undefined;
    for (const session of this.agents.values()) {
      if (session.name.toLowerCase() === lower) {
        if (session.teamId || this.isTeamLead(session.agentId)) return session;
        if (!fallback) fallback = session;
      }
    }
    return fallback;
  }

  /**
   * Emergency rescue: Resets all agents, clears stuck sessions, 
   * and potentially switches their backend to a stable default (Gemini).
   */
  rescueAll(stableBackendId: string): void {
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
