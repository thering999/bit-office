export interface ReviewPattern {
    /** The issue pattern (e.g. "missing error handling") */
    pattern: string;
    /** How many times this was flagged by reviewers */
    count: number;
    /** Last seen timestamp */
    lastSeen: number;
}
export interface ProjectRecord {
    /** Short description of what was built */
    summary: string;
    /** Tech stack used */
    tech: string;
    /** Timestamp */
    completedAt: number;
    /** Whether the project passed review */
    reviewPassed: boolean;
    /** User ratings (e.g. creativity, visual, interaction) — added post-completion */
    ratings?: Record<string, number>;
}
interface MemoryStore {
    reviewPatterns: ReviewPattern[];
    techPreferences: string[];
    projectHistory: ProjectRecord[];
}
/**
 * Record review patterns from a reviewer's FAIL verdict.
 * Extracts individual issues and tracks their frequency.
 */
export declare function recordReviewFeedback(reviewOutput: string): void;
/**
 * Record a completed project for history.
 */
export declare function recordProjectCompletion(summary: string, tech: string, reviewPassed: boolean): void;
/**
 * Record tech preference (extracted from approved plan's TECH line).
 */
export declare function recordTechPreference(tech: string): void;
/**
 * Update the most recent project record with user ratings.
 * Called when user rates a project after preview.
 */
export declare function recordProjectRatings(ratings: Record<string, number>): void;
/**
 * Get memory context to inject into agent prompts.
 * Returns a formatted string, or empty string if no relevant memory.
 */
export declare function getMemoryContext(): string;
/**
 * Get full memory store (for debugging/inspection).
 */
export declare function getMemoryStore(): MemoryStore;
/**
 * Clear all memory (for testing or reset).
 */
export declare function clearMemory(): void;
export {};
//# sourceMappingURL=memory.d.ts.map