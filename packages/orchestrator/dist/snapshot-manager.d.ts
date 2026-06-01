/**
 * SnapshotManager handles workspace state backups and rollbacks.
 * Currently uses Git as the primary snapshot mechanism.
 */
export declare class SnapshotManager {
    constructor();
    /**
     * Create a snapshot of the current workspace state.
     * Returns a snapshot ID (e.g., git commit hash or stash name).
     */
    createSnapshot(targetPath: string, taskId: string): Promise<string | null>;
    /**
     * Roll back the workspace to a previously created snapshot.
     */
    rollback(targetPath: string, snapshotName: string): Promise<boolean>;
    private isGitRepo;
}
//# sourceMappingURL=snapshot-manager.d.ts.map