/**
 * Create a git worktree for an agent's task.
 * Returns the worktree path, or null if workspace is not a git repo.
 */
export declare function createWorktree(workspace: string, agentId: string, taskId: string, agentName: string): string | null;
export interface MergeResult {
    success: boolean;
    conflictFiles?: string[];
}
/**
 * Merge a worktree branch back to the current branch and clean up.
 */
export declare function mergeWorktree(workspace: string, worktreePath: string, branch: string): MergeResult;
/**
 * Check for potential merge conflicts between a branch and the current HEAD
 * using git merge-tree (dry run). Returns list of conflicting file paths.
 */
export declare function checkConflicts(workspace: string, branch: string): string[];
/**
 * Remove a worktree directory only (keep the branch for manual conflict resolution).
 */
export declare function removeWorktreeOnly(worktreePath: string, workspace?: string): void;
/**
 * Force-remove a worktree and its branch (used on task failure/cancel).
 */
export declare function removeWorktree(worktreePath: string, branch: string, workspace?: string): void;
//# sourceMappingURL=worktree.d.ts.map