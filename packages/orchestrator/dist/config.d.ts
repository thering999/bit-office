export declare const CONFIG: {
    readonly delegation: {
        /** Maximum delegation chain depth (user → lead → dev → reviewer → ...) */
        readonly maxDepth: 5;
        /** Maximum total delegations per team session */
        readonly maxTotal: 20;
        /** Maximum leader invocation rounds (after receiving results) */
        readonly budgetRounds: 7;
        /** Force-complete after this many leader rounds (safety ceiling) */
        readonly hardCeilingRounds: 10;
        /** Maximum code review iterations before accepting as-is */
        readonly maxReviewRounds: 3;
        /** Maximum direct fix attempts (reviewer → dev) before escalating to leader */
        readonly maxDirectFixes: 1;
    };
    readonly timing: {
        /** Wait for straggler workers before flushing partial results to leader (ms) */
        readonly resultBatchWindowMs: 20000;
        /** Leader task timeout — delegation planning only, no tools (ms) */
        readonly leaderTimeoutMs: number;
        /** Worker task timeout — real coding with full tool access (ms) */
        readonly workerTimeoutMs: number;
        /** Delay before setting agent status back to idle after task completion (ms) */
        readonly idleDoneDelayMs: 5000;
        /** Delay before setting agent status back to idle after task failure (ms) */
        readonly idleErrorDelayMs: 3000;
        /** Delay before dequeuing next task (ms) */
        readonly dequeueDelayMs: 100;
        /** Delay before retrying a failed task (ms) */
        readonly retryDelayMs: 500;
        /** Inactivity timeout — no output for this long means it's stuck (ms) */
        readonly inactivityTimeoutMs: number;
    };
    readonly limits: {
        /** Max chars for team chat messages (results, delegations, completions) */
        readonly chatMessageChars: 2000;
        /** Max chars for activity intent (short activity feed summaries) */
        readonly intentChars: 500;
        /** Max lines / chars for fallback summary when no SUMMARY field is found */
        readonly fallbackSummaryLines: 20;
        readonly fallbackSummaryChars: 2000;
    };
    readonly preview: {
        /** Port for static file serving (npx serve) */
        readonly staticPort: 9100;
        /** Common build output directories to scan for index.html */
        readonly buildOutputCandidates: readonly ["dist/index.html", "build/index.html", "out/index.html", "index.html", "public/index.html"];
        /** File extension → runner command mapping for auto-constructing previewCmd */
        readonly runners: Record<string, string>;
    };
    readonly memory: {
        /** Enable vector memory (Qdrant) — requires QDRANT_HOST/PORT */
        readonly enabled: true;
        /** After this many consecutive connection failures, skip vector ops for this session */
        readonly consecutiveFailsThreshold: 5;
    };
};
//# sourceMappingURL=config.d.ts.map