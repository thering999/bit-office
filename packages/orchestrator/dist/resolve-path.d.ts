/**
 * Resolve an agent-reported file path against disk reality.
 * Agents report paths unpredictably — sometimes relative to workspace root,
 * sometimes relative to projectDir, sometimes just a filename, sometimes hallucinated.
 * This function tries multiple strategies and returns the first that exists on disk.
 */
export declare function resolveAgentPath(filePath: string, projectDir: string, workspace: string): string | undefined;
//# sourceMappingURL=resolve-path.d.ts.map