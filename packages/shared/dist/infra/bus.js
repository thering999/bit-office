import { EventEmitter } from "node:events";
/**
 * Global Infrastructure Bus for Swarm Events
 * This handles communication between agents, gateway, and logging systems.
 * It is isomorphic (runs in browser and Node.js).
 */
export class SwarmBus extends EventEmitter {
    static instance;
    logPath;
    isNode;
    anyListeners = [];
    logBuffer = [];
    flushTimer = null;
    FLUSH_INTERVAL_MS = 1000;
    MAX_BUFFER_SIZE = 100;
    constructor() {
        super();
        // Check if we are in a Node.js environment
        this.isNode = typeof process !== "undefined" &&
            process.versions != null &&
            process.versions.node != null;
        if (this.isNode) {
            try {
                const nodePath = require("node:path");
                this.logPath = nodePath.join(process.cwd(), "swarm-audit.log");
                // Start flush timer
                this.flushTimer = setInterval(() => this.flushLogs(), this.FLUSH_INTERVAL_MS);
                // Ensure logs are flushed on exit
                process.on("beforeExit", () => this.flushLogs());
            }
            catch (e) {
                // Silent fail
            }
        }
    }
    static getInstance() {
        if (!SwarmBus.instance) {
            SwarmBus.instance = new SwarmBus();
        }
        return SwarmBus.instance;
    }
    flushLogs() {
        if (!this.isNode || !this.logPath || this.logBuffer.length === 0)
            return;
        try {
            const nodeFs = require("node:fs");
            const content = this.logBuffer.join("");
            this.logBuffer = [];
            nodeFs.appendFileSync(this.logPath, content);
        }
        catch (err) {
            // Silent fail
        }
    }
    /**
     * Register a listener for all events
     */
    onAny(listener) {
        this.anyListeners.push(listener);
    }
    /**
     * Emit a standardized swarm event
     */
    async emitEvent(event) {
        // 1. Audit Log (Filesystem - Node only)
        if (this.isNode && this.logPath) {
            const logLine = `${new Date().toISOString()} [${event.type}] ${JSON.stringify(event)}\n`;
            this.logBuffer.push(logLine);
            if (this.logBuffer.length >= this.MAX_BUFFER_SIZE) {
                this.flushLogs();
            }
        }
        // 2. Emit through EventEmitter
        this.emit(event.type, event);
        // 3. Emit to any-listeners
        for (const listener of this.anyListeners) {
            try {
                listener(event);
            }
            catch (e) {
                console.error("[SwarmBus] Error in onAny listener:", e);
            }
        }
    }
}
// Export singleton instance
export const bus = SwarmBus.getInstance();
//# sourceMappingURL=bus.js.map