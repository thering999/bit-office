// ReflectionEngine — autonomous self-evaluation for swarm task results.
export class ReflectionEngine {
    maxFixRounds = 3;
    /**
     * Decide if this task result should trigger a self-healing reflection pass.
     */
    shouldReflect(session, result) {
        // Don't reflect if already at max fix rounds
        const fixRound = session.getFixRound?.() ?? 0;
        if (fixRound >= this.maxFixRounds)
            return false;
        return true;
    }
    /**
     * Analyze the result of a task to determine if it meets quality standards.
     */
    async reflect(session, result) {
        const output = (result.fullOutput ?? result.summary ?? "").toLowerCase();
        const isError = /error|failed|exception|not found|undefined is not/.test(output);
        const isEmpty = output.trim().length < 50;
        const testFailed = result.testResult === "failed";
        if (testFailed) {
            return {
                passed: false,
                score: 0.3,
                critique: "Test suite failed. Automated QA detected failures.",
                needsFix: true,
                needsQA: "test",
                suggestedTaskId: `reflect_${Date.now()}`,
                suggestedPrompt: "The previous implementation caused test failures. Please review the failing tests and fix the root causes."
            };
        }
        if (isError) {
            return {
                passed: false,
                score: 0.2,
                critique: "The output contains technical error patterns or stack traces.",
                needsFix: true,
                needsQA: "lint",
                suggestedTaskId: `reflect_${Date.now()}`,
                suggestedPrompt: `The previous attempt failed with an error. Please fix the following issue: ${output.slice(0, 500)}`
            };
        }
        if (isEmpty) {
            return {
                passed: false,
                score: 0.1,
                critique: "The output is too short and likely incomplete.",
                needsFix: true,
                needsQA: null,
                suggestedTaskId: `reflect_${Date.now()}`,
                suggestedPrompt: "The previous output was too brief. Please provide a more complete implementation."
            };
        }
        return {
            passed: true,
            score: 0.9,
            critique: "Output looks stable and relevant.",
            needsFix: false,
            needsQA: null,
            suggestedTaskId: null,
        };
    }
    /**
     * Generates a self-healing task prompt if reflection failed.
     */
    createHealingTask(originalPrompt, result) {
        return `[SELF-HEALING ROUND]
Original Goal: ${originalPrompt}
Critique: ${result.critique}
Instruction: ${result.suggestedPrompt || "Please review your previous work and fix the issues identified."}`;
    }
}
export const reflectionEngine = new ReflectionEngine();
//# sourceMappingURL=reflection-engine.js.map