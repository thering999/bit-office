export interface KnowledgeEntry {
    agentName: string;
    role: string;
    taskId: string;
    projectDir: string;
    summary: string;
    modules: string[];
    features: string[];
    timestamp: number;
}
export declare class KnowledgeManager {
    private baseDir;
    constructor();
    /**
     * Saves a structured summary of an agent's work for the project knowledge base.
     * This is designed to be consumed by NotebookLM or used as context for future tasks.
     */
    documentWork(entry: KnowledgeEntry): Promise<string>;
    /**
     * Retrieves all knowledge entries for a project to be used as context.
     */
    getProjectContext(projectDir: string): string;
}
export declare const knowledgeManager: KnowledgeManager;
//# sourceMappingURL=knowledge-manager.d.ts.map