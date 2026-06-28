import { describe, it, expect, beforeEach } from 'vitest';
import { PhaseMachine } from '../phase-machine.js';

describe('PhaseMachine', () => {
  let pm: PhaseMachine;

  beforeEach(() => { pm = new PhaseMachine(); });

  it('returns undefined for unknown leader', () => {
    expect(pm.getPhaseForLeader('nonexistent')).toBeUndefined();
  });

  it('setPhase registers team at given phase', () => {
    pm.setPhase('team-1', 'create', 'lead-1');
    const info = pm.getPhaseForLeader('lead-1');
    expect(info?.phase).toBe('create');
    expect(info?.teamId).toBe('team-1');
    expect(info?.leadAgentId).toBe('lead-1');
  });

  it('hasTeams / hasTeam reflect registration', () => {
    expect(pm.hasTeams()).toBe(false);
    pm.setPhase('team-1', 'create', 'lead-1');
    expect(pm.hasTeams()).toBe(true);
    expect(pm.hasTeam('team-1')).toBe(true);
    expect(pm.hasTeam('team-999')).toBe(false);
  });

  it('checkPlanDetected: no-op when no [PLAN] tag', () => {
    pm.setPhase('team-1', 'create', 'lead-1');
    const result = pm.checkPlanDetected('lead-1', 'just some output');
    expect(result).toBeNull();
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('create');
  });

  it('checkPlanDetected: create → design when [PLAN] in output', () => {
    pm.setPhase('team-1', 'create', 'lead-1');
    const result = pm.checkPlanDetected('lead-1', 'here is [PLAN] the plan');
    expect(result?.phase).toBe('design');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('design');
  });

  it('checkPlanDetected: no-op when already past create', () => {
    pm.setPhase('team-1', 'design', 'lead-1');
    const result = pm.checkPlanDetected('lead-1', '[PLAN]');
    expect(result).toBeNull();
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('design');
  });

  it('approvePlan: transitions to execute from any phase', () => {
    pm.setPhase('team-1', 'design', 'lead-1');
    const result = pm.approvePlan('lead-1');
    expect(result?.phase).toBe('execute');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('execute');
  });

  it('approvePlan: returns null for unknown leader', () => {
    expect(pm.approvePlan('nobody')).toBeNull();
  });

  it('canDelegate: false when not in execute', () => {
    pm.setPhase('team-1', 'create', 'lead-1');
    expect(pm.canDelegate('lead-1')).toBe(false);
  });

  it('canDelegate: true only in execute phase', () => {
    pm.setPhase('team-1', 'execute', 'lead-1');
    expect(pm.canDelegate('lead-1')).toBe(true);
  });

  it('checkFinalResult: execute → complete', () => {
    pm.setPhase('team-1', 'execute', 'lead-1');
    const result = pm.checkFinalResult('lead-1');
    expect(result?.phase).toBe('complete');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('complete');
  });

  it('checkFinalResult: no-op when not in execute', () => {
    pm.setPhase('team-1', 'design', 'lead-1');
    expect(pm.checkFinalResult('lead-1')).toBeNull();
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('design');
  });

  it('handleUserMessage: complete → execute (transitioned=true)', () => {
    pm.setPhase('team-1', 'complete', 'lead-1');
    const result = pm.handleUserMessage('lead-1');
    expect(result?.transitioned).toBe(true);
    expect(result?.phaseOverride).toBe('execute');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('execute');
  });

  it('handleUserMessage: non-complete returns current phase without transition', () => {
    pm.setPhase('team-1', 'execute', 'lead-1');
    const result = pm.handleUserMessage('lead-1');
    expect(result?.transitioned).toBe(false);
    expect(result?.phaseOverride).toBe('execute');
  });

  it('handleUserMessage: returns null for unknown leader', () => {
    expect(pm.handleUserMessage('nobody')).toBeNull();
  });

  it('multiple teams maintain independent phases', () => {
    pm.setPhase('team-A', 'create', 'lead-A');
    pm.setPhase('team-B', 'execute', 'lead-B');
    pm.checkPlanDetected('lead-A', '[PLAN] ready');
    expect(pm.getPhaseForLeader('lead-A')?.phase).toBe('design');
    expect(pm.getPhaseForLeader('lead-B')?.phase).toBe('execute');
  });

  it('getAllPhases returns all registered teams', () => {
    pm.setPhase('team-A', 'create', 'lead-A');
    pm.setPhase('team-B', 'execute', 'lead-B');
    const all = pm.getAllPhases();
    expect(all).toHaveLength(2);
    expect(all.map(p => p.teamId).sort()).toEqual(['team-A', 'team-B']);
  });

  it('clear removes specific team', () => {
    pm.setPhase('team-A', 'create', 'lead-A');
    pm.setPhase('team-B', 'execute', 'lead-B');
    pm.clear('team-A');
    expect(pm.getPhaseForLeader('lead-A')).toBeUndefined();
    expect(pm.getPhaseForLeader('lead-B')?.phase).toBe('execute');
  });

  it('clearAll removes all teams', () => {
    pm.setPhase('team-A', 'create', 'lead-A');
    pm.setPhase('team-B', 'execute', 'lead-B');
    pm.clearAll();
    expect(pm.hasTeams()).toBe(false);
    expect(pm.getAllPhases()).toHaveLength(0);
  });

  it('full phase lifecycle: create → design → execute → complete → execute', () => {
    pm.setPhase('team-1', 'create', 'lead-1');
    pm.checkPlanDetected('lead-1', 'output with [PLAN]');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('design');
    pm.approvePlan('lead-1');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('execute');
    pm.checkFinalResult('lead-1');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('complete');
    pm.handleUserMessage('lead-1');
    expect(pm.getPhaseForLeader('lead-1')?.phase).toBe('execute');
  });
});
