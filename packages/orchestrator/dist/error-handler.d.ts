/**
 * AI Swarm Error Handler
 * Translates technical errors into user-friendly Thai and provides actionable fixes.
 */
export interface ErrorSolution {
    title: string;
    description: string;
    action?: string;
}
export interface ErrorTranslation {
    message: string;
    suggestion: string;
    solutions: ErrorSolution[];
}
export declare class AgentErrorHandler {
    /**
     * Removes technical noise from the error string to make it cleaner for translation.
     */
    static clean(error: string): string;
    /**
     * Translates a technical error message into a user-friendly Thai explanation.
     */
    static translate(error: string, context?: {
        command?: string;
        agentId?: string;
    }): ErrorTranslation;
    /**
     * Formats the translation into a single user-friendly string.
     */
    static formatThai(error: string, context?: {
        command?: string;
        agentId?: string;
    }): string;
}
//# sourceMappingURL=error-handler.d.ts.map