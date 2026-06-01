export interface ReflectionResult {
    passed: boolean;
    score: number;
    critique: string;
    needsFix: boolean;
    needsQA?: "lint" | "test" | "both" | null;
    suggestedTaskId?: string | null;
    suggestedPrompt?: string;
}
export interface AgentSessionLike {
    name: string;
    getFixRound?(): number;
}
export interface TaskResultLike {
    summary?: string;
    fullOutput?: string;
    testResult?: "passed" | "failed" | "unknown";
}
export declare class ReflectionEngine {
    private maxFixRounds;
    /**
     * Decide if this task result should trigger a self-healing reflection pass.
     */
    shouldReflect(session: AgentSessionLike, result: TaskResultLike): boolean;
    /**
     * Analyze the result of a task to determine if it meets quality standards.
     */
    reflect(session: AgentSessionLike, result: TaskResultLike): Promise<ReflectionResult>;
    /**
     * Generates a self-healing task prompt if reflection failed.
     */
    createHealingTask(originalPrompt: string, result: ReflectionResult): string;
}
export declare const reflectionEngine: ReflectionEngine;
//# sourceMappingURL=reflection-engine.d.ts.map