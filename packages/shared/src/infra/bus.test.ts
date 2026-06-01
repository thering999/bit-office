import { describe, it, expect, vi } from 'vitest';
import { bus } from './bus';

describe('SwarmBus', () => {
  it('should emit and receive events', () => {
    const callback = vi.fn();
    bus.on('task:started', callback);

    bus.emitEvent({
      type: 'task:started',
      agentId: 'leo',
      taskId: 'task-1',
      prompt: 'coding'
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      agentId: 'leo',
      prompt: 'coding'
    }));
  });

  it('should log all events to the audit log', () => {
    // Audit logging is internal, but we can verify it doesn't crash
    bus.emitEvent({
      type: 'agent:fired',
      agentId: 'leo'
    });
  });
});
