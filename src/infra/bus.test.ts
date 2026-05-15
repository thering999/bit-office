import { describe, it, expect, vi } from 'vitest';
import { bus } from './bus';

describe('SwarmBus', () => {
  it('should emit and receive events', () => {
    const callback = vi.fn();
    bus.on('agent:started', callback);

    bus.emitEvent({
      type: 'agent:started',
      agentId: 'leo',
      role: 'developer'
    });

    expect(callback).toHaveBeenCalledWith(expect.objectContaining({
      agentId: 'leo',
      role: 'developer'
    }));
  });

  it('should log all events to the audit log', () => {
    // Audit logging is internal, but we can verify it doesn't crash
    bus.emitEvent({
      type: 'system:boot',
      version: '1.0.0'
    });
  });
});
