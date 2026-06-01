/** Parsed result from agent output */
export interface ParsedResult {
    summary: string;
    fullOutput: string;
    changedFiles: string[];
    entryFile?: string;
    projectDir?: string;
    previewCmd?: string;
    previewPort?: number;
    modules?: string[];
    features?: string[];
}
/**
 * Parse agent stdout for structured result fields.
 * Falls back to a cleaned-up excerpt of the raw output for the summary.
 */
export declare function parseAgentOutput(raw: string, fallbackText?: string | null): ParsedResult;
//# sourceMappingURL=output-parser.d.ts.map