import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DelegationRouter } from '../delegation.js';
import type { AgentManager } from '../agent-manager.js';
import type { PromptEngine } from '../prompt-templates.js';
import type { OrchestratorEvent } from '../types.js';

function makeRouter(emitEvent = vi.fn()) {
  const agentManager = {
    findByName: vi.fn().mockReturnValue(null),
    get: vi.fn().mockReturnValue(null),
    getAll: vi.fn().mockReturnValue([]),
  } as unknown as AgentManager;

  const promptEngine = {
    render: vi.fn().mockImplementation((_tpl: string, vars: any) => vars.prompt ?? ''),
  } as unknown as PromptEngine;

  const router = new DelegationRouter(agentManager, promptEngine, emitEvent, false, true);
  return { router, agentManager, promptEngine, emitEvent };
}

describe('DelegationRouter', () => {
  describe('initial state', () => {
    it('isDelegated returns false for unknown taskId', () => {
      const { router } = makeRouter();
      expect(router.isDelegated('nonexistent')).toBe(false);
    });

    it('isResultTask returns false for unknown taskId', () => {
      const { router } = makeRouter();
      expect(router.isResultTask('nonexistent')).toBe(false);
    });

    it('hasPendingFrom returns false with no tasks', () => {
      const { router } = makeRouter();
      expect(router.hasPendingFrom('agent-1')).toBe(false);
    });

    it('getTeamProjectDir returns null initially', () => {
      const { router } = makeRouter();
      expect(router.getTeamProjectDir()).toBeNull();
    });

    it('isBudgetExhausted returns false initially', () => {
      const { router } = makeRouter();
      expect(router.isBudgetExhausted()).toBe(false);
    });
  });

  describe('setTeamProjectDir', () => {
    it('stores and retrieves project dir', () => {
      const { router } = makeRouter();
      router.setTeamProjectDir('/workspace/project');
      expect(router.getTeamProjectDir()).toBe('/workspace/project');
    });

    it('can clear project dir with null', () => {
      const { router } = makeRouter();
      router.setTeamProjectDir('/workspace/project');
      router.setTeamProjectDir(null);
      expect(router.getTeamProjectDir()).toBeNull();
    });
  });

  describe('stop()', () => {
    it('stop does not throw', () => {
      const { router } = makeRouter();
      expect(() => router.stop()).not.toThrow();
    });
  });

  describe('clearAgent()', () => {
    it('clearAgent on unknown agent does not throw', () => {
      const { router } = makeRouter();
      expect(() => router.clearAgent('agent-unknown')).not.toThrow();
    });
  });

  describe('clearAll()', () => {
    it('resets all state', () => {
      const { router } = makeRouter();
      router.setTeamProjectDir('/some/dir');
      router.clearAll();
      expect(router.getTeamProjectDir()).toBeNull();
      expect(router.isBudgetExhausted()).toBe(false);
      expect(router.hasPendingFrom('any')).toBe(false);
      expect(router.isDelegated('any')).toBe(false);
    });

    it('can be called multiple times safely', () => {
      const { router } = makeRouter();
      expect(() => { router.clearAll(); router.clearAll(); }).not.toThrow();
    });
  });

  describe('wireDelegation via onDelegation', () => {
    it('blocked when stopped — no delegation emitted', () => {
      const emit = vi.fn();
      const { router, agentManager } = makeRouter(emit);

      const session = {
        agentId: 'lead-1',
        name: 'Leader',
        role: 'Team Lead',
        onDelegation: null as any,
        onTaskComplete: null as any,
      } as any;

      router.wireAgent(session);
      router.stop();

      // Trigger delegation after stop
      session.onDelegation?.('lead-1', 'Dev', 'build feature');

      // agentManager.findByName should not have been called (stopped early)
      expect((agentManager.findByName as any).mock.calls.length).toBe(0);
    });

    it('blocked when target agent not found', () => {
      const emit = vi.fn();
      const { router, agentManager } = makeRouter(emit);

      (agentManager.findByName as any).mockReturnValue(null);

      const session = { agentId: 'lead-1', name: 'Leader', role: 'Lead', onDelegation: null } as any;
      router.wireAgent(session);

      // Should not throw, just log and return
      expect(() => session.onDelegation?.('lead-1', 'NoAgent', 'do work')).not.toThrow();
    });
  });

  describe('resultTaskDidNotDelegate', () => {
    it('returns false for unknown taskId', () => {
      const { router } = makeRouter();
      expect(router.resultTaskDidNotDelegate('unknown')).toBe(false);
    });
  });
});
