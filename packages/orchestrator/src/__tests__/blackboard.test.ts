import { describe, it, expect, beforeEach } from 'vitest';
import { MissionBlackboard } from '../blackboard.js';

describe('MissionBlackboard', () => {
  let board: MissionBlackboard;
  beforeEach(() => { board = new MissionBlackboard(); });

  it('posts task entry and returns id', () => {
    const id = board.post({ type: 'task', content: 'fix auth', author: 'Dev', status: 'in-progress' });
    expect(board.getEntries()).toHaveLength(1);
    expect(board.getEntries()[0].id).toBe(id);
  });

  it('getStateSummary includes all entry types', () => {
    board.post({ type: 'task', content: 'task1', author: 'A', status: 'in-progress' });
    board.post({ type: 'insight', content: 'found bug', author: 'B', status: 'completed' });
    board.post({ type: 'blocker', content: 'no key', author: 'C', status: 'pending' });
    const s = board.getStateSummary();
    expect(s).toContain('task1');
    expect(s).toContain('found bug');
    expect(s).toContain('no key');
  });

  it('updateStatus changes entry status', () => {
    const id = board.post({ type: 'blocker', content: 'x', author: 'X', status: 'pending' });
    board.updateStatus(id, 'completed');
    expect(board.getEntries()[0].status).toBe('completed');
  });

  it('updateStatus with content updates content', () => {
    const id = board.post({ type: 'task', content: 'old', author: 'Dev', status: 'pending' });
    board.updateStatus(id, 'completed', 'new content');
    expect(board.getEntries()[0].content).toBe('new content');
  });

  it('emits blackboard:updated on post', () => {
    let fired = false;
    board.on('blackboard:updated', () => { fired = true; });
    board.post({ type: 'insight', content: 'y', author: 'Y', status: 'completed' });
    expect(fired).toBe(true);
  });

  it('emits blackboard:updated on updateStatus', () => {
    const id = board.post({ type: 'task', content: 'z', author: 'Z', status: 'pending' });
    let count = 0;
    board.on('blackboard:updated', () => count++);
    board.updateStatus(id, 'completed');
    expect(count).toBe(1);
  });

  it('clear empties entries', () => {
    board.post({ type: 'task', content: 'a', author: 'A', status: 'in-progress' });
    board.clear();
    expect(board.getEntries()).toHaveLength(0);
  });

  it('completed blockers excluded from summary', () => {
    board.post({ type: 'blocker', content: 'resolved', author: 'A', status: 'completed' });
    const s = board.getStateSummary();
    expect(s).not.toContain('resolved');
  });
});
