import type { AIBackend } from "./ai-backend.js";
export interface SwarmSpec {
    teamName: string;
    leadPresetIndex: number;
    members: {
        name: string;
        role: string;
        personality: string;
        backendId?: string;
        palette: number;
    }[];
}
export declare class MetaAgent {
    private backends;
    private defaultBackendId;
    private onThought?;
    constructor(backends: Map<string, AIBackend>, defaultBackendId: string, onThought?: ((thought: string) => void) | undefined);
    analyzeAndAssemble(prompt: string, context?: string): Promise<SwarmSpec | null>;
    /**
     * Dynamically re-evaluates the swarm during a mission if progress is stalled or errors occur.
     */
    reevaluateSwarm(missionPrompt: string, status: string, agents: any[]): Promise<SwarmSpec | null>;
    private callArchitect;
}
//# sourceMappingURL=meta-agent.d.ts.map