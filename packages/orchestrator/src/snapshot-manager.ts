import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * SnapshotManager handles workspace state backups and rollbacks.
 * Currently uses Git as the primary snapshot mechanism.
 */
export class SnapshotManager {
  constructor() {}

  /**
   * Create a snapshot of the current workspace state.
   * Returns a snapshot ID (e.g., git commit hash or stash name).
   */
  public async createSnapshot(targetPath: string, taskId: string): Promise<string | null> {
    try {
      if (!this.isGitRepo(targetPath)) return null;

      // Check if there are changes to snapshot
      const status = execSync('git status --porcelain', { cwd: targetPath }).toString();
      if (!status.trim()) return 'no_changes';

      // Use a temporary stash for the snapshot
      const snapshotName = `bit-office-snapshot-${taskId}-${Date.now()}`;
      execSync(`git stash push -u -m "${snapshotName}"`, { cwd: targetPath });
      
      // Apply the stash back so the agent can work on top of it, 
      // but we now have it in the stash list for rollback.
      execSync('git stash apply stash@{0}', { cwd: targetPath });

      return snapshotName;
    } catch (error) {
      console.error(`[SnapshotManager] Failed to create snapshot in ${targetPath}:`, error);
      return null;
    }
  }

  /**
   * Roll back the workspace to a previously created snapshot.
   */
  public async rollback(targetPath: string, snapshotName: string): Promise<boolean> {
    try {
      if (!this.isGitRepo(targetPath)) return false;
      if (snapshotName === 'no_changes') {
        // Just clean up any new untracked files
        execSync('git clean -fd', { cwd: targetPath });
        execSync('git checkout .', { cwd: targetPath });
        return true;
      }

      // Find the stash index
      const stashList = execSync('git stash list', { cwd: targetPath }).toString();
      const lines = stashList.split('\n');
      const stashIndex = lines.findIndex(line => line.includes(snapshotName));

      if (stashIndex === -1) {
        console.warn(`[SnapshotManager] Snapshot ${snapshotName} not found in stash list for ${targetPath}.`);
        return false;
      }

      // Hard reset to clear current work
      execSync('git reset --hard HEAD', { cwd: targetPath });
      execSync('git clean -fd', { cwd: targetPath });

      // Pop the stash to restore
      execSync(`git stash pop stash@{${stashIndex}}`, { cwd: targetPath });
      
      return true;
    } catch (error) {
      console.error(`[SnapshotManager] Failed to rollback in ${targetPath}:`, error);
      return false;
    }
  }

  private isGitRepo(targetPath: string): boolean {
    return fs.existsSync(path.join(targetPath, '.git')) || fs.existsSync(path.join(targetPath, '.git-dir')) || fs.existsSync(path.join(targetPath, '..', '.git'));
  }
}
