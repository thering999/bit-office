import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Infrastructure Bus for Swarm Events
 * This handles communication between agents, gateway, and logging systems.
 */
export class SwarmBus extends EventEmitter {
  private logPath: string;

  constructor(logDir: string = '.bit-office/logs') {
    super();
    this.logPath = path.join(logDir, 'swarm-bus.log');
    this.ensureLogDir(logDir);
    this.setupAuditLogging();
  }

  private ensureLogDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private setupAuditLogging() {
    this.on('event', (event: any) => {
      const logEntry = JSON.stringify({
        timestamp: new Date().toISOString(),
        ...event
      }) + '\n';
      fs.appendFileSync(this.logPath, logEntry);
    });
  }

  /**
   * Emit a standardized swarm event
   */
  emitEvent(event: SwarmEvent) {
    this.emit('event', event);
    this.emit(event.type, event);
  }
}

export type SwarmEvent = 
  | { type: 'agent:started'; agentId: string; role: string }
  | { type: 'agent:task_started'; agentId: string; taskId: string; prompt: string }
  | { type: 'agent:task_done'; agentId: string; taskId: string; result: any }
  | { type: 'agent:error'; agentId: string; error: string; context?: any }
  | { type: 'system:boot'; version: string };

// Export singleton instance
export const bus = new SwarmBus();
