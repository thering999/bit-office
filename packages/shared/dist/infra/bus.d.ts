import { EventEmitter } from "node:events";
import type { OrchestratorEvent } from "../orchestrator-types";
/**
 * Global Infrastructure Bus for Swarm Events
 * This handles communication between agents, gateway, and logging systems.
 * It is isomorphic (runs in browser and Node.js).
 */
export declare class SwarmBus extends EventEmitter {
    private static instance;
    private logPath?;
    private isNode;
    private anyListeners;
    private logBuffer;
    private flushTimer;
    private readonly FLUSH_INTERVAL_MS;
    private readonly MAX_BUFFER_SIZE;
    private constructor();
    static getInstance(): SwarmBus;
    private flushLogs;
    /**
     * Register a listener for all events
     */
    onAny(listener: (event: any) => void): void;
    /**
     * Emit a standardized swarm event
     */
    emitEvent(event: OrchestratorEvent): Promise<void>;
}
export declare const bus: SwarmBus;
//# sourceMappingURL=bus.d.ts.map