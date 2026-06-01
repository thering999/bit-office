import type { AgentSession } from "./agent-session.js";
export declare class AgentManager {
    private agents;
    private _teamLeadId;
    private _chatLog;
    pushChat(from: string, message: string, type: string): void;
    getChatLog(): string;
    setTeamLead(id: string | null): void;
    getTeamLead(): string | null;
    isTeamLead(id: string): boolean;
    getTeamRoster(): string;
    getTeamMembers(): Array<{
        name: string;
        role: string;
        status: string;
        isLead: boolean;
        lastResult: string | null;
    }>;
    add(session: AgentSession): void;
    delete(agentId: string): boolean;
    get(agentId: string): AgentSession | undefined;
    getAll(): AgentSession[];
    findByName(name: string): AgentSession | undefined;
    /**
     * Emergency rescue: Resets all agents, clears stuck sessions,
     * and potentially switches their backend to a stable default (Gemini).
     */
    rescueAll(stableBackendId: string): void;
}
//# sourceMappingURL=agent-manager.d.ts.map