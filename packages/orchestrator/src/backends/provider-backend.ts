import { AIBackend, BuildArgsOpts } from "../ai-backend.js";

/**
 * ProviderBackend: A dynamic AI Intelligence Provider abstraction.
 * It routes requests to various underlying providers based on configuration.
 */
export class ProviderBackend implements AIBackend {
  public id = "ai-provider";
  public name = "AI Intelligence Provider";
  public color = "#7C3AED"; // Purple-600

  constructor(
    public command: string = process.env.AI_PROVIDER_CMD || "claude",
    public failoverTo: string[] = ["gemini-api", "groq", "openai-api"]
  ) {}

  buildArgs(prompt: string, opts: BuildArgsOpts): string[] {
    const args: string[] = [];
    const cmd = this.command.toLowerCase();

    // Provider-specific argument formatting
    if (cmd.includes("claude")) {
      if (opts.resumeSessionId) args.push("--session", opts.resumeSessionId);
      else if (opts.continue) args.push("--continue");
      if (opts.fullAccess) args.push("--dangerously-skip-permissions");
      args.push(prompt);
    } else if (cmd.includes("gemini")) {
      if (opts.model) args.push("--model", opts.model);
      args.push(prompt);
    } else if (cmd.includes("openclaw")) {
      args.push("--message", prompt);
      if (opts.continue) args.push("--continue");
    } else if (cmd.includes("opencode")) {
      args.push("run", prompt);
      if (opts.continue) args.push("--continue");
    } else if (cmd.includes("aider")) {
      args.push("--message", prompt, "--yes", "--no-pretty", "--no-git");
    } else {
      // Generic fallback
      if (opts.resumeSessionId) args.push("--session", opts.resumeSessionId);
      if (opts.model) args.push("--model", opts.model);
      args.push(prompt);
    }

    return args;
  }

  getEnv(agentId?: string): Record<string, string> {
    const env: Record<string, string> = {
      "AI_AGENT_ID": agentId || "unknown",
      "SWARM_MODE": "true",
      "BLACKBOARD_SYNC": "enabled",
      "FORCE_COLOR": "1",
      "TERM": "xterm-256color"
    };

    // Forward relevant keys if they exist in process.env
    const keysToForward = ["ANTHROPIC_API_KEY", "GOOGLE_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "OPENAI_API_KEY"];
    for (const key of keysToForward) {
      if (process.env[key]) env[key] = process.env[key]!;
    }

    return env;
  }

  supportsStdin = true;
}
