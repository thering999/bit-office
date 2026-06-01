import type { TaskResultPayload } from "./types.js";
/** Preview info captured from dev workers — ground truth */
export interface TeamPreview {
    previewUrl?: string;
    previewPath?: string;
    entryFile?: string;
    previewCmd?: string;
    previewPort?: number;
}
/** Context needed for finalization */
export interface FinalizeContext {
    /** Result payload from the leader's task completion (will be mutated) */
    result: TaskResultPayload;
    /** Preview captured from dev workers (ground truth, preferred over leader's) */
    teamPreview: TeamPreview | null;
    /** Accumulated changedFiles from all workers */
    teamChangedFiles: Set<string>;
    /** Team project directory (from delegation router) */
    projectDir: string | null;
    /** Workspace root */
    workspace: string;
    /** Callback to detect preview from a specific worker agent */
    detectWorkerPreview: () => {
        previewUrl: string | undefined;
        previewPath: string | undefined;
    } | null;
}
/**
 * Finalize a team leader's result — enrich with team-level data and resolve preview.
 * Mutates `ctx.result` in place.
 */
export declare function finalizeTeamResult(ctx: FinalizeContext): void;
//# sourceMappingURL=result-finalizer.d.ts.map