import type { AgentManager } from "./agent-manager.js";
import type { MetaAgent } from "./meta-agent.js";
import { EventEmitter } from "events";
export declare class MetaSwarm extends EventEmitter {
    private agentManager;
    private metaAgent;
    private teamId;
    private healthInterval;
    private isEvaluating;
    constructor(agentManager: AgentManager, metaAgent: MetaAgent, teamId: string);
    startMonitoring(): void;
    stopMonitoring(): void;
    checkHealth(): Promise<void>;
    triggerAutoReassembly(): Promise<void>;
}
//# sourceMappingURL=meta-swarm.d.ts.map