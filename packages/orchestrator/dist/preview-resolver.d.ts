export interface PreviewInput {
    /** Structured ENTRY_FILE from agent output */
    entryFile?: string;
    /** Structured PREVIEW_CMD from agent output */
    previewCmd?: string;
    /** Structured PREVIEW_PORT from agent output */
    previewPort?: number;
    /** List of changed files reported by the agent */
    changedFiles?: string[];
    /** Raw stdout buffer (for regex-based URL/path extraction) */
    stdout?: string;
    /** Primary working directory for path resolution */
    cwd: string;
    /** Workspace root (fallback for path resolution) */
    workspace: string;
}
export interface PreviewResult {
    previewUrl: string | undefined;
    previewPath: string | undefined;
}
/**
 * Cascading preview resolution — resolve paths and metadata only.
 * Does NOT auto-start any server. The actual serving happens only when the
 * user clicks Preview, which sends a SERVE_PREVIEW command to the gateway.
 *
 * 1. PREVIEW_CMD with port → web app (deferred to SERVE_PREVIEW)
 * 2. PREVIEW_CMD without port → desktop/CLI app (deferred to user Launch)
 * 3. ENTRY_FILE (.html) → resolve path
 * 4. Explicit "PREVIEW: http://..." in stdout
 * 5. .html file path mentioned in stdout
 * 6. .html in changedFiles
 * 7. Build output candidates scan (dist/index.html, etc.)
 */
export declare function resolvePreview(input: PreviewInput): PreviewResult;
//# sourceMappingURL=preview-resolver.d.ts.map