export interface RetryState {
    taskId: string;
    originalPrompt: string;
    attempt: number;
    maxRetries: number;
    errors: string[];
}
export declare class RetryTracker {
    private state;
    private maxRetries;
    private escalateToLeader;
    constructor(maxRetries?: number, escalateToLeader?: boolean);
    /**
     * Initialize tracking for a task. Call before first attempt.
     */
    track(taskId: string, originalPrompt: string): void;
    /**
     * Check if the task has retries remaining.
     */
    shouldRetry(taskId: string): boolean;
    /**
     * Record a failed attempt. Returns the updated state.
     */
    recordAttempt(taskId: string, error: string): RetryState | undefined;
    /**
     * Get the original prompt for retrying (with error context appended).
     */
    getRetryPrompt(taskId: string): string | null;
    /**
     * Get escalation prompt for the team lead (when all retries exhausted).
     * Returns null if escalation is disabled or task not tracked.
     */
    getEscalation(taskId: string): {
        prompt: string;
    } | null;
    /**
     * Remove tracking for a completed/cancelled task.
     */
    clear(taskId: string): void;
}
//# sourceMappingURL=retry.d.ts.map