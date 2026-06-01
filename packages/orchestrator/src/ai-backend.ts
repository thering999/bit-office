/**
 * AIBackend interface — consumers register their own implementations.
 * No concrete backends shipped in this package.
 */

export interface BuildArgsOpts {
  continue?: boolean;
  /** Resume a specific session by ID (preferred over --continue for multi-agent) */
  resumeSessionId?: string;
  fullAccess?: boolean;
  noTools?: boolean;
  /** Override model for this invocation (e.g. "sonnet" for faster leader) */
  model?: string;
  /** Enable verbose output (default: false, enable via DEBUG env) */
  verbose?: boolean;
  /** Skip session resume for this invocation (leader state-summary mode) */
  skipResume?: boolean;
  /** Optional path to a screenshot for vision-capable backends */
  imagePath?: string;
}

export interface AIBackend {
  id: string;
  /** Human-readable name */
  name: string;
  /** Base command to spawn (e.g. "claude", "gemini", "node") */
  command: string;
  /** UI theme color (hex) */
  color?: string;
  /** Build command line arguments for a prompt */
  buildArgs(prompt: string, opts: BuildArgsOpts): string[];
  /** Extra env vars to delete before spawning (e.g. CLAUDECODE) */
  deleteEnv?: string[];
  /** Whether this backend accepts stdin messages while running */
  supportsStdin?: boolean;
  /** Dynamic environment variables to merge before spawning (e.g. key rotation) */
  getEnv?: (agentId?: string) => Record<string, string>;
  /** Optional backup backend IDs to try if this one fails (failover chain) */
  failoverTo?: string[];
}
