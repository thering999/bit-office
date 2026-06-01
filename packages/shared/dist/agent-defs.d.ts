export interface AgentDefinition {
    id: string;
    name: string;
    role: string;
    skills: string;
    personality: string;
    palette: number;
    isBuiltin: boolean;
    teamRole: "dev" | "reviewer" | "leader";
    avatarUrl?: string;
}
export declare const DEFAULT_AGENT_DEFS: AgentDefinition[];
//# sourceMappingURL=agent-defs.d.ts.map