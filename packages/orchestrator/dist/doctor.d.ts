export interface DiagnosticResult {
    category: string;
    status: "ok" | "warn" | "error";
    message: string;
    fix?: string;
}
/**
 * Swarm Doctor: Diagnoses common AI agent and infrastructure issues.
 */
export declare class SwarmDoctor {
    private workspace;
    constructor(workspace: string);
    diagnose(): Promise<DiagnosticResult[]>;
    private checkBackendScripts;
    private checkMcpHealth;
    private checkGitLock;
    private checkZombieProcesses;
    private checkToolAccessibility;
    private checkDockerHealth;
    private checkAIConnectivity;
}
//# sourceMappingURL=doctor.d.ts.map