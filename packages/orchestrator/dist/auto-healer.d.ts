import type { AgentManager } from "./agent-manager.js";
import type { TaskFailedEvent } from "./types.js";
import type { AgentSession } from "./agent-session.js";
/**
 * AutoHealer listens to agent failures and attempts to resolve "knowledge gaps"
 * (e.g. missing components, unknown functions) by querying the knowledge graph.
 */
export declare class AutoHealer {
    private agentManager;
    private runTask;
    constructor(agentManager: AgentManager, runTask: (agentId: string, taskId: string, prompt: string) => void);
    /**
     * Analyze a task failure for potential knowledge gaps.
     * If a gap is detected (e.g. "ReferenceError: X is not defined"),
     * it triggers a research task or provides a hint for retry.
     */
    handleFailure(event: TaskFailedEvent, session: AgentSession): Promise<boolean>;
}
//# sourceMappingURL=auto-healer.d.ts.map