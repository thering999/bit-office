/**
 * Global preview server — one at a time.
 * Supports two modes:
 *   1. Static file serving (npx serve) for HTML/CSS/JS and framework build output
 *   2. Command execution (python app.py, node server.js) for dynamic apps
 *
 * Port allocation is fully controlled by this server — agent-specified ports
 * are always overridden to prevent conflicts with the host system.
 */
declare class PreviewServer {
    private process;
    private currentDir;
    private isDetached;
    /**
     * Mode 1: Serve a static file directory on a fixed port.
     * Returns the preview URL for the given file.
     */
    serve(filePath: string): string | undefined;
    /**
     * Mode 2: Run a command (e.g. "python app.py") and use a controlled port.
     * The agent-specified port is ALWAYS replaced with COMMAND_PORT to prevent
     * conflicts with the host system (e.g. Next.js on 3000).
     * Returns the preview URL.
     */
    runCommand(cmd: string, cwd: string, agentPort: number): string | undefined;
    /**
     * Mode 3: Launch a desktop/CLI process (no web preview URL).
     * Used for Pygame, Tkinter, Electron, terminal apps, etc.
     * NOT detached — GUI apps need the login session to access WindowServer (macOS).
     */
    launchProcess(cmd: string, cwd: string): void;
    /** Kill the current process and any orphan process on managed ports */
    stop(): void;
    /** Kill whatever process is listening on the given port (best-effort). */
    private killPortHolder;
}
/** Singleton instance */
export declare const previewServer: PreviewServer;
export {};
//# sourceMappingURL=preview-server.d.ts.map