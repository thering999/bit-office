export interface MemoryEntry {
    id?: string;
    text: string;
    metadata: Record<string, any>;
    embedding?: number[];
}
export interface KnowledgeInsight {
    id: string;
    title: string;
    content: string;
    tags: string[];
}
export declare class VectorMemory {
    private client;
    private collectionName;
    private apiKey;
    private geminiKey;
    constructor();
    init(): Promise<void>;
    addEntry(text: string, metadata: Record<string, any>): Promise<void>;
    search(query: string, limit?: number, filter?: any, crossProject?: boolean): Promise<{
        text: any;
        metadata: Record<string, unknown> | {
            [key: string]: unknown;
        } | null | undefined;
        score: number;
    }[]>;
    private getEmbedding;
    getRecallContext(query: string, limit?: number): Promise<string>;
    getOmniContext(query: string, limit?: number): Promise<string>;
    /**
     * Provides a combined memory context for injection into agent prompts.
     * Merges project-local recalls, cross-project Omni-Insights, and successful swarm experiences.
     */
    getEnhancedMemoryContext(query: string): Promise<string>;
    getSwarmExperienceContext(query: string, limit?: number): Promise<string>;
    /**
     * Prune consolidated entries older than a given threshold (ms).
     * Keeps the vector DB lean and relevant for future queries.
     */
    pruneOldEntries(maxAgeMs?: number): Promise<number>;
    getUnconsolidatedEntries(limit?: number): Promise<{
        id: string | number;
        text: any;
        metadata: Record<string, unknown> | {
            [key: string]: unknown;
        } | null | undefined;
    }[]>;
    markAsConsolidated(ids: (string | number)[]): Promise<void>;
    summarize(text: string, systemPrompt: string): Promise<string>;
    addExperience(agentId: string, taskId: string, prompt: string, output: string, success: boolean): Promise<void>;
    consolidate(): Promise<KnowledgeInsight[]>;
}
export declare const vectorMemory: VectorMemory;
//# sourceMappingURL=vector-memory.d.ts.map