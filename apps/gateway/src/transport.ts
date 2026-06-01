import type { GatewayEvent, Command, UserRole } from "@office/shared";



export interface CommandMeta {
  role: UserRole;
  clientId: string;
}

/**
 * Channel interface — every message channel implements this.
 * "activate if configured, skip if not"
 */
export interface Channel {
  /** Channel name for logging */
  readonly name: string;
  /** Initialize and connect. Return false to skip (e.g. missing config). */
  init(commandHandler: (cmd: Command, meta: CommandMeta) => void): Promise<boolean>;
  /** Broadcast an event to this channel's clients */
  broadcast(event: GatewayEvent): void;
  /** Cleanup on shutdown */
  destroy?(): void;
}

const channels: Channel[] = [];

/** Register a channel. Call before initTransports(). */
export function registerChannel(channel: Channel) {
  channels.push(channel);
}

/** Initialize all registered channels. Skips those that return false from init(). */
export async function initTransports(commandHandler: (cmd: Command, meta: CommandMeta) => void) {
  const active: string[] = [];
  const skipped: string[] = [];

  for (const ch of channels) {
    const ok = await ch.init(commandHandler);
    if (ok) {
      active.push(ch.name);
    } else {
      skipped.push(ch.name);
    }
  }

  // Remove channels that didn't activate
  for (let i = channels.length - 1; i >= 0; i--) {
    if (skipped.includes(channels[i].name)) {
      channels.splice(i, 1);
    }
  }

  console.log(`[Transport] Active channels: ${active.join(", ") || "none"}`);
  if (skipped.length) {
    console.log(`[Transport] Skipped channels: ${skipped.join(", ")}`);
  }
}

const BATCHABLE_TYPES = new Set([
  "LOG_APPEND",
  "AGENT_STATUS",
  "TOKEN_UPDATE",
  "TOOL_STARTED",
  "TOOL_FINISHED",
  "META_THOUGHT",
]);

let batchBuffer: GatewayEvent[] = [];
let batchTimer: NodeJS.Timeout | null = null;

function flushBatch() {
  if (batchBuffer.length === 0) return;
  
  const batchEvent: GatewayEvent = {
    type: "BATCH",
    events: [...batchBuffer],
  } as any;
  
  for (const ch of channels) {
    ch.broadcast(batchEvent);
  }
  
  batchBuffer = [];
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
}

/** Broadcast event to all active channels */
export function publishEvent(event: GatewayEvent) {
  if (BATCHABLE_TYPES.has(event.type)) {
    batchBuffer.push(event);
    if (batchBuffer.length >= 50) {
      flushBatch();
    } else if (!batchTimer) {
      batchTimer = setTimeout(flushBatch, 50);
    }
    return;
  }
  
  // Non-batchable (critical) events flush pending batch first to preserve order
  flushBatch();
  
  for (const ch of channels) {
    ch.broadcast(event);
  }
}



/** Destroy all channels on shutdown */
export function destroyTransports() {
  for (const ch of channels) {
    ch.destroy?.();
  }
}
